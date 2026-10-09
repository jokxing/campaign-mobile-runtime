import type { SupportConversation, SupportMessage } from '~~/shared/support';
import { parseMarkRead, parseSendMessage, type SendMessageBody, type SupportParticipant } from '~~/shared/contracts/support';

export type ConversationSummary = Omit<SupportConversation, 'messages'> & { messageCount: number };
type ConversationResponse = { conversation: SupportConversation };

const conversationsPath = '/api/support/conversations';

function conversationPath(id: string) {
  return `${conversationsPath}/${encodeURIComponent(id)}`;
}

export function getSupportConversations() {
  return $fetch<{ records: ConversationSummary[] }>(conversationsPath);
}

export function getSupportConversation(id: string) {
  return $fetch<ConversationResponse>(conversationPath(id));
}

export function markSupportConversationRead(id: string, reader: SupportParticipant) {
  return $fetch<ConversationResponse>(`${conversationPath(id)}/read`, {
    method: 'POST',
    body: parseMarkRead({ reader })
  });
}

export function sendSupportMessage(id: string, body: SendMessageBody) {
  return $fetch<{ message: SupportMessage }>(`${conversationPath(id)}/messages`, {
    method: 'POST',
    body: parseSendMessage(body)
  });
}

// The caller owns event handlers and connection lifetime. Call only in the browser.
export function createSupportEventSource() {
  return new EventSource('/api/support/events');
}
