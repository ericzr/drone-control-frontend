import type { RouteRecordRaw } from 'vue-router';

/**
 * /data-screen 已合并至 /situation-board（指挥中心），
 * 此路由仅保留重定向兼容旧地址。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/data-screen',
    redirect: '/situation-board',
    name: 'DataScreenRedirect',
    meta: { hideInMenu: true },
  },
];

export default routes;
