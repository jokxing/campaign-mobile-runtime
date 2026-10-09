import type { Campaign } from '~/types/campaign';
import type { RuntimePlatform } from '~~/shared/campaign';
export type { RuntimePlatform } from '~~/shared/campaign';

export type MemberProfile = 'guest' | 'new-member' | 'member' | 'premium';

const profileRank: Record<MemberProfile, number> = {
  guest: 0,
  'new-member': 1,
  member: 2,
  premium: 3
};

export function useCampaignEligibility() {
  const memberProfile = useState<MemberProfile>('campaign-member-profile', () => 'member');
  const runtimePlatform = useState<RuntimePlatform>('campaign-runtime-platform', () => 'h5');

  function evaluate(campaign: Campaign) {
    if (!campaign.platforms.includes(runtimePlatform.value)) {
      return { eligible: false, reason: '当前终端暂不支持参与此活动' };
    }
    if (campaign.status === 'scheduled') {
      return { eligible: false, reason: `活动将于 ${campaign.startAt} 开始` };
    }
    if (campaign.status === 'paused') {
      return { eligible: false, reason: '活动暂时停止参与' };
    }
    if (campaign.audience === 'new-member' && memberProfile.value !== 'new-member') {
      return { eligible: false, reason: '此活动仅面向新会员开放' };
    }
    if (campaign.audience === 'premium' && profileRank[memberProfile.value] < profileRank.premium) {
      return { eligible: false, reason: '升级为高级会员后即可参与' };
    }
    if (campaign.audience === 'member' && profileRank[memberProfile.value] < profileRank.member) {
      return { eligible: false, reason: '登录会员账号后即可参与' };
    }
    return { eligible: true, reason: '当前账号满足参与条件' };
  }

  return { memberProfile, runtimePlatform, evaluate };
}
