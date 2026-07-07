var MarsTranslator = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // engine/src/engine/index.ts
  var index_exports = {};
  __export(index_exports, {
    CHUNK_SIZE: () => CHUNK_SIZE,
    DEFAULT_CONFIG: () => DEFAULT_CONFIG,
    DEFAULT_WHITELIST: () => DEFAULT_WHITELIST,
    MAX_CHARS: () => MAX_CHARS,
    MarsTranslateError: () => MarsTranslateError,
    RULE_FAMILIES: () => RULE_FAMILIES,
    STRENGTH_DENSITY: () => STRENGTH_DENSITY,
    STYLE_TEMPLATES: () => STYLE_TEMPLATES,
    classifyCodePoint: () => classifyCodePoint,
    getDictionary: () => getDictionary,
    hashString: () => hashString,
    makeSeed: () => makeSeed,
    mulberry32: () => mulberry32,
    serializeConfig: () => serializeConfig,
    splitText: () => splitText,
    translate: () => translate,
    translateAll: () => translateAll,
    translateHanToMars: () => translateHanToMars,
    translateMarsToHan: () => translateMarsToHan
  });

  // engine/src/engine/types.ts
  var MarsTranslateError = class _MarsTranslateError extends Error {
    constructor(code, message) {
      super(message);
      __publicField(this, "code");
      this.code = code;
      this.name = "MarsTranslateError";
      Object.setPrototypeOf(this, _MarsTranslateError.prototype);
    }
  };

  // engine/src/engine/classify.ts
  function classifyCodePoint(cp) {
    if (cp >= 19968 && cp <= 40959) return "han";
    if (cp >= 13312 && cp <= 19903) return "han";
    if (cp >= 12352 && cp <= 12447) return "kana";
    if (cp >= 12448 && cp <= 12543) return "kana";
    if (cp >= 12544 && cp <= 12591) return "bopomofo";
    if (cp <= 127) return "ascii";
    return "other";
  }

  // engine/src/config/schema.ts
  var RULE_FAMILIES = [
    "homophone",
    "shape",
    "bopomofo",
    "split",
    "emoji",
    "kana",
    "initials"
  ];
  var STRENGTH_DENSITY = {
    low: 0.15,
    // 仅高频字、首选候选
    mid: 0.45,
    high: 0.8
    // 多候选 + 多位置叠加
  };
  var DEFAULT_WHITELIST = [
    "\u2661",
    "\u2606",
    "\u2605",
    "\u273F",
    "\u2727",
    "\u266A",
    "\u306E",
    "\u3105",
    "\u3106",
    "\u3107",
    "\u3108",
    "\u3109",
    "\u310A",
    "\u310B",
    "\u310C",
    "\u310D",
    "\u310E",
    "\u310F",
    "\u3110",
    "\u3111",
    "\u3112",
    "\u3113",
    "\u3114",
    "\u3115",
    "\u3116",
    "\u3117",
    "\u3118",
    "\u3119"
  ];
  var DEFAULT_CONFIG = {
    strength: "mid",
    families: {
      homophone: true,
      shape: true,
      bopomofo: false,
      split: false,
      emoji: false,
      kana: false,
      initials: false
    },
    traditional: false,
    whitelist: { symbols: [...DEFAULT_WHITELIST] },
    style: "custom"
  };
  var STYLE_TEMPLATES = {
    anime: {
      families: {
        homophone: true,
        emoji: true,
        kana: true,
        bopomofo: false,
        split: false,
        shape: false,
        initials: false
      },
      strength: "mid"
    },
    retro: {
      families: {
        homophone: true,
        initials: true,
        kana: false,
        bopomofo: false,
        split: false,
        emoji: false,
        shape: false
      },
      strength: "mid"
    },
    minimal: {
      families: {
        homophone: true,
        shape: false,
        bopomofo: false,
        split: false,
        emoji: false,
        kana: false,
        initials: false
      },
      strength: "low"
    },
    custom: {}
  };

  // engine/src/engine/determinism.ts
  function hashString(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function serializeConfig(c) {
    var _a, _b, _c, _d;
    const strength = (_a = c.strength) != null ? _a : "mid";
    const fam = RULE_FAMILIES.map((f) => {
      var _a2;
      return `${f}:${((_a2 = c.families) == null ? void 0 : _a2[f]) ? 1 : 0}`;
    }).join(",");
    const wl = [...(_c = (_b = c.whitelist) == null ? void 0 : _b.symbols) != null ? _c : []].sort().join("");
    const trad = c.traditional ? 1 : 0;
    const style = (_d = c.style) != null ? _d : "custom";
    return `${strength}|${fam}|${trad}|${wl}|${style}`;
  }
  function makeSeed(text, config) {
    return hashString(text + " " + serializeConfig(config));
  }

  // engine/src/dictionary/data.ts
  var homophone = [
    ["\u6211", ["\u6D90", "\u83AA", "\u56EE"]],
    ["\u7684", ["\u561A", "\u65F3", "\u7534"]],
    ["\u4F60", ["\u7962", "\u4F31", "\u59B3"]],
    ["\u4ED6", ["\u7942", "\u6039"]],
    ["\u5979", ["\u7942"]],
    ["\u7231", ["\u566F", "\u5B21"]],
    ["\u597D", ["\u604F", "\u90DD"]],
    ["\u662F", ["\u6630"]],
    ["\u4E0D", ["\u5425"]],
    ["\u5417", ["\u561B", "\u508C"]],
    ["\u554A", ["\u5416", "\u5475"]],
    ["\u5440", ["\u4E2B"]],
    ["\u54E6", ["\u5594"]],
    ["\u55EF", ["\u5514"]],
    ["\u4EBA", ["\u4EBE", "\u79C2"]],
    ["\u4EEC", ["\u9585", "\u5011"]],
    ["\u56FD", ["\u56FB", "\u56EF"]],
    ["\u5BB6", ["\u50A2"]],
    ["\u5728", ["\u4FA2"]],
    ["\u8FD9", ["\u55FB", "\u9019"]],
    ["\u90A3", ["\u59A0"]],
    ["\u60F3", ["\u8459"]],
    ["\u770B", ["\u77B0"]],
    ["\u8BF4", ["\u8AAC", "\u8AAA"]],
    ["\u89C1", ["\u898B"]],
    ["\u670B", ["\u5017"]],
    ["\u53CB", ["\u53D0"]],
    ["\u65F6", ["\u6642"]],
    ["\u5019", ["\u77E6"]],
    ["\u5F88", ["\u4F77"]],
    ["\u90FD", ["\u514E"]],
    ["\u4F1A", ["\u6703", "\u70E9"]],
    ["\u80FD", ["\u879A"]],
    ["\u8981", ["\u5A79"]],
    ["\u6765", ["\u4F86", "\u5F95"]],
    ["\u53BB", ["\u53BA"]],
    ["\u5403", ["\u544E"]],
    ["\u559D", ["\u5649"]],
    ["\u7761", ["\u778C"]],
    ["\u7B11", ["\u54B2"]],
    ["\u54ED", ["\u55BE"]],
    ["\u7F8E", ["\u5A84"]],
    ["\u5E05", ["\u5E25"]],
    ["\u559C", ["\u56CD"]],
    ["\u6B22", ["\u6B61", "\u61FD"]],
    ["\u4E50", ["\u6A02", "\u697D"]],
    ["\u5E78", ["\u5A5E"]],
    ["\u798F", ["\u7550"]],
    ["\u5929", ["\u5172"]],
    ["\u5730", ["\u57CA"]],
    ["\u65E5", ["\u66F0"]],
    ["\u6708", ["\u73A5"]],
    ["\u661F", ["\u6692"]],
    ["\u4E91", ["\u96F2"]],
    ["\u98CE", ["\u98A9"]],
    ["\u96E8", ["\u5704"]],
    ["\u96EA", ["\u81A4"]],
    ["\u82B1", ["\u57D6"]],
    ["\u8349", ["\u613A"]],
    ["\u6811", ["\u6A39"]],
    ["\u6C34", ["\u6E01"]],
    ["\u706B", ["\u706C"]],
    ["\u5C71", ["\u5CD4", "\u5215"]],
    ["\u77F3", ["\u77FD"]],
    ["\u91D1", ["\u552B"]],
    ["\u6728", ["\u6729"]],
    ["\u5FC3", ["\u82AF"]],
    ["\u624B", ["\u624C"]],
    ["\u53E3", ["\u56D7"]],
    ["\u773C", ["\u7771"]],
    ["\u8138", ["\u9765"]],
    ["\u5934", ["\u5160"]],
    ["\u53D1", ["\u767C"]],
    ["\u5C0F", ["\u5C10"]],
    ["\u5927", ["\u6C4F"]],
    ["\u591A", ["\u591B"]],
    ["\u5C11", ["\u4EEF"]],
    ["\u9AD8", ["\u9AD9"]],
    ["\u4F4E", ["\u4EFE"]],
    ["\u957F", ["\u514F"]],
    ["\u77ED", ["\u77EC"]],
    ["\u7EA2", ["\u7D05"]],
    ["\u767D", ["\u769B"]],
    ["\u9ED1", ["\u6F76"]],
    ["\u7D2B", ["\u8308"]],
    ["\u84DD", ["\u85CD"]],
    ["\u7EFF", ["\u7DA0"]],
    ["\u9EC4", ["\u9EC3"]],
    ["\u54E5", ["\u8B0C"]],
    ["\u59D0", ["\u5A8E"]],
    ["\u5F1F", ["\u5F1A"]],
    ["\u59B9", ["\u59BA", "\u6CAC"]],
    ["\u7238", ["\u7239"]],
    ["\u5988", ["\u5B37"]],
    ["\u5A18", ["\u5B43"]],
    ["\u5B50", ["\u5B52"]],
    ["\u5973", ["\u9495", "\u6C5D"]],
    ["\u7537", ["\u5A1A"]],
    ["\u751F", ["\u7521"]],
    ["\u6B7B", ["\u5C4D"]],
    ["\u9B3C", ["\u9B3E"]],
    ["\u795E", ["\u926E"]],
    ["\u9F99", ["\u9F8D"]],
    ["\u738B", ["\u739A"]],
    ["\u540E", ["\u5F8C"]],
    ["\u524D", ["\u5042"]],
    ["\u5DE6", ["\u5497"]],
    ["\u53F3", ["\u4F51"]],
    ["\u4E0A", ["\u4EE9"]],
    ["\u4E0B", ["\u8290"]],
    ["\u4E2D", ["\u72C6"]],
    ["\u4E00", ["\u2460"]],
    ["\u4E8C", ["\u8CB3"]],
    ["\u4E09", ["\u53C1"]],
    ["\u56DB", ["\u7F52"]],
    ["\u4E94", ["\u4FC9"]],
    ["\u516D", ["\u9646"]],
    ["\u4E03", ["\u67D2"]],
    ["\u516B", ["\u634C"]],
    ["\u4E5D", ["\u7396"]],
    ["\u5341", ["\u62FE"]],
    ["\u5E74", ["\u79CA"]],
    ["\u5C81", ["\u6B72"]],
    ["\u6625", ["\u8436"]],
    ["\u590F", ["\u5913"]],
    ["\u79CB", ["\u79CC"]],
    ["\u51AC", ["\u9F15"]],
    ["\u732B", ["\u8C93"]],
    ["\u72D7", ["\u5920"]],
    ["\u9E21", ["\u9D8F"]],
    ["\u9E1F", ["\u8526"]],
    ["\u9C7C", ["\u6F01"]],
    ["\u866B", ["\u87F2"]]
  ];
  var shape = [
    ["\u4EBA", ["\u4EBE"]],
    ["\u56FD", ["\u56FB", "\u56EF"]],
    ["\u7231", ["\u611B"]],
    ["\u4F60", ["\u4F31"]],
    ["\u4ED6", ["\u7942"]],
    ["\u7684", ["\u65F3"]],
    ["\u597D", ["\u604F"]],
    ["\u660E", ["\u6719", "\u7700"]],
    ["\u65E5", ["\u66F0"]],
    ["\u6708", ["\u73A5"]],
    ["\u5929", ["\u5172"]],
    ["\u738B", ["\u738A"]],
    ["\u571F", ["\u5721"]],
    ["\u6728", ["\u6729"]],
    ["\u77F3", ["\u5CAB"]],
    ["\u6C34", ["\u6C3A"]],
    ["\u706B", ["\u706C"]],
    ["\u4E2D", ["\u4E32"]],
    ["\u5341", ["+"]],
    ["\u5927", ["\u5936"]],
    ["\u5C0F", ["\u5C10"]],
    ["\u4E09", ["\u53C4"]],
    ["\u4E2A", ["\u500B"]],
    ["\u89C1", ["\u898B"]],
    ["\u8BA4", ["\u8A8D"]],
    ["\u8BA9", ["\u8B93"]],
    ["\u8BF4", ["\u8AAA"]],
    ["\u8BDD", ["\u8A71"]],
    ["\u8BFB", ["\u8B80"]],
    ["\u5199", ["\u5BEB"]],
    ["\u5B57", ["\u8293"]],
    ["\u5B66", ["\u5B78"]],
    ["\u751F", ["\u82FC"]],
    ["\u957F", ["\u9577"]],
    ["\u95E8", ["\u9580"]],
    ["\u95F4", ["\u9593"]],
    ["\u95EE", ["\u554F"]],
    ["\u540C", ["\u4EDD"]],
    ["\u56DE", ["\u56D8"]],
    ["\u56ED", ["\u5712"]],
    ["\u56E0", ["\u56D9"]],
    ["\u56F0", ["\u774F"]],
    ["\u91CC", ["\u88CF"]],
    ["\u8868", ["\u9336"]],
    ["\u8F66", ["\u8ECA"]],
    ["\u9A6C", ["\u99AC"]],
    ["\u9E1F", ["\u9CE5"]],
    ["\u9C7C", ["\u9B5A"]],
    ["\u866B", ["\u87F2"]],
    ["\u8D1D", ["\u8C9D"]],
    ["\u9875", ["\u9801"]],
    ["\u98CE", ["\u98A8"]],
    ["\u4E91", ["\u96F2"]],
    ["\u7535", ["\u96FB"]],
    ["\u4E1C", ["\u6771"]],
    ["\u897F", ["\u8980"]],
    ["\u5F00", ["\u958B"]],
    ["\u5173", ["\u95DC"]],
    ["\u9E21", ["\u96DE"]],
    ["\u9E2D", ["\u9D28"]],
    ["\u9E45", ["\u9D5D"]],
    ["\u9F99", ["\u9F8D"]],
    ["\u9F9F", ["\u9F9C"]]
  ];
  var kana = [
    ["\u7684", ["\u306E"]],
    ["\u6211", ["\u308F"]],
    ["\u4F60", ["\u304D\u307F"]],
    ["\u7231", ["\u3042\u3044"]],
    ["\u597D", ["\u3044\u3044"]],
    ["\u662F", ["\u3060"]],
    ["\u8C22\u8C22", ["\u3042\u308A\u304C\u3068\u3046"]],
    ["\u559C\u6B22", ["\u3059\u304D"]],
    ["\u53EF\u7231", ["\u304B\u308F\u3044\u3044"]],
    ["\u670B\u53CB", ["\u3068\u3082\u3060\u3061"]],
    ["\u6F02\u4EAE", ["\u304D\u308C\u3044"]],
    ["\u5BF9\u4E0D\u8D77", ["\u3054\u3081\u3093"]],
    ["\u65E9\u4E0A\u597D", ["\u304A\u306F\u3088\u3046"]],
    ["\u665A\u5B89", ["\u304A\u3084\u3059\u307F"]],
    ["\u732B", ["\u306D\u3053"]],
    ["\u72D7", ["\u3044\u306C"]]
  ];
  var bopomofo = [
    ["\u6211", "\u3128"],
    ["\u4F60", "\u310B"],
    ["\u4ED6", "\u310A"],
    ["\u5979", "\u310A"],
    ["\u7231", "\u311E"],
    ["\u597D", "\u310F"],
    ["\u662F", "\u3115"],
    ["\u4E0D", "\u3105"],
    ["\u7684", "\u3109"],
    ["\u5728", "\u3117"],
    ["\u8FD9", "\u3113"],
    ["\u90A3", "\u310B"],
    ["\u60F3", "\u3112"],
    ["\u770B", "\u310E"],
    ["\u8BF4", "\u3115"],
    ["\u4EBA", "\u3116"],
    ["\u670B", "\u3106"],
    ["\u53CB", "\u3121"],
    ["\u65F6", "\u3115"],
    ["\u5F88", "\u310F"],
    ["\u5403", "\u3114"],
    ["\u559D", "\u310F"],
    ["\u7B11", "\u3112"],
    ["\u54ED", "\u310E"],
    ["\u7F8E", "\u3107"],
    ["\u5929", "\u310A"],
    ["\u5730", "\u3109"]
  ];
  var split = [
    ["\u5F3A", ["\u5F13", "\u867D"]],
    ["\u597D", ["\u5973", "\u5B50"]],
    ["\u660E", ["\u65E5", "\u6708"]],
    ["\u661F", ["\u65E5", "\u751F"]],
    ["\u7537", ["\u7530", "\u529B"]],
    ["\u5C18", ["\u5C0F", "\u571F"]],
    ["\u5C16", ["\u5C0F", "\u5927"]],
    ["\u9C9C", ["\u9C7C", "\u7F8A"]],
    ["\u4F11", ["\u4EBB", "\u6728"]],
    ["\u6B6A", ["\u4E0D", "\u6B63"]],
    ["\u5CA9", ["\u5C71", "\u77F3"]],
    ["\u5D69", ["\u5C71", "\u9AD8"]],
    ["\u5B6C", ["\u4E0D", "\u597D"]],
    ["\u5361", ["\u4E0A", "\u4E0B"]],
    ["\u752D", ["\u4E0D", "\u7528"]],
    ["\u63B0", ["\u624B", "\u5206", "\u624B"]],
    ["\u6CEA", ["\u6C35", "\u76EE"]],
    ["\u82D7", ["\u8279", "\u7530"]],
    ["\u79CB", ["\u79BE", "\u706B"]],
    ["\u627E", ["\u624C", "\u6208"]],
    ["\u60F3", ["\u76F8", "\u5FC3"]],
    ["\u95F7", ["\u95E8", "\u5FC3"]],
    ["\u95EA", ["\u95E8", "\u4EBA"]],
    ["\u56F0", ["\u56D7", "\u6728"]],
    ["\u5417", ["\u53E3", "\u9A6C"]],
    ["\u5410", ["\u53E3", "\u571F"]],
    ["\u5413", ["\u53E3", "\u4E0B"]],
    ["\u5403", ["\u53E3", "\u4E5E"]],
    ["\u5427", ["\u53E3", "\u5DF4"]],
    ["\u543B", ["\u53E3", "\u52FF"]],
    ["\u5531", ["\u53E3", "\u660C"]],
    ["\u542C", ["\u53E3", "\u65A4"]],
    ["\u547C", ["\u53E3", "\u4E4E"]],
    ["\u5438", ["\u53E3", "\u53CA"]],
    ["\u5439", ["\u53E3", "\u6B20"]],
    ["\u5473", ["\u53E3", "\u672A"]],
    ["\u548C", ["\u53E3", "\u79BE"]],
    ["\u54C1", ["\u53E3", "\u53E3", "\u53E3"]],
    ["\u6676", ["\u65E5", "\u65E5", "\u65E5"]],
    ["\u68EE", ["\u6728", "\u6728", "\u6728"]],
    ["\u6797", ["\u6728", "\u6728"]],
    ["\u708E", ["\u706B", "\u706B"]],
    ["\u660C", ["\u65E5", "\u65E5"]],
    ["\u5415", ["\u53E3", "\u53E3"]],
    ["\u78CA", ["\u77F3", "\u77F3", "\u77F3"]],
    ["\u6DFC", ["\u6C34", "\u6C34", "\u6C34"]],
    ["\u946B", ["\u91D1", "\u91D1", "\u91D1"]],
    ["\u7131", ["\u706B", "\u706B", "\u706B"]],
    ["\u572D", ["\u571F", "\u571F"]],
    ["\u591A", ["\u5915", "\u5915"]],
    ["\u53CC", ["\u53C8", "\u53C8"]],
    ["\u4ECE", ["\u4EBA", "\u4EBA"]],
    ["\u4F17", ["\u4EBA", "\u4EBA", "\u4EBA"]]
  ];
  var emoji = [
    ["\u53EF", ["\u2661"]],
    ["\u7231", ["\u2605"]],
    ["\u5FC3", ["\u2661"]],
    ["\u5F00", ["\u2727"]],
    ["\u52A0", ["\u2605"]],
    ["\u7F8E", ["\u273F"]],
    ["\u7B11", ["\u266A"]],
    ["\u661F", ["\u2606"]],
    ["\u82B1", ["\u273F"]],
    ["\u65E5", ["\u2606"]],
    ["\u6708", ["\u2605"]],
    ["\u597D", ["\u2727"]],
    ["\u4F60", ["\u2661"]],
    ["\u6211", ["\u2605"]],
    ["\u5979", ["\u2661"]],
    ["\u4ED6", ["\u2661"]],
    ["\u670B", ["\u266A"]],
    ["\u53CB", ["\u2661"]],
    ["\u4E50", ["\u273F"]],
    ["\u559C", ["\u2661"]],
    ["\u6B22", ["\u2605"]]
  ];
  var initials = [
    ["\u4EC0\u4E48", "sm"],
    ["\u8C22\u8C22", "xx"],
    ["\u559C\u6B22", "xh"],
    ["\u6211\u4EEC", "wm"],
    ["\u4F60\u4EEC", "nm"],
    ["\u4ED6\u4EEC", "tm"],
    ["\u670B\u53CB", "py"],
    ["\u53EF\u7231", "ka"],
    ["\u6F02\u4EAE", "pl"],
    ["\u5BF9\u4E0D\u8D77", "dqb"],
    ["\u6CA1\u5173\u7CFB", "mxg"],
    ["\u4E0D\u77E5\u9053", "bzd"],
    ["\u600E\u4E48\u529E", "zmb"],
    ["\u4E3A\u4EC0\u4E48", "wsm"],
    ["\u600E\u4E48\u6837", "zmy"],
    ["\u771F\u7684", "zs"],
    ["\u7F8E\u597D", "mh"],
    ["\u5F00\u5FC3", "kx"],
    ["\u751F\u6C14", "sq"],
    ["\u9AD8\u5174", "gx"],
    ["\u96BE\u8FC7", "ng"],
    ["\u7231\u4F60", "an"],
    ["\u60F3\u4F60", "xy"],
    ["\u5B9D\u8D1D", "bb"],
    ["\u8001\u516C", "lg"],
    ["\u8001\u5A46", "lp"],
    ["\u540C\u5B66", "tx"],
    ["\u8001\u5E08", "ls"],
    ["\u5403\u996D", "cf"],
    ["\u7761\u89C9", "shj"],
    ["\u5DE5\u4F5C", "gz"],
    ["\u6E38\u620F", "yx"],
    ["\u97F3\u4E50", "yy"],
    ["\u7535\u5F71", "dy"],
    ["\u5929\u6C14", "tq"],
    ["\u65F6\u95F4", "sj"],
    ["\u5B66\u6821", "xxw"],
    ["\u5B66\u4E60", "xxu"]
  ];
  function homo(p) {
    return p.map(([han, candidates]) => ({
      id: `homo_${han}`,
      han,
      family: "homophone",
      candidates
    }));
  }
  function shape_(p) {
    return p.map(([han, candidates]) => ({ id: `shape_${han}`, han, family: "shape", candidates }));
  }
  function kana_(p) {
    return p.map(([han, candidates]) => ({ id: `kana_${han}`, han, family: "kana", candidates }));
  }
  function bopo(p) {
    return p.map(([han, b]) => ({ id: `bopo_${han}`, han, family: "bopomofo", bopomofo: b }));
  }
  function split_(p) {
    return p.map(([han, parts]) => ({ id: `split_${han}`, han, family: "split", parts }));
  }
  function emo(p) {
    return p.map(([han, symbols]) => ({ id: `emo_${han}`, han, family: "emoji", symbols }));
  }
  function init(p) {
    return p.map(([han, initials2]) => ({ id: `init_${han}`, han, family: "initials", initials: initials2 }));
  }
  var DICTIONARY_DATA = [
    ...homo(homophone),
    ...shape_(shape),
    ...kana_(kana),
    ...bopo(bopomofo),
    ...split_(split),
    ...emo(emoji),
    ...init(initials)
  ];

  // engine/src/dictionary/traditional.ts
  var SIMPLIFIED_TO_TRADITIONAL = {
    \u7231: "\u611B",
    \u788D: "\u7919",
    \u5B89: "\u5B89",
    \u5427: "\u5427",
    \u516B: "\u516B",
    \u7238: "\u7238",
    \u767D: "\u767D",
    \u767E: "\u767E",
    \u529E: "\u8FA6",
    \u534A: "\u534A",
    \u5E2E: "\u5E6B",
    \u5B9D: "\u5BF6",
    \u62A5: "\u5831",
    \u676F: "\u676F",
    \u5317: "\u5317",
    \u8D1D: "\u8C9D",
    \u5907: "\u5099",
    \u7B14: "\u7B46",
    \u8FB9: "\u908A",
    \u53D8: "\u8B8A",
    \u6807: "\u6A19",
    \u522B: "\u5225",
    \u5BBE: "\u8CD3",
    \u5175: "\u5175",
    \u4E0D: "\u4E0D",
    \u5E03: "\u4F48",
    \u624D: "\u624D",
    \u83DC: "\u83DC",
    \u8349: "\u8349",
    \u957F: "\u9577",
    \u573A: "\u5834",
    \u8F66: "\u8ECA",
    \u9648: "\u9673",
    \u6668: "\u6668",
    \u79F0: "\u7A31",
    \u6210: "\u6210",
    \u5403: "\u5403",
    \u866B: "\u87F2",
    \u51FA: "\u51FA",
    \u5904: "\u8655",
    \u6625: "\u6625",
    \u8BCD: "\u8A5E",
    \u4ECE: "\u5F9E",
    \u9519: "\u932F",
    \u5927: "\u5927",
    \u5E26: "\u5E36",
    \u5355: "\u55AE",
    \u5F53: "\u7576",
    \u5C9B: "\u5CF6",
    \u5BFC: "\u5C0E",
    \u706F: "\u71C8",
    \u5730: "\u5730",
    \u7535: "\u96FB",
    \u4E1C: "\u6771",
    \u51AC: "\u51AC",
    \u52A8: "\u52D5",
    \u8BFB: "\u8B80",
    \u5EA6: "\u5EA6",
    \u77ED: "\u77ED",
    \u5BF9: "\u5C0D",
    \u987F: "\u9813",
    \u591A: "\u591A",
    \u4E8C: "\u4E8C",
    \u513F: "\u5152",
    \u53D1: "\u767C",
    \u996D: "\u98EF",
    \u8303: "\u7BC4",
    \u98DE: "\u98DB",
    \u5206: "\u5206",
    \u98CE: "\u98A8",
    \u51E4: "\u9CF3",
    \u592B: "\u592B",
    \u798F: "\u798F",
    \u7236: "\u7236",
    \u590D: "\u5FA9",
    \u5E72: "\u5E79",
    \u94A2: "\u92FC",
    \u9AD8: "\u9AD8",
    \u54E5: "\u54E5",
    \u4E2A: "\u500B",
    \u5DE5: "\u5DE5",
    \u516C: "\u516C",
    \u72D7: "\u72D7",
    \u5173: "\u95DC",
    \u89C2: "\u89C0",
    \u9986: "\u9928",
    \u5E7F: "\u5EE3",
    \u56FD: "\u570B",
    \u679C: "\u679C",
    \u8FC7: "\u904E",
    \u6D77: "\u6D77",
    \u6C49: "\u6F22",
    \u597D: "\u597D",
    \u53F7: "\u865F",
    \u559D: "\u559D",
    \u548C: "\u548C",
    \u6CB3: "\u6CB3",
    \u7EA2: "\u7D05",
    \u540E: "\u5F8C",
    \u6E56: "\u6E56",
    \u82B1: "\u82B1",
    \u8BDD: "\u8A71",
    \u753B: "\u756B",
    \u6B22: "\u6B61",
    \u8FD8: "\u9084",
    \u9EC4: "\u9EC3",
    \u56DE: "\u56DE",
    \u4F1A: "\u6703",
    \u706B: "\u706B",
    \u9E21: "\u96DE",
    \u5BB6: "\u5BB6",
    \u95F4: "\u9593",
    \u89C1: "\u898B",
    \u6C5F: "\u6C5F",
    \u8BB2: "\u8B1B",
    \u4EA4: "\u4EA4",
    \u59D0: "\u59D0",
    \u4ECB: "\u4ECB",
    \u4ECA: "\u4ECA",
    \u91D1: "\u91D1",
    \u8FDB: "\u9032",
    \u4EAC: "\u4EAC",
    \u7ECF: "\u7D93",
    \u7CBE: "\u7CBE",
    \u4E5D: "\u4E5D",
    \u9152: "\u9152",
    \u5377: "\u6372",
    \u5F00: "\u958B",
    \u770B: "\u770B",
    \u53EF: "\u53EF",
    \u8BFE: "\u8AB2",
    \u7A7A: "\u7A7A",
    \u53E3: "\u53E3",
    \u54ED: "\u54ED",
    \u82E6: "\u82E6",
    \u84DD: "\u85CD",
    \u8001: "\u8001",
    \u4E50: "\u6A02",
    \u4E86: "\u4E86",
    \u7D2F: "\u7D2F",
    \u51B7: "\u51B7",
    \u79BB: "\u96E2",
    \u91CC: "\u88E1",
    \u793C: "\u79AE",
    \u4E3D: "\u9E97",
    \u8FDE: "\u9023",
    \u7EC3: "\u7DF4",
    \u4E24: "\u5169",
    \u4EAE: "\u4EAE",
    \u6797: "\u6797",
    \u94C3: "\u9234",
    \u9886: "\u9818",
    \u9F99: "\u9F8D",
    \u697C: "\u6A13",
    \u7EFF: "\u7DA0",
    \u5988: "\u5ABD",
    \u9A6C: "\u99AC",
    \u5417: "\u55CE",
    \u4E70: "\u8CB7",
    \u5356: "\u8CE3",
    \u6EE1: "\u6EFF",
    \u732B: "\u8C93",
    \u7F8E: "\u7F8E",
    \u59B9: "\u59B9",
    \u95E8: "\u9580",
    \u68A6: "\u5922",
    \u7C73: "\u7C73",
    \u9762: "\u9EB5",
    \u4EEC: "\u5011",
    \u660E: "\u660E",
    \u540D: "\u540D",
    \u6BCD: "\u6BCD",
    \u6728: "\u6728",
    \u54EA: "\u54EA",
    \u90A3: "\u90A3",
    \u5357: "\u5357",
    \u8111: "\u8166",
    \u9E1F: "\u9CE5",
    \u60A8: "\u60A8",
    \u725B: "\u725B",
    \u5973: "\u5973",
    \u6B27: "\u6B50",
    \u76D8: "\u76E4",
    \u670B: "\u670B",
    \u5564: "\u5564",
    \u54C1: "\u54C1",
    \u5E73: "\u5E73",
    \u5A46: "\u5A46",
    \u4E03: "\u4E03",
    \u59BB: "\u59BB",
    \u5947: "\u5947",
    \u9A91: "\u9A0E",
    \u6C14: "\u6C23",
    \u5343: "\u5343",
    \u94B1: "\u9322",
    \u5F3A: "\u5F37",
    \u4EB2: "\u89AA",
    \u9752: "\u9752",
    \u79CB: "\u79CB",
    \u533A: "\u5340",
    \u53BB: "\u53BB",
    \u5168: "\u5168",
    \u786E: "\u78BA",
    \u8BA9: "\u8B93",
    \u70ED: "\u71B1",
    \u4EBA: "\u4EBA",
    \u8BA4: "\u8A8D",
    \u65E5: "\u65E5",
    \u8363: "\u69AE",
    \u5982: "\u5982",
    \u4E09: "\u4E09",
    \u4F1E: "\u5098",
    \u8272: "\u8272",
    \u6740: "\u6BBA",
    \u6C99: "\u6C99",
    \u5C71: "\u5C71",
    \u4E0A: "\u4E0A",
    \u5546: "\u5546",
    \u5C11: "\u5C11",
    \u820D: "\u6368",
    \u6444: "\u651D",
    \u8EAB: "\u8EAB",
    \u6DF1: "\u6DF1",
    \u751F: "\u751F",
    \u58F0: "\u8072",
    \u5E08: "\u5E2B",
    \u8BD7: "\u8A69",
    \u5341: "\u5341",
    \u65F6: "\u6642",
    \u5B9E: "\u5BE6",
    \u98DF: "\u98DF",
    \u53F2: "\u53F2",
    \u793A: "\u793A",
    \u4E16: "\u4E16",
    \u4E8B: "\u4E8B",
    \u662F: "\u662F",
    \u4E66: "\u66F8",
    \u6811: "\u6A39",
    \u53CC: "\u96D9",
    \u6C34: "\u6C34",
    \u7761: "\u7761",
    \u8BF4: "\u8AAA",
    \u56DB: "\u56DB",
    \u677E: "\u9B06",
    \u5C81: "\u6B72",
    \u5B59: "\u5B6B",
    \u53F0: "\u81FA",
    \u592A: "\u592A",
    \u8C08: "\u8AC7",
    \u6C64: "\u6E6F",
    \u7CD6: "\u7CD6",
    \u8BA8: "\u8A0E",
    \u5929: "\u5929",
    \u7530: "\u7530",
    \u6761: "\u689D",
    \u94C1: "\u9435",
    \u5385: "\u5EF3",
    \u542C: "\u807D",
    \u540C: "\u540C",
    \u7AE5: "\u7AE5",
    \u5934: "\u982D",
    \u56FE: "\u5716",
    \u571F: "\u571F",
    \u5154: "\u5154",
    \u5916: "\u5916",
    \u665A: "\u665A",
    \u4E07: "\u842C",
    \u738B: "\u738B",
    \u7F51: "\u7DB2",
    \u4E3A: "\u70BA",
    \u536B: "\u885B",
    \u95FB: "\u805E",
    \u95EE: "\u554F",
    \u6211: "\u6211",
    \u4E4C: "\u70CF",
    \u65E0: "\u7121",
    \u4E94: "\u4E94",
    \u5348: "\u5348",
    \u821E: "\u821E",
    \u7269: "\u7269",
    \u897F: "\u897F",
    \u4E60: "\u7FD2",
    \u7CFB: "\u7CFB",
    \u7EC6: "\u7D30",
    \u867E: "\u8766",
    \u4E0B: "\u4E0B",
    \u590F: "\u590F",
    \u5148: "\u5148",
    \u73B0: "\u73FE",
    \u60F3: "\u60F3",
    \u54CD: "\u97FF",
    \u5199: "\u5BEB",
    \u5FC3: "\u5FC3",
    \u65B0: "\u65B0",
    \u4FE1: "\u4FE1",
    \u661F: "\u661F",
    \u884C: "\u884C",
    \u5E78: "\u5E78",
    \u4F11: "\u4F11",
    \u5B66: "\u5B78",
    \u96EA: "\u96EA",
    \u9E2D: "\u9D28",
    \u7259: "\u7259",
    \u70DF: "\u7159",
    \u4E25: "\u56B4",
    \u773C: "\u773C",
    \u9633: "\u967D",
    \u6837: "\u6A23",
    \u8981: "\u8981",
    \u7237: "\u723A",
    \u4E5F: "\u4E5F",
    \u4E1A: "\u696D",
    \u53F6: "\u8449",
    \u4E00: "\u4E00",
    \u8863: "\u8863",
    \u533B: "\u91AB",
    \u4EE5: "\u4EE5",
    \u8BAE: "\u8B70",
    \u5F02: "\u7570",
    \u94F6: "\u9280",
    \u996E: "\u98F2",
    \u5E94: "\u61C9",
    \u82F1: "\u82F1",
    \u8FCE: "\u8FCE",
    \u9C7C: "\u9B5A",
    \u96E8: "\u96E8",
    \u8BED: "\u8A9E",
    \u5143: "\u5143",
    \u56ED: "\u5712",
    \u8FDC: "\u9060",
    \u613F: "\u9858",
    \u6708: "\u6708",
    \u4E91: "\u96F2",
    \u8FD0: "\u904B",
    \u6742: "\u96DC",
    \u65E9: "\u65E9",
    \u6CFD: "\u6FA4",
    \u5F20: "\u5F35",
    \u7AE0: "\u7AE0",
    \u4E08: "\u4E08",
    \u62DB: "\u62DB",
    \u8005: "\u8005",
    \u8FD9: "\u9019",
    \u771F: "\u771F",
    \u9488: "\u91DD",
    \u9547: "\u93AE",
    \u4E89: "\u722D",
    \u653F: "\u653F",
    \u90D1: "\u912D",
    \u4E4B: "\u4E4B",
    \u7EC7: "\u7E54",
    \u7EB8: "\u7D19",
    \u4E2D: "\u4E2D",
    \u91CD: "\u91CD",
    \u5468: "\u5468",
    \u732A: "\u8C6C",
    \u4E3B: "\u4E3B",
    \u4F4F: "\u4F4F",
    \u6CE8: "\u8A3B",
    \u52A9: "\u52A9",
    \u4E13: "\u5C08",
    \u88C5: "\u88DD",
    \u58EE: "\u58EF",
    \u72B6: "\u72C0",
    \u684C: "\u684C",
    \u5B50: "\u5B50",
    \u5B57: "\u5B57",
    \u603B: "\u7E3D",
    \u8D70: "\u8D70",
    \u7EC4: "\u7D44",
    \u5634: "\u5634",
    \u6700: "\u6700",
    \u9189: "\u9189",
    \u7F6A: "\u7F6A",
    \u6628: "\u6628"
  };
  function toTraditional(s) {
    var _a;
    let out = "";
    for (const ch of s) {
      out += (_a = SIMPLIFIED_TO_TRADITIONAL[ch]) != null ? _a : ch;
    }
    return out;
  }

  // engine/src/dictionary/index.ts
  var FROZEN = Object.freeze(
    DICTIONARY_DATA.map((e) => Object.freeze({ ...e }))
  );
  var cached = null;
  function build() {
    const forward = /* @__PURE__ */ new Map();
    for (const e of FROZEN) {
      const keys = /* @__PURE__ */ new Set([e.han]);
      const trad = SIMPLIFIED_TO_TRADITIONAL[e.han];
      if (trad) keys.add(trad);
      if (e.hanTraditional) keys.add(e.hanTraditional);
      for (const k of keys) {
        const arr = forward.get(k);
        if (arr) arr.push(e);
        else forward.set(k, [e]);
      }
    }
    const reverse = /* @__PURE__ */ new Map();
    for (const e of FROZEN) {
      switch (e.family) {
        case "bopomofo":
          if (e.bopomofo) reverse.set(e.bopomofo, "");
          break;
        case "emoji":
          if (e.symbols) for (const s of e.symbols) reverse.set(s, "");
          break;
        case "split":
          if (e.parts) reverse.set(e.parts.join(""), e.han);
          break;
        case "initials":
          if (e.initials) reverse.set(e.initials, e.han);
          break;
        case "homophone":
        case "shape":
        case "kana":
          if (e.candidates) for (const c of e.candidates) reverse.set(c, e.han);
          break;
      }
    }
    let forwardMaxLen = 1;
    for (const k of forward.keys()) forwardMaxLen = Math.max(forwardMaxLen, k.length);
    let reverseMaxLen = 1;
    for (const k of reverse.keys()) reverseMaxLen = Math.max(reverseMaxLen, k.length);
    return {
      forward,
      reverse,
      entries: FROZEN,
      forwardMaxLen,
      reverseMaxLen
    };
  }
  function getDictionary() {
    if (!cached) cached = build();
    return cached;
  }

  // engine/src/rules/constants.ts
  var FAMILY_PRIORITY = {
    homophone: 90,
    // 同音字最高优先（最地道）
    shape: 80,
    // 形近字
    kana: 70,
    // 日语假名
    bopomofo: 60,
    // 注音混入
    split: 50,
    // 拆字重组
    emoji: 40,
    // emoji 穿插
    initials: 30
    // 拼音首字母
  };

  // engine/src/rules/index.ts
  function isWhitelisted(symbol, config) {
    return config.whitelist.symbols.includes(symbol);
  }
  function candidatesForEntry(entry, matchedText, config) {
    var _a, _b;
    if (!config.families[entry.family]) return [];
    const prio = (_a = entry.priority) != null ? _a : FAMILY_PRIORITY[entry.family];
    switch (entry.family) {
      case "homophone":
      case "shape":
      case "kana":
        return ((_b = entry.candidates) != null ? _b : []).map((value) => ({
          value,
          family: entry.family,
          priority: prio
        }));
      case "bopomofo":
        if (!entry.bopomofo) return [];
        if (!isWhitelisted(entry.bopomofo, config)) return [];
        return [{ value: matchedText + entry.bopomofo, family: entry.family, priority: prio }];
      case "emoji": {
        if (!entry.symbols) return [];
        const sym = entry.symbols.find((s) => isWhitelisted(s, config));
        if (!sym) return [];
        return [{ value: matchedText + sym, family: entry.family, priority: prio }];
      }
      case "split":
        if (!entry.parts) return [];
        return [{ value: entry.parts.join(""), family: entry.family, priority: prio }];
      case "initials":
        if (!entry.initials) return [];
        return [{ value: entry.initials, family: entry.family, priority: prio }];
      default:
        return [];
    }
  }
  function pickBest(cands) {
    const sorted = cands.slice().sort((a, b) => b.priority - a.priority);
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const c of sorted) {
      if (seen.has(c.value)) continue;
      seen.add(c.value);
      out.push(c);
    }
    return out;
  }

  // engine/src/engine/pipeline.ts
  var UNTRANSLATABLE_OPEN = "\uFE35";
  var UNTRANSLATABLE_CLOSE = "\uFE36";
  function indexOfEnabled(entries, config) {
    for (let i = 0; i < entries.length; i++) {
      if (config.families[entries[i].family]) return i;
    }
    return -1;
  }
  function translateHanToMars(text, config) {
    var _a, _b;
    const dict = getDictionary();
    const src = config.traditional ? toTraditional(text) : text;
    const rng = mulberry32(makeSeed(text, config));
    const density = (_a = STRENGTH_DENSITY[config.strength]) != null ? _a : STRENGTH_DENSITY.mid;
    const out = [];
    const candPerChar = [];
    const marks = [];
    let i = 0;
    const n = src.length;
    while (i < n) {
      const cp = (_b = src.codePointAt(i)) != null ? _b : 0;
      const charLen = cp > 65535 ? 2 : 1;
      const cls = classifyCodePoint(cp);
      let matchedKey = null;
      let matchedEntries = [];
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
        const all = matchedEntries.flatMap(
          (e) => candidatesForEntry(e, matchedKey, config)
        );
        const best = pickBest(all);
        let emit = matchedKey;
        if (best.length > 0) {
          const r = rng();
          if (r < density) emit = best[0].value;
        }
        out.push(emit);
        for (let k = 0; k < matchedKey.length; k++) candPerChar.push(best);
        i += matchedKey.length;
        continue;
      }
      if (cls === "other") {
        const original = src.slice(i, i + charLen);
        const start = out.join("").length;
        out.push(UNTRANSLATABLE_OPEN + original + UNTRANSLATABLE_CLOSE);
        marks.push({
          index: start,
          length: original.length + UNTRANSLATABLE_OPEN.length + UNTRANSLATABLE_CLOSE.length,
          type: "untranslatable",
          text: original
        });
        for (let k = 0; k < charLen; k++) candPerChar.push([]);
      } else {
        out.push(src.slice(i, i + charLen));
        for (let k = 0; k < charLen; k++) candPerChar.push([]);
      }
      i += charLen;
    }
    return { result: out.join(""), candidates: candPerChar, marks };
  }
  function translateMarsToHan(text, config) {
    const dict = getDictionary();
    const out = [];
    const candPerChar = [];
    const marks = [];
    let i = 0;
    const n = text.length;
    while (i < n) {
      let matchedToken = null;
      let mapped = "";
      const maxLen = Math.min(dict.reverseMaxLen, n - i);
      for (let len = maxLen; len >= 1; len--) {
        const sub = text.slice(i, i + len);
        if (dict.reverse.has(sub)) {
          matchedToken = sub;
          mapped = dict.reverse.get(sub);
          break;
        }
      }
      if (matchedToken) {
        if (mapped !== "") out.push(mapped);
        for (let k = 0; k < matchedToken.length; k++) candPerChar.push([]);
        i += matchedToken.length;
      } else {
        out.push(text[i]);
        candPerChar.push([]);
        i += 1;
      }
    }
    let result = out.join("");
    if (config.traditional) result = toTraditional(result);
    return { result, candidates: candPerChar, marks };
  }

  // engine/src/engine/translate.ts
  var CHUNK_SIZE = 1e3;
  var MAX_CHARS = 2e3;
  function isBoundary(ch) {
    return /\s/.test(ch) || /[，。！？、；：,!?;:.…—~～"-]/.test(ch);
  }
  function splitText(text, size = CHUNK_SIZE) {
    if (text.length <= size) return [text];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + size, text.length);
      if (end < text.length) {
        while (end > start + 1 && !isBoundary(text[end - 1])) end--;
        if (end === start) end = start + size;
      }
      chunks.push(text.slice(start, end));
      start = end;
    }
    return chunks;
  }
  function normalizeConfig(c) {
    var _a, _b;
    return {
      ...DEFAULT_CONFIG,
      ...c,
      families: { ...DEFAULT_CONFIG.families, ...(_a = c == null ? void 0 : c.families) != null ? _a : {} },
      whitelist: (_b = c == null ? void 0 : c.whitelist) != null ? _b : DEFAULT_CONFIG.whitelist
    };
  }
  function translate(text, srcLang, tgtLang, config) {
    const cfg = normalizeConfig(config);
    if (text.trim() === "") {
      throw new MarsTranslateError("E_EMPTY", "\u8BF7\u8F93\u5165\u5185\u5BB9");
    }
    if (srcLang === "han" && tgtLang === "mars") return translateHanToMars(text, cfg);
    if (srcLang === "mars" && tgtLang === "han") return translateMarsToHan(text, cfg);
    throw new MarsTranslateError("E_UNSUPPORTED_DIR", "\u4E0D\u652F\u6301\u7684\u7FFB\u8BD1\u65B9\u5411");
  }
  function translateAll(text, srcLang, tgtLang, config, onProgress) {
    if (text.length <= MAX_CHARS) {
      onProgress == null ? void 0 : onProgress(1);
      return translate(text, srcLang, tgtLang, config);
    }
    const chunks = splitText(text);
    let result = "";
    const candidates = [];
    const marks = [];
    chunks.forEach((chunk, idx) => {
      const r = translate(chunk, srcLang, tgtLang, config);
      const offset = result.length;
      result += r.result;
      candidates.push(...r.candidates);
      for (const m of r.marks) marks.push({ ...m, index: m.index + offset });
      onProgress == null ? void 0 : onProgress((idx + 1) / chunks.length);
    });
    return { result, candidates, marks, chunks: chunks.length };
  }
  return __toCommonJS(index_exports);
})();
