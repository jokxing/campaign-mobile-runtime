<script setup lang="ts">
import type { Campaign } from '~/types/campaign';
defineProps<{ campaign: Campaign }>();
</script>
<template>
  <div class="benefit-ticket" :style="{ '--benefit-accent': campaign.theme }">
    <van-icon name="gem-o" size="28" :color="campaign.theme" />
    <span>PREMIUM SERVICE</span>
    <h2>{{ campaign.rules.benefit }}</h2>
    <p>
      <van-icon name="passed" />
      已通过高级会员资格校验
    </p>
    <van-button type="primary" :color="campaign.theme" block round>立即预约</van-button>
  </div>
</template>
