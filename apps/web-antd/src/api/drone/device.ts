/**
 * 无人机 / 机巢设备 API 占位（DEV_PLAN P1）。
 * 接入后端后使用 defHttp 替换下列实现。
 */
// import { defHttp } from '#/api/request';

export interface DockPageQuery {
  pageNo: number;
  pageSize: number;
  keyword?: string;
}

export interface DockVO {
  id: string | number;
  name: string;
  latitude?: string;
  longitude?: string;
  status?: string;
  bindDrone?: string;
  model?: string;
  address?: string;
  lastOnline?: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
}

/** @example return defHttp.get('/uav/dock/page', { params: q }); */
export async function fetchDockPage(_query: DockPageQuery): Promise<PageResult<DockVO>> {
  void _query;
  return Promise.reject(
    new Error('DRONE_API: 机巢分页接口尚未接入，请继续使用 mock CRUD'),
  );
}
