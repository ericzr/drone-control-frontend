import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  eventLevelDict,
  eventStatusDict,
  eventTypeDict,
  regionDict,
} from '../_mock';

const mockData = [
  { id: '1', eventNo: 'EVT-20260413-001', eventType: '违停', level: '一般', region: '高新区北片', location: '高新路与科技路交叉口', source: 'AI识别', sourceDrone: '大航蜂 M300-01', confidence: 96, status: '已派单', snapshot: '违停车辆_20260413_1431.jpg', description: '白色轿车违停占用公交站台', eventTime: '2026-04-13 14:31:00', createTime: '2026-04-13 14:31:02' },
  { id: '2', eventNo: 'EVT-20260413-002', eventType: '占道经营', level: '一般', region: '城管巡检区', location: '朝阳路步行街入口', source: 'AI识别', sourceDrone: '大航蜂 M300-07', confidence: 89, status: '待复核', snapshot: '占道_20260413_1440.jpg', description: '流动摊贩占用人行道', eventTime: '2026-04-13 14:40:00', createTime: '2026-04-13 14:40:05' },
  { id: '3', eventNo: 'EVT-20260413-003', eventType: '烟火', level: '重大', region: '林草防火区', location: '北坡 37° 区域', source: '卫星热点', sourceDrone: '', confidence: 0, status: '已确认', snapshot: '', description: '卫星热点告警，疑似明火', eventTime: '2026-04-13 10:05:00', createTime: '2026-04-13 10:05:30' },
  { id: '4', eventNo: 'EVT-20260412-004', eventType: '排污', level: '较大', region: '沿河西路', location: '排污口 A-3', source: 'AI识别', sourceDrone: '大航蜂 M30-06', confidence: 92, status: '处置中', snapshot: '排污_20260412_1635.jpg', description: '疑似工业废水排放', eventTime: '2026-04-12 16:35:00', createTime: '2026-04-12 16:35:08' },
  { id: '5', eventNo: 'EVT-20260412-005', eventType: '漂浮物', level: '一般', region: '生态园区', location: '人工湖西侧', source: 'AI识别', sourceDrone: '大航蜂 M350-03', confidence: 85, status: '已闭环', snapshot: '漂浮物_20260412_1410.jpg', description: '大面积水面垃圾漂浮', eventTime: '2026-04-12 14:10:00', createTime: '2026-04-12 14:10:12' },
  { id: '6', eventNo: 'EVT-20260411-006', eventType: '道路损坏', level: '一般', region: '交通主干道', location: '科技路 218 号路段', source: 'AI识别', sourceDrone: '大航蜂 FP-04', confidence: 78, status: '已闭环', snapshot: '路损_20260411_1745.jpg', description: '路面塌陷坑洞约 1m', eventTime: '2026-04-11 17:45:00', createTime: '2026-04-11 17:45:15' },
  { id: '7', eventNo: 'EVT-20260411-007', eventType: '违停', level: '一般', region: '高新区北片', location: '创业路 56 号门前', source: 'AI识别', sourceDrone: '大航蜂 M300-01', confidence: 94, status: '误报', snapshot: '违停_20260411_0845.jpg', description: '临时停车（已核实有许可）', eventTime: '2026-04-11 08:45:00', createTime: '2026-04-11 08:45:06' },
  { id: '8', eventNo: 'EVT-20260410-008', eventType: '违建', level: '较大', region: '城管巡检区', location: '朝阳路 18 号楼顶', source: '人工上报', sourceDrone: '', confidence: 0, status: '已派单', snapshot: '', description: '楼顶疑似违章搭建', eventTime: '2026-04-10 09:30:00', createTime: '2026-04-10 09:30:00' },
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
        eventNo: {
          title: '事件编号',
          type: 'text',
          search: { show: true },
          column: { width: 190 },
        },
        eventType: {
          title: '事件类型',
          type: 'dict-select',
          dict: eventTypeDict(),
          search: { show: true },
          column: { width: 120, align: 'center' },
        },
        level: {
          title: '事件等级',
          type: 'dict-select',
          dict: eventLevelDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
        },
        location: {
          title: '事发地点',
          type: 'text',
          column: { width: 200, ellipsis: true },
        },
        source: {
          title: '事件来源',
          type: 'text',
          column: { width: 100 },
          form: { show: false },
        },
        sourceDrone: {
          title: '识别设备',
          type: 'text',
          column: { width: 160 },
          form: { show: false },
        },
        confidence: {
          title: '置信度(%)',
          type: 'number',
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        status: {
          title: '处置状态',
          type: 'dict-select',
          dict: eventStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        description: {
          title: '事件描述',
          type: 'textarea',
          column: { width: 220, ellipsis: true },
          form: { col: { span: 24 } },
        },
        eventTime: {
          title: '事件时间',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
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
