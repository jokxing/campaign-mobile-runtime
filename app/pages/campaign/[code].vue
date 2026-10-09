<script setup lang="ts">
import OnboardingCampaign from '~/components/campaign/OnboardingCampaign.vue';
import CheckInCampaign from '~/components/campaign/CheckInCampaign.vue';
import MilestoneCampaign from '~/components/campaign/MilestoneCampaign.vue';
import MemberBenefitCampaign from '~/components/campaign/MemberBenefitCampaign.vue';

const route = useRoute();
const { config } = useCampaignRuntime();
const { initCampaignRuntime } = useCampaignRuntimeLoader();
const { evaluate } = useCampaignEligibility();

await callOnce('campaign-runtime:init', () => initCampaignRuntime());

const componentRegistry = {
  onboarding: OnboardingCampaign,
  'check-in': CheckInCampaign,
  milestone: MilestoneCampaign,
  'member-benefit': MemberBenefitCampaign
};
const campaign = computed(() =>
  config.value.campaigns.find(item => item.id === route.query.id || item.code === route.params.code)
);

useSeoMeta({
  title: () => (campaign.value ? `${campaign.value.title} | Moment 会员活动` : '活动详情 | Moment 会员活动'),
  description: () => campaign.value?.summary || '查看 Moment 会员活动详情与参与规则。',
  ogTitle: () => campaign.value?.title || 'Moment 会员活动',
  ogDescription: () => campaign.value?.summary || '查看会员活动详情与参与规则。',
  ogType: 'website'
});

const runtimeComponent = computed(() => (campaign.value ? componentRegistry[campaign.value.type] : null));
const progress = computed(() =>
  campaign.value?.type === 'onboarding' ? 33 : campaign.value?.type === 'check-in' ? 43 : 40
);
const eligibility = computed(() =>
  campaign.value ? evaluate(campaign.value) : { eligible: false, reason: '活动信息暂不可用' }
);
</script>

<template>
  <main class="mobile-page detail-page with-bottom-nav">
    <CampaignHeader :title="campaign?.title || '活动详情'" back />
    <template v-if="campaign && runtimeComponent">
      <section class="detail-hero" :style="{ '--accent': campaign.theme }">
        <van-tag color="var(--app-hero-tag)" text-color="var(--app-white)">{{ campaign.category }}</van-tag>
        <h1>{{ campaign.title }}</h1>
        <p>{{ campaign.summary }}</p>
      </section>
      <section class="progress-card">
        <div>
          <span>当前进度</span>
          <strong>{{ progress }}%</strong>
        </div>
        <van-progress :percentage="progress" :color="campaign.theme" stroke-width="7" :show-pivot="false" />
        <small>目标：{{ campaign.rules.target }} {{ campaign.rules.unit }}</small>
      </section>
      <section class="eligibility-card" :class="{ eligible: eligibility.eligible }">
        <van-icon :name="eligibility.eligible ? 'passed' : 'warning-o'" />
        <div>
          <strong>{{ eligibility.eligible ? '可以参与' : '暂不可参与' }}</strong>
          <p>{{ eligibility.reason }}</p>
        </div>
      </section>
      <section class="runtime-section">
        <div class="section-heading">
          <div>
            <span>CAMPAIGN JOURNEY</span>
            <h2>参与进度</h2>
          </div>
        </div>
        <component :is="runtimeComponent" :campaign="campaign" />
      </section>
      <section class="rule-card">
        <h2>活动规则</h2>
        <van-cell-group>
          <van-cell v-for="(step, index) in campaign.rules.steps" :key="step" :title="step">
            <template #icon>
              <span class="rule-index">{{ index + 1 }}</span>
            </template>
          </van-cell>
        </van-cell-group>
        <div>
          <span>完成权益</span>
          <strong>{{ campaign.rules.benefit }}</strong>
        </div>
      </section>
    </template>
    <section v-else class="empty-state detail-empty">
      <h2>活动暂不可用</h2>
      <NuxtLink to="/campaigns">返回活动中心</NuxtLink>
    </section>
    <BottomNavigation />
  </main>
</template>
