<script setup lang="ts">
import { campaignRoute } from '~/utils/routes';
const { config } = useCampaignRuntime();
const { initCampaignRuntime } = useCampaignRuntimeLoader();
const { evaluate } = useCampaignEligibility();
const { savedState, rememberCategory, saveBeforeNavigate, clearPosition, restorePosition } = useCampaignListRestore();
const activeCategory = ref('全部');
const restoringNavigation = ref(true);

await callOnce('campaign-runtime:init', () => initCampaignRuntime());

onMounted(() => {
  if (savedState?.category && config.value.categories.includes(savedState.category)) {
    activeCategory.value = savedState.category;
  }
  nextTick(() => {
    restorePosition();
    restoringNavigation.value = false;
  });
});

watch(activeCategory, (value, previous) => {
  rememberCategory(value);
  if (!restoringNavigation.value && previous && previous !== value) {
    clearPosition(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

const visibleCampaigns = computed(() =>
  config.value.campaigns.filter(
    item =>
      item.visible &&
      item.status !== 'draft' &&
      (activeCategory.value === '全部' || item.category === activeCategory.value)
  )
);
const featured = computed(() => visibleCampaigns.value.find(item => item.featured) || visibleCampaigns.value[0]);
const statusLabels = { active: '进行中', scheduled: '即将开始', paused: '已暂停', draft: '草稿' };
</script>

<template>
  <main class="mobile-page with-bottom-nav">
    <CampaignHeader />
    <section v-if="featured" class="campaign-hero" :style="{ '--accent': featured.theme }">
      <span>FEATURED CAMPAIGN</span>
      <h1>{{ featured.title }}</h1>
      <p>{{ featured.summary }}</p>
      <NuxtLink
        :to="campaignRoute(featured)"
        @click="saveBeforeNavigate(featured.id, activeCategory)"
      >
        查看活动
        <b>→</b>
      </NuxtLink>
    </section>
    <van-tabs v-model:active="activeCategory" shrink sticky offset-top="46" class="category-tabs">
      <van-tab v-for="category in config.categories" :key="category" :name="category" :title="category" />
    </van-tabs>
    <section class="campaign-list">
      <div class="section-heading">
        <div>
          <span>MEMBER CAMPAIGNS</span>
          <h2>{{ activeCategory }}</h2>
        </div>
        <small>{{ visibleCampaigns.length }} 项</small>
      </div>
      <NuxtLink
        v-for="campaign in visibleCampaigns"
        :key="campaign.id"
        :to="campaignRoute(campaign)"
        class="campaign-card"
        :data-campaign-id="campaign.id"
        @click="saveBeforeNavigate(campaign.id, activeCategory)"
      >
        <div class="card-accent" :style="{ background: campaign.theme }">
          <van-icon
            :name="
              campaign.type === 'check-in'
                ? 'calendar-o'
                : campaign.type === 'member-benefit'
                  ? 'gem-o'
                  : campaign.type === 'milestone'
                    ? 'flag-o'
                    : 'friends-o'
            "
            size="28"
          />
        </div>
        <div class="card-copy">
          <div>
            <van-tag plain type="primary">{{ campaign.category }}</van-tag>
            <van-tag
              :type="campaign.status === 'active' ? 'success' : campaign.status === 'scheduled' ? 'warning' : 'default'"
            >
              {{ statusLabels[campaign.status] }}
            </van-tag>
          </div>
          <h3>{{ campaign.title }}</h3>
          <p>{{ campaign.summary }}</p>
          <small>
            <van-icon name="clock-o" />
            {{ campaign.startAt }} 至 {{ campaign.endAt }}
          </small>
        </div>
        <div class="card-trailing">
          <van-icon v-if="!evaluate(campaign).eligible" name="lock" class="card-lock" />
          <van-icon name="arrow" class="card-arrow" />
        </div>
      </NuxtLink>
      <div v-if="visibleCampaigns.length === 0" class="empty-state">当前分类暂无活动</div>
    </section>
    <BottomNavigation />
  </main>
</template>
