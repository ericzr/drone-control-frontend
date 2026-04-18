<script lang="ts" setup>
import { ref } from 'vue';

import { useRouter } from 'vue-router';

import type { AlertImage } from '../scenes';

defineProps<{
  images: AlertImage[];
}>();

const router = useRouter();
const previewVisible = ref(false);
const previewItem = ref<AlertImage | null>(null);

function openPreview(item: AlertImage) {
  previewItem.value = item;
  previewVisible.value = true;
}

function closePreview() {
  previewVisible.value = false;
}

function goEventDetail() {
  if (previewItem.value) {
    const eid = previewItem.value.eventId || previewItem.value.id;
    closePreview();
    router.push(`/event/detail?id=${eid}`);
  }
}

function levelColor(level: string) {
  if (level === 'critical') return '#ef4444';
  if (level === 'warning') return '#f59e0b';
  return '#3b82f6';
}

function levelLabel(level: string) {
  if (level === 'critical') return '紧急';
  if (level === 'warning') return '一般';
  return '提示';
}
</script>

<template>
  <div class="alert-gallery">
    <div class="alert-gallery__grid">
      <div
        v-for="img in images"
        :key="img.id"
        class="alert-thumb"
        @click="openPreview(img)"
      >
        <div class="alert-thumb__img-wrap">
          <img :src="img.src" :alt="img.category" class="alert-thumb__img" />
          <span
            class="alert-thumb__badge"
            :style="{ background: levelColor(img.level) }"
          >
            {{ levelLabel(img.level) }}
          </span>
          <span class="alert-thumb__conf">{{ (img.confidence * 100).toFixed(0) }}%</span>
        </div>
        <div class="alert-thumb__info">
          <div class="alert-thumb__cat">{{ img.category }}</div>
          <div class="alert-thumb__meta">
            <span>{{ img.location }}</span>
            <span>{{ img.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="previewVisible && previewItem" class="alert-preview-mask" @click="closePreview">
          <div class="alert-preview" @click.stop>
            <img :src="previewItem.src" :alt="previewItem.category" class="alert-preview__img" />
            <div class="alert-preview__detail">
              <div class="alert-preview__row">
                <span
                  class="alert-preview__level"
                  :style="{ background: levelColor(previewItem.level) }"
                >{{ levelLabel(previewItem.level) }}</span>
                <span class="alert-preview__cat">{{ previewItem.category }}</span>
                <span class="alert-preview__conf">置信度 {{ (previewItem.confidence * 100).toFixed(1) }}%</span>
              </div>
              <div class="alert-preview__sub">
                {{ previewItem.location }} · {{ previewItem.time }}
              </div>
              <button class="alert-preview__goto" @click="goEventDetail">查看事件详情 ›</button>
            </div>
            <button class="alert-preview__close" @click="closePreview">✕</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="less" scoped>
.alert-gallery__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.alert-thumb {
  border-radius: 14px;
  overflow: hidden;
  background: rgb(255 255 255 / 4%);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgb(0 0 0 / 30%);
  }
}

.alert-thumb__img-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.alert-thumb__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.alert-thumb__badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 8px;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
}

.alert-thumb__conf {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 6px;
  color: #e5e7eb;
  font-size: 10px;
  font-weight: 700;
  background: rgb(0 0 0 / 50%);
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.alert-thumb__info {
  padding: 8px 10px 10px;
}

.alert-thumb__cat {
  color: #f3f4f6;
  font-size: 12px;
  font-weight: 700;
}

.alert-thumb__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  color: #9ca3af;
  font-size: 11px;
}

/* preview modal */
.alert-preview-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 70%);
  backdrop-filter: blur(6px);
}

.alert-preview {
  position: relative;
  max-width: 640px;
  width: 90vw;
  border-radius: 16px;
  overflow: hidden;
  background: #111827;
  box-shadow: 0 24px 60px rgb(0 0 0 / 50%);
}

.alert-preview__img {
  width: 100%;
  display: block;
}

.alert-preview__detail {
  padding: 16px 20px;
}

.alert-preview__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-preview__level {
  padding: 3px 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
}

.alert-preview__cat {
  color: #f3f4f6;
  font-size: 15px;
  font-weight: 700;
}

.alert-preview__conf {
  color: #9ca3af;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.alert-preview__sub {
  margin-top: 8px;
  color: #9ca3af;
  font-size: 13px;
}

.alert-preview__goto {
  display: inline-block;
  margin-top: 12px;
  padding: 6px 16px;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  background: transparent;
  color: #60a5fa;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3b82f6;
    color: #fff;
  }
}

.alert-preview__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: rgb(0 0 0 / 50%);
  color: #e5e7eb;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgb(0 0 0 / 70%);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
