export default defineEventHandler(event => {
  if (!event.path.startsWith('/api/support')) return;

  const origin = getHeader(event, 'origin');
  if (origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    setResponseHeader(event, 'access-control-allow-origin', origin);
    setResponseHeader(event, 'vary', 'Origin');
  }
  setResponseHeader(event, 'access-control-allow-methods', 'GET,POST,OPTIONS');
  setResponseHeader(event, 'access-control-allow-headers', 'Content-Type,X-Mock-Scenario');

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204);
    return '';
  }
});
