/**
 * 飞行任务 / 调度任务 API 占位（DEV_PLAN P1）。
 */
// import { defHttp } from '#/api/request';

export interface CreateTakeoffTaskPayload {
  dockId: string;
  targetLat: string;
  targetLng: string;
  altitudeM: number;
  safeAltitudeM?: number;
  returnAltitudeM?: number;
  lostAction?: string;
  routeLostAction?: string;
  returnMode?: string;
}

export interface FlightTaskVO {
  taskId: string;
  status: string;
  dockId: string;
  drone?: string;
  createdAt: string;
}

/** @example return defHttp.post('/uav/flight/takeoff', data); */
export async function createTakeoffTask(
  _payload: CreateTakeoffTaskPayload,
): Promise<{ taskId: string }> {
  void _payload;
  return Promise.reject(
    new Error('DRONE_API: 一键起飞任务创建接口尚未接入，当前使用 sessionStorage 演示'),
  );
}

/** @example return defHttp.get('/uav/flight/tasks', { params: q }); */
export async function fetchFlightTasks(
  _query: { pageNo: number; pageSize: number; status?: string },
): Promise<{ records: FlightTaskVO[]; total: number }> {
  void _query;
  return Promise.reject(
    new Error('DRONE_API: 飞行任务列表接口尚未接入'),
  );
}
