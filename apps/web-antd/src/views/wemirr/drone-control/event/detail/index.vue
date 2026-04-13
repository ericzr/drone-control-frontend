<script lang="ts" setup name="EventDetailPage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Divider,
  Input,
  Modal,
  Row,
  Select,
  SelectOption,
  Space,
  Steps,
  Tag,
  Textarea,
  message,
} from 'ant-design-vue';

const router = useRouter();

const event = ref({
  id: 'EVT-20260413-003',
  type: '烟雾告警',
  level: 'critical',
  scene: '森林防火',
  status: 2,
  location: '北坡 230m 处',
  coordinate: '108.9300, 34.2700',
  device: '大航蜂 M30T-01',
  pilot: '张伟',
  detectTime: '2026-04-13 14:32:18',
  confidence: 92,
  model: '无人机小目标检测 v11s',
  assignee: '',
  handleNote: '',
  confirmNote: '',
});

const statusSteps = [
  { title: '告警触发', desc: 'AI 自动识别' },
  { title: '待复核', desc: '人工确认' },
  { title: '已确认', desc: '确认为有效事件' },
  { title: '已指派', desc: '指派处理人' },
  { title: '处置中', desc: '现场处理' },
  { title: '待确认', desc: '等待负责人确认' },
  { title: '已关闭', desc: '事件闭环' },
];

const assigneeOptions = ['张伟', '李明', '王芳', '赵强', '刘洋'];

const compareSlider = ref(50);

function levelColor(level: string) {
  if (level === 'critical') return '#ff4d4f';
  if (level === 'warning') return '#faad14';
  return '#1677ff';
}

function handleConfirm() {
  event.value.status = 2;
  message.success('事件已确认');
}

function handleReject() {
  Modal.confirm({
    title: '驳回事件',
    content: '确定将此事件标记为误报吗？',
    onOk() {
      event.value.status = 6;
      message.info('事件已驳回（标记为误报）');
    },
  });
}

function handleAssign() {
  if (!event.value.assignee) {
    message.warning('请选择处理人');
    return;
  }
  event.value.status = 3;
  message.success(`已指派给 ${event.value.assignee}`);
}

function handleSubmitDisposal() {
  if (!event.value.handleNote) {
    message.warning('请填写处置说明');
    return;
  }
  event.value.status = 5;
  message.success('处置记录已提交，等待确认');
}

function handleClose() {
  event.value.status = 6;
  message.success('事件已关闭');
}

function goBack() {
  router.back();
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <!-- Header -->
      <Card :bordered="false">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold" style="color: var(--ant-color-text)">{{ event.id }}</span>
              <Tag :color="levelColor(event.level)">
                {{ event.level === 'critical' ? '紧急' : event.level === 'warning' ? '一般' : '提示' }}
              </Tag>
              <Tag>{{ event.scene }}</Tag>
            </div>
            <div class="mt-1 text-sm" style="color: var(--ant-color-text-tertiary)">
              {{ event.type }} · {{ event.location }} · {{ event.detectTime }}
            </div>
          </div>
          <Button @click="goBack">返回列表</Button>
        </div>
      </Card>

      <!-- Status Steps -->
      <Card :bordered="false" title="处理流程">
        <Steps :current="event.status" size="small" :items="statusSteps" />
      </Card>

      <Row :gutter="[16, 16]">
        <!-- Left: Info + Actions -->
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="事件信息">
            <Descriptions bordered :column="1" size="small">
              <DescriptionsItem label="事件编号">{{ event.id }}</DescriptionsItem>
              <DescriptionsItem label="告警类型">{{ event.type }}</DescriptionsItem>
              <DescriptionsItem label="应用场景">{{ event.scene }}</DescriptionsItem>
              <DescriptionsItem label="位置">{{ event.location }}</DescriptionsItem>
              <DescriptionsItem label="坐标">{{ event.coordinate }}</DescriptionsItem>
              <DescriptionsItem label="发现设备">{{ event.device }}</DescriptionsItem>
              <DescriptionsItem label="飞手">{{ event.pilot }}</DescriptionsItem>
              <DescriptionsItem label="检测时间">{{ event.detectTime }}</DescriptionsItem>
              <DescriptionsItem label="置信度">
                <Tag :color="event.confidence >= 90 ? 'green' : 'orange'">{{ event.confidence }}%</Tag>
              </DescriptionsItem>
              <DescriptionsItem label="检测模型">{{ event.model }}</DescriptionsItem>
            </Descriptions>
          </Card>

          <Card :bordered="false" title="处置操作" class="mt-4">
            <!-- Step 1: Confirm or Reject -->
            <div v-if="event.status <= 1" class="action-block">
              <div class="action-block__label">复核操作</div>
              <Space>
                <Button type="primary" @click="handleConfirm">确认事件</Button>
                <Button danger @click="handleReject">驳回（误报）</Button>
              </Space>
            </div>

            <!-- Step 2: Assign -->
            <div v-else-if="event.status === 2" class="action-block">
              <div class="action-block__label">指派处理人</div>
              <div class="flex gap-2">
                <Select v-model:value="event.assignee" placeholder="选择处理人" style="width: 200px">
                  <SelectOption v-for="name in assigneeOptions" :key="name" :value="name">{{ name }}</SelectOption>
                </Select>
                <Button type="primary" @click="handleAssign">确认指派</Button>
              </div>
            </div>

            <!-- Step 3-4: Handle -->
            <div v-else-if="event.status === 3 || event.status === 4" class="action-block">
              <div class="action-block__label">处置说明</div>
              <Textarea v-model:value="event.handleNote" :rows="3" placeholder="填写现场处置说明..." />
              <Button type="primary" class="mt-2" @click="handleSubmitDisposal">提交处置记录</Button>
            </div>

            <!-- Step 5: Confirm close -->
            <div v-else-if="event.status === 5" class="action-block">
              <div class="action-block__label">确认关闭</div>
              <Textarea v-model:value="event.confirmNote" :rows="2" placeholder="确认说明（可选）..." />
              <Button type="primary" class="mt-2" @click="handleClose">确认关闭事件</Button>
            </div>

            <!-- Step 6: Closed -->
            <div v-else class="action-block">
              <Badge status="success" text="事件已闭环" />
            </div>
          </Card>
        </Col>

        <!-- Right: Image Compare -->
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="影像对比">
            <div class="compare-container">
              <div class="compare-viewport">
                <div
                  class="compare-layer compare-layer--current"
                  :style="{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }"
                >
                  <div class="compare-placeholder compare-placeholder--current">
                    <div class="compare-placeholder__box" />
                    <span>当前帧 · AI 检测结果</span>
                  </div>
                </div>
                <div class="compare-layer compare-layer--history">
                  <div class="compare-placeholder compare-placeholder--history">
                    <span>历史影像 · 同一位置</span>
                  </div>
                </div>
                <div
                  class="compare-divider"
                  :style="{ left: `${compareSlider}%` }"
                />
              </div>
              <input
                v-model="compareSlider"
                type="range"
                min="0"
                max="100"
                class="compare-slider"
              />
              <div class="compare-labels">
                <span>当前帧（AI 标注）</span>
                <span>历史影像</span>
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="标注工具" class="mt-4">
            <div class="annotate-toolbar">
              <Space>
                <Button size="small">矩形框选</Button>
                <Button size="small">多边形标注</Button>
                <Button size="small">文字标注</Button>
                <Button size="small" danger>清除标注</Button>
              </Space>
              <div class="mt-3 text-xs" style="color: var(--ant-color-text-tertiary)">
                标注工具待接入图片编辑器，当前为 UI 占位
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.action-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-block__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ant-color-text);
}

.compare-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compare-viewport {
  position: relative;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  background: #111827;
}

.compare-layer {
  position: absolute;
  inset: 0;
}

.compare-layer--current {
  z-index: 2;
}

.compare-layer--history {
  z-index: 1;
}

.compare-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgb(255 255 255 / 50%);
  font-size: 13px;
  gap: 12px;
}

.compare-placeholder--current {
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
}

.compare-placeholder--history {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
}

.compare-placeholder__box {
  width: 120px;
  height: 80px;
  border: 2px dashed #ef4444;
  border-radius: 4px;
}

.compare-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #fff;
  z-index: 3;
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgb(0 0 0 / 40%);
}

.compare-slider {
  width: 100%;
  cursor: pointer;
}

.compare-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--ant-color-text-tertiary);
}
</style>
