import { getCampaignRuntime } from '~/api/campaign';
import { defaultCampaignConfig } from '~~/mock/data/campaign';

let inFlight: Promise<void> | null = null;
let lastRequestKey = '';
let lastLoadedAt = 0;

export function useCampaignRuntimeLoader() {
  const { config } = useCampaignRuntime();
  const runtimeStatus = useState<'idle' | 'loading' | 'ready' | 'error'>('campaign-runtime-status', () => 'idle');
  const runtimeLoadedAt = useState('campaign-runtime-loaded-at', () => '');

  async function initCampaignRuntime(context = 'member', force = false) {
    const requestKey = `context:${context}`;

    if (!force && inFlight && lastRequestKey === requestKey) return inFlight;
    if (!force && lastRequestKey === requestKey && Date.now() - lastLoadedAt < 1500) return;

    lastRequestKey = requestKey;
    runtimeStatus.value = 'loading';
    inFlight = getCampaignRuntime(context)
      .then(response => {
        // Categories and campaigns are committed together to keep filtering consistent.
        config.value = structuredClone(response.config);
        runtimeLoadedAt.value = response.generatedAt;
        runtimeStatus.value = 'ready';
        lastLoadedAt = Date.now();
      })
      .catch(error => {
        console.warn('[campaign-runtime] Local API unavailable, using bundled demo data.', error);
        config.value = structuredClone(defaultCampaignConfig);
        runtimeLoadedAt.value = new Date().toISOString();
        runtimeStatus.value = 'ready';
        lastLoadedAt = Date.now();
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  }

  return { runtimeStatus, runtimeLoadedAt, initCampaignRuntime };
}
