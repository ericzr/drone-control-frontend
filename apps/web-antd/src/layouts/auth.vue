<script lang="ts" setup>
import { computed } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
import { preferences } from '@vben/preferences';

import { $t } from '#/locales';

const appName = computed(() => preferences.app.name);
const logo = computed(() => preferences.logo.source);
const logoDark = computed(() => preferences.logo.sourceDark);
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-bg">
      <div class="auth-grid" />
      <div class="auth-glow auth-glow--1" />
      <div class="auth-glow auth-glow--2" />
      <div class="auth-particles">
        <span v-for="i in 20" :key="i" class="auth-particle" :style="{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 6}s`, animationDuration: `${4 + Math.random() * 4}s` }" />
      </div>
    </div>
    <AuthPageLayout
      :app-name="appName"
      :logo="logo"
      :logo-dark="logoDark"
      :page-description="$t('authentication.pageDesc')"
      :page-title="$t('authentication.pageTitle')"
    />
  </div>
</template>

<style scoped>
.auth-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 40%, #1b2838 100%);
}

.auth-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(22, 119, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(22, 119, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.auth-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
}

.auth-glow--1 {
  width: 500px;
  height: 500px;
  top: -100px;
  left: -100px;
  background: radial-gradient(circle, rgba(22, 119, 255, 0.4) 0%, transparent 70%);
  animation: glow-float 8s ease-in-out infinite;
}

.auth-glow--2 {
  width: 400px;
  height: 400px;
  bottom: -80px;
  right: 10%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  animation: glow-float 10s ease-in-out infinite reverse;
}

.auth-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.auth-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(22, 119, 255, 0.5);
  border-radius: 50%;
  animation: particle-rise linear infinite;
}

@keyframes glow-float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 20px); }
}

@keyframes particle-rise {
  0% { opacity: 0; transform: translateY(0); }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-200px); }
}

.auth-wrapper :deep(.vben-authentication) {
  position: relative;
  z-index: 1;
}

.auth-wrapper :deep(.vben-authentication .left-section),
.auth-wrapper :deep(.vben-authentication > div:first-child) {
  background: transparent !important;
}
</style>
