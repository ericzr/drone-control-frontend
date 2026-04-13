import { dict } from '@fast-crud/fast-crud';

import { createMockCrud } from '../device/_mock';

export { createMockCrud };

export const pilotStatusDict = () =>
  dict({
    data: [
      { value: '在岗', label: '在岗', color: 'success' },
      { value: '休假', label: '休假', color: 'default' },
      { value: '培训中', label: '培训中', color: 'processing' },
      { value: '离岗', label: '离岗', color: 'error' },
    ],
  });

export const licenseTypeDict = () =>
  dict({
    data: [
      { value: 'CAAC', label: 'CAAC 无人机驾驶证' },
      { value: 'AOPA', label: 'AOPA 合格证' },
      { value: 'UTC', label: 'UTC 培训合格证' },
      { value: 'INTERNAL', label: '企业内部认证' },
    ],
  });

export const licenseStatusDict = () =>
  dict({
    data: [
      { value: '有效', label: '有效', color: 'success' },
      { value: '即将过期', label: '即将过期', color: 'warning' },
      { value: '已过期', label: '已过期', color: 'error' },
    ],
  });

export const skillLevelDict = () =>
  dict({
    data: [
      { value: '初级', label: '初级', color: 'default' },
      { value: '中级', label: '中级', color: 'processing' },
      { value: '高级', label: '高级', color: 'success' },
      { value: '专家', label: '专家', color: 'warning' },
    ],
  });

export const attendanceTypeDict = () =>
  dict({
    data: [
      { value: '签到', label: '签到', color: 'success' },
      { value: '签退', label: '签退', color: 'default' },
      { value: '请假', label: '请假', color: 'warning' },
      { value: '缺勤', label: '缺勤', color: 'error' },
    ],
  });

export const trainingTypeDict = () =>
  dict({
    data: [
      { value: '理论培训', label: '理论培训' },
      { value: '实操飞行', label: '实操飞行' },
      { value: '应急演练', label: '应急演练' },
      { value: '安全教育', label: '安全教育' },
      { value: '新机型培训', label: '新机型培训' },
    ],
  });

export const trainingStatusDict = () =>
  dict({
    data: [
      { value: '未开始', label: '未开始', color: 'default' },
      { value: '进行中', label: '进行中', color: 'processing' },
      { value: '已完成', label: '已完成', color: 'success' },
      { value: '已取消', label: '已取消', color: 'error' },
    ],
  });

export const departmentDict = () =>
  dict({
    data: [
      { value: '飞行一队', label: '飞行一队' },
      { value: '飞行二队', label: '飞行二队' },
      { value: '巡检组', label: '巡检组' },
      { value: '应急组', label: '应急组' },
      { value: '培训组', label: '培训组' },
    ],
  });
