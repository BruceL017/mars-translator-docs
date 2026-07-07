/**
 * config/schema.ts
 * 配置模型（R14）—— schema、强度密度、默认配置、风格模板
 * 与 dev-ready §4 严格对齐。
 */

import type { RuleFamily, Strength, StyleName, TranslateConfig } from '../engine/types';

/** 7 类规则固定顺序（用于规范化序列化，保证确定性） */
export const RULE_FAMILIES: RuleFamily[] = [
  'homophone',
  'shape',
  'bopomofo',
  'split',
  'emoji',
  'kana',
  'initials',
];

/** 强度 → 替换密度（确定性密度曲线，非随机） */
export const STRENGTH_DENSITY: Record<Strength, number> = {
  low: 0.15, // 仅高频字、首选候选
  mid: 0.45,
  high: 0.8, // 多候选 + 多位置叠加
};

/** 默认安全字符白名单（③⑤ 类插入需命中，应对微信/QQ 过滤） */
export const DEFAULT_WHITELIST: string[] = [
  '♡',
  '☆',
  '★',
  '✿',
  '✧',
  '♪',
  'の',
  'ㄅ',
  'ㄆ',
  'ㄇ',
  'ㄈ',
  'ㄉ',
  'ㄊ',
  'ㄋ',
  'ㄌ',
  'ㄍ',
  'ㄎ',
  'ㄏ',
  'ㄐ',
  'ㄑ',
  'ㄒ',
  'ㄓ',
  'ㄔ',
  'ㄕ',
  'ㄖ',
  'ㄗ',
  'ㄘ',
  'ㄙ',
];

/** 默认配置 */
export const DEFAULT_CONFIG: TranslateConfig = {
  strength: 'mid',
  families: {
    homophone: true,
    shape: true,
    bopomofo: false,
    split: false,
    emoji: false,
    kana: false,
    initials: false,
  },
  traditional: false,
  whitelist: { symbols: [...DEFAULT_WHITELIST] },
  style: 'custom',
};

/** 风格模板 = 规则族预设组合（dev-ready §4） */
export interface StyleTemplate {
  families?: Partial<Record<RuleFamily, boolean>>;
  strength?: Strength;
  traditional?: boolean;
}

export const STYLE_TEMPLATES: Record<StyleName, StyleTemplate> = {
  anime: {
    families: {
      homophone: true,
      emoji: true,
      kana: true,
      bopomofo: false,
      split: false,
      shape: false,
      initials: false,
    },
    strength: 'mid',
  },
  retro: {
    families: {
      homophone: true,
      initials: true,
      kana: false,
      bopomofo: false,
      split: false,
      emoji: false,
      shape: false,
    },
    strength: 'mid',
  },
  minimal: {
    families: {
      homophone: true,
      shape: false,
      bopomofo: false,
      split: false,
      emoji: false,
      kana: false,
      initials: false,
    },
    strength: 'low',
  },
  custom: {},
};
