<script lang="ts" setup>
import { nextTick, ref } from 'vue';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  chart?: {
    type: 'bar' | 'number' | 'pie' | 'trend';
    data: { label: string; value: number; color?: string }[];
    title: string;
  };
}

const inputText = ref('');
const loading = ref(false);
const chatRef = ref<HTMLElement | null>(null);

const presetQueries = [
  '今日各场景告警数量',
  '本月飞行架次趋势',
  '各部门任务完成率',
  '在线设备分布',
  '本周告警处理率',
];

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: '你好，我是 AI 问数助手。你可以用自然语言查询平台数据，例如"今日各场景告警数量"。',
  },
]);

const mockResponses: Record<string, ChatMessage> = {
  '今日各场景告警数量': {
    role: 'assistant',
    content: '今日共产生 68 条告警，按场景分布如下：',
    chart: {
      type: 'bar',
      title: '今日告警 · 按场景',
      data: [
        { label: '森林防火', value: 18, color: '#ef4444' },
        { label: '交通巡查', value: 15, color: '#3b82f6' },
        { label: '市政巡检', value: 12, color: '#8b5cf6' },
        { label: '安全生产', value: 10, color: '#10b981' },
        { label: '环境监测', value: 8, color: '#06b6d4' },
        { label: '光伏巡检', value: 3, color: '#f59e0b' },
        { label: '热力巡检', value: 2, color: '#f97316' },
      ],
    },
  },
  '本月飞行架次趋势': {
    role: 'assistant',
    content: '本月累计 342 架次，日均 26 架次，呈上升趋势：',
    chart: {
      type: 'trend',
      title: '4 月飞行架次 · 日趋势',
      data: [
        { label: '4/1', value: 18 }, { label: '4/2', value: 22 },
        { label: '4/3', value: 20 }, { label: '4/4', value: 25 },
        { label: '4/5', value: 28 }, { label: '4/6', value: 15 },
        { label: '4/7', value: 12 }, { label: '4/8', value: 30 },
        { label: '4/9', value: 32 }, { label: '4/10', value: 35 },
        { label: '4/11', value: 28 }, { label: '4/12', value: 38 },
        { label: '4/13', value: 39 },
      ],
    },
  },
  '各部门任务完成率': {
    role: 'assistant',
    content: '各部门任务完成率如下，应急组 100% 表现最佳：',
    chart: {
      type: 'bar',
      title: '任务完成率 · 按部门',
      data: [
        { label: '应急组', value: 100, color: '#10b981' },
        { label: '飞行一队', value: 97, color: '#3b82f6' },
        { label: '飞行二队', value: 95, color: '#3b82f6' },
        { label: '巡检组', value: 90, color: '#f59e0b' },
        { label: '培训组', value: 84, color: '#ef4444' },
      ],
    },
  },
  '在线设备分布': {
    role: 'assistant',
    content: '当前共 128 台设备纳管，108 台在线：',
    chart: {
      type: 'pie',
      title: '在线设备 · 按类型',
      data: [
        { label: '无人机', value: 27, color: '#3b82f6' },
        { label: '摄像头', value: 42, color: '#10b981' },
        { label: '传感器', value: 25, color: '#f59e0b' },
        { label: '机巢', value: 14, color: '#8b5cf6' },
      ],
    },
  },
  '本周告警处理率': {
    role: 'assistant',
    content: '本周告警处理率 88.5%，较上周提升 3.2 个百分点。',
    chart: {
      type: 'number',
      title: '本周告警处理率',
      data: [
        { label: '处理率', value: 88.5 },
        { label: '总告警', value: 156 },
        { label: '已处理', value: 138 },
      ],
    },
  },
};

async function sendMessage(text?: string) {
  const query = text || inputText.value.trim();
  if (!query) return;

  messages.value.push({ role: 'user', content: query });
  inputText.value = '';
  loading.value = true;

  await nextTick();
  if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight;

  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

  const resp = mockResponses[query] || {
    role: 'assistant' as const,
    content: `正在查询「${query}」的相关数据... 当前为演示模式，暂时无法生成该查询的图表。请尝试预设问题。`,
  };
  messages.value.push(resp);
  loading.value = false;

  await nextTick();
  if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight;
}

function maxVal(data: { value: number }[]) {
  return Math.max(...data.map((d) => d.value), 1);
}
</script>

<template>
  <div class="ai-query">
    <div class="ai-query__presets">
      <span
        v-for="q in presetQueries"
        :key="q"
        class="ai-query__chip"
        @click="sendMessage(q)"
      >
        {{ q }}
      </span>
    </div>

    <div ref="chatRef" class="ai-query__chat">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="ai-query__msg"
        :class="`ai-query__msg--${msg.role}`"
      >
        <div class="ai-query__bubble">
          {{ msg.content }}
          <div v-if="msg.chart" class="ai-query__chart">
            <div class="ai-query__chart-title">{{ msg.chart.title }}</div>

            <!-- Bar chart -->
            <div v-if="msg.chart.type === 'bar'" class="ai-chart-bar">
              <div v-for="d in msg.chart.data" :key="d.label" class="ai-chart-bar__row">
                <span class="ai-chart-bar__label">{{ d.label }}</span>
                <div class="ai-chart-bar__track">
                  <div
                    class="ai-chart-bar__fill"
                    :style="{ width: `${(d.value / maxVal(msg.chart!.data)) * 100}%`, background: d.color || '#3b82f6' }"
                  />
                </div>
                <span class="ai-chart-bar__val">{{ d.value }}</span>
              </div>
            </div>

            <!-- Trend chart -->
            <div v-if="msg.chart.type === 'trend'" class="ai-chart-trend">
              <svg viewBox="0 0 400 120" class="ai-chart-trend__svg">
                <polyline
                  :points="msg.chart.data.map((d, i) => `${(i / (msg.chart!.data.length - 1)) * 380 + 10},${110 - (d.value / maxVal(msg.chart!.data)) * 95}`).join(' ')"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                />
                <circle
                  v-for="(d, j) in msg.chart.data"
                  :key="j"
                  :cx="(j / (msg.chart!.data.length - 1)) * 380 + 10"
                  :cy="110 - (d.value / maxVal(msg.chart!.data)) * 95"
                  r="3"
                  fill="#3b82f6"
                />
              </svg>
              <div class="ai-chart-trend__labels">
                <span v-for="(d, j) in msg.chart.data" :key="j" :style="{ left: `${(j / (msg.chart!.data.length - 1)) * 100}%` }">
                  {{ d.label }}
                </span>
              </div>
            </div>

            <!-- Pie chart (simplified as horizontal segments) -->
            <div v-if="msg.chart.type === 'pie'" class="ai-chart-pie">
              <div v-for="d in msg.chart.data" :key="d.label" class="ai-chart-pie__item">
                <span class="ai-chart-pie__dot" :style="{ background: d.color }" />
                <span class="ai-chart-pie__label">{{ d.label }}</span>
                <span class="ai-chart-pie__val">{{ d.value }}</span>
              </div>
            </div>

            <!-- Number highlight -->
            <div v-if="msg.chart.type === 'number'" class="ai-chart-num">
              <div v-for="d in msg.chart.data" :key="d.label" class="ai-chart-num__item">
                <div class="ai-chart-num__val">{{ d.value }}{{ d.label === '处理率' ? '%' : '' }}</div>
                <div class="ai-chart-num__label">{{ d.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loading" class="ai-query__msg ai-query__msg--assistant">
        <div class="ai-query__bubble ai-query__typing">思考中...</div>
      </div>
    </div>

    <div class="ai-query__input">
      <input
        v-model="inputText"
        placeholder="输入问题，如「今日各场景告警数量」"
        @keyup.enter="sendMessage()"
      />
      <button :disabled="loading" @click="sendMessage()">发送</button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-query {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ai-query__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
}

.ai-query__chip {
  padding: 4px 12px;
  font-size: 11px;
  color: rgb(255 255 255 / 70%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgb(255 255 255 / 8%);
    color: #f9fafb;
  }
}

.ai-query__chat {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 12%);
    border-radius: 2px;
  }
}

.ai-query__msg {
  display: flex;
}

.ai-query__msg--user {
  justify-content: flex-end;
}

.ai-query__bubble {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
}

.ai-query__msg--assistant .ai-query__bubble {
  background: rgb(255 255 255 / 6%);
  color: #e5e7eb;
}

.ai-query__msg--user .ai-query__bubble {
  background: #1677ff;
  color: #fff;
}

.ai-query__typing {
  color: rgb(255 255 255 / 40%);
  font-style: italic;
}

.ai-query__chart {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgb(255 255 255 / 8%);
}

.ai-query__chart-title {
  font-size: 12px;
  font-weight: 600;
  color: rgb(255 255 255 / 60%);
  margin-bottom: 8px;
}

/* bar */
.ai-chart-bar__row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.ai-chart-bar__label {
  width: 60px;
  flex: none;
  font-size: 11px;
  color: rgb(255 255 255 / 60%);
  text-align: right;
}
.ai-chart-bar__track {
  flex: 1;
  height: 14px;
  background: rgb(255 255 255 / 6%);
  border-radius: 3px;
  overflow: hidden;
}
.ai-chart-bar__fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}
.ai-chart-bar__val {
  width: 30px;
  flex: none;
  font-size: 12px;
  font-weight: 700;
  color: #e5e7eb;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* trend */
.ai-chart-trend__svg {
  width: 100%;
  height: 80px;
}
.ai-chart-trend__labels {
  position: relative;
  height: 16px;
  font-size: 9px;
  color: rgb(255 255 255 / 35%);

  span {
    position: absolute;
    transform: translateX(-50%);
  }
}

/* pie */
.ai-chart-pie__item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.ai-chart-pie__dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex: none;
}
.ai-chart-pie__label {
  flex: 1;
  font-size: 12px;
  color: rgb(255 255 255 / 60%);
}
.ai-chart-pie__val {
  font-size: 13px;
  font-weight: 700;
  color: #e5e7eb;
  font-variant-numeric: tabular-nums;
}

/* number */
.ai-chart-num {
  display: flex;
  gap: 16px;
}
.ai-chart-num__item {
  text-align: center;
}
.ai-chart-num__val {
  font-size: 22px;
  font-weight: 800;
  color: #f9fafb;
  font-variant-numeric: tabular-nums;
}
.ai-chart-num__label {
  font-size: 11px;
  color: rgb(255 255 255 / 45%);
  margin-top: 2px;
}

/* input */
.ai-query__input {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgb(255 255 255 / 8%);

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 8px;
    background: rgb(255 255 255 / 4%);
    color: #e5e7eb;
    font-size: 13px;
    outline: none;

    &::placeholder {
      color: rgb(255 255 255 / 30%);
    }

    &:focus {
      border-color: #1677ff;
    }
  }

  button {
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    background: #1677ff;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      opacity: 0.85;
    }
  }
}
</style>
