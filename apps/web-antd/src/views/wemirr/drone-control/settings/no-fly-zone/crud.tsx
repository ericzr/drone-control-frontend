import type { CreateCrudOptionsRet } from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import { createMockCrud } from '../../device/_mock';

const zoneLevelDict = () =>
  dict({
    data: [
      { value: '永久禁飞', label: '永久禁飞', color: 'error' },
      { value: '限时禁飞', label: '限时禁飞', color: 'warning' },
      { value: '限高区域', label: '限高区域', color: 'processing' },
      { value: '审批飞行', label: '审批飞行', color: 'default' },
    ],
  });

const zoneStatusDict = () =>
  dict({
    data: [
      { value: '生效中', label: '生效中', color: 'success' },
      { value: '待生效', label: '待生效', color: 'processing' },
      { value: '已失效', label: '已失效', color: 'default' },
    ],
  });

const initialData = [
  { id: '1', name: '军事管制区 A', level: '永久禁飞', status: '生效中', maxAlt: 0, center: '108.92, 34.30', radius: '3000m', effectTime: '永久', source: '空管部门', remark: '军事管制区域，严禁飞行', createTime: '2024-01-15' },
  { id: '2', name: '机场净空区', level: '永久禁飞', status: '生效中', maxAlt: 0, center: '108.96, 34.22', radius: '6000m', effectTime: '永久', source: '民航局', remark: '民航机场净空保护区', createTime: '2024-01-15' },
  { id: '3', name: '政府办公区', level: '限高区域', status: '生效中', maxAlt: 50, center: '108.94, 34.26', radius: '500m', effectTime: '永久', source: '公安局', remark: '限高 50m 以下飞行', createTime: '2024-03-20' },
  { id: '4', name: '大型活动临时禁飞', level: '限时禁飞', status: '待生效', maxAlt: 0, center: '108.95, 34.27', radius: '2000m', effectTime: '2026-05-01 ~ 2026-05-03', source: '公安局', remark: '五一活动期间临时禁飞', createTime: '2026-04-10' },
  { id: '5', name: '学校区域', level: '审批飞行', status: '生效中', maxAlt: 120, center: '108.93, 34.25', radius: '300m', effectTime: '永久', source: '教育局', remark: '需提前报备审批', createTime: '2025-06-01' },
];

const { pageRequest, addRequest, editRequest, delRequest } = createMockCrud(initialData);

export default function createCrudOptions(): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        name: {
          title: '区域名称',
          type: 'text',
          search: { show: true },
          column: { width: 160 },
          form: { rules: [{ required: true, message: '请输入名称' }] },
        },
        level: {
          title: '限制级别',
          type: 'dict-select',
          dict: zoneLevelDict(),
          search: { show: true },
          column: { width: 110, component: { name: 'fs-dict-tag' } },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: zoneStatusDict(),
          search: { show: true },
          column: { width: 90, component: { name: 'fs-dict-tag' } },
        },
        maxAlt: {
          title: '限高(m)',
          type: 'number',
          column: { width: 90, align: 'right' },
        },
        center: {
          title: '中心坐标',
          type: 'text',
          column: { width: 140 },
        },
        radius: {
          title: '范围半径',
          type: 'text',
          column: { width: 100 },
        },
        effectTime: {
          title: '生效时段',
          type: 'text',
          column: { width: 180 },
        },
        source: {
          title: '下发机构',
          type: 'text',
          column: { width: 90 },
        },
        remark: {
          title: '备注',
          type: 'textarea',
          column: { show: false },
        },
        createTime: {
          title: '创建时间',
          type: 'text',
          column: { width: 110 },
          form: { show: false },
        },
      },
    },
  };
}
