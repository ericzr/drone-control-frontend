import type { CreateCrudOptionsRet } from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import {
  createMockCrud,
  departmentDict,
  pilotStatusDict,
  skillLevelDict,
} from '../_mock';

const initialData = [
  { id: '1', name: '张伟', code: 'PLT-001', gender: '男', phone: '138****1001', department: '飞行一队', skillLevel: '高级', status: '在岗', totalHours: 286.5, totalSorties: 342, assignedDrone: '大航蜂 M300-01', createTime: '2024-06-15' },
  { id: '2', name: '李明', code: 'PLT-002', gender: '男', phone: '139****2002', department: '飞行一队', skillLevel: '中级', status: '在岗', totalHours: 152.3, totalSorties: 187, assignedDrone: '大航蜂 M30T-02', createTime: '2024-07-20' },
  { id: '3', name: '王芳', code: 'PLT-003', gender: '女', phone: '137****3003', department: '飞行二队', skillLevel: '高级', status: '培训中', totalHours: 310.8, totalSorties: 408, assignedDrone: '大航蜂 M350-03', createTime: '2024-03-10' },
  { id: '4', name: '赵强', code: 'PLT-004', gender: '男', phone: '136****4004', department: '巡检组', skillLevel: '专家', status: '在岗', totalHours: 520.2, totalSorties: 645, assignedDrone: '大航蜂 FP-04', createTime: '2023-11-05' },
  { id: '5', name: '刘洋', code: 'PLT-005', gender: '男', phone: '135****5005', department: '应急组', skillLevel: '中级', status: '休假', totalHours: 98.6, totalSorties: 120, assignedDrone: '大航蜂 M30-06', createTime: '2025-01-08' },
  { id: '6', name: '陈静', code: 'PLT-006', gender: '女', phone: '133****6006', department: '飞行二队', skillLevel: '初级', status: '在岗', totalHours: 45.2, totalSorties: 56, assignedDrone: '大航蜂 M300-07', createTime: '2025-03-22' },
  { id: '7', name: '周磊', code: 'PLT-007', gender: '男', phone: '131****7007', department: '培训组', skillLevel: '高级', status: '在岗', totalHours: 380.0, totalSorties: 490, assignedDrone: '', createTime: '2024-01-15' },
];

const { pageRequest, addRequest, editRequest, delRequest } =
  createMockCrud(initialData);

export default function createCrudOptions(): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        code: {
          title: '飞手编号',
          type: 'text',
          search: { show: true },
          column: { width: 110 },
        },
        name: {
          title: '姓名',
          type: 'text',
          search: { show: true },
          column: { width: 80 },
          form: { rules: [{ required: true, message: '请输入姓名' }] },
        },
        gender: {
          title: '性别',
          type: 'dict-select',
          dict: dict({ data: [{ value: '男', label: '男' }, { value: '女', label: '女' }] }),
          column: { width: 60 },
        },
        phone: {
          title: '联系电话',
          type: 'text',
          column: { width: 120 },
        },
        department: {
          title: '所属部门',
          type: 'dict-select',
          dict: departmentDict(),
          search: { show: true },
          column: { width: 100 },
        },
        skillLevel: {
          title: '技能等级',
          type: 'dict-select',
          dict: skillLevelDict(),
          search: { show: true },
          column: { width: 90, component: { name: 'fs-dict-tag' } },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: pilotStatusDict(),
          search: { show: true },
          column: { width: 80, component: { name: 'fs-dict-tag' } },
        },
        totalHours: {
          title: '飞行时长(h)',
          type: 'number',
          column: { width: 110, align: 'right' },
          form: { show: false },
        },
        totalSorties: {
          title: '飞行架次',
          type: 'number',
          column: { width: 90, align: 'right' },
          form: { show: false },
        },
        assignedDrone: {
          title: '关联设备',
          type: 'text',
          column: { width: 140 },
        },
        createTime: {
          title: '入职日期',
          type: 'text',
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
        },
      },
    },
  };
}
