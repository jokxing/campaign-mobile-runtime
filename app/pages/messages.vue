<script setup lang="ts">
import { formatTime } from '~/utils/date';
const { conversations, connected, errorMessage, refreshConversations, initSupportRuntime } = useSupportRuntime();

await initSupportRuntime();

const statusLabel = { waiting: '等待接入', active: '服务中', closed: '已结束' } as const;
const statusType = { waiting: 'warning', active: 'success', closed: 'default' } as const;

</script>

<template>
  <main class="mobile-page message-page with-bottom-nav">
    <CampaignHeader title="消息中心" />
    <section v-if="errorMessage" class="request-feedback" role="alert">
      <p>{{ errorMessage }}</p>
      <van-button size="small" @click="refreshConversations">重新加载</van-button>
    </section>
    <section class="message-intro">
      <div>
        <span>服务消息</span>
        <h1>需要帮助？我们在线</h1>
        <p>活动预约、会员权益与城市服务问题，都可以在这里继续沟通。</p>
      </div>
      <van-tag :type="connected ? 'success' : 'warning'" plain>
        {{ connected ? '实时连接' : '正在连接' }}
      </van-tag>
    </section>

    <section class="conversation-section">
      <p v-if="!errorMessage && conversations.length === 0" role="status">暂无服务会话。</p>
      <div class="section-heading">
        <div>
          <span>CONVERSATIONS</span>
          <h2>服务会话</h2>
        </div>
        <small>{{ conversations.length }} 个会话</small>
      </div>
      <NuxtLink
        v-for="conversation in conversations"
        :key="conversation.id"
        :to="`/support/${conversation.id}`"
        class="conversation-row"
      >
        <div class="conversation-avatar">
          <van-icon name="service-o" />
          <span v-if="conversation.status === 'active'" class="presence-dot" />
        </div>
        <div class="conversation-copy">
          <div>
            <strong>{{ conversation.subject }}</strong>
            <time>{{ formatTime(conversation.updatedAt) }}</time>
          </div>
          <p>{{ conversation.lastMessage }}</p>
          <van-tag :type="statusType[conversation.status]" plain size="medium">
            {{ statusLabel[conversation.status] }}
          </van-tag>
        </div>
        <van-badge v-if="conversation.unreadCustomer" :content="conversation.unreadCustomer" />
        <van-icon v-else name="arrow" />
      </NuxtLink>
    </section>
    <BottomNavigation />
  </main>
</template>
