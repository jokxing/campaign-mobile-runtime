export type SupportConversationStatus = 'waiting' | 'active' | 'closed';
export type SupportSender = 'customer' | 'agent' | 'system';

export interface SupportMessage {
  id: string;
  conversationId: string;
  sender: SupportSender;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface SupportConversation {
  id: string;
  customerName: string;
  subject: string;
  status: SupportConversationStatus;
  assignee: string | null;
  channel: 'mobile';
  priority: 'normal' | 'high';
  unreadAdmin: number;
  unreadCustomer: number;
  lastMessage: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportEvent {
  type: 'conversation.updated' | 'message.created';
  conversationId: string;
  occurredAt: string;
}
