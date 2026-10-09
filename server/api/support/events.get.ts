import { subscribeSupportEvents } from '../../utils/support-store';

export default defineEventHandler(event => {
  const stream = createEventStream(event);
  const unsubscribe = subscribeSupportEvents(payload => stream.push(JSON.stringify(payload)));
  const heartbeat = setInterval(() => stream.push(JSON.stringify({ type: 'heartbeat' })), 15000);

  stream.onClosed(() => {
    clearInterval(heartbeat);
    unsubscribe();
  });
  return stream.send();
});
