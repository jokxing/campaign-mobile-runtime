import type { CampaignConfig } from '~/types/campaign';
import { defaultCampaignConfig } from '~~/mock/data/campaign';

export function useCampaignRuntime() {
  const config = useState<CampaignConfig>('campaign-runtime-config', () => structuredClone(defaultCampaignConfig));
  return { config };
}
