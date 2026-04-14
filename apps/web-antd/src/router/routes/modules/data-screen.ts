import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    path: '/data-screen',
    name: 'DroneDataScreenRoot',
    redirect: '/data-screen/index',
    meta: {
      hideChildrenInMenu: true,
      icon: 'mdi:chart-areaspline',
      order: 118,
      title: '数据驾驶舱',
    },
    children: [
      {
        path: 'index',
        name: 'DroneDataScreen',
        component: () =>
          import('#/views/wemirr/drone-control/data-screen/index.vue'),
        meta: {
          hideInMenu: true,
          icon: 'mdi:chart-areaspline',
          title: '数据驾驶舱',
        },
      },
    ],
  },
];

export default routes;
