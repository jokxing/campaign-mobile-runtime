export const CAMPAIGN_TYPES = ['onboarding', 'check-in', 'milestone', 'member-benefit'] as const;
export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'active', 'paused'] as const;
export const CAMPAIGN_AUDIENCES = ['all', 'new-member', 'member', 'premium'] as const;
export const RUNTIME_PLATFORMS = ['h5', 'app', 'pwa'] as const;
export type CampaignType = typeof CAMPAIGN_TYPES[number];
export type CampaignStatus = typeof CAMPAIGN_STATUSES[number];
export type CampaignAudience = typeof CAMPAIGN_AUDIENCES[number];
export type RuntimePlatform = typeof RUNTIME_PLATFORMS[number];

export interface Campaign {
  id: string;
  code: string;
  type: CampaignType;
  title: string;
  summary: string;
  category: string;
  status: CampaignStatus;
  visible: boolean;
  featured: boolean;
  startAt: string;
  endAt: string;
  audience: CampaignAudience;
  platforms: RuntimePlatform[];
  theme: string;
  rules: {
    target: number;
    unit: string;
    benefit: string;
    steps: string[];
  };
}

export interface CampaignConfig {
  version: 1;
  publishedVersion: number;
  categories: string[];
  campaigns: Campaign[];
}
