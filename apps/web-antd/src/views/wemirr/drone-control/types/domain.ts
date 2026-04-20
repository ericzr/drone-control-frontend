/** 任务状态（与调度页 mock 对齐，后端就绪后由接口枚举替换） */
export type TaskStatusMock =
  | '执行中'
  | '排队中'
  | '已完成'
  | '已取消'
  | '返航中';

/** 飞行阶段（机巢监控 / 座舱） */
export type FlightPhase = 'preflight' | 'ascending' | 'cruise' | 'landed';

/** 飞行阶段中文映射 */
export const FLIGHT_PHASE_LABEL: Record<FlightPhase, string> = {
  preflight: '起飞准备中',
  ascending: '上升中',
  cruise: '巡航中',
  landed: '已降落',
};

/** 失联动作 */
export type LostAction = '返航' | '悬停' | '降落';

/** 航线失联动作 */
export type RouteLostAction = '退出' | '继续' | '返航';

/** 返航模式 */
export type ReturnMode = '设定高度' | '智能高度' | '原路返航';

/** 一键起飞表单（机巢 Modal） */
export interface TakeoffFormPayload {
  targetLat: string;
  targetLng: string;
  altitude: number;
  safeAltitude: number;
  returnAltitude: number;
  lostAction: LostAction;
  routeLostAction: RouteLostAction;
  returnMode: ReturnMode;
  cmdLostAction: string;
  cmdFlightMode: string;
  cmdFlightAlt: number;
}

/** 设备在线状态（机巢列表 mock） */
export type DeviceOnlineStatus = '在线' | '离线' | '作业中';

/** 告警级别 */
export type AlertLevel = 'critical' | 'warning' | 'info';

/** 任务优先级 */
export type TaskPriority = '紧急' | '高' | '普通';

/** 虚拟键盘按键（座舱 / 监控共用） */
export type FlightKey = 'q' | 'w' | 'e' | 'a' | 's' | 'd' | 'c' | ' ';
