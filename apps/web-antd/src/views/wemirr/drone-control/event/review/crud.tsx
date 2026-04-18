import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  eventTypeDict,
  regionDict,
  reviewResultDict,
} from '../_mock';
import { listClosureEvents } from '../../_services/event-closure-store';
import { matchesEventSource } from '../../composables/use-event-context';

export default function (props: CreateCrudOptionsProps): CreateCrudOptionsRet {
  async function pageRequest(query: any) {
    const { current = 1, size = 10, ...filters } = query;
    const contextFilters =
      ((props as any).context?.getContextFilters?.() || {}) as {
        scene?: string;
        source?: string;
      };
    let data = listClosureEvents().map((item) => ({
      id: item.id,
      eventNo: item.eventNo,
      eventType: item.eventType,
      scene: item.scene,
      region: item.region,
      location: item.location,
      source: item.source,
      confidence: item.confidence,
      snapshot: '',
      reviewer: item.reviewer || '',
      reviewResult: item.reviewResult || '',
      reviewRemark: item.reviewRemark || '',
      reviewTime: item.reviewTime || '',
      status: item.reviewTime || item.reviewResult ? '已复核' : '待复核',
      createTime: item.createTime,
    }));
    if (contextFilters.scene && contextFilters.scene !== 'all') {
      data = data.filter((row) => row.scene === contextFilters.scene);
    }
    if (contextFilters.source && contextFilters.source !== 'all') {
      data = data.filter((row) => matchesEventSource(row.source, contextFilters.source || 'all'));
    }
    for (const [key, val] of Object.entries(filters)) {
      if (val === undefined || val === null || val === '') continue;
      data = data.filter((row: any) => {
        const field = row[key];
        if (field == null) return false;
        if (typeof field === 'string' && typeof val === 'string') return field.includes(val);
        return String(field) === String(val);
      });
    }
    const total = data.length;
    const start = (current - 1) * size;
    return { current, size, total, records: data.slice(start, start + size) };
  }

  return {
    crudOptions: {
      request: {
        pageRequest,
        addRequest: async ({ form }: any) => form,
        editRequest: async ({ form }: any) => form,
        delRequest: async ({ row }: any) => row,
      },
      rowHandle: {
        fixed: 'right',
        width: 300,
        buttons: {
          detail: {
            text: '详情',
            type: 'link',
            order: -1,
            click: ({ row }: any) => {
              (props as any).context?.router?.push(
                `/event/detail?id=${row.eventNo}`,
              );
            },
          },
          review: {
            text: '复核',
            type: 'link',
            order: 0,
            show: (({ row }: any) => row.status === '待复核') as any,
            click: ({ row }: any) => {
              (props as any).context?.openReview?.(row);
            },
          },
          reflightCheck: {
            text: '发起复飞',
            type: 'link',
            order: 1,
            show: (({ row }: any) => row.reviewResult === '待现场核实') as any,
            click: ({ row }: any) => {
              (props as any).context?.triggerReflight?.(row);
            },
          },
        },
      },
      columns: {
        id: hiddenIdColumn,
        eventNo: {
          title: '事件编号',
          type: 'text',
          search: { show: true },
          column: { width: 190 },
          form: { show: false },
        },
        eventType: {
          title: '事件类型',
          type: 'dict-select',
          dict: eventTypeDict(),
          search: { show: true },
          column: { width: 120, align: 'center' },
          form: { show: false },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
          form: { show: false },
        },
        location: {
          title: '事发地点',
          type: 'text',
          column: { width: 200, ellipsis: true },
          form: { show: false },
        },
        source: {
          title: '事件来源',
          type: 'text',
          column: { width: 100 },
          form: { show: false },
        },
        confidence: {
          title: '置信度(%)',
          type: 'number',
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        reviewer: {
          title: '复核人',
          type: 'text',
          column: { width: 100 },
          form: { rules: [{ required: true, message: '请输入复核人' }] },
        },
        reviewResult: {
          title: '复核结果',
          type: 'dict-select',
          dict: reviewResultDict(),
          search: { show: true },
          column: { width: 130, align: 'center' },
          form: { rules: [{ required: true, message: '请选择复核结果' }] },
        },
        reviewRemark: {
          title: '复核意见',
          type: 'textarea',
          column: { width: 220, ellipsis: true },
          form: { col: { span: 24 } },
        },
        reviewTime: {
          title: '复核时间',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
        },
        createTime: {
          title: '事件时间',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
        },
      },
    },
  };
}
