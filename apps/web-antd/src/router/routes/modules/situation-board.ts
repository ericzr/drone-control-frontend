import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    path: '/situation-board',
    name: 'DroneSituationBoardRoot',
    redirect: '/situation-board/index',
    meta: {
      hideChildrenInMenu: true,
      icon: 'mdi:monitor-dashboard',
      order: 119,
      title: '指挥中心',
    },
    children: [
      {
        path: 'index',
        name: 'DroneSituationBoard',
        component: () =>
          import('#/views/wemirr/drone-control/situation-board/index.vue'),
        meta: {
          hideInMenu: true,
          icon: 'mdi:monitor-dashboard',
          title: '指挥中心',
        },
      },
    ],
  },
];

export default routes;
