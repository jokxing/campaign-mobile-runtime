export const HOME_MODULE_TYPES = ['hero-banner', 'notice-ticker', 'quick-nav', 'content-grid', 'benefit-cards'] as const;
export type HomeModuleType = typeof HOME_MODULE_TYPES[number];

export interface HomeModule {
  id: string;
  type: HomeModuleType;
  title: string;
  visible: boolean;
  locked?: boolean;
  props: { heading?: string; description?: string; items?: string[] };
}

export interface HomeConfig {
  version: 1;
  name: string;
  theme: { primary: string; background: string };
  modules: HomeModule[];
}
