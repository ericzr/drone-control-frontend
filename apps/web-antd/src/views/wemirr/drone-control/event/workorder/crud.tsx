import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  departmentDict,
  eventTypeDict,
  regionDict,
  workOrderStatusDict,
} from '../_mock';

const mockData = [
  { id: '1', orderNo: 'WO-20260413-001', eventNo: 'EVT-20260413-001', eventType: '违停', region: '高新区北片', location: '高新路与科技路交叉口', assignDept: '交管局', assignee: '钱交警', status: '处理中', deadline: '2026-04-13 18:00', description: '白色轿车违停占用公交站台，需现场处置', result: '', createTime: '2026-04-13 14:46:00' },
  { id: '2', orderNo: 'WO-20260412-002', eventNo: 'EVT-20260412-004', eventType: '排污', region: '沿河西路', location: '排污口 A-3', assignDept: '水务局', assignee: '李巡查', status: '处理中', deadline: '2026-04-14 12:00', description: '工业废水排放，需采样取证并责令整改', result: '', createTime: '2026-04-12 17:05:00' },
  { id: '3', orderNo: 'WO-20260412-003', eventNo: 'EVT-20260412-005', eventType: '漂浮物', region: '生态园区', location: '人工湖西侧', assignDept: '城管局', assignee: '赵管理', status: '已完成', deadline: '2026-04-13 12:00', description: '大面积水面垃圾，需安排清理', result: '已清理完毕，水面恢复正常', createTime: '2026-04-12 14:30:00' },
  { id: '4', orderNo: 'WO-20260411-004', eventNo: 'EVT-20260411-006', eventType: '道路损坏', region: '交通主干道', location: '科技路 218 号路段', assignDept: '城管局', assignee: '周维修', status: '已完成', deadline: '2026-04-12 18:00', description: '路面塌陷坑洞约 1m，紧急修补', result: '已完成沥青填补和标线恢复', createTime: '2026-04-11 18:00:00' },
  { id: '5', orderNo: 'WO-20260410-005', eventNo: 'EVT-20260410-008', eventType: '违建', region: '城管巡检区', location: '朝阳路 18 号楼顶', assignDept: '城管局', assignee: '赵管理', status: '待分配', deadline: '2026-04-15 18:00', description: '楼顶违章搭建，需执法队现场取证', result: '', createTime: '2026-04-10 10:00:00' },
  { id: '6', orderNo: 'WO-20260413-006', eventNo: 'EVT-20260413-003', eventType: '烟火', region: '林草防火区', location: '北坡 37° 区域', assignDept: '林草局', assignee: '王安全', status: '处理中', deadline: '2026-04-13 16:00', description: '疑似明火，紧急派员核查', result: '', createTime: '2026-04-13 10:20:00' },
];

const mockCrud = createMockCrud(mockData);

export default function (_props: CreateCrudOptionsProps): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: {
        pageRequest: mockCrud.pageRequest,
        addRequest: mockCrud.addRequest,
        editRequest: mockCrud.editRequest,
        delRequest: mockCrud.delRequest,
      },
      columns: {
        id: hiddenIdColumn,
        orderNo: {
          title: '工单编号',
          type: 'text',
          search: { show: true },
          column: { width: 180 },
        },
        eventNo: {
          title: '关联事件',
          type: 'text',
          column: { width: 190 },
        },
        eventType: {
          title: '事件类型',
          type: 'dict-select',
          dict: eventTypeDict(),
          search: { show: true },
          column: { width: 120, align: 'center' },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
        },
        location: {
          title: '处置地点',
          type: 'text',
          column: { width: 200, ellipsis: true },
        },
        assignDept: {
          title: '派单部门',
          type: 'dict-select',
          dict: departmentDict(),
          search: { show: true },
          column: { width: 120 },
          form: { rules: [{ required: true, message: '请选择派单部门' }] },
        },
        assignee: {
          title: '处置人',
          type: 'text',
          column: { width: 100 },
          form: { rules: [{ required: true, message: '请输入处置人' }] },
        },
        status: {
          title: '工单状态',
          type: 'dict-select',
          dict: workOrderStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
          addForm: { value: '待分配' },
        },
        deadline: {
          title: '截止时间',
          type: 'text',
          column: { width: 170 },
        },
        description: {
          title: '处置要求',
          type: 'textarea',
          column: { width: 220, ellipsis: true },
          form: { col: { span: 24 } },
        },
        result: {
          title: '处置结果',
          type: 'textarea',
          column: { width: 220, ellipsis: true },
          form: { col: { span: 24 } },
        },
        createTime: {
          title: '创建时间',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
        },
      },
    },
  };
}
