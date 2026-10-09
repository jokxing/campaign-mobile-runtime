import { markSupportConversationRead } from '../../../../utils/support-store';
import { parseMarkRead } from '../../../../../shared/contracts/support';
import { readSupportBody, supportFailure } from '../../../../utils/support-contract';

export default defineEventHandler(async event => {
  const body = await readSupportBody(event, parseMarkRead);
  const conversation = markSupportConversationRead(
    getRouterParam(event, 'id') || '',
    body.reader
  );
  if (!conversation) return supportFailure('NOT_FOUND');
  return { conversation };
});
