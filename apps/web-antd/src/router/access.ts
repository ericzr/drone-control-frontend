import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';
import type { RouteRecordRaw } from 'vue-router';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';
import { cloneDeep, generateMenus } from '@vben/utils';

import { message } from 'ant-design-vue';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
import { accessRoutes } from '#/router/routes';
import { isStaticPreviewMode } from '#/utils/preview-env';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');
const LOCAL_APPEND_ROUTE_NAMES = new Set([
  'DroneSituationBoardRoot',
  'DroneOverviewRoot',
  'DroneDispatchCenter',
  'DroneDeviceCenter',
  'DroneFlightCenter',
  'DroneTopicCenter',
  'DroneEventCenter',
  'DronePilotCenter',
  'DroneGeoData',
  'DroneSettings',
  'DroneAiCenter',
]);

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');
  const accessMode = isStaticPreviewMode()
    ? 'frontend'
    : preferences.app.accessMode;

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  const result = await generateAccessible(accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      return await getAllMenusApi({ status: true });
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });

  if (accessMode === 'backend') {
    return normalizeAccessResult(appendLocalBusinessRoutes(result, options));
  }

  return normalizeAccessResult(result);
}

function appendLocalBusinessRoutes(
  result: { accessibleMenus: any[]; accessibleRoutes: RouteRecordRaw[] },
  options: GenerateMenuAndRoutesOptions,
) {
  const localBusinessRoutes = cloneDeep(
    accessRoutes.filter((route) =>
      LOCAL_APPEND_ROUTE_NAMES.has(String(route.name || '')),
    ),
  );

  if (localBusinessRoutes.length === 0) {
    return result;
  }

  const root = options.router.getRoutes().find((item) => item.path === '/');
  const rootChildren = root?.children ?? [];
  const rootChildNames = new Set(rootChildren.map((item) => String(item.name)));

  localBusinessRoutes.forEach((route) => {
    const routeName = String(route.name || '');

    if (route.meta?.noBasicLayout || !root) {
      if (route.name && !options.router.hasRoute(route.name)) {
        options.router.addRoute(route);
      }
      return;
    }

    if (route.children && route.children.length > 0) {
      delete route.component;
    }

    if (!rootChildNames.has(routeName)) {
      rootChildren.push(route);
      rootChildNames.add(routeName);
    }
  });

  if (root?.name) {
    options.router.removeRoute(root.name);
    options.router.addRoute(root);
  }

  const localMenus = generateMenus(localBusinessRoutes, options.router);

  return {
    accessibleMenus: mergeMenus(result.accessibleMenus, localMenus),
    accessibleRoutes: mergeRoutes(result.accessibleRoutes, localBusinessRoutes),
  };
}

function mergeRoutes(
  routes: RouteRecordRaw[],
  localRoutes: RouteRecordRaw[],
): RouteRecordRaw[] {
  const routeNames = new Set(routes.map((route) => String(route.name || route.path || '')));
  const mergedRoutes = [...routes];

  localRoutes.forEach((route) => {
    const routeName = String(route.name || route.path || '');
    if (!routeNames.has(routeName)) {
      mergedRoutes.push(route);
      routeNames.add(routeName);
    }
  });

  return dedupeRoutes(mergedRoutes);
}

function mergeMenus(sourceMenus: any[], localMenus: any[]) {
  const menuPaths = new Set(sourceMenus.map((menu) => String(menu.path || menu.name || '')));
  const mergedMenus = [...sourceMenus];

  localMenus.forEach((menu) => {
    const menuKey = String(menu.path || menu.name || '');
    if (!menuPaths.has(menuKey)) {
      mergedMenus.push(menu);
      menuPaths.add(menuKey);
    }
  });

  return dedupeMenus(
    mergedMenus.toSorted((a, b) => (a?.order ?? 999) - (b?.order ?? 999)),
  );
}

function dedupeMenus(menus: any[]) {
  const seen = new Set<string>();

  return menus.flatMap((menu) => {
    const key = String(menu?.path || menu?.name || '');
    if (seen.has(key)) {
      return [];
    }

    seen.add(key);
    return [
      {
        ...menu,
        children: menu?.children ? dedupeMenus(menu.children) : menu?.children,
      },
    ];
  });
}

function dedupeRoutes(routes: RouteRecordRaw[]) {
  const seen = new Set<string>();

  return routes.flatMap((route) => {
    const key = String(route.name || route.path || '');
    if (seen.has(key)) {
      return [];
    }

    seen.add(key);
    return [
      {
        ...route,
        children: route.children ? dedupeRoutes(route.children) : route.children,
      },
    ];
  });
}

function normalizeAccessResult(result: {
  accessibleMenus: any[];
  accessibleRoutes: RouteRecordRaw[];
}) {
  return {
    accessibleMenus: dedupeMenus(result.accessibleMenus),
    accessibleRoutes: dedupeRoutes(result.accessibleRoutes),
  };
}

export { generateAccess };
