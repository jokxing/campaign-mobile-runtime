import type { SupportConversation } from '../../shared/support';

// Each call creates independent mutable data; pass a fixed time for reproducible fixtures.
export function createSupportConversations(now = Date.now()): SupportConversation[] {
  return [
    {
      id: 'conversation-1001',
      customerName: '访客 1001',
      subject: '城市活动预约咨询',
      status: 'waiting',
      assignee: null,
      channel: 'mobile',
      priority: 'normal',
      unreadAdmin: 1,
      unreadCustomer: 0,
      lastMessage: '你好，我想确认周末活动是否需要提前预约。',
      updatedAt: new Date(now - 1000 * 60 * 3).toISOString(),
      messages: [
        {
          id: 'message-1001',
          conversationId: 'conversation-1001',
          sender: 'system',
          senderName: '系统',
          content: '会话已创建，服务专员将尽快接入。',
          createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
          read: true
        },
        {
          id: 'message-1002',
          conversationId: 'conversation-1001',
          sender: 'customer',
          senderName: '访客 1001',
          content: '你好，我想确认周末活动是否需要提前预约。',
          createdAt: new Date(now - 1000 * 60 * 3).toISOString(),
          read: false
        }
      ]
    }
  ];
}
