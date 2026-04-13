import { dict } from '@fast-crud/fast-crud';

export { createMockCrud } from '../device/_mock';

/** 航线类型 */
export const routeTypeDict = () =>
  dict({
    data: [
      { value: '普通巡检', label: '普通巡检' },
      { value: '应急侦察', label: '应急侦察' },
      { value: '定时巡检', label: '定时巡检' },
      { value: '测绘航摄', label: '测绘航摄' },
    ],
  });

/** 航线状态 */
export const routeStatusDict = () =>
  dict({
    data: [
      { value: '草稿', label: '草稿', color: 'default' },
      { value: '待审核', label: '待审核', color: 'warning' },
      { value: '已发布', label: '已发布', color: 'success' },
      { value: '已归档', label: '已归档', color: 'default' },
    ],
  });

/** 任务类型 */
export const planTypeDict = () =>
  dict({
    data: [
      { value: '待命任务', label: '待命任务' },
      { value: '即时任务', label: '即时任务' },
      { value: '定时任务', label: '定时任务' },
    ],
  });

/** 任务状态 */
export const planStatusDict = () =>
  dict({
    data: [
      { value: '待执行', label: '待执行', color: 'default' },
      { value: '排队中', label: '排队中', color: 'warning' },
      { value: '执行中', label: '执行中', color: 'processing' },
      { value: '已完成', label: '已完成', color: 'success' },
      { value: '已取消', label: '已取消', color: 'error' },
    ],
  });

/** 优先级 */
export const priorityDict = () =>
  dict({
    data: [
      { value: '普通', label: '普通', color: 'default' },
      { value: '高', label: '高', color: 'warning' },
      { value: '紧急', label: '紧急', color: 'error' },
    ],
  });

/** 需求状态 */
export const demandStatusDict = () =>
  dict({
    data: [
      { value: '待审核', label: '待审核', color: 'warning' },
      { value: '已通过', label: '已通过', color: 'success' },
      { value: '已驳回', label: '已驳回', color: 'error' },
      { value: '已派单', label: '已派单', color: 'processing' },
      { value: '已完成', label: '已完成', color: 'default' },
    ],
  });

/** 影像状态 */
export const imageryStatusDict = () =>
  dict({
    data: [
      { value: '回传中', label: '回传中', color: 'processing' },
      { value: '已归档', label: '已归档', color: 'success' },
      { value: '待处理', label: '待处理', color: 'warning' },
    ],
  });

/** 区域 */
export const regionDict = () =>
  dict({
    data: [
      { value: '高新区北片', label: '高新区北片' },
      { value: '生态园区', label: '生态园区' },
      { value: '林草防火区', label: '林草防火区' },
      { value: '交通主干道', label: '交通主干道' },
      { value: '沿河西路', label: '沿河西路' },
      { value: '城管巡检区', label: '城管巡检区' },
      { value: '光伏园区', label: '光伏园区' },
    ],
  });

/** 提报部门 */
export const departmentDict = () =>
  dict({
    data: [
      { value: '林草局', label: '林草局' },
      { value: '交管局', label: '交管局' },
      { value: '城管局', label: '城管局' },
      { value: '应急管理局', label: '应急管理局' },
      { value: '生态环境局', label: '生态环境局' },
      { value: '水务局', label: '水务局' },
      { value: '自然资源局', label: '自然资源局' },
    ],
  });
