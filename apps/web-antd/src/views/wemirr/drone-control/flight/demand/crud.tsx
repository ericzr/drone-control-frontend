import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  demandStatusDict,
  departmentDict,
  priorityDict,
  regionDict,
} from '../_mock';

const mockData = [
  { id: '1', title: '沿河排污口复查', department: '水务局', requester: '李巡查', region: '沿河西路', requirePoints: '排污口 A-3, A-5, B-1', timeRequirement: '2026-04-14 前', aiType: '漂浮物识别', priority: '高', status: '已派单', remark: '群众举报，需尽快核实', createTime: '2026-04-13 09:20:00' },
  { id: '2', title: '林区疑似烟点复核', department: '林草局', requester: '王安全', region: '林草防火区', requirePoints: '北坡 37°区域', timeRequirement: '立即', aiType: '烟火识别', priority: '紧急', status: '已通过', remark: '卫星热点告警触发', createTime: '2026-04-13 10:05:00' },
  { id: '3', title: '光伏组件巡检', department: '自然资源局', requester: '孙测绘', region: '光伏园区', requirePoints: 'A 区 1-5 排', timeRequirement: '本周内', aiType: '热斑检测', priority: '普通', status: '待审核', remark: '季度例行巡检', createTime: '2026-04-12 14:30:00' },
  { id: '4', title: '违章建筑航拍取证', department: '城管局', requester: '赵管理', region: '城管巡检区', requirePoints: '朝阳路 18 号周边', timeRequirement: '2026-04-15 前', aiType: '违建检测', priority: '高', status: '已派单', remark: '执法队申请航拍取证', createTime: '2026-04-11 16:00:00' },
  { id: '5', title: '交通事故现场航拍', department: '交管局', requester: '钱交警', region: '交通主干道', requirePoints: '高新路与科技路交叉口', timeRequirement: '立即', aiType: '事故检测', priority: '紧急', status: '已完成', remark: '多车追尾，需空中全景取证', createTime: '2026-04-10 08:45:00' },
  { id: '6', title: '河道堤坝安全检查', department: '水务局', requester: '李巡查', region: '沿河西路', requirePoints: '沿河大坝 1-3 段', timeRequirement: '汛期前', aiType: '结构异常检测', priority: '普通', status: '待审核', remark: '汛期前例行安全检查', createTime: '2026-04-09 11:00:00' },
  { id: '7', title: '噪声扰民排查', department: '生态环境局', requester: '周环保', region: '高新区北片', requirePoints: '高新花园小区周边', timeRequirement: '2026-04-16 前', aiType: '无', priority: '普通', status: '已驳回', remark: '不适合无人机执行', createTime: '2026-04-08 15:20:00' },
];

const mockCrud = createMockCrud(mockData);

export default function (props: CreateCrudOptionsProps): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: {
        pageRequest: mockCrud.pageRequest,
        addRequest: mockCrud.addRequest,
        editRequest: mockCrud.editRequest,
        delRequest: mockCrud.delRequest,
      },
      rowHandle: {
        fixed: 'right',
        width: 280,
        buttons: {
          detail: {
            text: '详情',
            type: 'link',
            order: -1,
            click: ({ row }: any) => {
              (props as any).context?.openDetail?.(row);
            },
          },
          approve: {
            text: '审核',
            type: 'link',
            order: 0,
            show: ({ row }: any) => row.status === '待审核',
            click: ({ row }: any) => {
              (props as any).context?.approveDemand?.(row);
            },
          },
          toRoute: {
            text: '生成航线',
            type: 'link',
            order: 1,
            show: ({ row }: any) => row.status === '已通过',
            click: ({ row }: any) => {
              (props as any).context?.toRoute?.(row);
            },
          },
          toDispatch: {
            text: '派单',
            type: 'link',
            order: 2,
            show: ({ row }: any) => row.status === '已通过' || row.status === '已派单',
            click: ({ row }: any) => {
              (props as any).context?.toDispatch?.(row);
            },
          },
        },
      },
      columns: {
        id: hiddenIdColumn,
        title: {
          title: '需求标题',
          type: 'text',
          search: { show: true },
          column: { width: 180 },
          form: { rules: [{ required: true, message: '请输入需求标题' }] },
        },
        department: {
          title: '提报部门',
          type: 'dict-select',
          dict: departmentDict(),
          search: { show: true },
          column: { width: 120 },
          form: { rules: [{ required: true, message: '请选择提报部门' }] },
        },
        requester: {
          title: '提报人',
          type: 'text',
          column: { width: 90 },
        },
        region: {
          title: '目标区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
        },
        requirePoints: {
          title: '需求点位',
          type: 'text',
          column: { width: 200, ellipsis: true },
        },
        timeRequirement: {
          title: '时间要求',
          type: 'text',
          column: { width: 140 },
        },
        aiType: {
          title: 'AI识别类型',
          type: 'text',
          column: { width: 130 },
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
          dict: demandStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
          addForm: { value: '待审核' },
        },
        remark: {
          title: '备注',
          type: 'textarea',
          column: { width: 200, ellipsis: true },
          form: { col: { span: 24 } },
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
