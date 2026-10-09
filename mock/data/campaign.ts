import type { CampaignConfig } from '../../shared/campaign';

export const defaultCampaignConfig: CampaignConfig = {
  version: 1,
  publishedVersion: 3,
  categories: ['全部', '新人成长', '日常任务', '会员权益'],
  campaigns: [
    {
      id: 'campaign-onboarding',
      code: 'welcome-path',
      type: 'onboarding',
      title: '新人成长计划',
      summary: '完成三个简单步骤，解锁新会员专属权益。',
      category: '新人成长',
      status: 'active',
      visible: true,
      featured: true,
      startAt: '2026-07-01',
      endAt: '2026-12-31',
      audience: 'new-member',
      platforms: ['h5', 'app', 'pwa'],
      theme: '#2563eb',
      rules: {
        target: 3,
        unit: '项任务',
        benefit: '成长礼遇',
        steps: ['完善个人资料', '收藏感兴趣的内容', '完成首次服务预约']
      }
    },
    {
      id: 'campaign-checkin',
      code: 'weekly-check-in',
      type: 'check-in',
      title: '七日签到挑战',
      summary: '保持每日签到，连续七天获得会员积分。',
      category: '日常任务',
      status: 'active',
      visible: true,
      featured: false,
      startAt: '2026-07-01',
      endAt: '2026-09-30',
      audience: 'member',
      platforms: ['h5', 'app'],
      theme: '#0f766e',
      rules: {
        target: 7,
        unit: '天',
        benefit: '700 会员积分',
        steps: ['每日访问活动页', '完成当日签到', '连续七天解锁额外权益']
      }
    },
    {
      id: 'campaign-milestone',
      code: 'city-explorer',
      type: 'milestone',
      title: '城市探索里程碑',
      summary: '参与城市体验，逐步点亮探索徽章。',
      category: '日常任务',
      status: 'scheduled',
      visible: true,
      featured: true,
      startAt: '2026-08-01',
      endAt: '2026-11-30',
      audience: 'all',
      platforms: ['h5', 'app', 'pwa'],
      theme: '#b45309',
      rules: {
        target: 5,
        unit: '个地点',
        benefit: '城市探索徽章',
        steps: ['选择感兴趣的路线', '完成地点打卡', '达到里程碑领取徽章']
      }
    },
    {
      id: 'campaign-benefit',
      code: 'premium-care',
      type: 'member-benefit',
      title: '会员专属服务周',
      summary: '高级会员可预约一对一城市服务顾问。',
      category: '会员权益',
      status: 'active',
      visible: true,
      featured: false,
      startAt: '2026-07-10',
      endAt: '2026-08-10',
      audience: 'premium',
      platforms: ['h5', 'app'],
      theme: '#7c3aed',
      rules: {
        target: 1,
        unit: '次预约',
        benefit: '专属顾问服务',
        steps: ['验证会员等级', '选择可预约时间', '提交服务需求']
      }
    }
  ]
};
