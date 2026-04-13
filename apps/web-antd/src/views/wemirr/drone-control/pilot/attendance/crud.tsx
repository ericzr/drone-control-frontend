import type { CreateCrudOptionsRet } from '@fast-crud/fast-crud';

import {
  attendanceTypeDict,
  createMockCrud,
  departmentDict,
} from '../_mock';

const initialData = [
  { id: '1', pilotName: '张伟', pilotCode: 'PLT-001', department: '飞行一队', type: '签到', date: '2026-04-13', time: '08:02', location: '高新区一号机场', remark: '' },
  { id: '2', pilotName: '张伟', pilotCode: 'PLT-001', department: '飞行一队', type: '签退', date: '2026-04-13', time: '17:35', location: '高新区一号机场', remark: '' },
  { id: '3', pilotName: '李明', pilotCode: 'PLT-002', department: '飞行一队', type: '签到', date: '2026-04-13', time: '07:55', location: '高新区一号机场', remark: '' },
  { id: '4', pilotName: '王芳', pilotCode: 'PLT-003', department: '飞行二队', type: '请假', date: '2026-04-13', time: '-', location: '-', remark: '参加 CAAC 证书续期培训' },
  { id: '5', pilotName: '赵强', pilotCode: 'PLT-004', department: '巡检组', type: '签到', date: '2026-04-13', time: '07:48', location: '交通主干道机场', remark: '' },
  { id: '6', pilotName: '刘洋', pilotCode: 'PLT-005', department: '应急组', type: '请假', date: '2026-04-13', time: '-', location: '-', remark: '年假' },
  { id: '7', pilotName: '陈静', pilotCode: 'PLT-006', department: '飞行二队', type: '签到', date: '2026-04-13', time: '08:10', location: '生态园区机场', remark: '迟到 10 分钟' },
  { id: '8', pilotName: '周磊', pilotCode: 'PLT-007', department: '培训组', type: '签到', date: '2026-04-13', time: '07:50', location: '培训基地', remark: '' },
];

const { pageRequest, addRequest, editRequest, delRequest } =
  createMockCrud(initialData);

export default function createCrudOptions(): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        date: {
          title: '日期',
          type: 'text',
          search: { show: true, component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
        },
        pilotName: {
          title: '飞手姓名',
          type: 'text',
          search: { show: true },
          column: { width: 90 },
        },
        pilotCode: {
          title: '飞手编号',
          type: 'text',
          column: { width: 100 },
        },
        department: {
          title: '所属部门',
          type: 'dict-select',
          dict: departmentDict(),
          search: { show: true },
          column: { width: 100 },
        },
        type: {
          title: '考勤类型',
          type: 'dict-select',
          dict: attendanceTypeDict(),
          search: { show: true },
          column: { width: 90, component: { name: 'fs-dict-tag' } },
        },
        time: {
          title: '打卡时间',
          type: 'text',
          column: { width: 90 },
        },
        location: {
          title: '打卡地点',
          type: 'text',
          column: { width: 140 },
        },
        remark: {
          title: '备注',
          type: 'text',
          column: { show: true },
        },
      },
    },
  };
}
