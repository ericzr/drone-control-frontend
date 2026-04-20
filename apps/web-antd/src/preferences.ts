import { defineOverridesPreferences } from '@vben/preferences';

const assetBase = import.meta.env.BASE_URL || '/';
const withBase = (path: string) =>
  `${assetBase}${path.replace(/^\/+/, '')}`.replace(/([^:]\/)\/+/g, '$1');

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
    expandedSource: withBase('/logo-full-light.png'),
    expandedSourceDark: withBase('/logo-full-dark.png'),
    fit: 'contain',
    source: withBase('/logo-light.png'),
    sourceDark: withBase('/logo-dark.png'),
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
