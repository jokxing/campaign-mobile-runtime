<script setup lang="ts">
import { formatTime } from '~/utils/date';
import { getSupportConversation, markSupportConversationRead, sendSupportMessage } from '~/api/support';
import type { SupportConversation, SupportEvent } from '~~/shared/support';
import { MESSAGE_MAX_LENGTH, supportErrorMessage } from '~~/shared/contracts/support';

const route = useRoute();
const conversation = ref<SupportConversation | null>(null);
const draft = ref('');
const sending = ref(false);
const loading = ref(false);
const loadError = ref('');
const sendError = ref('');
const sendStatus = ref('');
let loadSequence = 0;
const messageList = ref<HTMLElement | null>(null);
const { connect, removeListener, refreshConversations } = useSupportRuntime();

async function loadConversation() {
  const sequence = ++loadSequence;
  const id = String(route.params.id);
  loading.value = true;
  loadError.value = '';
  try {
    const response = await getSupportConversation(id);
    if (sequence !== loadSequence) return;
    conversation.value = response.conversation;
    if (import.meta.client) {
      await markSupportConversationRead(id, 'customer');
      await refreshConversations();
    }
    if (sequence !== loadSequence) return;
    await nextTick();
    messageList.value?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    if (sequence === loadSequence) loadError.value = supportErrorMessage(error);
  } finally {
    if (sequence === loadSequence) loading.value = false;
  }
}

async function sendMessage() {
  const content = draft.value.trim();
  if (!content || sending.value || !conversation.value || conversation.value.status === 'closed') return;
  sendError.value = '';
  sendStatus.value = '';
  if (content.length > MESSAGE_MAX_LENGTH) {
    sendError.value = `消息不能超过 ${MESSAGE_MAX_LENGTH} 个字符。`;
    return;
  }
  const id = String(route.params.id);
  const submittedDraft = draft.value;
  sending.value = true;
  try {
    await sendSupportMessage(id, { sender: 'customer', content });
    if (id !== String(route.params.id)) return;
    if (draft.value === submittedDraft) draft.value = '';
    sendStatus.value = '消息已发送。';
    await loadConversation();
  } catch (error) {
    if (id === String(route.params.id)) sendError.value = supportErrorMessage(error);
  } finally {
    sending.value = false;
  }
}

function handleRealtime(event: SupportEvent) {
  if (event.conversationId === route.params.id) loadConversation();
}

await loadConversation();
watch(() => route.params.id, () => {
  conversation.value = null;
  draft.value = '';
  sendError.value = '';
  sendStatus.value = '';
  void loadConversation();
});
onMounted(() => connect(handleRealtime, loadConversation));
onBeforeUnmount(() => {
  loadSequence++;
  removeListener(handleRealtime, loadConversation);
});
</script>

<template>
  <main class="mobile-page support-chat-page">
    <CampaignHeader :title="conversation?.subject || '服务会话'" back />
    <section v-if="loadError" class="request-feedback" role="alert">
      <p>{{ loadError }}</p>
      <van-button size="small" :loading="loading" @click="loadConversation">重新加载</van-button>
    </section>
    <p v-else-if="loading && !conversation" class="request-feedback" role="status">正在加载会话…</p>
    <p v-if="sendError" class="request-feedback" role="alert">{{ sendError }} 输入内容已保留，可重新发送。</p>
    <p v-if="sendStatus" class="request-feedback" role="status">{{ sendStatus }}</p>
    <section v-if="conversation" class="support-status-bar">
      <span :class="`is-${conversation.status}`" />
      <div>
        <strong>{{ conversation.assignee || '正在安排服务专员' }}</strong>
        <p>{{ conversation.status === 'closed' ? '本次会话已结束' : '通常会在几分钟内回复' }}</p>
      </div>
    </section>

    <section v-if="conversation" ref="messageList" class="support-message-list">
      <article
        v-for="message in conversation.messages"
        :key="message.id"
        :class="['support-message', `is-${message.sender}`]"
      >
        <div v-if="message.sender !== 'system'" class="message-sender">{{ message.senderName }}</div>
        <p>{{ message.content }}</p>
        <time v-if="message.sender !== 'system'">
          {{ formatTime(message.createdAt) }}
          <span v-if="message.sender === 'customer'">· {{ message.read ? '已读' : '已发送' }}</span>
        </time>
      </article>
    </section>

    <footer v-if="conversation" class="support-composer">
      <template v-if="conversation.status !== 'closed'">
        <textarea
          v-model="draft"
          :maxlength="MESSAGE_MAX_LENGTH"
          placeholder="输入消息"
          aria-label="输入消息"
          @keydown.enter.exact="event => { if (!event.isComposing) { event.preventDefault(); sendMessage(); } }"
        />
        <van-button
          type="primary"
          icon="guide-o"
          aria-label="发送消息"
          :loading="sending"
          :disabled="!draft.trim()"
          @click="sendMessage"
        />
      </template>
      <p v-else>会话已结束，如需帮助可发起新的服务请求。</p>
    </footer>
  </main>
</template>
