import { supportFailure } from '../utils/support-contract';

// This entire service is an in-memory demo. Scenarios are not authentication.
export default defineEventHandler(event => {
  if (!event.path.startsWith('/api/support/') || event.method === 'OPTIONS') return;
  setResponseHeader(event, 'x-data-source', 'mock');
  const scenario = getHeader(event, 'x-mock-scenario');
  if (!scenario || scenario === 'success') return;
  if (scenario === 'unauthenticated') return supportFailure('UNAUTHENTICATED');
  if (scenario === 'forbidden') return supportFailure('FORBIDDEN');
  if (scenario === 'unavailable') return supportFailure('MOCK_UNAVAILABLE');
  if (scenario === 'conflict') return supportFailure('CONVERSATION_UNAVAILABLE');
  if (scenario === 'empty' && event.path === '/api/support/conversations' && event.method === 'GET') {
    return { records: [] };
  }
  return supportFailure('INVALID_REQUEST', 'x-mock-scenario');
});
