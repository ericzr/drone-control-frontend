import type { CreateCrudOptionsRet } from '@fast-crud/fast-crud';

import { coordinateDict, createMockCrud, resourceStatusDict, resourceTypeDict } from '../_mock';

const initialData = [
  { id: '1', name: '高新区 2026Q1 正射', type: '正射影像', coordinate: 'CGCS2000', resolution: '5cm', fileSize: '12.8 GB', area: '28.5 km²', captureDate: '2026-03-15', status: '已发布', createTime: '2026-03-18' },
  { id: '2', name: '北坡林区三维模型', type: '倾斜摄影', coordinate: 'WGS84', resolution: '3cm', fileSize: '45.2 GB', area: '8.2 km²', captureDate: '2026-02-20', status: '已发布', createTime: '2026-02-25' },
  { id: '3', name: '城区 DEM 30m', type: 'DEM高程', coordinate: 'CGCS2000', resolution: '30m', fileSize: '560 MB', area: '180 km²', captureDate: '2025-12-10', status: '已发布', createTime: '2025-12-15' },
  { id: '4', name: '主干道标注数据', type: '标注数据', coordinate: 'GCJ02', resolution: '-', fileSize: '85 MB', area: '52 km', captureDate: '2026-04-01', status: '已发布', createTime: '2026-04-02' },
  { id: '5', name: '水务河段点云', type: '点云数据', coordinate: 'WGS84', resolution: '2cm', fileSize: '23.6 GB', area: '5.8 km', captureDate: '2026-04-08', status: '处理中', createTime: '2026-04-10' },
  { id: '6', name: '工业区违建排查正射', type: '正射影像', coordinate: 'CGCS2000', resolution: '3cm', fileSize: '8.5 GB', area: '12 km²', captureDate: '2026-04-12', status: '处理中', createTime: '2026-04-12' },
];

const { pageRequest, addRequest, editRequest, delRequest } = createMockCrud(initialData);

export default function createCrudOptions(): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: { pageRequest, addRequest, editRequest, delRequest },
      columns: {
        id: { title: 'ID', type: 'text', column: { show: false }, form: { show: false } },
        name: {
          title: '资源名称',
          type: 'text',
          search: { show: true },
          column: { width: 200 },
          form: { rules: [{ required: true, message: '请输入名称' }] },
        },
        type: {
          title: '数据类型',
          type: 'dict-select',
          dict: resourceTypeDict(),
          search: { show: true },
          column: { width: 110 },
        },
        coordinate: {
          title: '坐标系',
          type: 'dict-select',
          dict: coordinateDict(),
          column: { width: 100 },
        },
        resolution: {
          title: '分辨率',
          type: 'text',
          column: { width: 80 },
        },
        fileSize: {
          title: '文件大小',
          type: 'text',
          column: { width: 100 },
          form: { show: false },
        },
        area: {
          title: '覆盖范围',
          type: 'text',
          column: { width: 100 },
        },
        captureDate: {
          title: '采集日期',
          type: 'text',
          column: { width: 110 },
          form: { component: { name: 'a-date-picker', valueFormat: 'YYYY-MM-DD' } },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: resourceStatusDict(),
          search: { show: true },
          column: { width: 90, component: { name: 'fs-dict-tag' } },
        },
        createTime: {
          title: '上传时间',
          type: 'text',
          column: { width: 110 },
          form: { show: false },
        },
      },
    },
  };
}
