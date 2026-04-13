import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  eventTypeDict,
  regionDict,
  reviewResultDict,
} from '../_mock';

const mockData = [
  { id: '1', eventNo: 'EVT-20260413-002', eventType: '占道经营', region: '城管巡检区', location: '朝阳路步行街入口', source: 'AI识别', confidence: 89, snapshot: '占道_20260413_1440.jpg', reviewer: '', reviewResult: '', reviewRemark: '', reviewTime: '', status: '待复核', createTime: '2026-04-13 14:40:05' },
  { id: '2', eventNo: 'EVT-20260413-001', eventType: '违停', region: '高新区北片', location: '高新路与科技路交叉口', source: 'AI识别', confidence: 96, snapshot: '违停_20260413_1431.jpg', reviewer: '张指挥', reviewResult: '确认有效', reviewRemark: '确认违停，已转派交管局', reviewTime: '2026-04-13 14:45:00', status: '已复核', createTime: '2026-04-13 14:31:02' },
  { id: '3', eventNo: 'EVT-20260412-004', eventType: '排污', region: '沿河西路', location: '排污口 A-3', source: 'AI识别', confidence: 92, snapshot: '排污_20260412_1635.jpg', reviewer: '李巡查', reviewResult: '确认有效', reviewRemark: '确认为工业废水排放，需现场取证', reviewTime: '2026-04-12 17:00:00', status: '已复核', createTime: '2026-04-12 16:35:08' },
  { id: '4', eventNo: 'EVT-20260411-007', eventType: '违停', region: '高新区北片', location: '创业路 56 号门前', source: 'AI识别', confidence: 94, snapshot: '违停_20260411_0845.jpg', reviewer: '张指挥', reviewResult: '误报排除', reviewRemark: '核实为临时许可停车', reviewTime: '2026-04-11 09:10:00', status: '已复核', createTime: '2026-04-11 08:45:06' },
  { id: '5', eventNo: 'EVT-20260413-003', eventType: '烟火', region: '林草防火区', location: '北坡 37° 区域', source: '卫星热点', confidence: 0, snapshot: '', reviewer: '王安全', reviewResult: '待现场核实', reviewRemark: '已派无人机前往核查', reviewTime: '2026-04-13 10:15:00', status: '已复核', createTime: '2026-04-13 10:05:30' },
];

import { dict } from '@fast-crud/fast-crud';

const reviewStatusDict = () =>
  dict({
    data: [
      { value: '待复核', label: '待复核', color: 'warning' },
      { value: '已复核', label: '已复核', color: 'success' },
    ],
  });

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
        eventNo: {
          title: '事件编号',
          type: 'text',
          search: { show: true },
          column: { width: 190 },
          form: { show: false },
        },
        eventType: {
          title: '事件类型',
          type: 'dict-select',
          dict: eventTypeDict(),
          search: { show: true },
          column: { width: 120, align: 'center' },
          form: { show: false },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
          form: { show: false },
        },
        location: {
          title: '事发地点',
          type: 'text',
          column: { width: 200, ellipsis: true },
          form: { show: false },
        },
        source: {
          title: '事件来源',
          type: 'text',
          column: { width: 100 },
          form: { show: false },
        },
        confidence: {
          title: '置信度(%)',
          type: 'number',
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        reviewer: {
          title: '复核人',
          type: 'text',
          column: { width: 100 },
          form: { rules: [{ required: true, message: '请输入复核人' }] },
        },
        reviewResult: {
          title: '复核结果',
          type: 'dict-select',
          dict: reviewResultDict(),
          search: { show: true },
          column: { width: 130, align: 'center' },
          form: { rules: [{ required: true, message: '请选择复核结果' }] },
        },
        reviewRemark: {
          title: '复核意见',
          type: 'textarea',
          column: { width: 220, ellipsis: true },
          form: { col: { span: 24 } },
        },
        reviewTime: {
          title: '复核时间',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
        },
        createTime: {
          title: '事件时间',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
        },
      },
    },
  };
}
