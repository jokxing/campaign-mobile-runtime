import { listSupportConversations } from '../../utils/support-store';

export default defineEventHandler(() => ({ records: listSupportConversations() }));
