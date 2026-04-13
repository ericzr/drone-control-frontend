import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  departmentDict,
  deviceStatusDict,
  regionDict,
} from '../_mock';

const vehicleTypeDict = () =>
  dict({
    data: [
      { value: '巡逻车', label: '巡逻车' },
      { value: '清扫车', label: '清扫车' },
      { value: '物流车', label: '物流车' },
      { value: '勘测车', label: '勘测车' },
    ],
  });

const driveDict = () =>
  dict({
    data: [
      { value: '纯电动', label: '纯电动' },
      { value: '油电混合', label: '油电混合' },
    ],
  });

const mockData = [
  {
    id: '1',
    name: '无人巡逻车 V-01',
    model: '百度 Apollo RT6',
    sn: 'APR6001',
    vehicleType: '巡逻车',
    driveType: '纯电动',
    status: '在线',
    battery: 82,
    region: '高新区北片',
    department: '综合指挥中心',
    maxSpeed: 40,
    operatingRadius: 5.0,
    firmware: 'v3.4.2',
    plateNo: '陕A·D0001',
    lastHeartbeat: '2026-04-13 16:05:30',
    createTime: '2025-12-01 10:00:00',
  },
  {
    id: '2',
    name: '无人清扫车 V-02',
    model: '仙途 S120',
    sn: 'XTS120002',
    vehicleType: '清扫车',
    driveType: '纯电动',
    status: '作业中',
    battery: 55,
    region: '城管巡检区',
    department: '城管局',
    maxSpeed: 15,
    operatingRadius: 3.0,
    firmware: 'v2.6.1',
    plateNo: '陕A·D0002',
    lastHeartbeat: '2026-04-13 16:10:12',
    createTime: '2026-01-15 14:00:00',
  },
  {
    id: '3',
    name: '无人勘测车 V-03',
    model: '大航蜂 GV-200',
    sn: 'DHFGV003',
    vehicleType: '勘测车',
    driveType: '油电混合',
    status: '在线',
    battery: 70,
    region: '交通主干道',
    department: '交管局',
    maxSpeed: 60,
    operatingRadius: 20.0,
    firmware: 'v1.9.0',
    plateNo: '陕A·D0003',
    lastHeartbeat: '2026-04-13 16:04:18',
    createTime: '2026-03-10 09:00:00',
  },
  {
    id: '4',
    name: '无人物流车 V-04',
    model: '新石器 X3',
    sn: 'XSQX3004',
    vehicleType: '物流车',
    driveType: '纯电动',
    status: '离线',
    battery: 12,
    region: '生态园区',
    department: '生态环境局',
    maxSpeed: 20,
    operatingRadius: 8.0,
    firmware: 'v2.1.5',
    plateNo: '陕A·D0004',
    lastHeartbeat: '2026-04-12 18:20:00',
    createTime: '2026-02-20 11:00:00',
  },
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
          title: '车辆名称',
          type: 'text',
          search: { show: true },
          column: { width: 160 },
          form: {
            rules: [{ required: true, message: '请输入车辆名称' }],
          },
        },
        model: {
          title: '车辆型号',
          type: 'text',
          column: { width: 150 },
        },
        sn: {
          title: '序列号',
          type: 'text',
          column: { width: 120 },
        },
        vehicleType: {
          title: '车辆类型',
          type: 'dict-select',
          dict: vehicleTypeDict(),
          search: { show: true },
          column: { width: 110, align: 'center' },
        },
        driveType: {
          title: '驱动方式',
          type: 'dict-select',
          dict: driveDict(),
          column: { width: 110, align: 'center' },
        },
        status: {
          title: '在线状态',
          type: 'dict-select',
          dict: deviceStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        battery: {
          title: '电量 %',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { component: { min: 0, max: 100 } },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
        },
        department: {
          title: '责任部门',
          type: 'dict-select',
          dict: departmentDict(),
          column: { width: 130 },
        },
        plateNo: {
          title: '车牌号',
          type: 'text',
          column: { width: 120 },
        },
        maxSpeed: {
          title: '最高时速(km/h)',
          type: 'number',
          column: { width: 140, align: 'center' },
        },
        operatingRadius: {
          title: '作业半径(km)',
          type: 'number',
          column: { width: 130, align: 'center' },
        },
        firmware: {
          title: '固件版本',
          type: 'text',
          column: { width: 110 },
        },
        lastHeartbeat: {
          title: '最后心跳',
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
