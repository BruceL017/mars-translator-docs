/**
 * dictionary/types.ts
 * 词库条目数据模型（dev-ready §3 7 类规则表示）
 *
 * 采用统一结构 + 族专属可选字段，加载器据此构建正向/反向索引。
 */
import type { RuleFamily } from '../engine/types';

export interface DictEntry {
  id: string; // 唯一 id
  han: string; // 规范源字（简体）；多字词为源词
  hanTraditional?: string; // 繁体源字（可选，附加检索键）
  family: RuleFamily; // 规则族
  candidates?: string[]; // ①同音 / ②形近 / ⑥假名 的替换候选
  bopomofo?: string; // ③注音符号（如 ㄅ）
  parts?: string[]; // ④拆字部件（如 ["弓","虽"]）
  symbols?: string[]; // ⑤穿插符号（如 ["♡","☆"]）
  initials?: string; // ⑦拼音首字母（如 "sm"）
  priority?: number; // 覆盖默认优先级
}
