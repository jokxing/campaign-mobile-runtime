<script setup lang="ts">
import type { Campaign } from '~/types/campaign';
defineProps<{ campaign: Campaign }>();
</script>
<template>
  <van-grid :column-num="4" :border="false" :gutter="8" class="checkin-grid">
    <van-grid-item v-for="day in campaign.rules.target" :key="day">
      <div class="checkin-day" :class="{ done: day <= 3 }">
        <span>DAY {{ day }}</span>
        <van-icon :name="day <= 3 ? 'success' : 'clock-o'" size="20" />
      </div>
    </van-grid-item>
  </van-grid>
</template>
