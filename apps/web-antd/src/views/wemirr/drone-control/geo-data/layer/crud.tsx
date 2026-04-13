import type { CreateCrudOptionsRet } from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import { createMockCrud, layerTypeDict } from '../_mock';

const initialData = [
  { id: '1', name: '机场点位', type: '业务图层', source: '设备中心', visible: true, opacity: 100, zIndex: 10, remark: '所有机场/机巢位置' },
  { id: '2', name: '禁飞区域', type: '叠加图层', source: '系统设置', visible: true, opacity: 60, zIndex: 20, remark: '限制飞行区域多边形' },
  { id: '3', name: '无人机轨迹', type: '业务图层', source: '飞控中心', visible: true, opacity: 80, zIndex: 15, remark: '实时与历史航迹' },
  { id: '4', name: '告警热力图', type: '热力图', source: '事件中心', visible: false, opacity: 70, zIndex: 25, remark: '基于历史告警的热力分布' },
  { id: '5', name: '巡检范围', type: '叠加图层', source: '调度中心', visible: true, opacity: 40, zIndex: 8, remark: '各巡检任务的覆盖范围' },
  { id: '6', name: 'AI 标注', type: '标注图层', source: 'AI 模型中心', visible: false, opacity: 90, zIndex: 30, remark: 'AI 识别结果标注点位' },
  { id: '7', name: '行政区划', type: '底图', source: '天地图', visible: true, opacity: 50, zIndex: 5, remark: '省市区边界' },
];

const { pageRequest, addRequest, editRequest, delRequest } = createMockCrud(initialData);

export default function createCrudOptions(): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        name: {
          title: '图层名称',
          type: 'text',
          search: { show: true },
          column: { width: 140 },
          form: { rules: [{ required: true, message: '请输入名称' }] },
        },
        type: {
          title: '图层类型',
          type: 'dict-select',
          dict: layerTypeDict(),
          search: { show: true },
          column: { width: 110 },
        },
        source: {
          title: '数据来源',
          type: 'text',
          column: { width: 120 },
        },
        visible: {
          title: '默认可见',
          type: 'dict-switch',
          dict: dict({ data: [{ value: true, label: '显示' }, { value: false, label: '隐藏' }] }),
          column: { width: 90, align: 'center' },
        },
        opacity: {
          title: '透明度(%)',
          type: 'number',
          column: { width: 100, align: 'right' },
          form: { component: { min: 0, max: 100 } },
        },
        zIndex: {
          title: '层级',
          type: 'number',
          column: { width: 70, align: 'right' },
        },
        remark: {
          title: '备注',
          type: 'text',
        },
      },
    },
  };
}
