// engine/build.mjs
// 将纯 TS 引擎打包为单文件 IIFE（浏览器全局 MarsTranslator），供 index.html 免构建引入。
// 用法：npm install && npm run build
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/engine/index.ts"],
  bundle: true,
  format: "iife",
  globalName: "MarsTranslator",
  outfile: "mars-engine.js",
  platform: "browser",
  target: "es2018",
  legalComments: "none",
});

console.log("✓ built engine/mars-engine.js");
