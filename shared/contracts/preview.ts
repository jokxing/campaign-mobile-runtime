import type { CampaignConfig } from '../campaign';
import type { HomeConfig } from '../home';
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES, CAMPAIGN_AUDIENCES, RUNTIME_PLATFORMS } from '../campaign';
import { HOME_MODULE_TYPES } from '../home';

type RecordValue = Record<string, unknown>;
const record = (v: unknown): v is RecordValue => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max = 200): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const color = (v: unknown) => typeof v === 'string' && /^#[\da-f]{6}$/i.test(v);
const integer = (v: unknown, min: number, max: number) => Number.isInteger(v) && Number(v) >= min && Number(v) <= max;
const member = (v: unknown, values: readonly string[]) => typeof v === 'string' && values.includes(v);
const list = (v: unknown, max: number): v is unknown[] => Array.isArray(v) && v.length <= max;
const strings = (v: unknown, max: number): v is string[] => list(v, max) && v.every(item => text(item));
const unique = (values: unknown[]) => new Set(values).size === values.length;
const date = (v: unknown): v is string => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const parsed = new Date(`${v}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v;
};

export function isCampaignConfig(value: unknown): value is CampaignConfig {
  if (!record(value) || value.version !== 1 || !integer(value.publishedVersion, 0, Number.MAX_SAFE_INTEGER)) return false;
  if (!strings(value.categories, 30) || !unique(value.categories) || !list(value.campaigns, 100)) return false;
  const categories = value.categories;
  if (!value.campaigns.every(item => {
    if (!record(item) || !record(item.rules)) return false;
    return text(item.id, 100) && text(item.code, 100) &&
      member(item.type, CAMPAIGN_TYPES) &&
      text(item.title) && text(item.summary, 1000) && categories.includes(String(item.category)) &&
      member(item.status, CAMPAIGN_STATUSES) &&
      typeof item.visible === 'boolean' && typeof item.featured === 'boolean' &&
      date(item.startAt) && date(item.endAt) && item.startAt <= item.endAt &&
      member(item.audience, CAMPAIGN_AUDIENCES) &&
      list(item.platforms, 3) && item.platforms.length > 0 && unique(item.platforms) &&
      item.platforms.every(platform => member(platform, RUNTIME_PLATFORMS)) && color(item.theme) &&
      integer(item.rules.target, 1, 100) && text(item.rules.unit, 50) && text(item.rules.benefit) &&
      strings(item.rules.steps, 30) && unique(item.rules.steps);
  })) return false;
  const campaigns = value.campaigns as RecordValue[];
  return unique(campaigns.map(item => item.id)) && unique(campaigns.map(item => item.code));
}

export function isHomeConfig(value: unknown): value is HomeConfig {
  if (!record(value) || value.version !== 1 || !text(value.name) || !record(value.theme) ||
    !color(value.theme.primary) || !color(value.theme.background) || !list(value.modules, 50)) return false;
  if (!value.modules.every(item => {
    if (!record(item) || !record(item.props)) return false;
    const props = item.props;
    return text(item.id, 100) && text(item.title) && typeof item.visible === 'boolean' &&
      (item.locked === undefined || typeof item.locked === 'boolean') &&
      member(item.type, HOME_MODULE_TYPES) &&
      (props.heading === undefined || text(props.heading)) &&
      (props.description === undefined || text(props.description, 1000)) &&
      (props.items === undefined || (strings(props.items, 50) && unique(props.items)));
  })) return false;
  return unique((value.modules as RecordValue[]).map(item => item.id));
}

export function isAllowedPreviewOrigin(origin: string, ownOrigin: string, allowlist: string): boolean {
  try {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) return false;
    return origin === ownOrigin || allowlist.split(',').map(value => value.trim()).includes(origin);
  } catch {
    return false;
  }
}

export type PreviewUpdate =
  | { channel: 'campaign-studio'; type: 'CONFIG_UPDATE'; payload: CampaignConfig }
  | { channel: 'mobile-home-composer'; type: 'SCHEMA_UPDATE'; payload: HomeConfig };

export function parsePreviewUpdate(value: unknown): PreviewUpdate | null {
  if (!record(value)) return null;
  if (value.channel === 'campaign-studio' && value.type === 'CONFIG_UPDATE' && isCampaignConfig(value.payload)) {
    return { channel: value.channel, type: value.type, payload: value.payload };
  }
  if (value.channel === 'mobile-home-composer' && value.type === 'SCHEMA_UPDATE' && isHomeConfig(value.payload)) {
    return { channel: value.channel, type: value.type, payload: value.payload };
  }
  return null;
}
