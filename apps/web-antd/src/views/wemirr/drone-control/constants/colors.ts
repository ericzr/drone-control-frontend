/**
 * 共享标签/徽标颜色映射。
 * 从 dispatch/task 与 overview 抽取，消除重复。
 */

/** 任务优先级 → Tag color */
export function getPriorityColor(priority: string): string {
  if (priority === '紧急') return 'red';
  if (priority === '高') return 'orange';
  return 'blue';
}

/** 任务状态 → Tag color */
export function getTaskStatusColor(status: string): string {
  if (status === '执行中') return 'processing';
  if (status === '排队中') return 'warning';
  if (status === '已完成') return 'success';
  if (status === '返航中') return 'orange';
  if (status === '已取消') return 'default';
  return 'default';
}

/** 告警级别 → 色值 */
export function getAlertLevelColor(level: string): string {
  if (level === 'critical') return '#ff4d4f';
  if (level === 'warning') return '#faad14';
  return '#1677ff';
}

/** 告警级别 → 中文 */
export function getAlertLevelText(level: string): string {
  if (level === 'critical') return '紧急';
  if (level === 'warning') return '一般';
  return '提示';
}
