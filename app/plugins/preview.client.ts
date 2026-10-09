import { isAllowedPreviewOrigin, parsePreviewUpdate } from '~~/shared/contracts/preview';

export default defineNuxtPlugin(() => {
  const { config } = useCampaignRuntime();
  const { homeConfig } = useHomeRuntime();
  const route = useRoute();
  const settings = useRuntimeConfig().public;
  if (String(settings.previewEnabled) !== 'true') return;
  const parentOrigin = typeof route.query.parentOrigin === 'string' ? route.query.parentOrigin : '';
  if (!isAllowedPreviewOrigin(parentOrigin, window.location.origin, String(settings.previewAllowedOrigins))) return;

  // Embedded in admin phone preview: hide native scrollbar while keeping scroll.
  if (window.parent !== window && route.query.preview === '1') {
    document.documentElement.classList.add('preview-embed');
  }

  const onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== parentOrigin) return;
    const update = parsePreviewUpdate(event.data);
    if (!update) return;
    if (update.channel === 'campaign-studio') config.value = structuredClone(update.payload);
    else homeConfig.value = structuredClone(update.payload);
  };

  window.addEventListener('message', onMessage);
  if (import.meta.hot) import.meta.hot.dispose(() => window.removeEventListener('message', onMessage));
  if (window.parent !== window && parentOrigin) {
    window.parent.postMessage({ channel: 'campaign-studio', type: 'PREVIEW_READY' }, parentOrigin);
    window.parent.postMessage({ channel: 'mobile-home-composer', type: 'PREVIEW_READY' }, parentOrigin);
  }
});
