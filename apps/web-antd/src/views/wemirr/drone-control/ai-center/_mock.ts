import { dict } from '@fast-crud/fast-crud';

export { createMockCrud } from '../device/_mock';

export const modelTypeDict = () =>
  dict({
    data: [
      { value: '目标检测', label: '目标检测' },
      { value: '语义分割', label: '语义分割' },
      { value: '图像分类', label: '图像分类' },
      { value: '异常检测', label: '异常检测' },
      { value: 'OCR识别', label: 'OCR识别' },
      { value: '多模态大模型', label: '多模态大模型' },
    ],
  });

export const frameworkDict = () =>
  dict({
    data: [
      { value: 'YOLOv11', label: 'YOLOv11' },
      { value: 'YOLOv8', label: 'YOLOv8' },
      { value: 'RT-DETR', label: 'RT-DETR' },
      { value: 'Qwen2-VL', label: 'Qwen2-VL' },
      { value: 'PaddleOCR', label: 'PaddleOCR' },
      { value: 'CLIP', label: 'CLIP' },
    ],
  });

export const modelStatusDict = () =>
  dict({
    data: [
      { value: '训练中', label: '训练中', color: 'processing' },
      { value: '已发布', label: '已发布', color: 'success' },
      { value: '草稿', label: '草稿', color: 'default' },
      { value: '已废弃', label: '已废弃', color: 'error' },
    ],
  });

export const deployStatusDict = () =>
  dict({
    data: [
      { value: '运行中', label: '运行中', color: 'success' },
      { value: '已停止', label: '已停止', color: 'default' },
      { value: '部署中', label: '部署中', color: 'processing' },
      { value: '异常', label: '异常', color: 'error' },
    ],
  });

export const inferenceDict = () =>
  dict({
    data: [
      { value: 'TensorRT', label: 'TensorRT' },
      { value: 'ONNX Runtime', label: 'ONNX Runtime' },
      { value: 'vLLM', label: 'vLLM' },
      { value: 'Triton', label: 'Triton' },
    ],
  });

export const deviceTypeDict = () =>
  dict({
    data: [
      { value: 'GPU A100', label: 'GPU A100' },
      { value: 'GPU A10', label: 'GPU A10' },
      { value: 'GPU T4', label: 'GPU T4' },
      { value: 'CPU', label: 'CPU' },
      { value: '边缘设备', label: '边缘设备' },
    ],
  });

export const spectrumDict = () =>
  dict({
    data: [
      { value: 'visible', label: '可见光（RGB）' },
      { value: 'infrared', label: '红外热成像' },
      { value: 'multispectral', label: '多光谱' },
      { value: 'sar', label: 'SAR 雷达' },
    ],
  });

export const inputSourceDict = () =>
  dict({
    data: [
      { value: 'image', label: '图片' },
      { value: 'video', label: '视频' },
      { value: 'stream', label: '实时流' },
      { value: 'all', label: '全类型' },
    ],
  });

export const sceneDict = () =>
  dict({
    data: [
      { value: 'traffic', label: '交通巡查' },
      { value: 'forest-fire', label: '森林防火' },
      { value: 'construction', label: '安全生产' },
      { value: 'environment', label: '环境监测' },
      { value: 'solar', label: '光伏巡检' },
      { value: 'city-admin', label: '城市管理' },
      { value: 'water', label: '水域监测' },
    ],
  });

export const detectStatusDict = () =>
  dict({
    data: [
      { value: '已完成', label: '已完成', color: 'success' },
      { value: '检测中', label: '检测中', color: 'processing' },
      { value: '失败', label: '失败', color: 'error' },
    ],
  });

export const detectMethodDict = () =>
  dict({
    data: [
      { value: '图片识别', label: '图片识别' },
      { value: '视频识别', label: '视频识别' },
      { value: '摄像头识别', label: '摄像头识别' },
    ],
  });
