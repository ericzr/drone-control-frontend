/**
 * 演示用：一键起飞后写入会话，任务调度页可合并展示（待替换为真实 API）。
 */
const STORAGE_KEY = 'drone_takeoff_tasks_v1';

export interface TakeoffTaskRecord {
  id: string;
  dockId: string;
  dockName: string;
  drone: string;
  targetLat: string;
  targetLng: string;
  altitude: number;
  safeAltitude?: number;
  returnAltitude?: number;
  lostAction?: string;
  returnMode?: string;
  createdAt: string;
}

function readAll(): TakeoffTaskRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as TakeoffTaskRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(list: TakeoffTaskRecord[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
}

export function appendTakeoffTask(row: TakeoffTaskRecord) {
  const list = readAll();
  list.unshift(row);
  writeAll(list);
}

export function consumePendingTakeoffTasks(): TakeoffTaskRecord[] {
  const list = readAll();
  if (list.length === 0) return [];
  sessionStorage.removeItem(STORAGE_KEY);
  return list;
}

export function peekTakeoffTasks(): TakeoffTaskRecord[] {
  return readAll();
}
