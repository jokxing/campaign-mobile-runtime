<script setup lang="ts">
import type { Campaign } from '~/types/campaign';
defineProps<{ campaign: Campaign }>();
</script>
<template>
  <van-cell-group inset class="task-stack">
    <van-cell
      v-for="(step, index) in campaign.rules.steps"
      :key="step"
      :title="step"
      :label="index === 0 ? '已完成' : '等待完成'"
      is-link
    >
      <template #icon>
        <span class="task-number" :class="{ done: index === 0 }">{{ index === 0 ? '✓' : index + 1 }}</span>
      </template>
    </van-cell>
  </van-cell-group>
</template>
