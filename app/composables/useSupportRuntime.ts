import { createSupportEventSource, getSupportConversations, type ConversationSummary } from '~/api/support';
import type { SupportEvent } from '~~/shared/support';
import { supportErrorMessage } from '~~/shared/contracts/support';
import { createRefreshTask } from '~/utils/refresh-task';

// Promise coordination belongs to each Nuxt app (one per SSR request), not useState.
const refreshTasks = new WeakMap<object, ReturnType<typeof createRefreshTask>>();

let eventSource: EventSource | null = null;
const realtimeListeners = new Set<(event: SupportEvent) => void>();

export function useSupportRuntime() {
  const app = useNuxtApp();
  const conversations = useState<ConversationSummary[]>('support-conversations', () => []);
  const connected = useState('support-connected', () => false);
  const errorMessage = useState('support-error', () => '');
  const initialized = useState('support-initialized', () => false);
  const unread = computed(() => conversations.value.reduce((total, item) => total + item.unreadCustomer, 0));

  async function loadConversations() {
    try {
      const response = await getSupportConversations();
      conversations.value = response.records;
      errorMessage.value = '';
      initialized.value = true;
    } catch (error) {
      errorMessage.value = supportErrorMessage(error);
    }
  }

  let refreshTask = refreshTasks.get(app);
  if (!refreshTask) {
    refreshTask = createRefreshTask(loadConversations);
    refreshTasks.set(app, refreshTask);
  }
  const runRefresh = refreshTask;

  function refreshConversations() {
    return runRefresh();
  }

  function initSupportRuntime() {
    return initialized.value ? Promise.resolve() : runRefresh(false);
  }

  function connect(onEvent?: (event: SupportEvent) => void) {
    if (onEvent) realtimeListeners.add(onEvent);
    if (!import.meta.client || eventSource) return;
    eventSource = createSupportEventSource();
    eventSource.onopen = () => {
      connected.value = true;
    };
    eventSource.onmessage = message => {
      let event: SupportEvent;
      try {
        event = JSON.parse(message.data);
        if (!event || typeof event.conversationId !== 'string') return;
      } catch {
        return;
      }
      if (event.type === 'conversation.updated' || event.type === 'message.created') {
        refreshConversations();
        realtimeListeners.forEach(listener => listener(event));
      }
    };
    eventSource.onerror = () => {
      connected.value = false;
    };
  }

  function removeListener(listener: (event: SupportEvent) => void) {
    realtimeListeners.delete(listener);
  }

  return { conversations, connected, errorMessage, unread, initSupportRuntime, refreshConversations, connect, removeListener };
}
