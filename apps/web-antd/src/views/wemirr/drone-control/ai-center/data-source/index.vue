<script lang="ts" setup name="AiDataSourcePage">
import { Page } from '@vben/common-ui';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import {
  appendAiDataSource,
  listAiDataSources,
  upsertAiDataSource,
  type AiDataSourceRecord,
} from '../../_services/ai-data-source-store';

const router = useRouter();

const sourceRecords = ref<AiDataSourceRecord[]>([]);
const detailOpen = ref(false);
const editOpen = ref(false);
const selectedRecord = ref<AiDataSourceRecord | null>(null);
const editingId = ref('');

const filters = reactive({
  keyword: '',
  sourceType: '全部',
  scene: '全部',
  onlineStatus: '全部',
  enabled: '全部',
});

const formState = reactive({
  name: '',
  sourceType: '实时视频流',
  scene: '交通巡查',
  protocol: 'RTSP',
  uri: '',
  location: '',
  owner: '综合指挥中心',
  deviceName: '',
  streamProfile: '',
  storagePolicy: '',
  onlineStatus: '待接入',
  enabled: true,
  bindTaskCount: 0,
  bindRuleCount: 0,
  latencyMs: 0,
  description: '',
  tagsText: '',
});

const columns: any[] = [
  { title: '数据源名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '类型', dataIndex: 'sourceType', key: 'sourceType', width: 110 },
  { title: '场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '协议', dataIndex: 'protocol', key: 'protocol', width: 90 },
  { title: '位置 / 设备', dataIndex: 'location', key: 'location', width: 220 },
  { title: '在线状态', dataIndex: 'onlineStatus', key: 'onlineStatus', width: 100 },
  { title: '任务 / 规则', dataIndex: 'binding', key: 'binding', width: 110 },
  { title: '开关', dataIndex: 'enabled', key: 'enabled', width: 90 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 280, fixed: 'right' },
];

const sceneOptions = ['全部', '森林防火', '交通巡查', '安全生产', '光伏巡检', '水域监测'].map((label) => ({
  label,
  value: label,
}));

const typeOptions = ['全部', '实时视频流', '摄像头点位', '飞行影像', '视频文件', '图片批次'].map((label) => ({
  label,
  value: label,
}));

const protocolOptions = ['RTSP', 'RTMP', 'HTTP-FLV', 'IMAGERY', 'OSS'].map((label) => ({
  label,
  value: label,
}));

const statusOptions = ['全部', '在线', '离线', '待接入'].map((label) => ({
  label,
  value: label,
}));

const enableOptions = ['全部', '已启用', '已停用'].map((label) => ({
  label,
  value: label,
}));

const templates = [
  {
    title: '机巢高点 RTSP',
    desc: '适合森林烟火、周界巡查的 7x24 实时流',
    payload: {
      name: '新建机巢高点视频流',
      sourceType: '实时视频流',
      scene: '森林防火',
      protocol: 'RTSP',
      uri: 'rtsp://10.10.9.21/live',
      location: '南坡林区高点',
      owner: '林草局值守专班',
      deviceName: '机巢 NB-006 / M30T',
      streamProfile: '主码流 4K / 25fps',
      storagePolicy: '命中自动截帧 + 热存 7 天',
      onlineStatus: '待接入',
      enabled: true,
      description: '适合作为森林烟火和周界巡查实时数据源。',
      tagsText: '烟火,实时流,高点',
    },
  },
  {
    title: '固定球机点位',
    desc: '适合违停、占道、施工监管的城市点位',
    payload: {
      name: '新建固定球机点位',
      sourceType: '摄像头点位',
      scene: '交通巡查',
      protocol: 'RTSP',
      uri: 'rtsp://10.18.11.8/front',
      location: '科技路路口',
      owner: '交管支队一大队',
      deviceName: '塔杆 TP-011 球机',
      streamProfile: '1080P / 20fps',
      storagePolicy: '15 分钟切片 + 标准存储 30 天',
      onlineStatus: '待接入',
      enabled: true,
      description: '适合违停抓拍、占道经营和重点路段监管。',
      tagsText: '球机,违停,复核',
    },
  },
];

const stats = computed(() => {
  const total = sourceRecords.value.length;
  const online = sourceRecords.value.filter((item) => item.onlineStatus === '在线').length;
  const enabled = sourceRecords.value.filter((item) => item.enabled).length;
  const bindingTasks = sourceRecords.value.reduce((sum, item) => sum + item.bindTaskCount, 0);
  return [
    { title: '纳管数据源', value: total, suffix: '路' },
    { title: '在线数据源', value: online, suffix: '路' },
    { title: '启用中数据源', value: enabled, suffix: '路' },
    { title: '关联任务数', value: bindingTasks, suffix: '个' },
  ];
});

const filteredRecords = computed(() => {
  return sourceRecords.value.filter((item) => {
    const matchKeyword =
      filters.keyword.trim() === '' ||
      [
        item.name,
        item.location,
        item.deviceName,
        item.uri,
        item.description,
        item.tags.join('|'),
      ]
        .join('|')
        .includes(filters.keyword.trim());
    const matchType = filters.sourceType === '全部' || item.sourceType === filters.sourceType;
    const matchScene = filters.scene === '全部' || item.scene === filters.scene;
    const matchStatus =
      filters.onlineStatus === '全部' || item.onlineStatus === filters.onlineStatus;
    const matchEnabled =
      filters.enabled === '全部' ||
      (filters.enabled === '已启用' ? item.enabled : !item.enabled);
    return matchKeyword && matchType && matchScene && matchStatus && matchEnabled;
  });
});

function nowString() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function sourceId() {
  return `SOURCE-${Date.now().toString().slice(-8)}`;
}

function refreshSources(showMessage = false) {
  sourceRecords.value = listAiDataSources();
  if (showMessage) message.success('数据源列表已刷新');
}

function resetForm() {
  editingId.value = '';
  formState.name = '';
  formState.sourceType = '实时视频流';
  formState.scene = '交通巡查';
  formState.protocol = 'RTSP';
  formState.uri = '';
  formState.location = '';
  formState.owner = '综合指挥中心';
  formState.deviceName = '';
  formState.streamProfile = '';
  formState.storagePolicy = '';
  formState.onlineStatus = '待接入';
  formState.enabled = true;
  formState.bindTaskCount = 0;
  formState.bindRuleCount = 0;
  formState.latencyMs = 0;
  formState.description = '';
  formState.tagsText = '';
}

function openCreate() {
  resetForm();
  editOpen.value = true;
}

function applyTemplate(template: (typeof templates)[number]) {
  resetForm();
  Object.assign(formState, template.payload);
  editOpen.value = true;
  message.success(`已套用模板：${template.title}`);
}

function submitForm() {
  if (!formState.name || !formState.uri || !formState.location || !formState.deviceName) {
    message.warning('请先补全名称、地址、位置和设备信息');
    return;
  }
  const record: AiDataSourceRecord = {
    id: editingId.value || sourceId(),
    name: formState.name,
    sourceType: formState.sourceType as AiDataSourceRecord['sourceType'],
    scene: formState.scene,
    protocol: formState.protocol,
    uri: formState.uri,
    location: formState.location,
    owner: formState.owner,
    deviceName: formState.deviceName,
    streamProfile: formState.streamProfile || '待补充',
    storagePolicy: formState.storagePolicy || '待补充',
    onlineStatus: formState.onlineStatus as AiDataSourceRecord['onlineStatus'],
    enabled: formState.enabled,
    bindTaskCount: formState.bindTaskCount,
    bindRuleCount: formState.bindRuleCount,
    lastSyncAt: nowString(),
    latencyMs: formState.latencyMs,
    description: formState.description || '新建数据源，待纳入任务和告警编排。',
    tags: formState.tagsText
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
  };

  if (editingId.value) {
    upsertAiDataSource(record);
    message.success(`数据源「${record.name}」已更新`);
  } else {
    appendAiDataSource(record);
    message.success(`数据源「${record.name}」已加入管理台账`);
  }

  refreshSources();
  selectedRecord.value = record;
  editOpen.value = false;
  detailOpen.value = true;
}

function openDetail(record: AiDataSourceRecord) {
  selectedRecord.value = record;
  detailOpen.value = true;
}

function openDetailFromTable(record: Record<string, any>) {
  openDetail(record as AiDataSourceRecord);
}

function editRecord(record: AiDataSourceRecord) {
  editingId.value = record.id;
  formState.name = record.name;
  formState.sourceType = record.sourceType;
  formState.scene = record.scene;
  formState.protocol = record.protocol;
  formState.uri = record.uri;
  formState.location = record.location;
  formState.owner = record.owner;
  formState.deviceName = record.deviceName;
  formState.streamProfile = record.streamProfile;
  formState.storagePolicy = record.storagePolicy;
  formState.onlineStatus = record.onlineStatus;
  formState.enabled = record.enabled;
  formState.bindTaskCount = record.bindTaskCount;
  formState.bindRuleCount = record.bindRuleCount;
  formState.latencyMs = record.latencyMs;
  formState.description = record.description;
  formState.tagsText = record.tags.join(', ');
  editOpen.value = true;
}

function editFromTable(record: Record<string, any>) {
  editRecord(record as AiDataSourceRecord);
}

function statusColor(status: string) {
  if (status === '在线') return 'green';
  if (status === '待接入') return 'gold';
  return 'default';
}

function typeColor(type: string) {
  if (type === '实时视频流') return 'blue';
  if (type === '摄像头点位') return 'cyan';
  if (type === '飞行影像') return 'purple';
  if (type === '图片批次') return 'orange';
  return 'default';
}

function toggleEnabled(record: AiDataSourceRecord) {
  const updated: AiDataSourceRecord = {
    ...record,
    enabled: !record.enabled,
    lastSyncAt: nowString(),
  };
  upsertAiDataSource(updated);
  refreshSources();
  if (selectedRecord.value?.id === record.id) {
    selectedRecord.value = updated;
  }
  message.success(updated.enabled ? `已启用 ${record.name}` : `已停用 ${record.name}`);
}

function toggleEnabledFromTable(record: Record<string, any>) {
  toggleEnabled(record as AiDataSourceRecord);
}

function testConnect(record: AiDataSourceRecord) {
  const updated: AiDataSourceRecord = {
    ...record,
    onlineStatus: record.enabled ? '在线' : '待接入',
    latencyMs: record.enabled ? Math.max(18, Math.floor(Math.random() * 80)) : 0,
    lastSyncAt: nowString(),
  };
  upsertAiDataSource(updated);
  refreshSources();
  if (selectedRecord.value?.id === record.id) {
    selectedRecord.value = updated;
  }
  message.success(`已完成 ${record.name} 的连通性测试`);
}

function testConnectFromTable(record: Record<string, any>) {
  testConnect(record as AiDataSourceRecord);
}

function goTask(record: AiDataSourceRecord) {
  selectedRecord.value = record;
  message.info(`前往分析任务使用数据源「${record.name}」`);
  router.push('/ai-center/task');
}

function goTaskFromTable(record: Record<string, any>) {
  goTask(record as AiDataSourceRecord);
}

function goHistory(record: AiDataSourceRecord) {
  selectedRecord.value = record;
  message.info(`前往历史回放查看「${record.name}」关联结果`);
  router.push('/ai-center/detect-history');
}

function goHistoryFromTable(record: Record<string, any>) {
  goHistory(record as AiDataSourceRecord);
}

onMounted(() => {
  refreshSources();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        type="success"
        show-icon
        message="P1 关键能力：数据源统一纳管"
        description="把实时视频流、摄像头点位、飞行影像和本地批次统一纳入 AI 数据源台账，为分析任务、媒体库和历史回放提供统一入口。"
      />

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :title="item.title" :value="item.value" :suffix="item.suffix" />
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="筛选与接入">
        <div class="flex flex-col gap-4">
          <div class="toolbar-grid">
            <Input v-model:value="filters.keyword" allow-clear placeholder="按名称、位置、设备、地址检索" />
            <Select v-model:value="filters.sourceType" :options="typeOptions" />
            <Select v-model:value="filters.scene" :options="sceneOptions" />
            <Select v-model:value="filters.onlineStatus" :options="statusOptions" />
            <Select v-model:value="filters.enabled" :options="enableOptions" />
            <Button @click="refreshSources(true)">刷新</Button>
          </div>
          <Space wrap>
            <Button size="small" @click="router.push('/ai-center/task')">分析任务</Button>
            <Button size="small" @click="router.push('/ai-center/media-library')">媒体库</Button>
            <Button size="small" @click="router.push('/ai-center/detection')">在线检测</Button>
            <Button size="small" @click="router.push('/ai-center/detect-history')">历史回放</Button>
            <Button size="small" type="primary" @click="openCreate">新增数据源</Button>
          </Space>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="数据源台账">
            <Table
              :columns="columns"
              :data-source="filteredRecords"
              :pagination="{ pageSize: 6 }"
              :scroll="{ x: 1560 }"
              row-key="id"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="font-medium">{{ record.name }}</div>
                  <div class="text-xs text-slate-400">{{ record.uri }}</div>
                </template>
                <template v-else-if="column.key === 'sourceType'">
                  <Tag :color="typeColor(record.sourceType)">{{ record.sourceType }}</Tag>
                </template>
                <template v-else-if="column.key === 'location'">
                  <div>{{ record.location }}</div>
                  <div class="text-xs text-slate-400">{{ record.deviceName }}</div>
                </template>
                <template v-else-if="column.key === 'onlineStatus'">
                  <Tag :color="statusColor(record.onlineStatus)">{{ record.onlineStatus }}</Tag>
                </template>
                <template v-else-if="column.key === 'binding'">
                  {{ record.bindTaskCount }} / {{ record.bindRuleCount }}
                </template>
                <template v-else-if="column.key === 'enabled'">
                  <Switch :checked="record.enabled" size="small" @change="toggleEnabledFromTable(record)" />
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space wrap size="small">
                    <Button size="small" type="link" @click="openDetailFromTable(record)">详情</Button>
                    <Button size="small" type="link" @click="editFromTable(record)">编辑</Button>
                    <Button size="small" type="link" @click="testConnectFromTable(record)">测试</Button>
                    <Button size="small" type="link" @click="goTaskFromTable(record)">任务</Button>
                    <Button size="small" type="link" @click="goHistoryFromTable(record)">历史</Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="接入模板">
            <div class="flex flex-col gap-3">
              <div
                v-for="template in templates"
                :key="template.title"
                class="template-card"
              >
                <div class="template-card__head">
                  <strong>{{ template.title }}</strong>
                  <Button size="small" type="link" @click="applyTemplate(template)">套用</Button>
                </div>
                <div class="template-card__desc">{{ template.desc }}</div>
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="联动说明" class="mt-4">
            <div class="insight-list">
              <div class="insight-item">
                <div class="insight-item__title">任务编排</div>
                <div class="insight-item__desc">分析任务创建时可直接套用已纳管的数据源，减少地址和点位重复录入。</div>
              </div>
              <div class="insight-item">
                <div class="insight-item__title">媒体沉淀</div>
                <div class="insight-item__desc">飞行影像、切片视频和本地批次统一进入媒体库，供检测与历史复核使用。</div>
              </div>
              <div class="insight-item">
                <div class="insight-item__title">历史回放</div>
                <div class="insight-item__desc">检测历史可按数据源回看命中片段，进一步转事件或派工。</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Drawer
        v-model:open="editOpen"
        :title="editingId ? '编辑数据源' : '新增数据源'"
        width="560"
        placement="right"
      >
        <Form layout="vertical" class="mt-2">
          <FormItem label="数据源名称">
            <Input v-model:value="formState.name" placeholder="例如：高新一路-路口球机" />
          </FormItem>
          <FormItem label="数据源类型">
            <Select v-model:value="formState.sourceType" :options="typeOptions.filter((item) => item.value !== '全部')" />
          </FormItem>
          <FormItem label="业务场景">
            <Select v-model:value="formState.scene" :options="sceneOptions.filter((item) => item.value !== '全部')" />
          </FormItem>
          <FormItem label="接入协议">
            <Select v-model:value="formState.protocol" :options="protocolOptions" />
          </FormItem>
          <FormItem label="地址 / 标识">
            <Input v-model:value="formState.uri" placeholder="例如：rtsp://10.18.8.10/front" />
          </FormItem>
          <FormItem label="位置">
            <Input v-model:value="formState.location" placeholder="例如：高新一路公交站台" />
          </FormItem>
          <FormItem label="来源设备 / 责任单位">
            <Input v-model:value="formState.deviceName" placeholder="例如：塔杆 TP-003 球机" />
          </FormItem>
          <FormItem label="责任人 / 单位">
            <Input v-model:value="formState.owner" />
          </FormItem>
          <FormItem label="码流 / 批次信息">
            <Input v-model:value="formState.streamProfile" placeholder="例如：1080P / 20fps" />
          </FormItem>
          <FormItem label="存储策略">
            <Input v-model:value="formState.storagePolicy" placeholder="例如：15 分钟切片 + 30 天标准存储" />
          </FormItem>
          <FormItem label="在线状态">
            <Select v-model:value="formState.onlineStatus" :options="statusOptions.filter((item) => item.value !== '全部')" />
          </FormItem>
          <FormItem label="是否启用">
            <Switch v-model:checked="formState.enabled" />
          </FormItem>
          <FormItem label="关联任务数">
            <InputNumber v-model:value="formState.bindTaskCount" :min="0" style="width: 100%" />
          </FormItem>
          <FormItem label="关联规则数">
            <InputNumber v-model:value="formState.bindRuleCount" :min="0" style="width: 100%" />
          </FormItem>
          <FormItem label="延迟(ms)">
            <InputNumber v-model:value="formState.latencyMs" :min="0" style="width: 100%" />
          </FormItem>
          <FormItem label="标签">
            <Input v-model:value="formState.tagsText" placeholder="例如：违停, 球机, 复核" />
          </FormItem>
          <FormItem label="说明">
            <Input v-model:value="formState.description" placeholder="说明数据源用途或接入说明" />
          </FormItem>
        </Form>
        <div class="mt-4 flex justify-end gap-2">
          <Button @click="editOpen = false">取消</Button>
          <Button type="primary" @click="submitForm">{{ editingId ? '保存修改' : '确认新增' }}</Button>
        </div>
      </Drawer>

      <Drawer
        v-model:open="detailOpen"
        :title="selectedRecord ? `数据源详情 - ${selectedRecord.name}` : '数据源详情'"
        width="560"
        placement="right"
      >
        <template v-if="selectedRecord">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="数据源名称">{{ selectedRecord.name }}</DescriptionsItem>
            <DescriptionsItem label="数据源类型">
              <Tag :color="typeColor(selectedRecord.sourceType)">{{ selectedRecord.sourceType }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="业务场景">{{ selectedRecord.scene }}</DescriptionsItem>
            <DescriptionsItem label="协议">{{ selectedRecord.protocol }}</DescriptionsItem>
            <DescriptionsItem label="地址 / 标识">{{ selectedRecord.uri }}</DescriptionsItem>
            <DescriptionsItem label="位置">{{ selectedRecord.location }}</DescriptionsItem>
            <DescriptionsItem label="来源设备">{{ selectedRecord.deviceName }}</DescriptionsItem>
            <DescriptionsItem label="责任单位">{{ selectedRecord.owner }}</DescriptionsItem>
            <DescriptionsItem label="码流 / 批次">{{ selectedRecord.streamProfile }}</DescriptionsItem>
            <DescriptionsItem label="存储策略">{{ selectedRecord.storagePolicy }}</DescriptionsItem>
            <DescriptionsItem label="在线状态">
              <Tag :color="statusColor(selectedRecord.onlineStatus)">{{ selectedRecord.onlineStatus }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="启用状态">
              <Tag :color="selectedRecord.enabled ? 'green' : 'default'">
                {{ selectedRecord.enabled ? '已启用' : '已停用' }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="关联任务 / 规则">
              {{ selectedRecord.bindTaskCount }} / {{ selectedRecord.bindRuleCount }}
            </DescriptionsItem>
            <DescriptionsItem label="最近同步">{{ selectedRecord.lastSyncAt }}</DescriptionsItem>
            <DescriptionsItem label="链路延迟">{{ selectedRecord.latencyMs }} ms</DescriptionsItem>
            <DescriptionsItem label="标签">{{ selectedRecord.tags.join(' / ') || '-' }}</DescriptionsItem>
            <DescriptionsItem label="说明">{{ selectedRecord.description }}</DescriptionsItem>
          </Descriptions>

          <div class="mt-4 flex gap-2">
            <Button type="primary" @click="goTask(selectedRecord)">用于任务编排</Button>
            <Button @click="goHistory(selectedRecord)">查看历史回放</Button>
            <Button @click="testConnect(selectedRecord)">测试连接</Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>

<style scoped>
.toolbar-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.template-card,
.insight-item {
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 14px;
  padding: 14px;
}

.template-card__head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.template-card__desc,
.insight-item__desc {
  color: var(--ant-color-text-description);
  font-size: 12px;
  line-height: 1.7;
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item__title {
  color: var(--ant-color-text);
  font-weight: 600;
  margin-bottom: 6px;
}

@media (max-width: 1200px) {
  .toolbar-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .toolbar-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
