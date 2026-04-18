/**
 * 无人机业务路由路径常量。
 * 避免在页面间硬编码路径字符串。
 */
export const DRONE_ROUTES = {
  OVERVIEW: '/overview',
  SITUATION_BOARD: '/situation-board',
  DISPATCH_TASK: '/dispatch/task',
  DISPATCH_SITUATION: '/dispatch/situation',
  DISPATCH_VIDEO_WALL: '/dispatch/video-wall',
  DEVICE_UAV: '/device/uav',
  DEVICE_DOCK: '/device/dock',
  DEVICE_DOCK_MONITOR: '/device/dock-monitor',
  DEVICE_DETAIL: '/device/detail',
  FLIGHT_COCKPIT: '/flight/cockpit',
  FLIGHT_ROUTE_PLAN: '/flight/route-plan',
  EVENT_LIST: '/event/list',
  EVENT_DETAIL: '/event/detail',
  EVENT_WORKORDER: '/event/workorder',
  AI_MODEL_REPO: '/ai-center/model-repo',
  AI_DETECTION: '/ai-center/detection',
  AI_EVALUATION: '/ai-center/evaluation',
  AI_DEPLOY: '/ai-center/deploy',
  AI_MARKETPLACE: '/ai-center/marketplace',
} as const;
