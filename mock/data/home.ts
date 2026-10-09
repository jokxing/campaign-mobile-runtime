import type { HomeConfig } from '../../shared/home';

export const defaultHomeConfig: HomeConfig = {
  version: 1,
  name: '城市生活会员首页',
  theme: { primary: '#2563eb', background: '#f4f6f8' },
  modules: [
    {
      id: 'hero',
      type: 'hero-banner',
      title: '主视觉横幅',
      visible: true,
      locked: true,
      props: { heading: '让日常服务更简单', description: '精选内容、会员权益与城市活动，一站触达。' }
    },
    { id: 'notice', type: 'notice-ticker', title: '公告栏', visible: true, props: { heading: '本周城市活动已更新' } },
    {
      id: 'nav',
      type: 'quick-nav',
      title: '快捷入口',
      visible: true,
      props: { heading: '快捷服务', items: ['城市活动', '生活指南', '会员中心', '服务预约'] }
    },
    {
      id: 'featured',
      type: 'content-grid',
      title: '推荐内容',
      visible: true,
      props: { heading: '今日推荐', items: ['周末灵感', '人气展览', '城市漫步', '品质餐厅'] }
    },
    {
      id: 'benefits',
      type: 'benefit-cards',
      title: '会员权益',
      visible: true,
      props: { heading: '专属权益', items: ['优先预约', '活动提醒', '积分好礼'] }
    }
  ]
};
