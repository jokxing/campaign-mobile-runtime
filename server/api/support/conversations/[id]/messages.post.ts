import { addSupportMessage } from '../../../../utils/support-store';
import { parseSendMessage } from '../../../../../shared/contracts/support';
import { readSupportBody, supportFailure } from '../../../../utils/support-contract';

export default defineEventHandler(async event => {
  const body = await readSupportBody(event, parseSendMessage);
  const message = addSupportMessage(
    getRouterParam(event, 'id') || '',
    body.sender,
    body.content
  );
  if (!message) return supportFailure('CONVERSATION_UNAVAILABLE');
  return { message };
});
