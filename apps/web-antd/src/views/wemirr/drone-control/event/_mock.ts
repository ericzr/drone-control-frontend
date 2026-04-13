import { dict } from '@fast-crud/fast-crud';

export { createMockCrud } from '../device/_mock';

export const eventTypeDict = () =>
  dict({
    data: [
      { value: '违停', label: '违停', color: 'warning' },
      { value: '占道经营', label: '占道经营', color: 'warning' },
      { value: '违建', label: '违建', color: 'error' },
      { value: '排污', label: '排污', color: 'error' },
      { value: '烟火', label: '烟火', color: 'error' },
      { value: '漂浮物', label: '漂浮物', color: 'warning' },
      { value: '道路损坏', label: '道路损坏', color: 'default' },
      { value: '设备异常', label: '设备异常', color: 'default' },
    ],
  });

export const eventLevelDict = () =>
  dict({
    data: [
      { value: '一般', label: '一般', color: 'default' },
      { value: '较大', label: '较大', color: 'warning' },
      { value: '重大', label: '重大', color: 'error' },
    ],
  });

export const eventStatusDict = () =>
  dict({
    data: [
      { value: '待复核', label: '待复核', color: 'warning' },
      { value: '已确认', label: '已确认', color: 'processing' },
      { value: '已派单', label: '已派单', color: 'processing' },
      { value: '处置中', label: '处置中', color: 'processing' },
      { value: '已闭环', label: '已闭环', color: 'success' },
      { value: '误报', label: '误报', color: 'default' },
    ],
  });

export const reviewResultDict = () =>
  dict({
    data: [
      { value: '确认有效', label: '确认有效', color: 'success' },
      { value: '误报排除', label: '误报排除', color: 'default' },
      { value: '待现场核实', label: '待现场核实', color: 'warning' },
    ],
  });

export const workOrderStatusDict = () =>
  dict({
    data: [
      { value: '待分配', label: '待分配', color: 'default' },
      { value: '已分配', label: '已分配', color: 'processing' },
      { value: '处理中', label: '处理中', color: 'processing' },
      { value: '待验收', label: '待验收', color: 'warning' },
      { value: '已完成', label: '已完成', color: 'success' },
      { value: '已驳回', label: '已驳回', color: 'error' },
    ],
  });

export const regionDict = () =>
  dict({
    data: [
      { value: '高新区北片', label: '高新区北片' },
      { value: '生态园区', label: '生态园区' },
      { value: '林草防火区', label: '林草防火区' },
      { value: '沿河西路', label: '沿河西路' },
      { value: '城管巡检区', label: '城管巡检区' },
      { value: '交通主干道', label: '交通主干道' },
    ],
  });

export const departmentDict = () =>
  dict({
    data: [
      { value: '交管局', label: '交管局' },
      { value: '城管局', label: '城管局' },
      { value: '林草局', label: '林草局' },
      { value: '水务局', label: '水务局' },
      { value: '应急管理局', label: '应急管理局' },
      { value: '生态环境局', label: '生态环境局' },
    ],
  });
