<script lang="ts" setup>
import { Badge, Button, Card, Col, Empty, Progress, Row, Tag, Tooltip } from 'ant-design-vue';

export interface DeviceCardField {
  key: string;
  label: string;
}

export interface DeviceCardAction {
  label: string;
  type?: 'primary' | 'default' | 'link' | 'dashed';
  danger?: boolean;
  show?: (row: Record<string, any>) => boolean;
  onClick: (row: Record<string, any>) => void;
}

const props = withDefaults(defineProps<{
  data: Record<string, any>[];
  nameKey?: string;
  modelKey?: string;
  statusKey?: string;
  batteryKey?: string;
  fields?: DeviceCardField[];
  actions?: DeviceCardAction[];
  icon?: string;
}>(), {
  nameKey: 'name',
  modelKey: 'model',
  statusKey: 'status',
  batteryKey: 'battery',
  icon: '📟',
});

function statusColor(s: string) {
  if (s === '在线' || s === '正常供电') return 'success';
  if (s === '作业中' || s === '执行任务') return 'processing';
  if (s === '维护中' || s === '充电中' || s === '备用电源') return 'warning';
  return 'default';
}

function batteryColor(val: number) {
  if (val < 20) return '#ef4444';
  if (val < 50) return '#f59e0b';
  return '#10b981';
}
</script>

<template>
  <div class="device-card-view">
    <Empty v-if="data.length === 0" description="暂无设备数据" />
    <Row v-else :gutter="[16, 16]">
      <Col
        v-for="item in data"
        :key="item.id ?? item[nameKey]"
        :xxl="6" :xl="8" :lg="8" :md="12" :sm="12" :xs="24"
      >
        <Card hoverable class="device-card" :body-style="{ padding: '16px' }">
          <div class="device-card__header">
            <div class="device-card__icon">{{ icon }}</div>
            <div class="device-card__title-area">
              <div class="device-card__name">
                <Tooltip :title="item[nameKey]">
                  {{ item[nameKey] }}
                </Tooltip>
              </div>
              <div v-if="modelKey && item[modelKey]" class="device-card__model">
                {{ item[modelKey] }}
              </div>
            </div>
            <Badge :status="statusColor(item[statusKey] ?? '')" />
            <Tag :color="statusColor(item[statusKey] ?? '')" size="small">{{ item[statusKey] }}</Tag>
          </div>

          <div v-if="batteryKey && item[batteryKey] != null" class="device-card__battery">
            <span class="device-card__battery-label">电量</span>
            <Progress
              :percent="item[batteryKey]"
              :stroke-color="batteryColor(item[batteryKey])"
              :show-info="true"
              size="small"
              class="device-card__battery-bar"
            />
          </div>

          <div class="device-card__fields">
            <div v-for="f in fields" :key="f.key" class="device-card__field">
              <span class="device-card__field-label">{{ f.label }}</span>
              <span class="device-card__field-value">
                <Tooltip :title="String(item[f.key] ?? '—')">
                  {{ item[f.key] ?? '—' }}
                </Tooltip>
              </span>
            </div>
          </div>

          <div v-if="actions && actions.length > 0" class="device-card__actions">
            <template v-for="act in actions" :key="act.label">
              <Button
                v-if="!act.show || act.show(item)"
                size="small"
                :type="act.type ?? 'link'"
                :danger="act.danger"
                @click="act.onClick(item)"
              >
                {{ act.label }}
              </Button>
            </template>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style lang="less" scoped>
.device-card-view {
  padding: 4px 0;
}

.device-card {
  border-radius: 12px;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgb(0 0 0 / 8%);
  }
}

.device-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.device-card__icon {
  font-size: 28px;
  flex: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--ant-color-primary-bg, #e6f4ff);
}

.device-card__title-area {
  flex: 1;
  min-width: 0;
}

.device-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ant-color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-card__model {
  font-size: 11px;
  color: var(--ant-color-text-tertiary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-card__battery {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.device-card__battery-label {
  font-size: 11px;
  color: var(--ant-color-text-tertiary);
  flex: none;
}

.device-card__battery-bar {
  flex: 1;
  :deep(.ant-progress-text) {
    font-size: 11px;
  }
}

.device-card__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  margin-bottom: 10px;
}

.device-card__field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.device-card__field-label {
  font-size: 10px;
  color: var(--ant-color-text-quaternary);
}

.device-card__field-value {
  font-size: 12px;
  color: var(--ant-color-text-secondary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-card__actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  border-top: 1px solid var(--ant-color-border-secondary);
  padding-top: 8px;
}
</style>
