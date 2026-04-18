import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  frameworkDict,
  inputSourceDict,
  modelStatusDict,
  modelTypeDict,
  sceneDict,
  spectrumDict,
} from '../_mock';

const mockData = [
  { id: '1', name: 'drone-det-v11s', displayName: '无人机小目标检测 v11s', modelType: '目标检测', spectrum: 'visible', inputSource: 'all', scene: 'city-admin', framework: 'YOLOv11', version: 'v1.2.0', dataset: 'VisDrone 2019', mAP50: 42.8, mAP5095: 28.3, fps: 156, modelSize: '18.5 MB', status: '已发布', creator: '算法团队', createTime: '2026-03-15 10:00:00' },
  { id: '2', name: 'vehicle-det-v8m', displayName: '车辆违停检测 v8m', modelType: '目标检测', spectrum: 'visible', inputSource: 'all', scene: 'traffic', framework: 'YOLOv8', version: 'v2.1.0', dataset: '自建违停数据集', mAP50: 89.2, mAP5095: 67.5, fps: 98, modelSize: '49.7 MB', status: '已发布', creator: '算法团队', createTime: '2026-02-20 14:00:00' },
  { id: '3', name: 'fire-smoke-det', displayName: '烟火识别模型', modelType: '目标检测', spectrum: 'visible', inputSource: 'all', scene: 'forest-fire', framework: 'YOLOv11', version: 'v1.0.0', dataset: '烟火数据集 v3', mAP50: 91.5, mAP5095: 72.1, fps: 142, modelSize: '22.3 MB', status: '已发布', creator: '算法团队', createTime: '2026-01-10 09:00:00' },
  { id: '4', name: 'road-damage-seg', displayName: '路面损伤分割', modelType: '语义分割', spectrum: 'visible', inputSource: 'image', scene: 'city-admin', framework: 'RT-DETR', version: 'v1.1.0', dataset: '路面损伤数据集', mAP50: 85.3, mAP5095: 61.8, fps: 45, modelSize: '67.2 MB', status: '已发布', creator: '算法团队', createTime: '2025-12-05 11:00:00' },
  { id: '5', name: 'qwen2vl-patrol', displayName: '智能巡检多模态分析', modelType: '多模态大模型', spectrum: 'visible', inputSource: 'image', scene: 'city-admin', framework: 'Qwen2-VL', version: 'v0.3.0', dataset: '-', mAP50: 0, mAP5095: 0, fps: 8, modelSize: '14.2 GB', status: '已发布', creator: 'AI 平台组', createTime: '2026-04-01 08:00:00' },
  { id: '6', name: 'solar-hotspot', displayName: '光伏热斑检测', modelType: '异常检测', spectrum: 'infrared', inputSource: 'all', scene: 'solar', framework: 'YOLOv8', version: 'v1.0.0', dataset: '光伏红外数据集', mAP50: 87.6, mAP5095: 64.2, fps: 112, modelSize: '25.8 MB', status: '训练中', creator: '算法团队', createTime: '2026-04-10 15:00:00' },
  { id: '7', name: 'water-pollution', displayName: '水体污染识别', modelType: '图像分类', spectrum: 'multispectral', inputSource: 'image', scene: 'water', framework: 'CLIP', version: 'v0.2.0', dataset: '水质图像数据集', mAP50: 0, mAP5095: 0, fps: 35, modelSize: '338 MB', status: '草稿', creator: '算法团队', createTime: '2026-04-08 16:00:00' },
  { id: '8', name: 'license-plate-ocr', displayName: '车牌识别 OCR', modelType: 'OCR识别', spectrum: 'visible', inputSource: 'all', scene: 'traffic', framework: 'PaddleOCR', version: 'v2.0.0', dataset: 'CCPD 数据集', mAP50: 0, mAP5095: 0, fps: 85, modelSize: '12.1 MB', status: '已发布', creator: '算法团队', createTime: '2025-11-20 10:00:00' },
  { id: '9', name: 'ir-person-det', displayName: '红外人员检测', modelType: '目标检测', spectrum: 'infrared', inputSource: 'stream', scene: 'construction', framework: 'YOLOv11', version: 'v1.0.0', dataset: '红外人体数据集', mAP50: 82.4, mAP5095: 58.6, fps: 130, modelSize: '20.1 MB', status: '已发布', creator: '算法团队', createTime: '2026-03-28 09:00:00' },
  { id: '10', name: 'ms-vegetation', displayName: '多光谱植被健康评估', modelType: '图像分类', spectrum: 'multispectral', inputSource: 'image', scene: 'environment', framework: 'CLIP', version: 'v0.1.0', dataset: '多光谱植被数据集', mAP50: 0, mAP5095: 0, fps: 22, modelSize: '420 MB', status: '草稿', creator: '算法团队', createTime: '2026-04-12 11:00:00' },
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
        },
      },
      columns: {
        id: hiddenIdColumn,
        name: {
          title: '模型标识',
          type: 'text',
          search: { show: true },
          column: { width: 170 },
          form: { rules: [{ required: true, message: '请输入模型标识' }] },
        },
        displayName: {
          title: '模型名称',
          type: 'text',
          column: { width: 190 },
          form: { rules: [{ required: true, message: '请输入模型名称' }] },
        },
        modelType: {
          title: '模型类型',
          type: 'dict-select',
          dict: modelTypeDict(),
          search: { show: true },
          column: { width: 130, align: 'center' },
        },
        spectrum: {
          title: '光谱类型',
          type: 'dict-select',
          dict: spectrumDict(),
          search: { show: true },
          column: { width: 130, align: 'center' },
        },
        inputSource: {
          title: '输入源',
          type: 'dict-select',
          dict: inputSourceDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        scene: {
          title: '应用场景',
          type: 'dict-select',
          dict: sceneDict(),
          search: { show: true },
          column: { width: 110, align: 'center' },
        },
        framework: {
          title: '框架',
          type: 'dict-select',
          dict: frameworkDict(),
          search: { show: true },
          column: { width: 110 },
        },
        version: {
          title: '版本',
          type: 'text',
          column: { width: 90 },
        },
        dataset: {
          title: '训练数据集',
          type: 'text',
          column: { width: 160, ellipsis: true },
        },
        mAP50: {
          title: 'mAP@50',
          type: 'number',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        fps: {
          title: 'FPS',
          type: 'number',
          column: { width: 80, align: 'center' },
          form: { show: false },
        },
        modelSize: {
          title: '模型大小',
          type: 'text',
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: modelStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
          addForm: { value: '草稿' },
        },
        creator: {
          title: '创建者',
          type: 'text',
          column: { width: 100 },
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
