import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import { createMockCrud, imageryStatusDict, regionDict } from '../_mock';

const mockData = [
  { id: '1', flightId: 'FLT-20260413-001', droneName: '大航蜂 M300-01', routeName: '高新区主干道双向巡查线', region: '高新区北片', flightDate: '2026-04-13', duration: 25, distance: 8.5, photoCount: 186, videoCount: 2, storageSize: '3.2 GB', status: '已归档', createTime: '2026-04-13 14:58:00' },
  { id: '2', flightId: 'FLT-20260413-002', droneName: '大航蜂 M300-07', routeName: '城管巡检区全覆盖航线', region: '城管巡检区', flightDate: '2026-04-13', duration: 42, distance: 15.1, photoCount: 312, videoCount: 3, storageSize: '5.8 GB', status: '回传中', createTime: '2026-04-13 15:20:00' },
  { id: '3', flightId: 'FLT-20260412-003', droneName: '大航蜂 M30T-02', routeName: '林草周界定时巡检线', region: '林草防火区', flightDate: '2026-04-12', duration: 35, distance: 12.3, photoCount: 245, videoCount: 2, storageSize: '4.1 GB', status: '已归档', createTime: '2026-04-12 09:10:00' },
  { id: '4', flightId: 'FLT-20260412-004', droneName: '大航蜂 FP-04', routeName: '交通主干道违停抓拍线', region: '交通主干道', flightDate: '2026-04-12', duration: 20, distance: 6.0, photoCount: 128, videoCount: 1, storageSize: '1.9 GB', status: '已归档', createTime: '2026-04-12 18:05:00' },
  { id: '5', flightId: 'FLT-20260411-005', droneName: '大航蜂 M30-06', routeName: '沿河低空排污口核查线', region: '沿河西路', flightDate: '2026-04-11', duration: 18, distance: 4.2, photoCount: 96, videoCount: 1, storageSize: '1.5 GB', status: '已归档', createTime: '2026-04-11 16:40:00' },
  { id: '6', flightId: 'FLT-20260411-006', droneName: '大航蜂 T40-08', routeName: '光伏园区测绘航摄线', region: '光伏园区', flightDate: '2026-04-11', duration: 55, distance: 18.6, photoCount: 520, videoCount: 0, storageSize: '8.7 GB', status: '待处理', createTime: '2026-04-11 11:00:00' },
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
        flightId: {
          title: '架次编号',
          type: 'text',
          search: { show: true },
          column: { width: 180 },
        },
        droneName: {
          title: '执行无人机',
          type: 'text',
          column: { width: 160 },
        },
        routeName: {
          title: '执行航线',
          type: 'text',
          column: { width: 230, ellipsis: true },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          search: { show: true },
          column: { width: 130 },
        },
        flightDate: {
          title: '飞行日期',
          type: 'text',
          search: { show: true },
          column: { width: 120 },
        },
        duration: {
          title: '时长(min)',
          type: 'number',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        distance: {
          title: '距离(km)',
          type: 'number',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        photoCount: {
          title: '照片数',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { show: false },
        },
        videoCount: {
          title: '视频数',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { show: false },
        },
        storageSize: {
          title: '数据量',
          type: 'text',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: imageryStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
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
