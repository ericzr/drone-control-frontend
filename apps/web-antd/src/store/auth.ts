import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';
import { isStaticPreviewMode } from '#/utils/preview-env';

function getPreviewUserInfo(): UserInfo {
  return {
    avatar: 'https://unpkg.com/@vbenjs/static-source@0.1.7/source/avatar-v1.webp',
    desc: 'GitHub Pages 静态预览演示账号',
    homePath: '/overview/index',
    nickname: '演示账号',
    roles: ['preview-admin'],
    token: 'github-pages-preview-token',
    userId: 'preview-admin',
    username: 'admin',
  };
}

function getPreviewAccessCodes() {
  return ['preview:*', 'drone:*', 'system:*'];
}

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   * @param onSuccess onSuccess
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    if (isStaticPreviewMode()) {
      const userInfo = getPreviewUserInfo();

      try {
        loginLoading.value = true;
        accessStore.setAccessToken(userInfo.token);
        accessStore.setAccessCodes(getPreviewAccessCodes());
        userStore.setUserInfo(userInfo);
        accessStore.setIsAccessChecked(false);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(userInfo.homePath || preferences.app.defaultHomePath);
        }

        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo.nickname}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      } finally {
        loginLoading.value = false;
      }

      return {
        userInfo,
      };
    }

    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);
        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.nickname) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.nickname}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      if (!isStaticPreviewMode()) {
        await logoutApi();
      }
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);
    console.info('要进行重定向才行', LOGIN_PATH);
    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    if (isStaticPreviewMode()) {
      const userInfo = getPreviewUserInfo();
      userStore.setUserInfo(userInfo);
      return userInfo;
    }

    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
