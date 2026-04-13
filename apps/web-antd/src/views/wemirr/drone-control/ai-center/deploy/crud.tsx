import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  deployStatusDict,
  deviceTypeDict,
  inferenceDict,
  modelTypeDict,
} from '../_mock';

const mockData = [
  { id: '1', serviceName: 'drone-det-service', modelName: '无人机小目标检测 v11s', modelType: '目标检测', inference: 'TensorRT', device: 'GPU A10', replicas: 2, status: '运行中', qps: 156, avgLatency: 12, gpuUsage: 65, apiEndpoint: '/ai/detect/drone', uptime: '15d 8h', createTime: '2026-03-20 10:00:00' },
  { id: '2', serviceName: 'vehicle-det-service', modelName: '车辆违停检测 v8m', modelType: '目标检测', inference: 'TensorRT', device: 'GPU A10', replicas: 2, status: '运行中', qps: 98, avgLatency: 18, gpuUsage: 52, apiEndpoint: '/ai/detect/vehicle', uptime: '30d 2h', createTime: '2026-02-25 14:00:00' },
  { id: '3', serviceName: 'fire-smoke-service', modelName: '烟火识别模型', modelType: '目标检测', inference: 'TensorRT', device: 'GPU T4', replicas: 1, status: '运行中', qps: 142, avgLatency: 14, gpuUsage: 78, apiEndpoint: '/ai/detect/fire', uptime: '45d 6h', createTime: '2026-01-15 09:00:00' },
  { id: '4', serviceName: 'qwen2vl-service', modelName: '智能巡检多模态分析', modelType: '多模态大模型', inference: 'vLLM', device: 'GPU A100', replicas: 1, status: '运行中', qps: 8, avgLatency: 850, gpuUsage: 88, apiEndpoint: '/ai/vlm/patrol', uptime: '5d 12h', createTime: '2026-04-05 08:00:00' },
  { id: '5', serviceName: 'road-damage-service', modelName: '路面损伤分割', modelType: '语义分割', inference: 'ONNX Runtime', device: 'GPU T4', replicas: 1, status: '已停止', qps: 0, avgLatency: 0, gpuUsage: 0, apiEndpoint: '/ai/segment/road', uptime: '-', createTime: '2025-12-10 11:00:00' },
  { id: '6', serviceName: 'solar-det-service', modelName: '光伏热斑检测', modelType: '异常检测', inference: 'TensorRT', device: 'GPU T4', replicas: 1, status: '部署中', qps: 0, avgLatency: 0, gpuUsage: 0, apiEndpoint: '/ai/detect/solar', uptime: '-', createTime: '2026-04-12 15:00:00' },
  { id: '7', serviceName: 'ocr-plate-service', modelName: '车牌识别 OCR', modelType: 'OCR识别', inference: 'ONNX Runtime', device: 'CPU', replicas: 3, status: '运行中', qps: 85, avgLatency: 25, gpuUsage: 0, apiEndpoint: '/ai/ocr/plate', uptime: '60d 0h', createTime: '2025-11-25 10:00:00' },
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
        serviceName: {
          title: '服务名称',
          type: 'text',
          search: { show: true },
          column: { width: 180 },
          form: { rules: [{ required: true, message: '请输入服务名称' }] },
        },
        modelName: {
          title: '关联模型',
          type: 'text',
          column: { width: 190 },
        },
        modelType: {
          title: '模型类型',
          type: 'dict-select',
          dict: modelTypeDict(),
          search: { show: true },
          column: { width: 130, align: 'center' },
        },
        inference: {
          title: '推理引擎',
          type: 'dict-select',
          dict: inferenceDict(),
          column: { width: 130 },
        },
        device: {
          title: '部署设备',
          type: 'dict-select',
          dict: deviceTypeDict(),
          column: { width: 110 },
        },
        replicas: {
          title: '副本数',
          type: 'number',
          column: { width: 90, align: 'center' },
          addForm: { value: 1 },
        },
        status: {
          title: '状态',
          type: 'dict-select',
          dict: deployStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        qps: {
          title: 'QPS',
          type: 'number',
          column: { width: 80, align: 'center' },
          form: { show: false },
        },
        avgLatency: {
          title: '延迟(ms)',
          type: 'number',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        gpuUsage: {
          title: 'GPU(%)',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { show: false },
        },
        apiEndpoint: {
          title: 'API 端点',
          type: 'text',
          column: { width: 170 },
        },
        uptime: {
          title: '运行时间',
          type: 'text',
          column: { width: 110 },
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
