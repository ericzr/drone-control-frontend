import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  detectMethodDict,
  detectStatusDict,
  modelTypeDict,
  spectrumDict,
} from '../_mock';

const mockData = [
  { id: '1', detectTime: '2026-04-13 14:32:18', method: '图片识别', modelName: '无人机小目标检测 v11s', modelType: '目标检测', spectrum: 'visible', totalTargets: 55, categories: 4, avgConfidence: 0.5924, elapsedMs: 173, fileName: '0000006_00159_d_0000001.jpg', resolution: '1360×766', status: '已完成' },
  { id: '2', detectTime: '2026-04-13 14:28:05', method: '图片识别', modelName: '车辆违停检测 v8m', modelType: '目标检测', spectrum: 'visible', totalTargets: 12, categories: 3, avgConfidence: 0.8312, elapsedMs: 86, fileName: '违停_20260413_1428.jpg', resolution: '1920×1080', status: '已完成' },
  { id: '3', detectTime: '2026-04-13 14:15:30', method: '视频识别', modelName: '烟火识别模型', modelType: '目标检测', spectrum: 'visible', totalTargets: 28, categories: 2, avgConfidence: 0.8750, elapsedMs: 8500, fileName: '森林巡检_20260413.mp4', resolution: '3840×2160', status: '已完成' },
  { id: '4', detectTime: '2026-04-13 13:50:00', method: '摄像头识别', modelName: '安全帽检测', modelType: '目标检测', spectrum: 'visible', totalTargets: 156, categories: 2, avgConfidence: 0.9012, elapsedMs: 0, fileName: 'rtsp://192.168.1.103:554/live', resolution: '1920×1080', status: '已完成' },
  { id: '5', detectTime: '2026-04-13 11:20:00', method: '图片识别', modelName: '光伏热斑检测', modelType: '异常检测', spectrum: 'infrared', totalTargets: 8, categories: 2, avgConfidence: 0.7623, elapsedMs: 210, fileName: 'solar_ir_panel_A03.tiff', resolution: '640×480', status: '已完成' },
  { id: '6', detectTime: '2026-04-13 10:45:00', method: '视频识别', modelName: '水体污染识别', modelType: '图像分类', spectrum: 'multispectral', totalTargets: 3, categories: 1, avgConfidence: 0.6845, elapsedMs: 12300, fileName: '渭河K12_多光谱.avi', resolution: '2048×1536', status: '已完成' },
  { id: '7', detectTime: '2026-04-13 09:30:00', method: '图片识别', modelName: '路面损伤分割', modelType: '语义分割', spectrum: 'visible', totalTargets: 15, categories: 3, avgConfidence: 0.8534, elapsedMs: 345, fileName: '路面_科技路218.jpg', resolution: '4032×3024', status: '已完成' },
  { id: '8', detectTime: '2026-04-12 16:00:00', method: '摄像头识别', modelName: '无人机小目标检测 v11s', modelType: '目标检测', spectrum: 'visible', totalTargets: 0, categories: 0, avgConfidence: 0, elapsedMs: 0, fileName: 'rtsp://192.168.1.101:554/live', resolution: '1920×1080', status: '失败' },
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
          toEvent: {
            text: '转事件',
            type: 'link',
            order: 0,
            click: ({ row }: any) => {
              (props as any).context?.toEvent?.(row);
            },
          },
        },
      },
      columns: {
        id: hiddenIdColumn,
        detectTime: {
          title: '检测时间',
          type: 'text',
          column: { width: 170, sorter: true },
          form: { show: false },
        },
        method: {
          title: '检测方式',
          type: 'dict-select',
          dict: detectMethodDict(),
          search: { show: true },
          column: { width: 110, align: 'center' },
        },
        modelName: {
          title: '使用模型',
          type: 'text',
          search: { show: true },
          column: { width: 190 },
        },
        modelType: {
          title: '模型类型',
          type: 'dict-select',
          dict: modelTypeDict(),
          column: { width: 110, align: 'center' },
        },
        spectrum: {
          title: '光谱类型',
          type: 'dict-select',
          dict: spectrumDict(),
          search: { show: true },
          column: { width: 130, align: 'center' },
        },
        totalTargets: {
          title: '目标总数',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { show: false },
        },
        categories: {
          title: '类别数',
          type: 'number',
          column: { width: 80, align: 'center' },
          form: { show: false },
        },
        avgConfidence: {
          title: '平均置信度',
          type: 'number',
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: detectStatusDict(),
          search: { show: true },
          column: { width: 90, align: 'center' },
        },
        fileName: {
          title: '文件/源',
          type: 'text',
          column: { width: 200, ellipsis: true },
          form: { show: false },
        },
      },
    },
  };
}
