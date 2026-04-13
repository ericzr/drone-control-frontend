import { dict } from '@fast-crud/fast-crud';

/** 设备在线状态字典 */
export const deviceStatusDict = () =>
  dict({
    data: [
      { value: '在线', label: '在线', color: 'success' },
      { value: '离线', label: '离线', color: 'default' },
      { value: '作业中', label: '作业中', color: 'processing' },
      { value: '维护中', label: '维护中', color: 'warning' },
    ],
  });

/** 所属区域字典 */
export const regionDict = () =>
  dict({
    data: [
      { value: '高新区北片', label: '高新区北片' },
      { value: '生态园区', label: '生态园区' },
      { value: '热力管网片区', label: '热力管网片区' },
      { value: '沿河西路', label: '沿河西路' },
      { value: '林草防火区', label: '林草防火区' },
      { value: '城管巡检区', label: '城管巡检区' },
      { value: '交通主干道', label: '交通主干道' },
      { value: '光伏园区', label: '光伏园区' },
    ],
  });

/** 所属部门字典 */
export const departmentDict = () =>
  dict({
    data: [
      { value: '综合指挥中心', label: '综合指挥中心' },
      { value: '林草局', label: '林草局' },
      { value: '交管局', label: '交管局' },
      { value: '城管局', label: '城管局' },
      { value: '应急管理局', label: '应急管理局' },
      { value: '生态环境局', label: '生态环境局' },
      { value: '水务局', label: '水务局' },
      { value: '自然资源局', label: '自然资源局' },
    ],
  });

/**
 * 创建本地模拟 CRUD 请求
 * 开发阶段替代真实接口，后续用 defHttp 替换即可
 */
export function createMockCrud<T extends { id?: string }>(initialData: T[]) {
  const data: T[] = [...initialData];
  let seq = initialData.length + 1;

  const pageRequest = async (query: any) => {
    const {
      current = 1,
      size = 10,
      offset: _o,
      column: _c,
      asc: _a,
      ...filters
    } = query;

    let filtered = [...data];
    for (const [key, val] of Object.entries(filters)) {
      if (val === undefined || val === null || val === '') continue;
      filtered = filtered.filter((row: any) => {
        const field = row[key];
        if (field == null) return false;
        if (typeof field === 'string' && typeof val === 'string')
          return field.includes(val);
        return String(field) === String(val);
      });
    }

    const total = filtered.length;
    const start = (current - 1) * size;
    const records = filtered.slice(start, start + size);
    return { current, size, total, records };
  };

  const addRequest = async ({ form }: any) => {
    const item = {
      ...form,
      id: String(seq++),
      createTime: new Date().toISOString(),
    };
    data.unshift(item as T);
    return item;
  };

  const editRequest = async ({ form }: any) => {
    const idx = data.findIndex((r) => r.id === form.id);
    if (idx >= 0) data[idx] = { ...data[idx], ...form };
    return form;
  };

  const delRequest = async ({ row }: any) => {
    const idx = data.findIndex((r) => r.id === row.id);
    if (idx >= 0) data.splice(idx, 1);
    return row;
  };

  return { pageRequest, addRequest, editRequest, delRequest };
}
