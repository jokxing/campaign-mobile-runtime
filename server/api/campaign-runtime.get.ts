import { defaultCampaignConfig } from '../../mock/data/campaign';

export default defineEventHandler(event => {
  const query = getQuery(event);

  return {
    config: structuredClone(defaultCampaignConfig),
    context: String(query.context || 'member'),
    generatedAt: new Date().toISOString()
  };
});
