import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import { createMockCrud } from '../../device/_mock';

const applyStatusDict = () =>
  dict({
    data: [
      { value: '草稿', label: '草稿', color: 'default' },
      { value: '待审批', label: '待审批', color: 'processing' },
      { value: '已批准', label: '已批准', color: 'success' },
      { value: '已驳回', label: '已驳回', color: 'error' },
      { value: '已过期', label: '已过期', color: 'default' },
    ],
  });

const airspaceTypeDict = () =>
  dict({
    data: [
      { value: 'W', label: 'W 类（微型）' },
      { value: 'X', label: 'X 类（轻型）' },
      { value: 'Y', label: 'Y 类（小型）' },
      { value: 'Z', label: 'Z 类（中大型）' },
    ],
  });

const purposeDict = () =>
  dict({
    data: [
      { value: '日常巡检', label: '日常巡检' },
      { value: '应急响应', label: '应急响应' },
      { value: '测绘航摄', label: '测绘航摄' },
      { value: '环境监测', label: '环境监测' },
      { value: '安全巡查', label: '安全巡查' },
      { value: '培训飞行', label: '培训飞行' },
      { value: '其他', label: '其他' },
    ],
  });

const initialData = [
  { id: '1', applyNo: 'RA-20260413-001', routeName: '高新区主干道日巡航线', airspaceType: 'X', purpose: '日常巡检', pilot: '张伟', pilotCode: 'PLT-001', drone: '大航蜂 M300-01', maxAlt: 120, flightDate: '2026-04-14', startTime: '08:00', endTime: '10:00', area: '高新区主干道沿线', status: '待审批', approver: '', remark: '', createTime: '2026-04-13 14:00' },
  { id: '2', applyNo: 'RA-20260413-002', routeName: '北坡林区防火巡检航线', airspaceType: 'X', purpose: '日常巡检', pilot: '李明', pilotCode: 'PLT-002', drone: '大航蜂 M30T-02', maxAlt: 150, flightDate: '2026-04-14', startTime: '09:00', endTime: '11:30', area: '北坡林区全域', status: '已批准', approver: '周磊', remark: '注意避开军事管制区', createTime: '2026-04-13 10:30' },
  { id: '3', applyNo: 'RA-20260412-003', routeName: '渭河排污排查航线', airspaceType: 'Y', purpose: '环境监测', pilot: '王芳', pilotCode: 'PLT-003', drone: '大航蜂 M350-03', maxAlt: 100, flightDate: '2026-04-13', startTime: '14:00', endTime: '16:00', area: '渭河 K8-K15 段', status: '已批准', approver: '周磊', remark: '', createTime: '2026-04-12 16:20' },
  { id: '4', applyNo: 'RA-20260412-004', routeName: '工业区违建排查航线', airspaceType: 'X', purpose: '安全巡查', pilot: '赵强', pilotCode: 'PLT-004', drone: '大航蜂 FP-04', maxAlt: 120, flightDate: '2026-04-13', startTime: '08:00', endTime: '10:30', area: '工业区东片区', status: '已批准', approver: '周磊', remark: '', createTime: '2026-04-12 09:15' },
  { id: '5', applyNo: 'RA-20260411-005', routeName: '夜间红外测试航线', airspaceType: 'X', purpose: '培训飞行', pilot: '刘洋', pilotCode: 'PLT-005', drone: '大航蜂 M30T-08', maxAlt: 80, flightDate: '2026-04-12', startTime: '20:00', endTime: '21:30', area: '培训基地周边', status: '已驳回', approver: '周磊', remark: '夜间飞行需额外审批，请补充夜航资质材料', createTime: '2026-04-11 15:40' },
  { id: '6', applyNo: 'RA-20260413-006', routeName: '光伏电站巡检航线', airspaceType: 'W', purpose: '日常巡检', pilot: '陈静', pilotCode: 'PLT-006', drone: '大航蜂 M300-07', maxAlt: 60, flightDate: '2026-04-15', startTime: '10:00', endTime: '11:00', area: 'A 区光伏电站', status: '草稿', approver: '', remark: '', createTime: '2026-04-13 16:00' },
  { id: '7', applyNo: 'RA-20260410-007', routeName: '城区全覆盖测绘航线', airspaceType: 'Y', purpose: '测绘航摄', pilot: '赵强', pilotCode: 'PLT-004', drone: '大航蜂 M350-03', maxAlt: 200, flightDate: '2026-04-11', startTime: '07:00', endTime: '12:00', area: '城区 15km² 范围', status: '已过期', approver: '周磊', remark: '已完成飞行', createTime: '2026-04-10 08:00' },
];

const { pageRequest, addRequest, editRequest, delRequest } = createMockCrud(initialData);

export default function createCrudOptions(props: CreateCrudOptionsProps): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      rowHandle: {
        fixed: 'right',
        width: 250,
        buttons: {
          detail: {
            text: '详情',
            type: 'link',
            order: -1,
            click: ({ row }: any) => {
              (props as any).context?.openDetail?.(row);
            },
          },
          dispatch: {
            text: '创建任务',
            type: 'link',
            order: 0,
            show: ({ row }: any) => row.status === '已批准',
            click: ({ row }: any) => {
              (props as any).context?.createDispatchFromRoute?.(row);
            },
          },
        },
      },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        applyNo: {
          title: '申请编号',
          type: 'text',
          search: { show: true },
          column: { width: 160 },
          form: { show: false },
        },
        routeName: {
          title: '航线名称',
          type: 'text',
          search: { show: true },
          column: { width: 200 },
          form: { rules: [{ required: true, message: '请输入航线名称' }] },
        },
        airspaceType: {
          title: '空域类型',
          type: 'dict-select',
          dict: airspaceTypeDict(),
          column: { width: 120 },
        },
        purpose: {
          title: '飞行目的',
          type: 'dict-select',
          dict: purposeDict(),
          search: { show: true },
          column: { width: 100 },
        },
        pilot: {
          title: '飞手',
          type: 'text',
          search: { show: true },
          column: { width: 70 },
        },
        drone: {
          title: '执行设备',
          type: 'text',
          column: { width: 140 },
        },
        maxAlt: {
          title: '最大高度(m)',
          type: 'number',
          column: { width: 100, align: 'right' },
          form: { component: { min: 10, max: 500 } },
        },
        flightDate: {
          title: '飞行日期',
          type: 'text',
          search: { show: true, component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' }, rules: [{ required: true, message: '请选择日期' }] },
        },
        startTime: {
          title: '开始时间',
          type: 'text',
          column: { width: 90 },
          form: { component: { name: 'a-time-picker', valueFormat: 'HH:mm', format: 'HH:mm' } },
        },
        endTime: {
          title: '结束时间',
          type: 'text',
          column: { width: 90 },
          form: { component: { name: 'a-time-picker', valueFormat: 'HH:mm', format: 'HH:mm' } },
        },
        area: {
          title: '飞行区域',
          type: 'text',
          column: { width: 160 },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: applyStatusDict(),
          search: { show: true },
          column: { width: 90, component: { name: 'fs-dict-tag' } },
          form: { show: false },
        },
        approver: {
          title: '审批人',
          type: 'text',
          column: { width: 80 },
          form: { show: false },
        },
        remark: {
          title: '备注',
          type: 'textarea',
          column: { show: false },
        },
        createTime: {
          title: '申请时间',
          type: 'text',
          column: { width: 150 },
          form: { show: false },
        },
      },
    },
  };
}
