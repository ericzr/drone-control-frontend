<script lang="ts" setup name="AiMarketplacePage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Tag,
  message,
} from 'ant-design-vue';

const searchKeyword = ref('');
const selectedCategory = ref('全部');
const categoryOptions = [
  { label: '全部', value: '全部' },
  { label: '目标检测', value: '目标检测' },
  { label: '语义分割', value: '语义分割' },
  { label: '异常检测', value: '异常检测' },
  { label: 'OCR识别', value: 'OCR识别' },
  { label: '大模型', value: '大模型' },
];

const algorithms = ref([
  {
    name: '通用目标检测',
    desc: '基于 YOLOv11 的高性能通用目标检测算法，支持 80+ 类别识别。',
    tags: ['YOLOv11', '实时检测', 'GPU加速'],
    provider: '大航蜂 AI 团队',
    category: '目标检测',
    price: '免费',
    calls: '12.5万次/月',
    rating: 4.8,
  },
  {
    name: '违停车辆检测',
    desc: '专为城市道路场景优化的车辆违停检测算法，支持夜间和遮挡场景。',
    tags: ['YOLOv8', '违停', '交通'],
    provider: '大航蜂 AI 团队',
    category: '目标检测',
    price: '¥0.01/次',
    calls: '8.2万次/月',
    rating: 4.6,
  },
  {
    name: '烟火识别',
    desc: '高灵敏度烟雾和明火检测算法，支持远距离小目标烟火识别。',
    tags: ['YOLOv11', '烟火', '林草'],
    provider: '大航蜂 AI 团队',
    category: '目标检测',
    price: '¥0.02/次',
    calls: '3.6万次/月',
    rating: 4.9,
  },
  {
    name: '路面损伤分割',
    desc: '像素级路面损伤分割检测，支持裂缝、坑洞、车辙等多类型缺陷。',
    tags: ['RT-DETR', '分割', '道路'],
    provider: '大航蜂 AI 团队',
    category: '语义分割',
    price: '¥0.03/次',
    calls: '1.8万次/月',
    rating: 4.5,
  },
  {
    name: '智能巡检助手（大模型）',
    desc: '基于 Qwen2-VL 的多模态理解能力，支持自然语言提问和图像分析。',
    tags: ['Qwen2-VL', '多模态', '大模型'],
    provider: '大航蜂 AI 团队',
    category: '大模型',
    price: '¥0.05/次',
    calls: '5200次/月',
    rating: 4.7,
  },
  {
    name: '光伏热斑检测',
    desc: '基于红外热成像的光伏面板热斑异常检测，支持自动化巡检。',
    tags: ['YOLOv8', '红外', '光伏'],
    provider: '大航蜂 AI 团队',
    category: '异常检测',
    price: '¥0.02/次',
    calls: '6800次/月',
    rating: 4.4,
  },
  {
    name: '水体污染分析',
    desc: '基于 CLIP 语义理解的水体颜色和污染状态分析。',
    tags: ['CLIP', '水质', '环保'],
    provider: '大航蜂 AI 团队',
    category: '异常检测',
    price: '¥0.02/次',
    calls: '2100次/月',
    rating: 4.2,
  },
  {
    name: '车牌识别 OCR',
    desc: '高精度车牌字符识别，支持蓝牌、绿牌、黄牌等多类型。',
    tags: ['PaddleOCR', '车牌', '交通'],
    provider: '大航蜂 AI 团队',
    category: 'OCR识别',
    price: '免费',
    calls: '6.5万次/月',
    rating: 4.6,
  },
]);

const filteredAlgorithms = ref(algorithms.value);

function doSearch() {
  filteredAlgorithms.value = algorithms.value.filter((item) => {
    const matchCategory =
      selectedCategory.value === '全部' || item.category === selectedCategory.value;
    const matchKeyword =
      searchKeyword.value.trim() === '' ||
      item.name.includes(searchKeyword.value.trim()) ||
      item.desc.includes(searchKeyword.value.trim());
    return matchCategory && matchKeyword;
  });
}

function getRatingStars(rating: number) {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false">
        <div class="flex items-center gap-4 flex-wrap">
          <Input
            v-model:value="searchKeyword"
            allow-clear
            placeholder="搜索算法名称或描述"
            style="width: 300px"
            @press-enter="doSearch"
          />
          <Select
            v-model:value="selectedCategory"
            :options="categoryOptions"
            style="width: 160px"
            @change="doSearch"
          />
          <Button type="primary" @click="doSearch">搜索</Button>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col
          v-for="algo in filteredAlgorithms"
          :key="algo.name"
          :xl="6"
          :lg="8"
          :md="12"
          :span="24"
        >
          <Card :bordered="false" hoverable class="h-full">
            <div class="flex flex-col h-full">
              <div class="text-base font-semibold text-slate-900 dark:text-slate-100">
                {{ algo.name }}
              </div>
              <div class="mt-2 flex-1 text-sm leading-6 text-slate-500">
                {{ algo.desc }}
              </div>
              <div class="mt-3 flex flex-wrap gap-1">
                <Tag v-for="tag in algo.tags" :key="tag" color="blue" size="small">
                  {{ tag }}
                </Tag>
              </div>
              <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{{ algo.provider }}</span>
                <span class="text-amber-500">{{ getRatingStars(algo.rating) }} {{ algo.rating }}</span>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-sm font-medium" :class="algo.price === '免费' ? 'text-green-600' : 'text-slate-700 dark:text-slate-300'">
                  {{ algo.price }}
                </span>
                <Space>
                  <Button size="small" @click="message.info(`${algo.name} 详情页占位`)">详情</Button>
                  <Button size="small" type="primary" @click="message.success(`已订阅 ${algo.name}`)">
                    {{ algo.price === '免费' ? '免费使用' : '订阅' }}
                  </Button>
                </Space>
              </div>
              <div class="mt-1 text-xs text-slate-300">
                月调用量 {{ algo.calls }}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>
