/**
 * engine/pipeline.ts
 * 规则引擎 5 段流水线（dev-ready §2）：
 *   1. 字符级语言路由
 *   2. 规则族匹配（正向贪心最长匹配）
 *   3. 候选生成
 *   4. 后处理 / 去重（pickBest）
 *   5. 确定性选择（强度 → 优先级 → 候选序）
 *
 * 双向：
 *   han→mars：正向流水线 + 确定性种子替换
 *   mars→han：反向贪心最长匹配（反向索引 + 形近/同音回查）
 */

import { classifyCodePoint } from './classify';
import { makeSeed, mulberry32 } from './determinism';
import { STRENGTH_DENSITY } from '../config/schema';
import { getDictionary, type LoadedDictionary } from '../dictionary/index';
import { toTraditional } from '../dictionary/traditional';
import { candidatesForEntry, pickBest } from '../rules/index';
import { RULE_FAMILIES } from '../config/schema';
import type { DictEntry } from '../dictionary/types';
import type { Candidate, Mark, TranslateConfig, TranslateResult } from './types';

const UNTRANSLATABLE_OPEN = '︵';
const UNTRANSLATABLE_CLOSE = '︶';

function indexOfEnabled(entries: ReadonlyArray<DictEntry>, config: TranslateConfig): number {
  for (let i = 0; i < entries.length; i++) {
    if (config.families[entries[i].family]) return i;
  }
  return -1;
}

/** 汉 → 火：5 段流水线 + 确定性种子替换 */
export function translateHanToMars(text: string, config: TranslateConfig): TranslateResult {
  const dict: LoadedDictionary = getDictionary();
  // R01 繁：汉→火方向按 traditional 将基字转繁体（与 mars→han 对称）。
  // 保持 makeSeed(text, config) 不变，toTraditional 为纯函数，确定性不受影响。
  const src = config.traditional ? toTraditional(text) : text;
  const rng = mulberry32(makeSeed(text, config));
  const density = STRENGTH_DENSITY[config.strength] ?? STRENGTH_DENSITY.mid;

  const out: string[] = [];
  const candPerChar: Candidate[][] = [];
  const marks: Mark[] = [];

  let i = 0;
  const n = src.length;
  while (i < n) {
    const cp = src.codePointAt(i) ?? 0;
    const charLen = cp > 0xffff ? 2 : 1;
    const cls = classifyCodePoint(cp);

    // 步骤 1–2：正向贪心最长匹配（仅取含已开启规则族的键）
    let matchedKey: string | null = null;
    let matchedEntries: ReadonlyArray<DictEntry> = [];
    const maxLen = Math.min(dict.forwardMaxLen, n - i);
    for (let len = maxLen; len >= 1; len--) {
      const sub = src.slice(i, i + len);
      const ents = dict.forward.get(sub);
      if (ents && indexOfEnabled(ents, config) !== -1) {
        matchedKey = sub;
        matchedEntries = ents;
        break;
      }
    }

    if (matchedKey) {
      const all = matchedEntries.flatMap((e) =>
        candidatesForEntry(e, matchedKey as string, config),
      );
      const best = pickBest(all);
      let emit = matchedKey; // 默认：未达密度则保留原文（已为繁体基字）
      if (best.length > 0) {
        const r = rng(); // 仅在有候选时消耗一次 PRNG（位置/数量由种子推导）
        if (r < density) emit = best[0].value;
      }
      out.push(emit);
      for (let k = 0; k < matchedKey.length; k++) candPerChar.push(best);
      i += matchedKey.length;
      continue;
    }

    // 无字典匹配：按语言路由处理
    if (cls === 'other') {
      const original = src.slice(i, i + charLen);
      const start = out.join('').length;
      out.push(UNTRANSLATABLE_OPEN + original + UNTRANSLATABLE_CLOSE);
      marks.push({
        index: start,
        length: original.length + UNTRANSLATABLE_OPEN.length + UNTRANSLATABLE_CLOSE.length,
        type: 'untranslatable',
        text: original,
      });
      for (let k = 0; k < charLen; k++) candPerChar.push([]);
    } else {
      // ASCII / 假名 / 注音 / 无规则的汉字 → 原样透传（已为繁体基字）
      out.push(src.slice(i, i + charLen));
      for (let k = 0; k < charLen; k++) candPerChar.push([]);
    }
    i += charLen;
  }

  return { result: out.join(''), candidates: candPerChar, marks };
}

/** 火 → 汉：反向贪心最长匹配（反向索引），无法消歧则原样保留 */
export function translateMarsToHan(text: string, config: TranslateConfig): TranslateResult {
  const dict: LoadedDictionary = getDictionary();

  const out: string[] = [];
  const candPerChar: Candidate[][] = [];
  const marks: Mark[] = [];

  let i = 0;
  const n = text.length;
  while (i < n) {
    let matchedToken: string | null = null;
    let mapped = '';
    const maxLen = Math.min(dict.reverseMaxLen, n - i);
    for (let len = maxLen; len >= 1; len--) {
      const sub = text.slice(i, i + len);
      if (dict.reverse.has(sub)) {
        matchedToken = sub;
        mapped = dict.reverse.get(sub) as string;
        break;
      }
    }

    if (matchedToken) {
      if (mapped !== '') out.push(mapped); // 纯插入符号（''）则剥离
      for (let k = 0; k < matchedToken.length; k++) candPerChar.push([]);
      i += matchedToken.length;
    } else {
      out.push(text[i]);
      candPerChar.push([]);
      i += 1;
    }
  }

  let result = out.join('');
  if (config.traditional) result = toTraditional(result); // 还原出口也可转繁体（与正向对称）
  return { result, candidates: candPerChar, marks };
}

/** 同时导出规则族常量供调用方使用（如配置校验） */
export { RULE_FAMILIES };
