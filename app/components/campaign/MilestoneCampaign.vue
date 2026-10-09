<script setup lang="ts">
import type { Campaign } from '~/types/campaign';
defineProps<{ campaign: Campaign }>();
</script>
<template>
  <section class="milestone-journey" :style="{ '--step-count': campaign.rules.target }">
    <div
      v-for="index in campaign.rules.target"
      :key="index"
      class="milestone-step"
      :class="{ reached: index <= 2, current: index === 2 }"
    >
      <div class="milestone-node">
        <van-icon v-if="index === 2" name="success" />
        <span v-else>{{ index }}</span>
      </div>
      <strong>阶段 {{ index }}</strong>
    </div>
  </section>
</template>
