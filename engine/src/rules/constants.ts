/**
 * rules/constants.ts
 * 7 类规则的默认优先级（用于确定性候选排序）。
 * 优先级越大越优先；同优先级保持稳定插入序（由 pickBest 保证）。
 */
import type { RuleFamily } from '../engine/types';

export const FAMILY_PRIORITY: Record<RuleFamily, number> = {
  homophone: 90, // 同音字最高优先（最地道）
  shape: 80, // 形近字
  kana: 70, // 日语假名
  bopomofo: 60, // 注音混入
  split: 50, // 拆字重组
  emoji: 40, // emoji 穿插
  initials: 30, // 拼音首字母
};
