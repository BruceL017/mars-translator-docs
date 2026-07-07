/**
 * rules/index.ts
 * 7 类规则实现 —— 候选生成 + 确定性排序（dev-ready §2 步骤 2–5）。
 *
 * 每个规则族从字典条目产出候选；候选选择按「强度 → 优先级 → 候选序」
 * 三级确定性策略选唯一输出（dev-ready §2 步骤 5）。
 */

import { FAMILY_PRIORITY } from './constants';
import type { DictEntry } from '../dictionary/types';
import type { Candidate, TranslateConfig } from '../engine/types';

/** 符号是否命中白名单（③⑤ 类受约束） */
export function isWhitelisted(symbol: string, config: TranslateConfig): boolean {
  return config.whitelist.symbols.includes(symbol);
}

/**
 * 由单个字典条目 + 命中的原始文本（matchedText，可能已转繁体）
 * 产出该条目对应的候选集。家族未开启或受白名单约束不通过时返回空。
 */
export function candidatesForEntry(
  entry: DictEntry,
  matchedText: string,
  config: TranslateConfig,
): Candidate[] {
  if (!config.families[entry.family]) return [];
  const prio = entry.priority ?? FAMILY_PRIORITY[entry.family];

  switch (entry.family) {
    case 'homophone':
    case 'shape':
    case 'kana':
      return (entry.candidates ?? []).map((value) => ({
        value,
        family: entry.family,
        priority: prio,
      }));
    case 'bopomofo':
      if (!entry.bopomofo) return [];
      if (!isWhitelisted(entry.bopomofo, config)) return [];
      return [{ value: matchedText + entry.bopomofo, family: entry.family, priority: prio }];
    case 'emoji': {
      if (!entry.symbols) return [];
      const sym = entry.symbols.find((s) => isWhitelisted(s, config));
      if (!sym) return [];
      return [{ value: matchedText + sym, family: entry.family, priority: prio }];
    }
    case 'split':
      if (!entry.parts) return [];
      return [{ value: entry.parts.join(''), family: entry.family, priority: prio }];
    case 'initials':
      if (!entry.initials) return [];
      return [{ value: entry.initials, family: entry.family, priority: prio }];
    default:
      return [];
  }
}

/**
 * 候选确定性排序：按优先级降序（同优先级保持稳定插入序），并去重。
 * best[0] 即「首选候选」。
 */
export function pickBest(cands: Candidate[]): Candidate[] {
  const sorted = cands.slice().sort((a, b) => b.priority - a.priority);
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const c of sorted) {
    if (seen.has(c.value)) continue;
    seen.add(c.value);
    out.push(c);
  }
  return out;
}
