<template>
  <main class="mobile-page with-bottom-nav member-page">
    <CampaignHeader title="会员中心" />
    <section class="member-summary">
      <van-icon name="gem" size="26" />
      <span>MOMENT MEMBER</span>
      <h1>城市生活会员</h1>
      <p>本月已解锁 3 项会员权益</p>
      <div>
        <strong>1,280</strong>
        <small>可用积分</small>
      </div>
    </section>
    <section class="home-section">
      <div class="section-heading">
        <div>
          <span>MY SERVICES</span>
          <h2>我的服务</h2>
        </div>
      </div>
      <van-grid :column-num="3" :border="false" class="member-actions">
        <van-grid-item icon="fire-o" text="进行中活动">
          <template #icon>
            <van-badge content="3"><van-icon name="fire-o" size="25" /></van-badge>
          </template>
        </van-grid-item>
        <van-grid-item icon="coupon-o" text="待使用权益">
          <template #icon>
            <van-badge content="2"><van-icon name="coupon-o" size="25" /></van-badge>
          </template>
        </van-grid-item>
        <van-grid-item icon="orders-o" text="服务记录" />
      </van-grid>
    </section>
    <section class="home-section">
      <div class="section-heading">
        <div>
          <span>ACCOUNT</span>
          <h2>账户设置</h2>
        </div>
      </div>
      <van-cell-group class="member-list">
        <van-cell title="个人资料" icon="contact-o" is-link />
        <van-cell title="消息提醒" icon="bell" is-link />
        <van-cell title="隐私设置" icon="shield-o" is-link />
      </van-cell-group>
    </section>
    <BottomNavigation />
  </main>
</template>
