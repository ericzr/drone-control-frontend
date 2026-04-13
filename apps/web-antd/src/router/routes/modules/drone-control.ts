import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    path: '/overview',
    name: 'DroneOverviewRoot',
    redirect: '/overview/index',
    meta: {
      hideChildrenInMenu: true,
      icon: 'carbon:workspace',
      order: 120,
      title: '控制台总览',
    },
    children: [
      {
        path: 'index',
        name: 'DroneControlOverview',
        component: () =>
          import('#/views/wemirr/drone-control/overview/index.vue'),
        meta: {
          affixTab: true,
          hideInMenu: true,
          icon: 'carbon:workspace',
          title: '控制台总览',
        },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/dispatch',
    name: 'DroneDispatchCenter',
    redirect: '/dispatch/situation',
    meta: {
      icon: 'mdi:map-search-outline',
      order: 121,
      title: '调度中心',
    },
    children: [
      {
        path: 'situation',
        name: 'DispatchSituation',
        component: () =>
          import(
            '#/views/wemirr/drone-control/dispatch/situation/index.vue'
          ),
        meta: { icon: 'mdi:earth', title: '综合态势' },
      },
      {
        path: 'video-wall',
        name: 'DispatchVideoWall',
        component: () =>
          import(
            '#/views/wemirr/drone-control/dispatch/video-wall/index.vue'
          ),
        meta: { icon: 'mdi:monitor-multiple', title: '视频监控' },
      },
      {
        path: 'task',
        name: 'DispatchTask',
        component: () =>
          import('#/views/wemirr/drone-control/dispatch/task/index.vue'),
        meta: { icon: 'mdi:clipboard-text-clock-outline', title: '任务调度' },
      },
      {
        path: 'statistics',
        name: 'DispatchStatistics',
        component: () =>
          import(
            '#/views/wemirr/drone-control/dispatch/statistics/index.vue'
          ),
        meta: { icon: 'mdi:chart-bar', title: '任务统计' },
      },
      {
        path: 'imagery',
        name: 'DispatchImagery',
        component: () =>
          import('#/views/wemirr/drone-control/dispatch/imagery/index.vue'),
        meta: { icon: 'mdi:image-search-outline', title: '时空影像' },
      },
      {
        path: 'emergency',
        name: 'DispatchEmergency',
        component: () =>
          import(
            '#/views/wemirr/drone-control/dispatch/emergency/index.vue'
          ),
        meta: { icon: 'mdi:alert-octagon-outline', title: '应急指挥' },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/device',
    name: 'DroneDeviceCenter',
    redirect: '/device/uav',
    meta: {
      icon: 'mdi:devices',
      order: 122,
      title: '设备中心',
    },
    children: [
      {
        path: 'uav',
        name: 'DeviceUav',
        component: () =>
          import('#/views/wemirr/drone-control/device/uav/index.vue'),
        meta: { icon: 'mdi:quadcopter', title: '无人机管理' },
      },
      {
        path: 'dock',
        name: 'DeviceDock',
        component: () =>
          import('#/views/wemirr/drone-control/device/dock/index.vue'),
        meta: { icon: 'mdi:home-variant-outline', title: '机巢管理' },
      },
      {
        path: 'robot-dog',
        name: 'DeviceRobotDog',
        component: () =>
          import('#/views/wemirr/drone-control/device/robot-dog/index.vue'),
        meta: { icon: 'mdi:robot-outline', title: '机器狗管理' },
      },
      {
        path: 'vehicle',
        name: 'DeviceVehicle',
        component: () =>
          import('#/views/wemirr/drone-control/device/vehicle/index.vue'),
        meta: { icon: 'mdi:car-connected', title: '无人车管理' },
      },
      {
        path: 'camera',
        name: 'DeviceCamera',
        component: () =>
          import('#/views/wemirr/drone-control/device/camera/index.vue'),
        meta: { icon: 'mdi:cctv', title: '摄像头管理' },
      },
      {
        path: 'sensor',
        name: 'DeviceSensor',
        component: () =>
          import('#/views/wemirr/drone-control/device/sensor/index.vue'),
        meta: { icon: 'mdi:access-point', title: '传感器管理' },
      },
      {
        path: 'charger',
        name: 'DeviceCharger',
        component: () =>
          import('#/views/wemirr/drone-control/device/charger/index.vue'),
        meta: { icon: 'mdi:ev-station', title: '充电站管理' },
      },
      {
        path: 'detail',
        name: 'DeviceDetail',
        component: () =>
          import('#/views/wemirr/drone-control/device/detail/index.vue'),
        meta: {
          hideInMenu: true,
          icon: 'mdi:file-document-outline',
          title: '设备详情',
          activePath: '/device/uav',
        },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/flight',
    name: 'DroneFlightCenter',
    redirect: '/flight/route-plan',
    meta: {
      icon: 'mdi:airplane',
      order: 123,
      title: '飞控中心',
    },
    children: [
      {
        path: 'route-plan',
        name: 'FlightRoutePlan',
        component: () =>
          import('#/views/wemirr/drone-control/flight/route-plan/index.vue'),
        meta: { icon: 'mdi:map-marker-path', title: '航线规划' },
      },
      {
        path: 'route-apply',
        name: 'FlightRouteApply',
        component: () =>
          import(
            '#/views/wemirr/drone-control/flight/route-apply/index.vue'
          ),
        meta: { icon: 'mdi:file-sign', title: '航线申请' },
      },
      {
        path: 'plan',
        name: 'FlightPlanManage',
        component: () =>
          import('#/views/wemirr/drone-control/flight/plan/index.vue'),
        meta: { icon: 'mdi:calendar-clock', title: '计划管理' },
      },
      {
        path: 'operation',
        name: 'FlightOperation',
        component: () =>
          import('#/views/wemirr/drone-control/flight/operation/index.vue'),
        meta: { icon: 'mdi:monitor-dashboard', title: '飞行作业' },
      },
      {
        path: 'cockpit',
        name: 'FlightCockpit',
        component: () =>
          import('#/views/wemirr/drone-control/flight/cockpit/index.vue'),
        meta: { icon: 'mdi:steering', title: '虚拟驾驶舱' },
      },
      {
        path: 'imagery',
        name: 'FlightImagery',
        component: () =>
          import('#/views/wemirr/drone-control/flight/imagery/index.vue'),
        meta: { icon: 'mdi:image-multiple', title: '飞行影像' },
      },
      {
        path: 'demand',
        name: 'FlightDemand',
        component: () =>
          import('#/views/wemirr/drone-control/flight/demand/index.vue'),
        meta: {
          icon: 'mdi:file-document-edit-outline',
          title: '需求提报',
        },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/event',
    name: 'DroneEventCenter',
    redirect: '/event/list',
    meta: {
      icon: 'mdi:alarm-light-outline',
      order: 124,
      title: '事件中心',
    },
    children: [
      {
        path: 'list',
        name: 'EventList',
        component: () =>
          import('#/views/wemirr/drone-control/event/list/index.vue'),
        meta: { icon: 'mdi:format-list-bulleted', title: '事件列表' },
      },
      {
        path: 'review',
        name: 'EventReview',
        component: () =>
          import('#/views/wemirr/drone-control/event/review/index.vue'),
        meta: { icon: 'mdi:file-check-outline', title: '事件复核' },
      },
      {
        path: 'workorder',
        name: 'EventWorkOrder',
        component: () =>
          import('#/views/wemirr/drone-control/event/workorder/index.vue'),
        meta: { icon: 'mdi:clipboard-flow-outline', title: '工单管理' },
      },
      {
        path: 'map-view',
        name: 'EventMapView',
        component: () =>
          import('#/views/wemirr/drone-control/event/map-view/index.vue'),
        meta: { icon: 'mdi:map-marker-multiple-outline', title: '地图视图' },
      },
      {
        path: 'report',
        name: 'EventReport',
        component: () =>
          import('#/views/wemirr/drone-control/event/report/index.vue'),
        meta: { icon: 'mdi:file-chart-outline', title: '事件报告' },
      },
      {
        path: 'detail',
        name: 'EventDetail',
        component: () =>
          import('#/views/wemirr/drone-control/event/detail/index.vue'),
        meta: {
          hideInMenu: true,
          icon: 'mdi:file-document-outline',
          title: '事件详情',
          activePath: '/event/list',
        },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/pilot',
    name: 'DronePilotCenter',
    redirect: '/pilot/roster',
    meta: {
      icon: 'mdi:account-tie',
      order: 125,
      title: '飞手管理',
    },
    children: [
      {
        path: 'roster',
        name: 'PilotRoster',
        component: () =>
          import('#/views/wemirr/drone-control/pilot/roster/index.vue'),
        meta: { icon: 'mdi:account-group', title: '飞手档案' },
      },
      {
        path: 'certificate',
        name: 'PilotCertificate',
        component: () =>
          import('#/views/wemirr/drone-control/pilot/certificate/index.vue'),
        meta: { icon: 'mdi:certificate-outline', title: '资质证书' },
      },
      {
        path: 'attendance',
        name: 'PilotAttendance',
        component: () =>
          import('#/views/wemirr/drone-control/pilot/attendance/index.vue'),
        meta: { icon: 'mdi:clock-check-outline', title: '签到记录' },
      },
      {
        path: 'training',
        name: 'PilotTraining',
        component: () =>
          import('#/views/wemirr/drone-control/pilot/training/index.vue'),
        meta: { icon: 'mdi:school-outline', title: '培训计划' },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/geo-data',
    name: 'DroneGeoData',
    redirect: '/geo-data/basemap',
    meta: {
      icon: 'mdi:map-outline',
      order: 126,
      title: '数字模型',
    },
    children: [
      {
        path: 'basemap',
        name: 'GeoBasemap',
        component: () =>
          import('#/views/wemirr/drone-control/geo-data/basemap/index.vue'),
        meta: { icon: 'mdi:layers-outline', title: '底图配置' },
      },
      {
        path: 'resource',
        name: 'GeoResource',
        component: () =>
          import('#/views/wemirr/drone-control/geo-data/resource/index.vue'),
        meta: { icon: 'mdi:image-multiple-outline', title: '地理资源' },
      },
      {
        path: 'layer',
        name: 'GeoLayer',
        component: () =>
          import('#/views/wemirr/drone-control/geo-data/layer/index.vue'),
        meta: { icon: 'mdi:layers-triple-outline', title: '图层管理' },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/settings',
    name: 'DroneSettings',
    redirect: '/settings/no-fly-zone',
    meta: {
      icon: 'mdi:shield-airplane-outline',
      order: 127,
      title: '安全设置',
    },
    children: [
      {
        path: 'no-fly-zone',
        name: 'NoFlyZone',
        component: () =>
          import(
            '#/views/wemirr/drone-control/settings/no-fly-zone/index.vue'
          ),
        meta: { icon: 'mdi:map-marker-off-outline', title: '禁飞区管理' },
      },
      {
        path: 'params',
        name: 'SystemParams',
        component: () =>
          import('#/views/wemirr/drone-control/settings/params/index.vue'),
        meta: { icon: 'mdi:cog-outline', title: '系统参数' },
      },
    ],
  },

  {
    component: BasicLayout,
    path: '/ai-center',
    name: 'DroneAiCenter',
    redirect: '/ai-center/model-repo',
    meta: {
      icon: 'mdi:brain',
      order: 128,
      title: 'AI 模型中心',
    },
    children: [
      {
        path: 'model-repo',
        name: 'AiModelRepo',
        component: () =>
          import(
            '#/views/wemirr/drone-control/ai-center/model-repo/index.vue'
          ),
        meta: { icon: 'mdi:database-outline', title: '模型库' },
      },
      {
        path: 'deploy',
        name: 'AiDeploy',
        component: () =>
          import('#/views/wemirr/drone-control/ai-center/deploy/index.vue'),
        meta: { icon: 'mdi:rocket-launch-outline', title: '部署管理' },
      },
      {
        path: 'evaluation',
        name: 'AiEvaluation',
        component: () =>
          import(
            '#/views/wemirr/drone-control/ai-center/evaluation/index.vue'
          ),
        meta: { icon: 'mdi:chart-line', title: '评估报告' },
      },
      {
        path: 'marketplace',
        name: 'AiMarketplace',
        component: () =>
          import(
            '#/views/wemirr/drone-control/ai-center/marketplace/index.vue'
          ),
        meta: { icon: 'mdi:store-outline', title: '算法商城' },
      },
    ],
  },
];

export default routes;
