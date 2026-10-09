import { closeSupportConversation } from '../../../../utils/support-store';
import { supportFailure } from '../../../../utils/support-contract';

export default defineEventHandler(event => {
  const conversation = closeSupportConversation(getRouterParam(event, 'id') || '');
  if (!conversation) return supportFailure('NOT_FOUND');
  return { conversation };
});
