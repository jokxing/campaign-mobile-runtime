import type { SupportEvent, SupportMessage, SupportSender } from '../../shared/support';
import type { SupportParticipant } from '../../shared/contracts/support';

import { createSupportConversations } from '../../mock/data/support';

const conversations = createSupportConversations();

const subscribers = new Set<(event: SupportEvent) => void>();
let sequence = 2000;

function publish(type: SupportEvent['type'], conversationId: string) {
  const event = { type, conversationId, occurredAt: new Date().toISOString() };
  subscribers.forEach(subscriber => subscriber(event));
}

export function listSupportConversations() {
  return conversations.map(({ messages, ...conversation }) => ({ ...conversation, messageCount: messages.length }));
}

export function getSupportConversation(id: string) {
  return conversations.find(item => item.id === id);
}

export function addSupportMessage(id: string, sender: SupportSender, content: string) {
  const conversation = getSupportConversation(id);
  if (!conversation || conversation.status === 'closed') return null;
  if (sender === 'agent' && conversation.status !== 'active') return null;

  const message: SupportMessage = {
    id: `message-${++sequence}`,
    conversationId: id,
    sender,
    senderName: sender === 'customer' ? conversation.customerName : '服务专员',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };

  conversation.messages.push(message);
  conversation.lastMessage = message.content;
  conversation.updatedAt = message.createdAt;
  if (sender === 'customer') conversation.unreadAdmin += 1;
  if (sender === 'agent') conversation.unreadCustomer += 1;
  publish('message.created', id);
  return message;
}

export function claimSupportConversation(id: string) {
  const conversation = getSupportConversation(id);
  if (!conversation || conversation.status === 'closed') return null;
  conversation.status = 'active';
  conversation.assignee = '服务专员 A';
  conversation.updatedAt = new Date().toISOString();
  publish('conversation.updated', id);
  return conversation;
}

export function closeSupportConversation(id: string) {
  const conversation = getSupportConversation(id);
  if (!conversation) return null;
  conversation.status = 'closed';
  conversation.updatedAt = new Date().toISOString();
  publish('conversation.updated', id);
  return conversation;
}

export function markSupportConversationRead(id: string, reader: SupportParticipant) {
  const conversation = getSupportConversation(id);
  if (!conversation) return null;
  let changed = reader === 'agent' ? conversation.unreadAdmin > 0 : conversation.unreadCustomer > 0;
  if (reader === 'agent') conversation.unreadAdmin = 0;
  else conversation.unreadCustomer = 0;
  conversation.messages.forEach(message => {
    if (
      (reader === 'agent' && message.sender === 'customer') ||
      (reader === 'customer' && message.sender === 'agent')
    ) {
      if (!message.read) changed = true;
      message.read = true;
    }
  });
  if (changed) publish('conversation.updated', id);
  return conversation;
}

export function subscribeSupportEvents(subscriber: (event: SupportEvent) => void) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}
