import type { CampaignConfig } from '~/types/campaign';
import { isCampaignConfig } from '~~/shared/contracts/preview';

export interface CampaignRuntimeResponse {
  config: CampaignConfig;
  context: string;
  generatedAt: string;
}

export async function getCampaignRuntime(context: string) {
  const response = await $fetch<CampaignRuntimeResponse>('/api/campaign-runtime', { query: { context } });
  if (!response || !isCampaignConfig(response.config) || typeof response.context !== 'string' ||
    typeof response.generatedAt !== 'string' || !Number.isFinite(Date.parse(response.generatedAt))) {
    throw new Error('Invalid campaign runtime response');
  }
  return response;
}
