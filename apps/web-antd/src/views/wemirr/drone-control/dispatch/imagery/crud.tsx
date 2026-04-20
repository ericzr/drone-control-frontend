import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import { createMockCrud } from '../../device/_mock';

const imageryTypeDict = () =>
  dict({
    data: [
      { value: '可见光', label: '可见光' },
      { value: '红外热成像', label: '红外热成像' },
      { value: '多光谱', label: '多光谱' },
      { value: '激光雷达', label: '激光雷达' },
    ],
  });

const initialData = [
  { id: '1', taskName: '高新区主干道日巡', drone: '大航蜂 M300-01', pilot: '张伟', imageryType: '可见光', photoCount: 486, flightDate: '2026-04-13', waypoints: 32, coverage: '4.2 km²', fileSize: '2.8 GB', duration: '42 分钟' },
  { id: '2', taskName: '北坡林区防火巡检', drone: '大航蜂 M30T-02', pilot: '李明', imageryType: '红外热成像', photoCount: 312, flightDate: '2026-04-13', waypoints: 24, coverage: '6.5 km²', fileSize: '1.6 GB', duration: '38 分钟' },
  { id: '3', taskName: '渭河流域排污排查', drone: '大航蜂 M350-03', pilot: '王芳', imageryType: '可见光', photoCount: 628, flightDate: '2026-04-12', waypoints: 45, coverage: '8.1 km', fileSize: '4.2 GB', duration: '55 分钟' },
  { id: '4', taskName: '工业区违建排查', drone: '大航蜂 FP-04', pilot: '赵强', imageryType: '可见光', photoCount: 1024, flightDate: '2026-04-12', waypoints: 68, coverage: '12 km²', fileSize: '6.8 GB', duration: '72 分钟' },
  { id: '5', taskName: 'A 区光伏板巡检', drone: '大航蜂 M30T-08', pilot: '刘洋', imageryType: '红外热成像', photoCount: 256, flightDate: '2026-04-11', waypoints: 18, coverage: '2.4 km²', fileSize: '1.2 GB', duration: '28 分钟' },
  { id: '6', taskName: '城管全覆盖巡查', drone: '大航蜂 M300-07', pilot: '陈静', imageryType: '多光谱', photoCount: 845, flightDate: '2026-04-10', waypoints: 52, coverage: '15.6 km²', fileSize: '5.4 GB', duration: '85 分钟' },
];

const { pageRequest, addRequest, editRequest, delRequest } = createMockCrud(initialData);

export default function createCrudOptions(props: CreateCrudOptionsProps): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      rowHandle: {
        fixed: 'right',
        width: 200,
        buttons: {
          detail: {
            text: '详情',
            type: 'link',
            order: -1,
            click: ({ row }: any) => {
              (props as any).context?.openDetail?.(row);
            },
          },
        },
      },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        flightDate: {
          title: '飞行日期',
          type: 'text',
          search: { show: true, component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
          column: { width: 110 },
        },
        taskName: {
          title: '任务名称',
          type: 'text',
          search: { show: true },
          column: { width: 180 },
        },
        drone: {
          title: '执行设备',
          type: 'text',
          column: { width: 140 },
        },
        pilot: {
          title: '飞手',
          type: 'text',
          column: { width: 70 },
        },
        imageryType: {
          title: '影像类型',
          type: 'dict-select',
          dict: imageryTypeDict(),
          search: { show: true },
          column: { width: 110 },
        },
        photoCount: {
          title: '照片数',
          type: 'number',
          column: { width: 80, align: 'right' },
          form: { show: false },
        },
        waypoints: {
          title: '航点数',
          type: 'number',
          column: { width: 80, align: 'right' },
          form: { show: false },
        },
        coverage: {
          title: '覆盖范围',
          type: 'text',
          column: { width: 100 },
          form: { show: false },
        },
        duration: {
          title: '飞行时长',
          type: 'text',
          column: { width: 90 },
          form: { show: false },
        },
        fileSize: {
          title: '数据量',
          type: 'text',
          column: { width: 80 },
          form: { show: false },
        },
      },
    },
  };
}
