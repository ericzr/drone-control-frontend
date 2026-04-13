import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  planStatusDict,
  planTypeDict,
  priorityDict,
  regionDict,
} from '../_mock';

const mockData = [
  { id: '1', name: '高新主干道日巡', routeName: '高新区主干道双向巡查线', planType: '定时任务', schedule: '每日 08:30', region: '高新区北片', airport: '高新区一号机场', drone: '大航蜂 M300-01', aiPolicy: '违停识别 + 拥堵分析', priority: '普通', status: '执行中', creator: '张指挥', createTime: '2026-03-01 10:00:00' },
  { id: '2', name: '沿河排污口应急核查', routeName: '沿河低空排污口核查线', planType: '即时任务', schedule: '立即执行', region: '沿河西路', airport: '水务巡检机场', drone: '大航蜂 M30-06', aiPolicy: '漂浮物识别 + 排污口比对', priority: '高', status: '待执行', creator: '李巡查', createTime: '2026-04-13 15:48:00' },
  { id: '3', name: '林草防火晨巡', routeName: '林草周界定时巡检线', planType: '定时任务', schedule: '每日 06:00', region: '林草防火区', airport: '林草防火机场', drone: '大航蜂 M30T-02', aiPolicy: '烟火识别 + 热源检测', priority: '紧急', status: '已完成', creator: '王安全', createTime: '2026-02-20 14:00:00' },
  { id: '4', name: '城管全覆盖巡查', routeName: '城管巡检区全覆盖航线', planType: '定时任务', schedule: '每周一/三/五 09:00', region: '城管巡检区', airport: '城管巡检机场', drone: '大航蜂 M300-07', aiPolicy: '占道识别 + 违建检测', priority: '普通', status: '排队中', creator: '赵管理', createTime: '2026-03-10 11:00:00' },
  { id: '5', name: '光伏园区测绘', routeName: '光伏园区测绘航摄线', planType: '待命任务', schedule: '天气合适时', region: '光伏园区', airport: '光伏园区机场', drone: '大航蜂 T40-08', aiPolicy: '热斑检测 + 污损识别', priority: '普通', status: '待执行', creator: '孙测绘', createTime: '2026-04-01 08:00:00' },
  { id: '6', name: '交通晚高峰监测', routeName: '交通主干道违停抓拍线', planType: '定时任务', schedule: '每日 17:30', region: '交通主干道', airport: '交通主干道机场', drone: '大航蜂 FP-04', aiPolicy: '车流统计 + 事故检测', priority: '普通', status: '已完成', creator: '张指挥', createTime: '2026-03-15 16:00:00' },
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
        name: {
          title: '计划名称',
          type: 'text',
          search: { show: true },
          column: { width: 190 },
          form: { rules: [{ required: true, message: '请输入计划名称' }] },
        },
        routeName: {
          title: '关联航线',
          type: 'text',
          column: { width: 220, ellipsis: true },
        },
        planType: {
          title: '任务类型',
          type: 'dict-select',
          dict: planTypeDict(),
          search: { show: true },
          column: { width: 110, align: 'center' },
        },
        schedule: {
          title: '执行计划',
          type: 'text',
          column: { width: 160 },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
        },
        airport: {
          title: '执行机场',
          type: 'text',
          column: { width: 160 },
        },
        drone: {
          title: '执行无人机',
          type: 'text',
          column: { width: 160 },
        },
        aiPolicy: {
          title: 'AI识别策略',
          type: 'text',
          column: { width: 200, ellipsis: true },
        },
        priority: {
          title: '优先级',
          type: 'dict-select',
          dict: priorityDict(),
          search: { show: true },
          column: { width: 90, align: 'center' },
          addForm: { value: '普通' },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: planStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
          addForm: { value: '待执行' },
        },
        creator: {
          title: '创建人',
          type: 'text',
          column: { width: 100 },
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
