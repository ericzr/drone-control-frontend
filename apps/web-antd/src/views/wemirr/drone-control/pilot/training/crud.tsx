import type { CreateCrudOptionsRet } from '@fast-crud/fast-crud';

import {
  createMockCrud,
  trainingStatusDict,
  trainingTypeDict,
} from '../_mock';

const initialData = [
  { id: '1', title: '2026 年第二季度安全教育', type: '安全教育', trainer: '周磊', startDate: '2026-04-20', endDate: '2026-04-20', status: '未开始', participants: 12, location: '培训基地 A 教室', content: '无人机飞行安全法规解读、应急处置流程', hours: 4 },
  { id: '2', title: 'M350 RTK 新机型实操培训', type: '新机型培训', trainer: '赵强', startDate: '2026-04-15', endDate: '2026-04-18', status: '进行中', participants: 6, location: '高新区一号机场', content: 'DJI M350 RTK 飞行操控、负载切换、RTK 精准定位', hours: 16 },
  { id: '3', title: '林区防火应急演练', type: '应急演练', trainer: '王芳', startDate: '2026-04-10', endDate: '2026-04-11', status: '已完成', participants: 8, location: '北坡林区', content: '火情发现→报告→协同扑灭全流程模拟', hours: 8 },
  { id: '4', title: 'CAAC 法规理论复习', type: '理论培训', trainer: '周磊', startDate: '2026-04-05', endDate: '2026-04-05', status: '已完成', participants: 15, location: '培训基地 B 教室', content: '无人机空域管理、适航审定、持证飞行要求', hours: 6 },
  { id: '5', title: '夜间红外巡检实操', type: '实操飞行', trainer: '赵强', startDate: '2026-04-25', endDate: '2026-04-26', status: '未开始', participants: 4, location: '交通主干道机场', content: '红外载荷操作、夜间起降、图像判读', hours: 8 },
  { id: '6', title: '水域巡检场景培训', type: '实操飞行', trainer: '李明', startDate: '2026-03-28', endDate: '2026-03-29', status: '已完成', participants: 5, location: '水务巡检机场', content: '河道低空飞行、水面异物识别、样本采集', hours: 10 },
];

const { pageRequest, addRequest, editRequest, delRequest } =
  createMockCrud(initialData);

export default function createCrudOptions(): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        title: {
          title: '培训主题',
          type: 'text',
          search: { show: true },
          column: { width: 220 },
          form: { rules: [{ required: true, message: '请输入培训主题' }] },
        },
        type: {
          title: '培训类型',
          type: 'dict-select',
          dict: trainingTypeDict(),
          search: { show: true },
          column: { width: 110 },
        },
        trainer: {
          title: '培训讲师',
          type: 'text',
          column: { width: 90 },
        },
        participants: {
          title: '参训人数',
          type: 'number',
          column: { width: 90, align: 'right' },
        },
        hours: {
          title: '学时(h)',
          type: 'number',
          column: { width: 80, align: 'right' },
        },
        startDate: {
          title: '开始日期',
          type: 'text',
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
        },
        endDate: {
          title: '结束日期',
          type: 'text',
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: trainingStatusDict(),
          search: { show: true },
          column: { width: 90, component: { name: 'fs-dict-tag' } },
        },
        location: {
          title: '培训地点',
          type: 'text',
          column: { width: 140 },
        },
        content: {
          title: '培训内容',
          type: 'textarea',
          column: { show: false },
        },
      },
    },
  };
}
