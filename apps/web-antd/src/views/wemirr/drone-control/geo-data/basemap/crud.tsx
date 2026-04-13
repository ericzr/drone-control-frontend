import type { CreateCrudOptionsRet } from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import { coordinateDict, createMockCrud, mapProviderDict } from '../_mock';

const initialData = [
  { id: '1', name: '高德矢量底图', provider: 'amap', coordinate: 'GCJ02', url: 'https://webrd0{1-4}.is.autonavi.com/...', isDefault: true, enabled: true, remark: 'SaaS 默认底图' },
  { id: '2', name: '天地图矢量', provider: 'tianditu', coordinate: 'CGCS2000', url: 'https://t{0-7}.tianditu.gov.cn/...', isDefault: false, enabled: true, remark: '政务合规场景' },
  { id: '3', name: '天地图影像', provider: 'tianditu', coordinate: 'CGCS2000', url: 'https://t{0-7}.tianditu.gov.cn/img_w/...', isDefault: false, enabled: true, remark: '卫星影像底图' },
  { id: '4', name: 'Mars3D 三维', provider: 'mars3d', coordinate: 'WGS84', url: 'http://mars3d.cn/...', isDefault: false, enabled: false, remark: '本地化三维场景' },
  { id: '5', name: 'Cesium 地球', provider: 'cesium', coordinate: 'WGS84', url: 'https://cesium.com/...', isDefault: false, enabled: false, remark: '数字孪生场景' },
];

const { pageRequest, addRequest, editRequest, delRequest } = createMockCrud(initialData);

export default function createCrudOptions(): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        name: {
          title: '底图名称',
          type: 'text',
          search: { show: true },
          column: { width: 160 },
          form: { rules: [{ required: true, message: '请输入名称' }] },
        },
        provider: {
          title: '地图服务',
          type: 'dict-select',
          dict: mapProviderDict(),
          search: { show: true },
          column: { width: 120 },
        },
        coordinate: {
          title: '坐标系',
          type: 'dict-select',
          dict: coordinateDict(),
          column: { width: 100 },
        },
        url: {
          title: '服务地址',
          type: 'text',
          column: { width: 240, ellipsis: true },
        },
        isDefault: {
          title: '默认底图',
          type: 'dict-switch',
          dict: dict({ data: [{ value: true, label: '是' }, { value: false, label: '否' }] }),
          column: { width: 90, align: 'center' },
        },
        enabled: {
          title: '启用',
          type: 'dict-switch',
          dict: dict({ data: [{ value: true, label: '启用' }, { value: false, label: '停用' }] }),
          column: { width: 80, align: 'center' },
        },
        remark: {
          title: '备注',
          type: 'text',
        },
      },
    },
  };
}
