import { createSupportEventSource, getSupportConversations, type ConversationSummary } from '~/api/support';
import type { SupportEvent } from '~~/shared/support';
import { supportErrorMessage } from '~~/shared/contracts/support';
import { createRefreshTask } from '~/utils/refresh-task';

// Promise coordination belongs to each Nuxt app (one per SSR request), not useState.
const refreshTasks = new WeakMap<object, ReturnType<typeof createRefreshTask>>();

let eventSource: EventSource | null = null;
let listeningForOnline = false;
const realtimeListeners = new Set<(event: SupportEvent) => void>();
const reconnectListeners = new Set<() => void>();

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

  function connect(onEvent?: (event: SupportEvent) => void, onReconnect?: () => void) {
    if (onEvent) realtimeListeners.add(onEvent);
    if (onReconnect) reconnectListeners.add(onReconnect);
    if (!import.meta.client) return;
    // Browsers can resume with a stale OPEN stream after going offline.
    // Recreate it and fetch snapshots immediately when the network returns.
    if (!listeningForOnline) {
      listeningForOnline = true;
      window.addEventListener('online', () => {
        eventSource?.close();
        eventSource = null;
        connected.value = false;
        void refreshConversations();
        reconnectListeners.forEach(listener => listener());
        connect();
      });
    }
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) return;
    eventSource = createSupportEventSource();
    eventSource.onopen = () => {
      connected.value = true;
      // SSE has no event replay: always reconcile snapshots after (re)connecting.
      void refreshConversations();
      reconnectListeners.forEach(listener => listener());
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

  function removeListener(listener: (event: SupportEvent) => void, onReconnect?: () => void) {
    realtimeListeners.delete(listener);
    if (onReconnect) reconnectListeners.delete(onReconnect);
  }

  return { conversations, connected, errorMessage, unread, initSupportRuntime, refreshConversations, connect, removeListener };
}
