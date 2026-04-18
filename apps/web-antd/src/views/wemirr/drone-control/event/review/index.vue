<script lang="ts" setup name="EventReviewPage">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useFs } from '@fast-crud/fast-crud';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Select,
  SelectOption,
  Space,
  Statistic,
  Tag,
  Textarea,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';

import createCrudOptions from './crud';
import {
  getClosureEventByNoOrId,
  listClosureEvents,
  listClosureWorkorders,
  submitEventReview,
  useEventClosureVersion,
} from '../../_services/event-closure-store';
import EventContextBar from '../../components/EventContextBar.vue';

const route = useRoute();
const router = useRouter();
const closureStoreVersion = useEventClosureVersion();

const reviewDrawerVisible = ref(false);
const reviewRow = ref<Record<string, any> | null>(null);
const reviewResult = ref('确认有效');
const reviewRemark = ref('');
const reviewerName = ref('当前用户');
const compareSlider = ref(50);

function getSceneProfile(scene: string) {
  const map: Record<string, { after: string; before: string; hint: string }> = {
    交通巡查: {
      after: '当前帧 · 路口违停识别',
      before: '历史影像 · 路口通行基线',
      hint: '建议联动交管席核查占道和违停状态，必要时补充高清抓拍。',
    },
    城管巡检: {
      after: '当前帧 · 占道经营识别',
      before: '历史影像 · 步行街常态快照',
      hint: '建议补充摊点近景和路面秩序照片，用于派单前确认。',
    },
    森林防火: {
      after: '当前帧 · 烟点疑似轮廓',
      before: '历史影像 · 林区正常状态',
      hint: '建议优先发起复飞红外核查，并同步地面应急组预备处置。',
    },
    环境监测: {
      after: '当前帧 · 排污异常识别',
      before: '历史影像 · 上轮取证基线',
      hint: '建议联合生态巡检组补充取样影像，形成工单证据链。',
    },
    水域监测: {
      after: '当前帧 · 漂浮物聚集识别',
      before: '历史影像 · 河道正常状态',
      hint: '建议对污染带近距离悬停拍摄，并记录上游来向。',
    },
  };
  return (
    map[scene] || {
      after: '当前帧 · AI 检测结果',
      before: '历史影像 · 同点位复查',
      hint: '建议结合地图点位与现场证据，完成复核后再决定是否派单。',
    }
  );
}

function buildReviewRow(eventNo: string) {
  const event = getClosureEventByNoOrId(eventNo);
  if (!event) return null;
  return {
    id: event.id,
    eventNo: event.eventNo,
    eventType: event.eventType,
    region: event.region,
    location: event.location,
    scene: event.scene,
    source: event.source,
    confidence: event.confidence,
    reviewer: event.reviewer || '',
    reviewResult: event.reviewResult || '',
    reviewRemark: event.reviewRemark || '',
    reviewTime: event.reviewTime || '',
    status: event.reviewTime || event.reviewResult ? '已复核' : '待复核',
    createTime: event.createTime,
  };
}

function openReview(row: Record<string, any>) {
  reviewRow.value = row;
  reviewResult.value = row.reviewResult || '确认有效';
  reviewRemark.value = row.reviewRemark || '';
  reviewDrawerVisible.value = true;
}

function submitReview() {
  if (!reviewRow.value) return;
  if (!reviewRemark.value.trim()) {
    message.warning('请填写复核意见');
    return;
  }
  const updated = submitEventReview({
    eventNo: reviewRow.value.eventNo,
    reviewer: reviewerName.value,
    reviewResult: reviewResult.value,
    reviewRemark: reviewRemark.value,
  });
  reviewRow.value.reviewer = reviewerName.value;
  reviewRow.value.reviewResult = reviewResult.value;
  reviewRow.value.reviewRemark = reviewRemark.value;
  reviewRow.value.reviewTime = updated?.reviewTime || '';
  reviewRow.value.status = '已复核';
  reviewDrawerVisible.value = false;
  message.success(`事件 ${reviewRow.value.eventNo} 复核完成：${reviewResult.value}`);
  crudExpose.doRefresh();
}

function triggerReflight(row: Record<string, any>) {
  Modal.confirm({
    title: '发起复飞核查',
    content: `将为事件「${row.eventNo}」(${row.location}) 创建应急复核调度任务，使用无人机复飞现场确认。`,
    okText: '确认发起',
    onOk() {
      message.success(`已为 ${row.eventNo} 创建复飞核查任务`);
      router.push('/dispatch/task');
    },
  });
}

const { crudBinding, crudRef, crudExpose } = useFs({
  createCrudOptions,
  context: {
    router,
    openReview,
    triggerReflight,
    getContextFilters: () => ({
      scene: (route.query.scene as string) || 'all',
      source: (route.query.source as string) || 'all',
    }),
  },
});

const closureEvents = computed(() => {
  closureStoreVersion.value;
  return listClosureEvents();
});

const workorderMap = computed(() => {
  closureStoreVersion.value;
  return new Map(listClosureWorkorders().map((item) => [item.eventId, item]));
});

const reviewStats = computed(() => {
  const total = closureEvents.value.length;
  const reviewed = closureEvents.value.filter((item) => item.reviewTime || item.reviewResult).length;
  const confirmed = closureEvents.value.filter((item) => item.reviewResult === '确认有效').length;
  const rejected = closureEvents.value.filter((item) => item.reviewResult === '误报排除').length;
  const pending = closureEvents.value.filter((item) => item.status === '待复核').length;
  return {
    total,
    reviewed,
    confirmed,
    rejected,
    pending,
    rate: total > 0 ? Math.round((reviewed / total) * 100) : 0,
  };
});

const currentReviewDetail = computed(() => {
  if (!reviewRow.value?.eventNo) return null;
  const event = getClosureEventByNoOrId(reviewRow.value.eventNo);
  if (!event) return null;
  const profile = getSceneProfile(event.scene);
  const workorder = workorderMap.value.get(event.eventNo);
  return {
    event,
    workorder,
    profile,
    evidenceList:
      workorder?.evidences.length
        ? workorder.evidences
        : [
            {
              id: 'synthetic-1',
              title: '当前帧识别截图',
              type: '图片',
              uploadedAt: event.eventTime || event.createTime,
              uploadedBy: event.sourceDrone || '系统',
              summary: event.description,
            },
            {
              id: 'synthetic-2',
              title: '复核建议',
              type: '文本',
              uploadedAt: event.reviewTime || event.createTime,
              uploadedBy: event.reviewer || '系统',
              summary: event.reviewRemark || profile.hint,
            },
          ],
    timelineItems: [
      {
        key: 'detect',
        color: 'blue',
        title: 'AI 识别上报',
        time: event.eventTime || event.createTime,
        note: `${event.source} · 置信度 ${event.confidence}%`,
      },
      ...(event.reviewTime
        ? [
            {
              key: 'review',
              color: 'gold',
              title: '人工复核',
              time: event.reviewTime,
              note: `${event.reviewer || '当前用户'} · ${event.reviewRemark || event.reviewResult}`,
            },
          ]
        : []),
      ...(workorder
        ? workorder.logs.slice(-3).map((item, index) => ({
            key: `${item.action}-${index}`,
            color:
              item.action.includes('归档') || item.action.includes('通过')
                ? 'green'
                : item.action.includes('驳回')
                  ? 'red'
                  : 'gray',
            title: item.action,
            time: item.time,
            note: `${item.user}${item.note ? ` · ${item.note}` : ''}`,
          }))
        : []),
    ],
  };
});

function openQueryReview() {
  const id = route.query.id as string | undefined;
  if (!id) return;
  const row = buildReviewRow(id);
  if (!row) return;
  openReview(row);
}

onMounted(async () => {
  await crudExpose.doRefresh();
  openQueryReview();
});

watch(
  () => route.query.id,
  () => {
    openQueryReview();
  },
);

const statColors = {
  reviewed: { color: '#52c41a' },
  confirmed: { color: '#1677ff' },
  rejected: { color: '#ff4d4f' },
  rate: { color: '#722ed1' },
};
</script>

<template>
  <fs-page class="page-layout-card">
    <div class="px-3 pt-3">
      <EventContextBar current="review" />
    </div>

    <Row :gutter="[16, 16]" class="mb-4 px-3 pt-3">
      <Col :lg="5" :span="12">
        <Card :bordered="false" size="small">
          <Statistic title="总事件" :value="reviewStats.total" suffix="件" />
        </Card>
      </Col>
      <Col :lg="5" :span="12">
        <Card :bordered="false" size="small">
          <Statistic title="已复核" :value="reviewStats.reviewed" suffix="件" :value-style="statColors.reviewed" />
        </Card>
      </Col>
      <Col :lg="5" :span="12">
        <Card :bordered="false" size="small">
          <Statistic title="确认有效" :value="reviewStats.confirmed" suffix="件" :value-style="statColors.confirmed" />
        </Card>
      </Col>
      <Col :lg="5" :span="12">
        <Card :bordered="false" size="small">
          <Statistic title="误报排除" :value="reviewStats.rejected" suffix="件" :value-style="statColors.rejected" />
        </Card>
      </Col>
      <Col :lg="4" :span="12">
        <Card :bordered="false" size="small">
          <Statistic title="复核率" :value="reviewStats.rate" suffix="%" :value-style="statColors.rate" />
        </Card>
      </Col>
    </Row>

    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="reviewDrawerVisible" title="事件复核" width="600" placement="right">
      <template v-if="reviewRow">
        <Descriptions bordered :column="1" size="small" class="mb-4">
          <DescriptionsItem label="事件编号">{{ reviewRow.eventNo }}</DescriptionsItem>
          <DescriptionsItem label="事件类型">{{ reviewRow.eventType }}</DescriptionsItem>
          <DescriptionsItem label="应用场景">{{ currentReviewDetail?.event.scene || '-' }}</DescriptionsItem>
          <DescriptionsItem label="位置">{{ reviewRow.location }}</DescriptionsItem>
          <DescriptionsItem label="置信度">
            <Tag :color="reviewRow.confidence >= 90 ? 'green' : reviewRow.confidence >= 70 ? 'orange' : 'red'">
              {{ reviewRow.confidence }}%
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="来源">{{ reviewRow.source }}</DescriptionsItem>
          <DescriptionsItem label="关联工单">
            {{ currentReviewDetail?.workorder?.id || '未生成' }}
          </DescriptionsItem>
        </Descriptions>

        <Card :bordered="false" title="影像对比" size="small" class="mb-4">
          <div class="compare-container">
            <div class="compare-viewport">
              <div
                class="compare-layer compare-layer--current"
                :style="{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }"
              >
                <div class="compare-placeholder compare-placeholder--current">
                  <div class="compare-placeholder__box" />
                  <span>{{ currentReviewDetail?.profile.after || '当前帧 · AI 检测' }}</span>
                </div>
              </div>
              <div class="compare-layer compare-layer--history">
                <div class="compare-placeholder compare-placeholder--history">
                  <span>{{ currentReviewDetail?.profile.before || '历史影像 · 同一位置' }}</span>
                </div>
              </div>
              <div class="compare-divider" :style="{ left: `${compareSlider}%` }" />
            </div>
            <input v-model="compareSlider" type="range" min="0" max="100" class="compare-slider" />
            <div class="compare-labels">
              <span>当前帧（AI 标注）</span>
              <span>历史影像</span>
            </div>
          </div>
        </Card>

        <Card :bordered="false" title="证据摘要" size="small" class="mb-4">
          <template v-if="currentReviewDetail">
            <div class="evidence-list">
              <div
                v-for="item in currentReviewDetail.evidenceList"
                :key="item.id"
                class="evidence-item"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="font-medium text-slate-900">{{ item.title }}</div>
                  <Tag size="small">{{ item.type }}</Tag>
                </div>
                <div class="mt-1 text-xs text-slate-400">
                  {{ item.uploadedAt }} · {{ item.uploadedBy }}
                </div>
                <div class="mt-2 text-sm leading-6 text-slate-600">
                  {{ item.summary }}
                </div>
              </div>
            </div>
          </template>
          <Empty v-else description="暂无证据摘要" />
        </Card>

        <Card :bordered="false" title="处置轨迹" size="small" class="mb-4">
          <template v-if="currentReviewDetail">
            <Timeline>
              <TimelineItem
                v-for="item in currentReviewDetail.timelineItems"
                :key="item.key"
                :color="item.color"
              >
                <div class="flex items-center gap-2">
                  <div class="font-medium text-slate-900">{{ item.title }}</div>
                  <span class="text-xs text-slate-400">{{ item.time }}</span>
                </div>
                <div class="mt-1 text-sm text-slate-600">{{ item.note }}</div>
              </TimelineItem>
            </Timeline>
          </template>
          <Empty v-else description="暂无处置轨迹" />
        </Card>

        <Card :bordered="false" title="复核操作" size="small">
          <div class="flex flex-col gap-3">
            <div class="review-hint">
              {{ currentReviewDetail?.profile.hint || '请结合影像、证据和地图点位完成本次复核。' }}
            </div>
            <div>
              <span class="mr-2 text-sm font-medium">复核结果：</span>
              <RadioGroup v-model:value="reviewResult">
                <Radio value="确认有效">确认有效</Radio>
                <Radio value="误报排除">误报排除</Radio>
                <Radio value="待现场核实">待现场核实</Radio>
              </RadioGroup>
            </div>
            <div>
              <span class="mr-2 text-sm font-medium">复核人：</span>
              <Select v-model:value="reviewerName" style="width: 200px">
                <SelectOption value="当前用户">当前用户</SelectOption>
                <SelectOption value="张指挥">张指挥</SelectOption>
                <SelectOption value="李巡查">李巡查</SelectOption>
                <SelectOption value="王安全">王安全</SelectOption>
              </Select>
            </div>
            <div>
              <span class="text-sm font-medium">复核意见：</span>
              <Textarea v-model:value="reviewRemark" :rows="3" placeholder="请描述复核情况和处理建议..." class="mt-1" />
            </div>
            <Space class="mt-2">
              <Button type="primary" @click="submitReview">提交复核</Button>
              <Button v-if="reviewResult === '待现场核实'" @click="triggerReflight(reviewRow)">发起复飞核查</Button>
              <Button @click="router.push(`/event/detail?id=${reviewRow.eventNo}`)">查看详情</Button>
              <Button @click="router.push(`/event/map-view?id=${reviewRow.eventNo}`)">地图聚焦</Button>
              <Button
                v-if="currentReviewDetail?.workorder"
                @click="router.push(`/event/workorder-detail?id=${currentReviewDetail.workorder.id}`)"
              >
                查看工单
              </Button>
            </Space>
          </div>
        </Card>
      </template>
    </Drawer>
  </fs-page>
</template>

<style lang="less" scoped>
.compare-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compare-viewport {
  position: relative;
  height: 200px;
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
  font-size: 12px;
  gap: 8px;
}

.compare-placeholder--current {
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
}

.compare-placeholder--history {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
}

.compare-placeholder__box {
  width: 80px;
  height: 50px;
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

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.evidence-item {
  padding: 12px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 0.98));
}

.review-hint {
  padding: 12px 14px;
  border: 1px solid rgba(22, 119, 255, 0.12);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(248, 250, 252, 0.98));
  color: #334155;
  font-size: 13px;
  line-height: 1.8;
}
</style>
