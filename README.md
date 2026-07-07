# 火星文翻译器 · 文档与在线翻译

本仓库是「火星文翻译器（Mars Translator）」的**产品交付物 + 可在线使用的翻译网页**。

- 产品文档（PRD / 技术设计 / Sprint 计划 / 设计系统）：见 [`deliverables/`](deliverables/)
- **可直接打开使用的翻译网页**：根目录 [`index.html`](index.html)
- 翻译引擎（纯前端、零后端）：[`engine/`](engine/)

---

## 🚀 快速开始（三种方式，零构建）

### 方式 A：直接双击打开（最简单）
双击根目录的 **`index.html`**，浏览器即开即用，**断网也能用**，无需安装任何依赖。

### 方式 B：本地静态服务（推荐）
```bash
# 在仓库根目录执行
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```
任意静态服务器（如 `npx serve`、Nginx、GitHub Pages）均可托管。

### 怎么用
1. 在左侧输入框输入中文（如「你好，世界」），右侧实时输出火星文；
2. 点顶部「火星文 → 汉语」可反向还原；
3. 设置页可调：**替换强度**（低/中/高）、**风格模板**（二次元/复古/极简/自定义）、**7 类规则开关**（同音/形近/注音/拆字/符号/假名/首字母）、**字符白名单**。

---

## 🧩 它为什么能「打开即用」

翻译引擎是**纯 TypeScript 逻辑、零运行时依赖、浏览器安全**（无 `fs`/`path`/`process`/网络/DOM 依赖）。

- 源码快照：`engine/src/`（取自同级 `mars-translator` 仓库的 `src/engine`、`src/rules`、`src/dictionary`、`src/config`）
- 已预打包为单文件：`engine/mars-engine.js`（IIFE，全局变量 `MarsTranslator`）
- `index.html` 通过 `<script src="engine/mars-engine.js"></script>` 引入并调用
  `MarsTranslator.translateAll(text, srcLang, tgtLang, config)`

> 因为引擎已**预先打包并提交**进仓库，使用者完全不需要 Node / 构建步骤。

### 重新打包引擎（仅维护者需要）
```bash
cd engine
npm install        # 安装 esbuild（devDependency）
npm run build      # 生成 mars-engine.js
```

---

## 📁 仓库结构

```
.
├── index.html                  # 在线翻译网页（真实引擎驱动，打开即用）
├── engine/
│   ├── mars-engine.js          # 预打包的翻译引擎（IIFE，已提交）
│   ├── src/                    # 引擎源码快照（engine/rules/dictionary/config）
│   ├── build.mjs               # esbuild 打包脚本
│   └── package.json
├── deliverables/               # 产品文档与设计稿
│   ├── mars-translator-ui-design.html   # UI 视觉稿（设计参考，非运行页）
│   ├── mars-translator-design-system.md
│   ├── product-strategy/       # PRD / Dev-Ready / Sprint 计划
│   └── OPTIMIZATION-SUMMARY-*.md
└── .gitignore
```

> **说明**：`mars-translator/` 是独立的应用仓库（Vite + React），未纳入本仓库。
> 本仓库的 `engine/` 是从其中抽取、可独立在浏览器运行的**纯逻辑内核**快照。

---

## 🔒 安全说明
仓库不含任何密钥、令牌或环境变量。`.gitignore` 已排除 `node_modules/`、构建产物与本地状态。
