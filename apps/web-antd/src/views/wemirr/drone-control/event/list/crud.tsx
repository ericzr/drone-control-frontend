import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  eventLevelDict,
  eventStatusDict,
  eventTypeDict,
  regionDict,
} from '../_mock';
import { listClosureEvents, saveClosureEvents } from '../../_services/event-closure-store';

async function pageRequest(query: any) {
  const { current = 1, size = 10, ...filters } = query;
  let data = listClosureEvents();
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

export default function (props: CreateCrudOptionsProps): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: {
        pageRequest,
        addRequest: async ({ form }: any) => form,
        editRequest: async ({ form }: any) => {
          const list = listClosureEvents();
          const index = list.findIndex((item) => item.id === form.id);
          if (index >= 0) {
            list.splice(index, 1, { ...list[index], ...form });
            saveClosureEvents(list);
          }
          return form;
        },
        delRequest: async ({ row }: any) => row,
      },
      rowHandle: {
        fixed: 'right',
        width: 250,
        buttons: {
          detail: {
            text: '详情',
            type: 'link',
            order: -1,
            click: ({ row }: any) => {
              (props as any).context?.router?.push(
                `/event/detail?id=${row.eventNo || row.id}`,
              );
            },
          },
          toWorkorder: {
            text: '转工单',
            type: 'link',
            order: 0,
            click: ({ row }: any) => {
              (props as any).context?.openCreateWorkorder?.(row);
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
        },
        eventType: {
          title: '事件类型',
          type: 'dict-select',
          dict: eventTypeDict(),
          search: { show: true },
          column: { width: 120, align: 'center' },
        },
        level: {
          title: '事件等级',
          type: 'dict-select',
          dict: eventLevelDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
        },
        location: {
          title: '事发地点',
          type: 'text',
          column: { width: 200, ellipsis: true },
        },
        source: {
          title: '事件来源',
          type: 'text',
          column: { width: 100 },
          form: { show: false },
        },
        sourceDrone: {
          title: '识别设备',
          type: 'text',
          column: { width: 160 },
          form: { show: false },
        },
        confidence: {
          title: '置信度(%)',
          type: 'number',
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        status: {
          title: '处置状态',
          type: 'dict-select',
          dict: eventStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        description: {
          title: '事件描述',
          type: 'textarea',
          column: { width: 220, ellipsis: true },
          form: { col: { span: 24 } },
        },
        eventTime: {
          title: '事件时间',
          type: 'text',
          column: { width: 170 },
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
