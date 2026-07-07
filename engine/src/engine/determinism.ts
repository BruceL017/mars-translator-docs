/**
 * engine/determinism.ts
 * 确定性伪随机与配置规范化（dev-ready §2 可复现保证）。
 *
 * 铁律：引擎全程禁止 Math.random。
 * 强度 → 替换位置/数量由种子推导：seed = hash(text + canonical(config))。
 * 候选选择固定取最高优先级（stable sort），字典为冻结不可变对象。
 * 同输入 + 同配置 ⇒ 同输出（可复现率 100%）。
 */

import { RULE_FAMILIES } from '../config/schema';
import type { TranslateConfig } from './types';

/** FNV-1a 字符串哈希 → 32 位无符号整数 */
export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 确定性 PRNG（仅由 seed 推导，无随机源） */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 规范化配置序列化（与键顺序无关，保证同语义配置产生相同种子）。
 * 这是可复现率 100% 的关键：即便对象键顺序不同也不影响 seed。
 */
export function serializeConfig(c: TranslateConfig): string {
  const strength = c.strength ?? 'mid';
  const fam = RULE_FAMILIES.map((f) => `${f}:${c.families?.[f] ? 1 : 0}`).join(',');
  const wl = [...(c.whitelist?.symbols ?? [])].sort().join('');
  const trad = c.traditional ? 1 : 0;
  const style = c.style ?? 'custom';
  return `${strength}|${fam}|${trad}|${wl}|${style}`;
}

/** 由文本 + 配置推导确定性种子 */
export function makeSeed(text: string, config: TranslateConfig): number {
  return hashString(text + ' ' + serializeConfig(config));
}
