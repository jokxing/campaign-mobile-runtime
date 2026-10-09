<script setup lang="ts">
const route = useRoute();
const { unread, initSupportRuntime, connect } = useSupportRuntime();
const activeName = computed({
  get: () =>
    route.path === '/home'
      ? 'home'
      : route.path === '/member'
        ? 'member'
        : route.path.startsWith('/messages') || route.path.startsWith('/support')
          ? 'messages'
          : 'campaigns',
  set: (name: string) =>
    navigateTo(
      name === 'home' ? '/home' : name === 'member' ? '/member' : name === 'messages' ? '/messages' : '/campaigns'
    )
});

onMounted(() => {
  void initSupportRuntime();
  connect();
});
</script>

<template>
  <van-tabbar
    v-model="activeName"
    fixed
    safe-area-inset-bottom
    class="app-tabbar"
  >
    <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item name="campaigns" icon="gift-o">活动</van-tabbar-item>
    <van-tabbar-item name="messages" icon="chat-o" :badge="unread || undefined">消息</van-tabbar-item>
    <van-tabbar-item name="member" icon="user-o">会员</van-tabbar-item>
  </van-tabbar>
</template>
