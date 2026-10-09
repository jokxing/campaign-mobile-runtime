<script setup lang="ts">
import { vantThemeVars } from '~/theme/vant';
const { theme } = useAppTheme();
useHead({
  htmlAttrs: {
    'data-app-theme': theme
  }
});
</script>

<template>
  <van-config-provider
    :theme="theme"
    :theme-vars="vantThemeVars"
    theme-vars-scope="global"
    class="theme-shell"
  >
    <NuxtPage />
  </van-config-provider>
</template>
