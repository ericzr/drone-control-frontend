import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import {
  createMockCrud,
  licenseStatusDict,
  licenseTypeDict,
} from '../_mock';

const initialData = [
  { id: '1', pilotName: '张伟', pilotCode: 'PLT-001', licenseType: 'CAAC', licenseNo: 'CAAC-2023-08652', issueDate: '2023-06-15', expiryDate: '2026-06-14', status: '有效', issuer: '中国民用航空局' },
  { id: '2', pilotName: '张伟', pilotCode: 'PLT-001', licenseType: 'AOPA', licenseNo: 'AOPA-S-2023-1245', issueDate: '2023-08-20', expiryDate: '2025-08-19', status: '即将过期', issuer: 'AOPA 中国' },
  { id: '3', pilotName: '李明', pilotCode: 'PLT-002', licenseType: 'UTC', licenseNo: 'UTC-2024-03421', issueDate: '2024-03-10', expiryDate: '2026-03-09', status: '有效', issuer: '大疆 UTC' },
  { id: '4', pilotName: '王芳', pilotCode: 'PLT-003', licenseType: 'CAAC', licenseNo: 'CAAC-2022-06310', issueDate: '2022-09-01', expiryDate: '2025-08-31', status: '即将过期', issuer: '中国民用航空局' },
  { id: '5', pilotName: '赵强', pilotCode: 'PLT-004', licenseType: 'CAAC', licenseNo: 'CAAC-2021-04112', issueDate: '2021-05-18', expiryDate: '2024-05-17', status: '已过期', issuer: '中国民用航空局' },
  { id: '6', pilotName: '赵强', pilotCode: 'PLT-004', licenseType: 'INTERNAL', licenseNo: 'INT-2024-0088', issueDate: '2024-12-01', expiryDate: '2025-12-01', status: '有效', issuer: '大航蜂科技' },
  { id: '7', pilotName: '刘洋', pilotCode: 'PLT-005', licenseType: 'UTC', licenseNo: 'UTC-2025-00156', issueDate: '2025-01-15', expiryDate: '2027-01-14', status: '有效', issuer: '大疆 UTC' },
  { id: '8', pilotName: '陈静', pilotCode: 'PLT-006', licenseType: 'INTERNAL', licenseNo: 'INT-2025-0102', issueDate: '2025-03-22', expiryDate: '2026-03-22', status: '有效', issuer: '大航蜂科技' },
];

const { pageRequest, addRequest, editRequest, delRequest } =
  createMockCrud(initialData);

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
        licenseType: {
          title: '证书类型',
          type: 'dict-select',
          dict: licenseTypeDict(),
          search: { show: true },
          column: { width: 160 },
        },
        licenseNo: {
          title: '证书编号',
          type: 'text',
          search: { show: true },
          column: { width: 170 },
        },
        issuer: {
          title: '发证机关',
          type: 'text',
          column: { width: 120 },
        },
        issueDate: {
          title: '发证日期',
          type: 'text',
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
        },
        expiryDate: {
          title: '有效期至',
          type: 'text',
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: licenseStatusDict(),
          search: { show: true },
          column: { width: 100, component: { name: 'fs-dict-tag' } },
        },
      },
    },
  };
}
