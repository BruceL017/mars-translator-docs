/**
 * engine/classify.ts
 * 字符级语言路由（dev-ready §2 步骤 1）
 *
 * 按 Unicode 区间逐字判定归属：
 * - CJK 统一表意文字 (U+4E00–U+9FFF) 及扩展 A (U+3400–U+4DBF) → han
 * - 平假名 (U+3040–U+309F) / 片假名 (U+30A0–U+30FF)        → kana
 * - 注音 (U+3100–U+312F)                                   → bopomofo
 * - ASCII (≤ U+007F)                                       → ascii
 * - 其余原样保留并打 marks                                  → other
 */

export type CharClass = 'han' | 'kana' | 'bopomofo' | 'ascii' | 'other';

export function classifyCodePoint(cp: number): CharClass {
  if (cp >= 0x4e00 && cp <= 0x9fff) return 'han'; // CJK 统一表意文字
  if (cp >= 0x3400 && cp <= 0x4dbf) return 'han'; // CJK 扩展 A
  if (cp >= 0x3040 && cp <= 0x309f) return 'kana'; // 平假名
  if (cp >= 0x30a0 && cp <= 0x30ff) return 'kana'; // 片假名
  if (cp >= 0x3100 && cp <= 0x312f) return 'bopomofo'; // 注音符号
  if (cp <= 0x007f) return 'ascii'; // ASCII（含英文字母/标点/数字）
  return 'other'; // 其余（特殊符号、emoji、其他文字等）
}
