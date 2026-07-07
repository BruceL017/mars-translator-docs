/**
 * dictionary/index.ts
 * 词库加载器：冻结不可变对象 + 构建正向/反向索引（dev-ready §2 / §3）。
 *
 * - 正向索引 forward：源字/词 → 条目[]（简繁双键）
 * - 反向索引 reverse：火星文 token → 源字（'' 表示纯插入符号，还原时剥离）
 * - 加载为单例，Object.freeze 保证不可变，符合确定性铁律。
 */

import { DICTIONARY_DATA } from './data';
import { SIMPLIFIED_TO_TRADITIONAL } from './traditional';
import type { DictEntry } from './types';

export { DICTIONARY_DATA } from './data';

export interface LoadedDictionary {
  /** 正向索引：源字/词 → 条目（简繁双键） */
  forward: ReadonlyMap<string, ReadonlyArray<DictEntry>>;
  /** 反向索引：火星文 token → 源字（'' = 纯插入符号） */
  reverse: ReadonlyMap<string, string>;
  /** 冻结后的全部条目 */
  entries: ReadonlyArray<DictEntry>;
  /** 正向最长键长（用于贪心匹配上界） */
  forwardMaxLen: number;
  /** 反向最长 token 长（用于贪心匹配上界） */
  reverseMaxLen: number;
}

const FROZEN: ReadonlyArray<DictEntry> = Object.freeze(
  DICTIONARY_DATA.map((e) => Object.freeze({ ...e })),
) as ReadonlyArray<DictEntry>;

let cached: LoadedDictionary | null = null;

function build(): LoadedDictionary {
  const forward = new Map<string, DictEntry[]>();
  for (const e of FROZEN) {
    const keys = new Set<string>([e.han]);
    const trad = SIMPLIFIED_TO_TRADITIONAL[e.han];
    if (trad) keys.add(trad);
    if (e.hanTraditional) keys.add(e.hanTraditional);
    for (const k of keys) {
      const arr = forward.get(k);
      if (arr) arr.push(e);
      else forward.set(k, [e]);
    }
  }

  const reverse = new Map<string, string>();
  for (const e of FROZEN) {
    switch (e.family) {
      case 'bopomofo':
        if (e.bopomofo) reverse.set(e.bopomofo, ''); // 纯插入，还原时剥离
        break;
      case 'emoji':
        if (e.symbols) for (const s of e.symbols) reverse.set(s, ''); // 纯插入，还原时剥离
        break;
      case 'split':
        if (e.parts) reverse.set(e.parts.join(''), e.han);
        break;
      case 'initials':
        if (e.initials) reverse.set(e.initials, e.han);
        break;
      case 'homophone':
      case 'shape':
      case 'kana':
        if (e.candidates) for (const c of e.candidates) reverse.set(c, e.han);
        break;
    }
  }

  let forwardMaxLen = 1;
  for (const k of forward.keys()) forwardMaxLen = Math.max(forwardMaxLen, k.length);
  let reverseMaxLen = 1;
  for (const k of reverse.keys()) reverseMaxLen = Math.max(reverseMaxLen, k.length);

  return {
    forward: forward as ReadonlyMap<string, ReadonlyArray<DictEntry>>,
    reverse: reverse as ReadonlyMap<string, string>,
    entries: FROZEN,
    forwardMaxLen,
    reverseMaxLen,
  };
}

/** 获取（单例）已加载词库 */
export function getDictionary(): LoadedDictionary {
  if (!cached) cached = build();
  return cached;
}
