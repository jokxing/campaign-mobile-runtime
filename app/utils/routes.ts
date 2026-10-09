import type { Campaign } from '../../shared/campaign';

export function campaignRoute(campaign: Pick<Campaign, 'id' | 'code'>) {
  return {
    path: `/campaign/${encodeURIComponent(campaign.code)}`,
    query: { id: campaign.id }
  };
}
