/**
 * engine/types.ts
 * 火星文翻译器 —— 核心类型定义
 *
 * 本文件定义规则引擎、配置模型、接口契约所需的全部类型。
 * 引擎为纯 TS 模块，零运行时联网依赖，可独立单测。
 */

/** 7 类规则族 */
export type RuleFamily =
  | 'homophone' // ① 同音字替换
  | 'shape' // ② 形近字替换
  | 'bopomofo' // ③ 注音符号混入
  | 'split' // ④ 拆字重组
  | 'emoji' // ⑤ emoji/符号穿插
  | 'kana' // ⑥ 日语假名借用
  | 'initials'; // ⑦ 拼音首字母缩写

/** 语言方向（仅支持汉↔火） */
export type Lang = 'han' | 'mars';

/** 替换强度（密度曲线，非随机） */
export type Strength = 'low' | 'mid' | 'high';

/** 风格模板 */
export type StyleName = 'anime' | 'retro' | 'minimal' | 'custom';

/**
 * 配置模型（R14）
 * 与 dev-ready §4 严格对齐。
 */
export interface TranslateConfig {
  strength: Strength; // 替换密度
  families: Record<RuleFamily, boolean>; // 7 类规则开关
  traditional: boolean; // 繁体输出开关
  whitelist: { symbols: string[] }; // 字符集白名单（③⑤ 类受约束）
  style: StyleName; // 风格模板
}

/** 候选输出（调试 / 可解释） */
export interface Candidate {
  value: string; // 候选替换字符串（可能为多字符）
  family: RuleFamily; // 产出该候选的规则族
  priority: number; // 优先级，越大越优先
}

/** 保留标记（无法翻译字符的坐标，供 UI 高亮） */
export interface Mark {
  index: number; // 在 result 中的起始下标
  length: number; // 长度
  type: 'untranslatable';
  text: string; // 被包裹的原始文本
}

/** translate() 出参 */
export interface TranslateResult {
  result: string; // 最终译文
  candidates: Candidate[][]; // 每个输入字符的候选集
  marks: Mark[]; // 保留标记数组
  chunks?: number; // 分块数（仅在超长分块时出现）
}

/** 错误码 */
export type ErrorCode = 'E_EMPTY' | 'E_OVERFLOW' | 'E_UNSUPPORTED_DIR';

/** 历史记录条目（dev-ready §5 存储 schema） */
export interface HistoryItem {
  id: string;
  ts: number;
  srcText: string;
  srcLang: string;
  tgtLang: string;
  result: string;
  configSnapshot: TranslateConfig;
}

/** 收藏条目（dev-ready §5 存储 schema） */
export interface FavoriteItem {
  id: string;
  ts: number;
  result: string;
  note?: string;
}

/** 引擎统一错误类型 */
export class MarsTranslateError extends Error {
  public readonly code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'MarsTranslateError';
    Object.setPrototypeOf(this, MarsTranslateError.prototype);
  }
}
