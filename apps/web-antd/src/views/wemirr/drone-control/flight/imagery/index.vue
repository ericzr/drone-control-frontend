<script lang="ts" setup name="FlightImageryPage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  SelectOption,
  Space,
  Spin,
  Tag,
  message,
} from 'ant-design-vue';

const searchQuery = ref('');
const searchMode = ref<'keyword' | 'semantic'>('semantic');
const searching = ref(false);
const hasSearched = ref(false);

interface ImageResult {
  id: string;
  src: string;
  caption: string;
  similarity: number;
  date: string;
  location: string;
  drone: string;
  tags: string[];
}

const results = ref<ImageResult[]>([]);

const presetQueries = [
  '红色车辆',
  '河面漂浮物',
  '烟雾',
  '施工现场人员未戴安全帽',
  '光伏板热斑',
  '路面裂缝',
];

function placeholder(idx: number, label: string): string {
  const colors = ['3b82f6', 'ef4444', 'f59e0b', '10b981', '8b5cf6', 'ec4899', '06b6d4', 'f97316'];
  const c = colors[idx % colors.length];
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='%23111827'/%3E%3Crect x='40' y='40' width='240' height='160' rx='4' fill='none' stroke='%23${c}' stroke-width='2' stroke-dasharray='6,3'/%3E%3Ctext x='160' y='125' text-anchor='middle' fill='%23${c}' font-size='12' font-family='monospace'%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;
}

const mockResultSets: Record<string, ImageResult[]> = {
  '红色车辆': [
    { id: '1', src: placeholder(1, '红色轿车 · 违停'), caption: '人民路交叉口发现红色轿车违停', similarity: 0.94, date: '2026-04-13 14:55', location: '人民路交叉口', drone: '大航蜂 FP-02', tags: ['违停', '红色', '轿车'] },
    { id: '2', src: placeholder(1, '红色SUV · 路侧'), caption: '学府路商业街红色 SUV', similarity: 0.87, date: '2026-04-13 11:30', location: '学府路商业街', drone: '大航蜂 M300-05', tags: ['停靠', '红色', 'SUV'] },
    { id: '3', src: placeholder(1, '红色货车 · 干道'), caption: '环城西路红色货车行驶中', similarity: 0.82, date: '2026-04-12 16:20', location: '环城西路', drone: '大航蜂 FP-02', tags: ['行驶', '红色', '货车'] },
    { id: '4', src: placeholder(7, '红色面包车'), caption: '工业区红色面包车', similarity: 0.78, date: '2026-04-12 10:45', location: '工业区东门', drone: '大航蜂 M300-07', tags: ['停靠', '红色', '面包车'] },
  ],
  '烟雾': [
    { id: '5', src: placeholder(1, '烟雾 · 北坡'), caption: '北坡林区疑似烟雾', similarity: 0.96, date: '2026-04-13 14:32', location: '北坡 230m', drone: '大航蜂 M30T-01', tags: ['烟雾', '林区', '紧急'] },
    { id: '6', src: placeholder(1, '烟雾 · 南坡'), caption: '南坡密林区烟雾', similarity: 0.91, date: '2026-04-13 10:20', location: '南坡密林区', drone: '大航蜂 M350-03', tags: ['烟雾', '明火', '林区'] },
    { id: '7', src: placeholder(3, '焚烧 · 农田'), caption: '农田秸秆焚烧产生烟雾', similarity: 0.84, date: '2026-04-11 15:10', location: '城郊农田', drone: '大航蜂 M30T-01', tags: ['焚烧', '烟雾', '农田'] },
  ],
  '河面漂浮物': [
    { id: '8', src: placeholder(4, '漂浮物 · 灞河'), caption: '灞河桥下游漂浮物聚集', similarity: 0.92, date: '2026-04-13 13:20', location: '灞河桥下游 200m', drone: '大航蜂 M350-02', tags: ['漂浮物', '水域', '灞河'] },
    { id: '9', src: placeholder(4, '垃圾 · 渭河'), caption: '渭河 K12 段河面垃圾', similarity: 0.88, date: '2026-04-12 09:40', location: '渭河 K12 段', drone: '大航蜂 M30T-06', tags: ['垃圾', '水域', '渭河'] },
  ],
};

async function handleSearch(text?: string) {
  const query = text || searchQuery.value.trim();
  if (!query) return;
  searchQuery.value = query;
  searching.value = true;
  hasSearched.value = true;

  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

  results.value = mockResultSets[query] || [
    { id: 'g1', src: placeholder(6, query), caption: `与「${query}」相关的影像`, similarity: 0.75, date: '2026-04-12', location: '全域', drone: '-', tags: [query] },
  ];
  searching.value = false;
  message.success(`找到 ${results.value.length} 张相关影像`);
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false" title="语义搜图">
        <template #extra>
          <Select v-model:value="searchMode" size="small" style="width: 110px">
            <SelectOption value="semantic">语义检索</SelectOption>
            <SelectOption value="keyword">关键词</SelectOption>
          </Select>
        </template>

        <div class="search-bar">
          <Input
            v-model:value="searchQuery"
            :placeholder="searchMode === 'semantic' ? '描述你要找的画面，如「红色车辆」' : '输入关键词'"
            size="large"
            allow-clear
            @press-enter="handleSearch()"
          />
          <Button type="primary" size="large" :loading="searching" @click="handleSearch()">
            搜索
          </Button>
        </div>

        <div class="preset-chips">
          <span class="preset-label">试试：</span>
          <span
            v-for="q in presetQueries"
            :key="q"
            class="preset-chip"
            @click="handleSearch(q)"
          >
            {{ q }}
          </span>
        </div>
      </Card>

      <Spin :spinning="searching">
        <div v-if="hasSearched && results.length > 0">
          <div class="result-count">
            找到 <strong>{{ results.length }}</strong> 张与「{{ searchQuery }}」相关的影像
          </div>
          <Row :gutter="[16, 16]">
            <Col v-for="img in results" :key="img.id" :lg="6" :md="8" :sm="12" :span="24">
              <Card :bordered="false" hoverable class="result-card" size="small">
                <template #cover>
                  <div class="result-cover">
                    <img :src="img.src" :alt="img.caption" />
                    <span class="result-sim">{{ (img.similarity * 100).toFixed(0) }}%</span>
                  </div>
                </template>
                <div class="result-info">
                  <div class="result-caption">{{ img.caption }}</div>
                  <div class="result-meta">{{ img.date }} · {{ img.location }}</div>
                  <div class="result-tags">
                    <Tag v-for="t in img.tags" :key="t" size="small">{{ t }}</Tag>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        <div v-else-if="hasSearched && !searching">
          <Empty description="未找到匹配影像" />
        </div>
      </Spin>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.search-bar {
  display: flex;
  gap: 12px;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.preset-label {
  font-size: 12px;
  color: var(--ant-color-text-tertiary);
}

.preset-chip {
  padding: 3px 12px;
  font-size: 12px;
  border: 1px solid var(--ant-color-border);
  border-radius: 999px;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--ant-color-primary);
    border-color: var(--ant-color-primary);
  }
}

.result-count {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--ant-color-text-secondary);
}

.result-card {
  overflow: hidden;
}

.result-cover {
  position: relative;

  img {
    width: 100%;
    display: block;
  }
}

.result-sim {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  background: rgb(0 0 0 / 50%);
  color: #fff;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.result-info {
  padding: 4px 0 0;
}

.result-caption {
  font-size: 13px;
  font-weight: 500;
  color: var(--ant-color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  margin-top: 3px;
  font-size: 11px;
  color: var(--ant-color-text-tertiary);
}

.result-tags {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
