import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  regionDict,
  routeStatusDict,
  routeTypeDict,
} from '../_mock';

const mockData = [
  { id: '1', name: '高新区主干道双向巡查线', routeType: '普通巡检', region: '高新区北片', airport: '高新区一号机场', waypoints: 12, distance: 8.5, altitude: 120, speed: 10, estimatedTime: 25, safeCheck: '通过', status: '已发布', createTime: '2026-03-01 10:00:00' },
  { id: '2', name: '沿河低空排污口核查线', routeType: '应急侦察', region: '沿河西路', airport: '水务巡检机场', waypoints: 6, distance: 4.2, altitude: 60, speed: 6, estimatedTime: 18, safeCheck: '通过', status: '已发布', createTime: '2026-03-05 09:00:00' },
  { id: '3', name: '林草周界定时巡检线', routeType: '定时巡检', region: '林草防火区', airport: '林草防火机场', waypoints: 18, distance: 12.3, altitude: 150, speed: 12, estimatedTime: 35, safeCheck: '通过', status: '已发布', createTime: '2026-02-20 14:00:00' },
  { id: '4', name: '城管巡检区全覆盖航线', routeType: '普通巡检', region: '城管巡检区', airport: '城管巡检机场', waypoints: 22, distance: 15.1, altitude: 100, speed: 8, estimatedTime: 42, safeCheck: '通过', status: '已发布', createTime: '2026-03-10 11:00:00' },
  { id: '5', name: '光伏园区测绘航摄线', routeType: '测绘航摄', region: '光伏园区', airport: '光伏园区机场', waypoints: 30, distance: 18.6, altitude: 80, speed: 5, estimatedTime: 55, safeCheck: '通过', status: '待审核', createTime: '2026-04-01 08:00:00' },
  { id: '6', name: '交通主干道违停抓拍线', routeType: '普通巡检', region: '交通主干道', airport: '交通主干道机场', waypoints: 8, distance: 6.0, altitude: 100, speed: 10, estimatedTime: 20, safeCheck: '通过', status: '已发布', createTime: '2026-03-15 16:00:00' },
  { id: '7', name: '生态园区水域巡查线', routeType: '普通巡检', region: '生态园区', airport: '生态园区机场', waypoints: 10, distance: 7.8, altitude: 80, speed: 8, estimatedTime: 28, safeCheck: '通过', status: '草稿', createTime: '2026-04-10 09:30:00' },
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
          title: '航线名称',
          type: 'text',
          search: { show: true },
          column: { width: 220 },
          form: { rules: [{ required: true, message: '请输入航线名称' }] },
        },
        routeType: {
          title: '航线类型',
          type: 'dict-select',
          dict: routeTypeDict(),
          search: { show: true },
          column: { width: 120, align: 'center' },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          search: { show: true },
          column: { width: 130 },
        },
        airport: {
          title: '起降机场',
          type: 'text',
          column: { width: 160 },
        },
        waypoints: {
          title: '航点数',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { component: { min: 1 } },
        },
        distance: {
          title: '距离(km)',
          type: 'number',
          column: { width: 100, align: 'center' },
        },
        altitude: {
          title: '飞行高度(m)',
          type: 'number',
          column: { width: 120, align: 'center' },
          addForm: { value: 120 },
          form: { component: { min: 10, max: 500 } },
        },
        speed: {
          title: '飞行速度(m/s)',
          type: 'number',
          column: { width: 130, align: 'center' },
          addForm: { value: 10 },
        },
        estimatedTime: {
          title: '预估时间(min)',
          type: 'number',
          column: { width: 130, align: 'center' },
          form: { show: false },
        },
        safeCheck: {
          title: '安全检查',
          type: 'text',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: routeStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
          addForm: { value: '草稿' },
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
