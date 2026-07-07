/**
 * engine/translate.ts
 * 翻译门面（dev-ready §5 接口契约）+ 超长分块（边界处理 §6）。
 */

import { translateHanToMars, translateMarsToHan } from './pipeline';
import { MarsTranslateError } from './types';
import { DEFAULT_CONFIG } from '../config/schema';
import type { Candidate, Lang, Mark, TranslateConfig, TranslateResult } from './types';

/** 单块上限（字符数） */
export const CHUNK_SIZE = 1000;
/** 触发分块的阈值（字符数） */
export const MAX_CHARS = 2000;

/** 词/句边界判定（用于分块时尽量保留词边界） */
function isBoundary(ch: string): boolean {
  return /\s/.test(ch) || /[，。！？、；：,!?;:.…—~～"-]/.test(ch);
}

/** 按 ~1000 字/块切分（保留词边界）；合并时按序拼接 */
export function splitText(text: string, size: number = CHUNK_SIZE): string[] {
  if (text.length <= size) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + size, text.length);
    if (end < text.length) {
      // 回退到最近的词/句边界
      while (end > start + 1 && !isBoundary(text[end - 1])) end--;
      if (end === start) end = start + size; // 极端无边界则强制切
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

/**
 * 核心翻译。空输入抛 E_EMPTY；不支持方向抛 E_UNSUPPORTED_DIR。
 * 注意：>2000 字由调用方使用 translateAll 分块处理（E_OVERFLOW 不在核心内抛出，
 * 由 translateAll 透明分块，UI 显示进度条）。
 */
/** 将（可能部分缺失的）配置归一化为完整 TranslateConfig，保证引擎不抛错 */
function normalizeConfig(c: TranslateConfig): TranslateConfig {
  return {
    ...DEFAULT_CONFIG,
    ...c,
    families: { ...DEFAULT_CONFIG.families, ...(c?.families ?? {}) },
    whitelist: c?.whitelist ?? DEFAULT_CONFIG.whitelist,
  };
}

export function translate(
  text: string,
  srcLang: Lang,
  tgtLang: Lang,
  config: TranslateConfig,
): TranslateResult {
  const cfg = normalizeConfig(config);
  if (text.trim() === '') {
    throw new MarsTranslateError('E_EMPTY', '请输入内容');
  }
  if (srcLang === 'han' && tgtLang === 'mars') return translateHanToMars(text, cfg);
  if (srcLang === 'mars' && tgtLang === 'han') return translateMarsToHan(text, cfg);
  throw new MarsTranslateError('E_UNSUPPORTED_DIR', '不支持的翻译方向');
}

/**
 * 全量翻译（含超长分块）。返回合并后的结果、候选、标记，并据此调整标记坐标。
 * onProgress 回调分块进度（0–1）。
 */
export function translateAll(
  text: string,
  srcLang: Lang,
  tgtLang: Lang,
  config: TranslateConfig,
  onProgress?: (progress: number) => void,
): TranslateResult {
  if (text.length <= MAX_CHARS) {
    onProgress?.(1);
    return translate(text, srcLang, tgtLang, config);
  }

  const chunks = splitText(text);
  let result = '';
  const candidates: Candidate[][] = [];
  const marks: Mark[] = [];

  chunks.forEach((chunk, idx) => {
    const r = translate(chunk, srcLang, tgtLang, config);
    const offset = result.length;
    result += r.result;
    candidates.push(...r.candidates);
    for (const m of r.marks) marks.push({ ...m, index: m.index + offset });
    onProgress?.((idx + 1) / chunks.length);
  });

  return { result, candidates, marks, chunks: chunks.length };
}
