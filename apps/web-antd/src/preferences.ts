import { defineOverridesPreferences } from '@vben/preferences';

function resolveAssetBase() {
  if (typeof window === 'undefined') {
    return '/';
  }

  const { hostname, pathname } = window.location;
  const previewMatch = pathname.match(/^(\/.+\/previews\/[^/]+\/)/);
  if (previewMatch?.[1]) {
    return previewMatch[1];
  }

  if (hostname.endsWith('github.io')) {
    const [repoName] = pathname.split('/').filter(Boolean);
    if (repoName) {
      return `/${repoName}/`;
    }
  }

  return '/';
}

function resolveBrandAsset(path: string) {
  const base = resolveAssetBase();
  const normalizedPath = path.replace(/^\/+/, '');
  const version = import.meta.env.VITE_APP_VERSION || 'brand';
  return `${base}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1') + `?v=${version}`;
}

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    defaultAvatar:
      'https://unpkg.com/@vbenjs/static-source@0.1.7/source/avatar-v1.webp',
    // 是否开启检查更新
    enableCheckUpdates: true,
    // 检查更新的时间间隔，单位为分钟
    checkUpdatesInterval: 5,
    accessMode: 'backend',
    contentCompact: 'wide',
    layout: 'sidebar-nav',
  },
  sidebar: {
    width: 210,
  },
  logo: {
    enable: true,
    expandedSource: resolveBrandAsset('/logo-full-light.png'),
    expandedSourceDark: resolveBrandAsset('/logo-full-dark.png'),
    fit: 'contain',
    source: resolveBrandAsset('/logo-light.png'),
    sourceDark: resolveBrandAsset('/logo-dark.png'),
  },
  copyright: {
    companyName: '云界空域OS',
    companySiteLink: 'https://docs.battcn.com/',
  },
  widget: {
    languageToggle: false,
    timezone: false,
  },
  footer: {
    enable: true,
  },
  theme: {
    mode: 'auto',
  },
});
