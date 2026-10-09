<script setup lang="ts">
const { homeConfig } = useHomeRuntime();
const modules = computed(() => homeConfig.value.modules.filter(item => item.visible));
const iconSet = ['location-o', 'guide-o', 'vip-card-o', 'service-o'];
</script>

<template>
  <main
    class="mobile-page with-bottom-nav"
    :style="{ '--home-brand': homeConfig.theme.primary, background: homeConfig.theme.background }"
  >
    <CampaignHeader title="Moment 城市生活" />
    <template v-for="module in modules" :key="module.id">
      <section v-if="module.type === 'hero-banner'" class="home-hero">
        <van-tag color="var(--app-hero-tag)" text-color="var(--app-white)">MEMBER EDITION</van-tag>
        <h1>{{ module.props.heading }}</h1>
        <p>{{ module.props.description }}</p>
        <van-button size="small" color="var(--app-white)" round class="hero-action" @click="navigateTo('/campaigns')">
          开始探索
          <van-icon name="arrow" />
        </van-button>
      </section>
      <van-notice-bar
        v-else-if="module.type === 'notice-ticker'"
        left-icon="volume-o"
        :text="module.props.heading"
        class="home-notice"
      />
      <section v-else-if="module.type === 'quick-nav'" class="home-section">
        <div class="section-heading">
          <div>
            <span>QUICK ACCESS</span>
            <h2>{{ module.props.heading }}</h2>
          </div>
        </div>
        <van-grid :column-num="4" :border="false" class="home-quick-grid">
          <van-grid-item
            v-for="(item, index) in module.props.items"
            :key="item"
            :to="index === 0 ? '/campaigns' : '/member'"
            :icon="iconSet[index % iconSet.length]"
            :text="item"
          />
        </van-grid>
      </section>
      <section v-else-if="module.type === 'content-grid'" class="home-section">
        <div class="section-heading">
          <div>
            <span>EDITOR'S PICKS</span>
            <h2>{{ module.props.heading }}</h2>
          </div>
          <small>查看更多</small>
        </div>
        <div class="home-content-grid">
          <article v-for="(item, index) in module.props.items" :key="item" :class="`tone-${index % 4}`">
            <span>精选 {{ index + 1 }}</span>
            <h3>{{ item }}</h3>
            <p>发现城市里的新鲜体验</p>
          </article>
        </div>
      </section>
      <section v-else-if="module.type === 'benefit-cards'" class="home-section">
        <div class="section-heading">
          <div>
            <span>MEMBER BENEFITS</span>
            <h2>{{ module.props.heading }}</h2>
          </div>
          <small>会员中心</small>
        </div>
        <van-cell-group class="home-benefits">
          <van-cell
            v-for="item in module.props.items"
            :key="item"
            :title="item"
            label="为会员准备的专属服务"
            icon="gem-o"
            is-link
            to="/member"
          />
        </van-cell-group>
      </section>
    </template>
    <BottomNavigation />
  </main>
</template>
