<script setup lang="ts">
defineProps<{ title?: string; back?: boolean }>();
const router = useRouter();
const { theme, toggleTheme } = useAppTheme();
</script>

<template>
  <van-nav-bar
    :title="title || 'Moment 会员活动'"
    :left-arrow="back"
    fixed
    placeholder
    safe-area-inset-top
    @click-left="router.back()"
  >
    <template v-if="!back" #left><span class="brand-mark">M</span></template>
    <template #right>
      <button class="theme-toggle" :title="theme === 'light' ? '切换深色主题' : '切换浅色主题'" @click="toggleTheme">
        <span class="theme-swatch" />
        <strong>{{ theme === 'light' ? '深色' : '浅色' }}</strong>
      </button>
    </template>
  </van-nav-bar>
</template>
