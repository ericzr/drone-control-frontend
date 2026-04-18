export const EVENT_CONTEXT_SOURCE_OPTIONS = [
  { label: '全部来源', value: 'all' },
  { label: 'AI 告警', value: 'ai' },
  { label: '人工 / 其他', value: 'manual' },
];

export function matchesEventSource(source: string, filter: string) {
  if (!filter || filter === 'all') return true;
  return filter === 'ai' ? source.includes('AI') : !source.includes('AI');
}

export function matchesWorkorderSource(
  source: 'AI' | '人工' | '举报',
  filter: string,
) {
  if (!filter || filter === 'all') return true;
  return filter === 'ai' ? source === 'AI' : source !== 'AI';
}
