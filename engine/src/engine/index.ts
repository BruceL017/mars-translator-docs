/**
 * engine/index.ts
 * 规则引擎统一出口（纯 TS 模块，零运行时联网依赖）。
 */

export * from './types';
export * from './classify';
export * from './determinism';
export * from './pipeline';
export * from './translate';
export { getDictionary, type LoadedDictionary } from '../dictionary/index';
export {
  STRENGTH_DENSITY,
  DEFAULT_CONFIG,
  DEFAULT_WHITELIST,
  RULE_FAMILIES,
  STYLE_TEMPLATES,
} from '../config/schema';
export type { StyleTemplate } from '../config/schema';
