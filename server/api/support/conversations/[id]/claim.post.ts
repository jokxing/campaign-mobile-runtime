import { claimSupportConversation } from '../../../../utils/support-store';
import { supportFailure } from '../../../../utils/support-contract';

export default defineEventHandler(event => {
  const conversation = claimSupportConversation(getRouterParam(event, 'id') || '');
  if (!conversation) return supportFailure('CONVERSATION_UNAVAILABLE');
  return { conversation };
});
