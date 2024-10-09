import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { promises, existsSync } from 'fs';
import { dirname as dirname$1, resolve as resolve$1, join } from 'path';
import { promises as promises$1 } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import { toString } from 'mdast-util-to-string';
import { postprocess, preprocess } from 'micromark';
import { stringifyPosition } from 'unist-util-stringify-position';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { push, splice } from 'micromark-util-chunked';
import { resolveAll } from 'micromark-util-resolve-all';
import { normalizeUri } from 'micromark-util-sanitize-uri';
import slugify from 'slugify';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import remarkMDC, { parseFrontMatter } from 'remark-mdc';
import remarkEmoji from 'remark-emoji';
import remarkGFM from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSortAttributeValues from 'rehype-sort-attribute-values';
import rehypeSortAttributes from 'rehype-sort-attributes';
import rehypeRaw from 'rehype-raw';
import { detab } from 'detab';
import { toString as toString$1 } from 'hast-util-to-string';
import Slugger from 'github-slugger';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  const _value = value.trim();
  if (
    // eslint-disable-next-line unicorn/prefer-at
    value[0] === '"' && value.endsWith('"') && !value.includes("\\")
  ) {
    return _value.slice(1, -1);
  }
  if (_value.length <= 9) {
    const _lval = _value.toLowerCase();
    if (_lval === "true") {
      return true;
    }
    if (_lval === "false") {
      return false;
    }
    if (_lval === "undefined") {
      return void 0;
    }
    if (_lval === "null") {
      return null;
    }
    if (_lval === "nan") {
      return Number.NaN;
    }
    if (_lval === "infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (_lval === "-infinity") {
      return Number.NEGATIVE_INFINITY;
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const PLUS_RE$4 = /\+/g;
function decode$5(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey$4(text) {
  return decode$5(text.replace(PLUS_RE$4, " "));
}
function decodeQueryValue$4(text) {
  return decode$5(text.replace(PLUS_RE$4, " "));
}

function parseQuery$4(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey$4(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue$4(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}

const PROTOCOL_STRICT_REGEX$4 = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX$4 = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX$4 = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE$4 = /^\.?\//;
function hasProtocol$4(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX$4.test(inputString);
  }
  return PROTOCOL_REGEX$4.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX$4.test(inputString) : false);
}
function hasTrailingSlash$3(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash$3(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash$3(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash$4(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash$2(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash$2(input = "") {
  return hasLeadingSlash$2(input) ? input : "/" + input;
}
function getQuery$2(input) {
  return parseQuery$4(parseURL$4(input).search);
}
function isNonEmptyURL$4(url) {
  return url && url !== "/";
}
function joinURL$4(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL$4(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE$4, "");
      url = withTrailingSlash$4(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative$4 = Symbol.for("ufo:protocolRelative");
function parseURL$4(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol$4(input, { acceptRelative: true })) {
    return defaultProto ? parseURL$4(defaultProto + input) : parsePath$4(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  const [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  const { pathname, search, hash } = parsePath$4(
    path.replace(/\/(?=[A-Za-z]:)/, "")
  );
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative$4]: !protocol
  };
}
function parsePath$4(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = options || {};
  const dec = opt.decode || decode$4;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function serialize(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encode$4;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}
function decode$4(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function encode$4(val) {
  return encodeURIComponent(val);
}

const defaults$1 = Object.freeze({
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false,
  excludeKeys: void 0,
  excludeValues: void 0,
  replacer: void 0
});
function objectHash(object, options) {
  if (options) {
    options = { ...defaults$1, ...options };
  } else {
    options = defaults$1;
  }
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
const defaultPrototypesKeys = Object.freeze([
  "prototype",
  "__proto__",
  "constructor"
]);
function createHasher(options) {
  let buff = "";
  let context = /* @__PURE__ */ new Map();
  const write = (str) => {
    buff += str;
  };
  return {
    toString() {
      return buff;
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    },
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        objType = objString.slice(8, objectLength - 1);
      }
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = context.get(object)) === void 0) {
        context.set(object, context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else if (!options.ignoreUnknown) {
          this.unkown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        let extraKeys = [];
        if (options.respectType !== false && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }
        if (options.excludeKeys) {
          keys = keys.filter((key) => {
            return !options.excludeKeys(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    },
    array(arr, unordered) {
      unordered = unordered === void 0 ? options.unorderedArrays !== false : unordered;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    },
    date(date) {
      return write("date:" + date.toJSON());
    },
    symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    unkown(value, type) {
      write(type);
      if (!value) {
        return;
      }
      write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          Array.from(value.entries()),
          true
          /* ordered */
        );
      }
    },
    error(err) {
      return write("error:" + err.toString());
    },
    boolean(bool) {
      return write("bool:" + bool);
    },
    string(string) {
      write("string:" + string.length + ":");
      write(string);
    },
    function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this.object(fn);
      }
    },
    number(number) {
      return write("number:" + number);
    },
    xml(xml) {
      return write("xml:" + xml.toString());
    },
    null() {
      return write("Null");
    },
    undefined() {
      return write("Undefined");
    },
    regexp(regex) {
      return write("regex:" + regex.toString());
    },
    uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    url(url) {
      return write("url:" + url.toString());
    },
    map(map) {
      write("map:");
      const arr = [...map];
      return this.array(arr, options.unorderedSets !== false);
    },
    set(set) {
      write("set:");
      const arr = [...set];
      return this.array(arr, options.unorderedSets !== false);
    },
    file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error(
        'Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n'
      );
    },
    domwindow() {
      return write("domwindow");
    },
    bigint(number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    process() {
      return write("process");
    },
    timer() {
      return write("timer");
    },
    pipe() {
      return write("pipe");
    },
    tcp() {
      return write("tcp");
    },
    udp() {
      return write("udp");
    },
    tty() {
      return write("tty");
    },
    statwatcher() {
      return write("statwatcher");
    },
    securecontext() {
      return write("securecontext");
    },
    connection() {
      return write("connection");
    },
    zlib() {
      return write("zlib");
    },
    context() {
      return write("context");
    },
    nodescript() {
      return write("nodescript");
    },
    httpparser() {
      return write("httpparser");
    },
    dataview() {
      return write("dataview");
    },
    signal() {
      return write("signal");
    },
    fsevent() {
      return write("fsevent");
    },
    tlswrap() {
      return write("tlswrap");
    }
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

class WordArray {
  constructor(words, sigBytes) {
    words = this.words = words || [];
    this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
  }
  toString(encoder) {
    return (encoder || Hex).stringify(this);
  }
  concat(wordArray) {
    this.clamp();
    if (this.sigBytes % 4) {
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
        this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
      }
    } else {
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
    return this;
  }
  clamp() {
    this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
    this.words.length = Math.ceil(this.sigBytes / 4);
  }
  clone() {
    return new WordArray([...this.words]);
  }
}
const Hex = {
  stringify(wordArray) {
    const hexChars = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      hexChars.push((bite >>> 4).toString(16), (bite & 15).toString(16));
    }
    return hexChars.join("");
  }
};
const Base64 = {
  stringify(wordArray) {
    const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const base64Chars = [];
    for (let i = 0; i < wordArray.sigBytes; i += 3) {
      const byte1 = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      const byte2 = wordArray.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
      const byte3 = wordArray.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
      const triplet = byte1 << 16 | byte2 << 8 | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < wordArray.sigBytes * 8; j++) {
        base64Chars.push(keyStr.charAt(triplet >>> 6 * (3 - j) & 63));
      }
    }
    return base64Chars.join("");
  }
};
const Latin1 = {
  parse(latin1Str) {
    const latin1StrLength = latin1Str.length;
    const words = [];
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
    }
    return new WordArray(words, latin1StrLength);
  }
};
const Utf8 = {
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};
class BufferedBlockAlgorithm {
  constructor() {
    this._data = new WordArray();
    this._nDataBytes = 0;
    this._minBufferSize = 0;
    this.blockSize = 512 / 32;
  }
  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }
  _append(data) {
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _doProcessBlock(_dataWords, _offset) {
  }
  _process(doFlush) {
    let processedWords;
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4);
    if (doFlush) {
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }
    const nWordsReady = nBlocksReady * this.blockSize;
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        this._doProcessBlock(this._data.words, offset);
      }
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }
    return new WordArray(processedWords, nBytesReady);
  }
}
class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate) {
    this._append(messageUpdate);
    this._process();
    return this;
  }
  finalize(messageUpdate) {
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

const H = [
  1779033703,
  -1150833019,
  1013904242,
  -1521486534,
  1359893119,
  -1694144372,
  528734635,
  1541459225
];
const K = [
  1116352408,
  1899447441,
  -1245643825,
  -373957723,
  961987163,
  1508970993,
  -1841331548,
  -1424204075,
  -670586216,
  310598401,
  607225278,
  1426881987,
  1925078388,
  -2132889090,
  -1680079193,
  -1046744716,
  -459576895,
  -272742522,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  -1740746414,
  -1473132947,
  -1341970488,
  -1084653625,
  -958395405,
  -710438585,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  -2117940946,
  -1838011259,
  -1564481375,
  -1474664885,
  -1035236496,
  -949202525,
  -778901479,
  -694614492,
  -200395387,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  -2067236844,
  -1933114872,
  -1866530822,
  -1538233109,
  -1090935817,
  -965641998
];
const W = [];
class SHA256 extends Hasher {
  constructor() {
    super(...arguments);
    this._hash = new WordArray([...H]);
  }
  reset() {
    super.reset();
    this._hash = new WordArray([...H]);
  }
  _doProcessBlock(M, offset) {
    const H2 = this._hash.words;
    let a = H2[0];
    let b = H2[1];
    let c = H2[2];
    let d = H2[3];
    let e = H2[4];
    let f = H2[5];
    let g = H2[6];
    let h = H2[7];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W[i - 15];
        const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
        const gamma1x = W[i - 2];
        const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
      }
      const ch = e & f ^ ~e & g;
      const maj = a & b ^ a & c ^ b & c;
      const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
      const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
      const t1 = h + sigma1 + ch + K[i] + W[i];
      const t2 = sigma0 + maj;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  finalize(messageUpdate) {
    super.finalize(messageUpdate);
    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;
    this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(
      nBitsTotal / 4294967296
    );
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;
    this._process();
    return this._hash;
  }
}
function sha256base64(message) {
  return new SHA256().finalize(message).toString(Base64);
}

function hash(object, options = {}) {
  const hashed = typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}

function isEqual(object1, object2, hashOptions = {}) {
  if (object1 === object2) {
    return true;
  }
  if (objectHash(object1, hashOptions) === objectHash(object2, hashOptions)) {
    return true;
  }
  return false;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function rawHeaders(headers) {
  const rawHeaders2 = [];
  for (const key in headers) {
    if (Array.isArray(headers[key])) {
      for (const h of headers[key]) {
        rawHeaders2.push(key, h);
      }
    } else {
      rawHeaders2.push(key, headers[key]);
    }
  }
  return rawHeaders2;
}
function mergeFns(...functions) {
  return function(...args) {
    for (const fn of functions) {
      fn(...args);
    }
  };
}
function createNotImplementedError(name) {
  throw new Error(`[unenv] ${name} is not implemented yet!`);
}

let defaultMaxListeners = 10;
let EventEmitter$1 = class EventEmitter {
  __unenv__ = true;
  _events = /* @__PURE__ */ Object.create(null);
  _maxListeners;
  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }
  static set defaultMaxListeners(arg) {
    if (typeof arg !== "number" || arg < 0 || Number.isNaN(arg)) {
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + "."
      );
    }
    defaultMaxListeners = arg;
  }
  setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number. Received ' + n + "."
      );
    }
    this._maxListeners = n;
    return this;
  }
  getMaxListeners() {
    return _getMaxListeners(this);
  }
  emit(type, ...args) {
    if (!this._events[type] || this._events[type].length === 0) {
      return false;
    }
    if (type === "error") {
      let er;
      if (args.length > 0) {
        er = args[0];
      }
      if (er instanceof Error) {
        throw er;
      }
      const err = new Error(
        "Unhandled error." + (er ? " (" + er.message + ")" : "")
      );
      err.context = er;
      throw err;
    }
    for (const _listener of this._events[type]) {
      (_listener.listener || _listener).apply(this, args);
    }
    return true;
  }
  addListener(type, listener) {
    return _addListener(this, type, listener, false);
  }
  on(type, listener) {
    return _addListener(this, type, listener, false);
  }
  prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  }
  once(type, listener) {
    return this.on(type, _wrapOnce(this, type, listener));
  }
  prependOnceListener(type, listener) {
    return this.prependListener(type, _wrapOnce(this, type, listener));
  }
  removeListener(type, listener) {
    return _removeListener(this, type, listener);
  }
  off(type, listener) {
    return this.removeListener(type, listener);
  }
  removeAllListeners(type) {
    return _removeAllListeners(this, type);
  }
  listeners(type) {
    return _listeners(this, type, true);
  }
  rawListeners(type) {
    return _listeners(this, type, false);
  }
  listenerCount(type) {
    return this.rawListeners(type).length;
  }
  eventNames() {
    return Object.keys(this._events);
  }
};
function _addListener(target, type, listener, prepend) {
  _checkListener(listener);
  if (target._events.newListener !== void 0) {
    target.emit("newListener", type, listener.listener || listener);
  }
  if (!target._events[type]) {
    target._events[type] = [];
  }
  if (prepend) {
    target._events[type].unshift(listener);
  } else {
    target._events[type].push(listener);
  }
  const maxListeners = _getMaxListeners(target);
  if (maxListeners > 0 && target._events[type].length > maxListeners && !target._events[type].warned) {
    target._events[type].warned = true;
    const warning = new Error(
      `[unenv] Possible EventEmitter memory leak detected. ${target._events[type].length} ${type} listeners added. Use emitter.setMaxListeners() to increase limit`
    );
    warning.name = "MaxListenersExceededWarning";
    warning.emitter = target;
    warning.type = type;
    warning.count = target._events[type]?.length;
    console.warn(warning);
  }
  return target;
}
function _removeListener(target, type, listener) {
  _checkListener(listener);
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  const lenBeforeFilter = target._events[type].length;
  target._events[type] = target._events[type].filter((fn) => fn !== listener);
  if (lenBeforeFilter === target._events[type].length) {
    return target;
  }
  if (target._events.removeListener) {
    target.emit("removeListener", type, listener.listener || listener);
  }
  if (target._events[type].length === 0) {
    delete target._events[type];
  }
  return target;
}
function _removeAllListeners(target, type) {
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  if (target._events.removeListener) {
    for (const _listener of target._events[type]) {
      target.emit("removeListener", type, _listener.listener || _listener);
    }
  }
  delete target._events[type];
  return target;
}
function _wrapOnce(target, type, listener) {
  let fired = false;
  const wrapper = (...args) => {
    if (fired) {
      return;
    }
    target.removeListener(type, wrapper);
    fired = true;
    return args.length === 0 ? listener.call(target) : listener.apply(target, args);
  };
  wrapper.listener = listener;
  return wrapper;
}
function _getMaxListeners(target) {
  return target._maxListeners ?? EventEmitter$1.defaultMaxListeners;
}
function _listeners(target, type, unwrap) {
  let listeners = target._events[type];
  if (typeof listeners === "function") {
    listeners = [listeners];
  }
  return unwrap ? listeners.map((l) => l.listener || l) : listeners;
}
function _checkListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError(
      'The "listener" argument must be of type Function. Received type ' + typeof listener
    );
  }
}

const EventEmitter = globalThis.EventEmitter || EventEmitter$1;

class _Readable extends EventEmitter {
  __unenv__ = true;
  readableEncoding = null;
  readableEnded = true;
  readableFlowing = false;
  readableHighWaterMark = 0;
  readableLength = 0;
  readableObjectMode = false;
  readableAborted = false;
  readableDidRead = false;
  closed = false;
  errored = null;
  readable = false;
  destroyed = false;
  static from(_iterable, options) {
    return new _Readable(options);
  }
  constructor(_opts) {
    super();
  }
  _read(_size) {
  }
  read(_size) {
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  isPaused() {
    return true;
  }
  unpipe(_destination) {
    return this;
  }
  unshift(_chunk, _encoding) {
  }
  wrap(_oldStream) {
    return this;
  }
  push(_chunk, _encoding) {
    return false;
  }
  _destroy(_error, _callback) {
    this.removeAllListeners();
  }
  destroy(error) {
    this.destroyed = true;
    this._destroy(error);
    return this;
  }
  pipe(_destenition, _options) {
    return {};
  }
  compose(stream, options) {
    throw new Error("[unenv] Method not implemented.");
  }
  [Symbol.asyncDispose]() {
    this.destroy();
    return Promise.resolve();
  }
  async *[Symbol.asyncIterator]() {
    throw createNotImplementedError("Readable.asyncIterator");
  }
  iterator(options) {
    throw createNotImplementedError("Readable.iterator");
  }
  map(fn, options) {
    throw createNotImplementedError("Readable.map");
  }
  filter(fn, options) {
    throw createNotImplementedError("Readable.filter");
  }
  forEach(fn, options) {
    throw createNotImplementedError("Readable.forEach");
  }
  reduce(fn, initialValue, options) {
    throw createNotImplementedError("Readable.reduce");
  }
  find(fn, options) {
    throw createNotImplementedError("Readable.find");
  }
  findIndex(fn, options) {
    throw createNotImplementedError("Readable.findIndex");
  }
  some(fn, options) {
    throw createNotImplementedError("Readable.some");
  }
  toArray(options) {
    throw createNotImplementedError("Readable.toArray");
  }
  every(fn, options) {
    throw createNotImplementedError("Readable.every");
  }
  flatMap(fn, options) {
    throw createNotImplementedError("Readable.flatMap");
  }
  drop(limit, options) {
    throw createNotImplementedError("Readable.drop");
  }
  take(limit, options) {
    throw createNotImplementedError("Readable.take");
  }
  asIndexedPairs(options) {
    throw createNotImplementedError("Readable.asIndexedPairs");
  }
}
const Readable = globalThis.Readable || _Readable;

class _Writable extends EventEmitter {
  __unenv__ = true;
  writable = true;
  writableEnded = false;
  writableFinished = false;
  writableHighWaterMark = 0;
  writableLength = 0;
  writableObjectMode = false;
  writableCorked = 0;
  closed = false;
  errored = null;
  writableNeedDrain = false;
  destroyed = false;
  _data;
  _encoding = "utf-8";
  constructor(_opts) {
    super();
  }
  pipe(_destenition, _options) {
    return {};
  }
  _write(chunk, encoding, callback) {
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._data === void 0) {
      this._data = chunk;
    } else {
      const a = typeof this._data === "string" ? Buffer.from(this._data, this._encoding || encoding || "utf8") : this._data;
      const b = typeof chunk === "string" ? Buffer.from(chunk, encoding || this._encoding || "utf8") : chunk;
      this._data = Buffer.concat([a, b]);
    }
    this._encoding = encoding;
    if (callback) {
      callback();
    }
  }
  _writev(_chunks, _callback) {
  }
  _destroy(_error, _callback) {
  }
  _final(_callback) {
  }
  write(chunk, arg2, arg3) {
    const encoding = typeof arg2 === "string" ? this._encoding : "utf-8";
    const cb = typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    this._write(chunk, encoding, cb);
    return true;
  }
  setDefaultEncoding(_encoding) {
    return this;
  }
  end(arg1, arg2, arg3) {
    const callback = typeof arg1 === "function" ? arg1 : typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return this;
    }
    const data = arg1 === callback ? void 0 : arg1;
    if (data) {
      const encoding = arg2 === callback ? void 0 : arg2;
      this.write(data, encoding, callback);
    }
    this.writableEnded = true;
    this.writableFinished = true;
    this.emit("close");
    this.emit("finish");
    return this;
  }
  cork() {
  }
  uncork() {
  }
  destroy(_error) {
    this.destroyed = true;
    delete this._data;
    this.removeAllListeners();
    return this;
  }
  compose(stream, options) {
    throw new Error("[h3] Method not implemented.");
  }
}
const Writable = globalThis.Writable || _Writable;

const __Duplex = class {
  allowHalfOpen = true;
  _destroy;
  constructor(readable = new Readable(), writable = new Writable()) {
    Object.assign(this, readable);
    Object.assign(this, writable);
    this._destroy = mergeFns(readable._destroy, writable._destroy);
  }
};
function getDuplex() {
  Object.assign(__Duplex.prototype, Readable.prototype);
  Object.assign(__Duplex.prototype, Writable.prototype);
  return __Duplex;
}
const _Duplex = /* @__PURE__ */ getDuplex();
const Duplex = globalThis.Duplex || _Duplex;

class Socket extends Duplex {
  __unenv__ = true;
  bufferSize = 0;
  bytesRead = 0;
  bytesWritten = 0;
  connecting = false;
  destroyed = false;
  pending = false;
  localAddress = "";
  localPort = 0;
  remoteAddress = "";
  remoteFamily = "";
  remotePort = 0;
  autoSelectFamilyAttemptedAddresses = [];
  readyState = "readOnly";
  constructor(_options) {
    super();
  }
  write(_buffer, _arg1, _arg2) {
    return false;
  }
  connect(_arg1, _arg2, _arg3) {
    return this;
  }
  end(_arg1, _arg2, _arg3) {
    return this;
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  setTimeout(_timeout, _callback) {
    return this;
  }
  setNoDelay(_noDelay) {
    return this;
  }
  setKeepAlive(_enable, _initialDelay) {
    return this;
  }
  address() {
    return {};
  }
  unref() {
    return this;
  }
  ref() {
    return this;
  }
  destroySoon() {
    this.destroy();
  }
  resetAndDestroy() {
    const err = new Error("ERR_SOCKET_CLOSED");
    err.code = "ERR_SOCKET_CLOSED";
    this.destroy(err);
    return this;
  }
}

class IncomingMessage extends Readable {
  __unenv__ = {};
  aborted = false;
  httpVersion = "1.1";
  httpVersionMajor = 1;
  httpVersionMinor = 1;
  complete = true;
  connection;
  socket;
  headers = {};
  trailers = {};
  method = "GET";
  url = "/";
  statusCode = 200;
  statusMessage = "";
  closed = false;
  errored = null;
  readable = false;
  constructor(socket) {
    super();
    this.socket = this.connection = socket || new Socket();
  }
  get rawHeaders() {
    return rawHeaders(this.headers);
  }
  get rawTrailers() {
    return [];
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  get headersDistinct() {
    return _distinct(this.headers);
  }
  get trailersDistinct() {
    return _distinct(this.trailers);
  }
}
function _distinct(obj) {
  const d = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      d[key] = (Array.isArray(value) ? value : [value]).filter(
        Boolean
      );
    }
  }
  return d;
}

class ServerResponse extends Writable {
  __unenv__ = true;
  statusCode = 200;
  statusMessage = "";
  upgrading = false;
  chunkedEncoding = false;
  shouldKeepAlive = false;
  useChunkedEncodingByDefault = false;
  sendDate = false;
  finished = false;
  headersSent = false;
  strictContentLength = false;
  connection = null;
  socket = null;
  req;
  _headers = {};
  constructor(req) {
    super();
    this.req = req;
  }
  assignSocket(socket) {
    socket._httpMessage = this;
    this.socket = socket;
    this.connection = socket;
    this.emit("socket", socket);
    this._flush();
  }
  _flush() {
    this.flushHeaders();
  }
  detachSocket(_socket) {
  }
  writeContinue(_callback) {
  }
  writeHead(statusCode, arg1, arg2) {
    if (statusCode) {
      this.statusCode = statusCode;
    }
    if (typeof arg1 === "string") {
      this.statusMessage = arg1;
      arg1 = void 0;
    }
    const headers = arg2 || arg1;
    if (headers) {
      if (Array.isArray(headers)) ; else {
        for (const key in headers) {
          this.setHeader(key, headers[key]);
        }
      }
    }
    this.headersSent = true;
    return this;
  }
  writeProcessing() {
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  appendHeader(name, value) {
    name = name.toLowerCase();
    const current = this._headers[name];
    const all = [
      ...Array.isArray(current) ? current : [current],
      ...Array.isArray(value) ? value : [value]
    ].filter(Boolean);
    this._headers[name] = all.length > 1 ? all : all[0];
    return this;
  }
  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
    return this;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  getHeaders() {
    return this._headers;
  }
  getHeaderNames() {
    return Object.keys(this._headers);
  }
  hasHeader(name) {
    return name.toLowerCase() in this._headers;
  }
  removeHeader(name) {
    delete this._headers[name.toLowerCase()];
  }
  addTrailers(_headers) {
  }
  flushHeaders() {
  }
  writeEarlyHints(_headers, cb) {
    if (typeof cb === "function") {
      cb();
    }
  }
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Error extends Error {
  constructor(message, opts = {}) {
    super(message, opts);
    __publicField$2(this, "statusCode", 500);
    __publicField$2(this, "fatal", false);
    __publicField$2(this, "unhandled", false);
    __publicField$2(this, "statusMessage");
    __publicField$2(this, "data");
    __publicField$2(this, "cause");
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
__publicField$2(H3Error, "__h3_error__", true);
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery$1(event) {
  return getQuery$2(event.path || "");
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= opts.modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function parseCookies(event) {
  return parse$1(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions) {
  serializeOptions = { path: "/", ...serializeOptions };
  const cookieStr = serialize(name, value, serializeOptions);
  let setCookies = event.node.res.getHeader("set-cookie");
  if (!Array.isArray(setCookies)) {
    setCookies = [setCookies];
  }
  const _optionsHash = objectHash(serializeOptions);
  setCookies = setCookies.filter((cookieValue) => {
    return cookieValue && _optionsHash !== objectHash(parse$1(cookieValue));
  });
  event.node.res.setHeader("set-cookie", [...setCookies, cookieStr]);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start, cookiesString.length));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(name, value);
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders(
    getProxyRequestHeaders(event),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  const response = await _getFetch(opts.fetch)(target, {
    headers: opts.headers,
    ignoreResponseError: true,
    // make $ofetch.raw transparent
    ...opts.fetchOptions
  });
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name)) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    for (const [key, value] of Object.entries(input)) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Event {
  constructor(req, res) {
    __publicField(this, "__is_event__", true);
    // Context
    __publicField(this, "node");
    // Node
    __publicField(this, "web");
    // Web
    __publicField(this, "context", {});
    // Shared
    // Request
    __publicField(this, "_method");
    __publicField(this, "_path");
    __publicField(this, "_headers");
    __publicField(this, "_requestBody");
    // Response
    __publicField(this, "_handled", false);
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. **/
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. **/
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL$4(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash$3(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const { pathname } = parseURL$4(info.url || "/");
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash$2(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      await sendError(event, error, !!app.options.debug);
    }
  };
  return toNodeHandle;
}

const s=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

const HASH_RE$3 = /#/g;
const AMPERSAND_RE$3 = /&/g;
const SLASH_RE$3 = /\//g;
const EQUAL_RE$3 = /=/g;
const PLUS_RE$3 = /\+/g;
const ENC_CARET_RE$3 = /%5e/gi;
const ENC_BACKTICK_RE$3 = /%60/gi;
const ENC_PIPE_RE$3 = /%7c/gi;
const ENC_SPACE_RE$3 = /%20/gi;
function encode$3(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE$3, "|");
}
function encodeQueryValue$3(input) {
  return encode$3(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE$3, "%2B").replace(ENC_SPACE_RE$3, "+").replace(HASH_RE$3, "%23").replace(AMPERSAND_RE$3, "%26").replace(ENC_BACKTICK_RE$3, "`").replace(ENC_CARET_RE$3, "^").replace(SLASH_RE$3, "%2F");
}
function encodeQueryKey$3(text) {
  return encodeQueryValue$3(text).replace(EQUAL_RE$3, "%3D");
}
function decode$3(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey$3(text) {
  return decode$3(text.replace(PLUS_RE$3, " "));
}
function decodeQueryValue$3(text) {
  return decode$3(text.replace(PLUS_RE$3, " "));
}

function parseQuery$3(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey$3(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue$3(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem$3(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey$3(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey$3(key)}=${encodeQueryValue$3(_value)}`).join("&");
  }
  return `${encodeQueryKey$3(key)}=${encodeQueryValue$3(value)}`;
}
function stringifyQuery$3(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem$3(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX$3 = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX$3 = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX$3 = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE$3 = /^\.?\//;
function hasProtocol$3(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX$3.test(inputString);
  }
  return PROTOCOL_REGEX$3.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX$3.test(inputString) : false);
}
function hasTrailingSlash$2(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash$2(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash$2(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash$3(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function withBase$1(input, base) {
  if (isEmptyURL$2(base) || hasProtocol$3(input)) {
    return input;
  }
  const _base = withoutTrailingSlash$2(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL$3(_base, input);
}
function withQuery$3(input, query) {
  const parsed = parseURL$3(input);
  const mergedQuery = { ...parseQuery$3(parsed.search), ...query };
  parsed.search = stringifyQuery$3(mergedQuery);
  return stringifyParsedURL$3(parsed);
}
function isEmptyURL$2(url) {
  return !url || url === "/";
}
function isNonEmptyURL$3(url) {
  return url && url !== "/";
}
function joinURL$3(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL$3(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE$3, "");
      url = withTrailingSlash$3(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative$3 = Symbol.for("ufo:protocolRelative");
function parseURL$3(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol$3(input, { acceptRelative: true })) {
    return parsePath$3(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  const [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  const { pathname, search, hash } = parsePath$3(
    path.replace(/\/(?=[A-Za-z]:)/, "")
  );
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative$3]: !protocol
  };
}
function parsePath$3(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL$3(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative$3] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function mergeFetchOptions(input, defaults, Headers = globalThis.Headers) {
  const merged = {
    ...defaults,
    ...input
  };
  if (defaults?.params && input?.params) {
    merged.params = {
      ...defaults?.params,
      ...input?.params
    };
  }
  if (defaults?.query && input?.query) {
    merged.query = {
      ...defaults?.query,
      ...input?.query
    };
  }
  if (defaults?.headers && input?.headers) {
    merged.headers = new Headers(defaults?.headers || {});
    for (const [key, value] of new Headers(input?.headers || {})) {
      merged.headers.set(key, value);
    }
  }
  return merged;
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  //  Gateway Timeout
]);
const nullBodyResponses$1 = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch$1(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: mergeFetchOptions(_options, globalOptions.defaults, Headers),
      response: void 0,
      error: void 0
    };
    context.options.method = context.options.method?.toUpperCase();
    if (context.options.onRequest) {
      await context.options.onRequest(context);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase$1(context.request, context.options.baseURL);
      }
      if (context.options.query || context.options.params) {
        context.request = withQuery$3(context.request, {
          ...context.options.params,
          ...context.options.query
        });
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(
        () => controller.abort(),
        context.options.timeout
      );
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await context.options.onRequestError(context);
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = context.response.body && !nullBodyResponses$1.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await context.options.onResponse(context);
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await context.options.onResponseError(context);
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}) => createFetch$1({
    ...globalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch || createNodeFetch();
const Headers$1 = globalThis.Headers || s;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch$1({ fetch, Headers: Headers$1, AbortController });
const $fetch$1 = ofetch;

const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createCall(handle) {
  return function callHandle(context) {
    const req = new IncomingMessage();
    const res = new ServerResponse(req);
    req.url = context.url || "/";
    req.method = context.method || "GET";
    req.headers = {};
    if (context.headers) {
      const headerEntries = typeof context.headers.entries === "function" ? context.headers.entries() : Object.entries(context.headers);
      for (const [name, value] of headerEntries) {
        if (!value) {
          continue;
        }
        req.headers[name.toLowerCase()] = value;
      }
    }
    req.headers.host = req.headers.host || context.host || "localhost";
    req.connection.encrypted = // @ts-ignore
    req.connection.encrypted || context.protocol === "https";
    req.body = context.body || null;
    req.__unenv__ = context.context;
    return handle(req, res).then(() => {
      let body = res._data;
      if (nullBodyResponses.has(res.statusCode) || req.method.toUpperCase() === "HEAD") {
        body = null;
        delete res._headers["content-length"];
      }
      const r = {
        body,
        headers: res._headers,
        status: res.statusCode,
        statusText: res.statusMessage
      };
      req.destroy();
      res.destroy();
      return r;
    });
  };
}

function createFetch(call, _fetch = global.fetch) {
  return async function ufetch(input, init) {
    const url = input.toString();
    if (!url.startsWith("/")) {
      return _fetch(url, init);
    }
    try {
      const r = await call({ url, ...init });
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(
          Object.entries(r.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(",") : String(value) || ""
          ])
        )
      });
    } catch (error) {
      return new Response(error.toString(), {
        status: Number.parseInt(error.statusCode || error.code) || 500,
        statusText: error.statusText
      });
    }
  };
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function pascalCase(str, opts) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => upperFirst(opts?.normalize ? p.toLowerCase() : p)).join("") : "";
}
function camelCase(str, opts) {
  return lowerFirst(pascalCase(str || "", opts));
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner ?? "-") : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /{{(.*?)}}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const inlineAppConfig = {
  "nuxt": {
    "buildId": "10ca9a8a-41e8-4ae8-be5c-6cbd082e5575"
  }
};



const appConfig = defuFn(inlineAppConfig);

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "stripePublicKey": "",
    "serverURL": "",
    "mdc": {
      "useNuxtImage": true,
      "components": {
        "prose": true,
        "map": {
          "p": "prose-p",
          "a": "prose-a",
          "blockquote": "prose-blockquote",
          "code-inline": "prose-code-inline",
          "code": "ProseCodeInline",
          "em": "prose-em",
          "h1": "prose-h1",
          "h2": "prose-h2",
          "h3": "prose-h3",
          "h4": "prose-h4",
          "h5": "prose-h5",
          "h6": "prose-h6",
          "hr": "prose-hr",
          "img": "prose-img",
          "ul": "prose-ul",
          "ol": "prose-ol",
          "li": "prose-li",
          "strong": "prose-strong",
          "table": "prose-table",
          "thead": "prose-thead",
          "tbody": "prose-tbody",
          "td": "prose-td",
          "th": "prose-th",
          "tr": "prose-tr"
        }
      },
      "headings": {
        "anchorLinks": {
          "h1": false,
          "h2": true,
          "h3": true,
          "h4": true,
          "h5": false,
          "h6": false
        }
      }
    },
    "content": {
      "locales": [],
      "defaultLocale": "",
      "integrity": 1723103931526,
      "experimental": {
        "stripQueryParameters": false,
        "advanceQuery": false,
        "clientDB": false
      },
      "respectPathCase": false,
      "api": {
        "baseURL": "/api/_content"
      },
      "navigation": {
        "fields": []
      },
      "tags": {
        "p": "prose-p",
        "a": "prose-a",
        "blockquote": "prose-blockquote",
        "code-inline": "prose-code-inline",
        "code": "ProseCodeInline",
        "em": "prose-em",
        "h1": "prose-h1",
        "h2": "prose-h2",
        "h3": "prose-h3",
        "h4": "prose-h4",
        "h5": "prose-h5",
        "h6": "prose-h6",
        "hr": "prose-hr",
        "img": "prose-img",
        "ul": "prose-ul",
        "ol": "prose-ol",
        "li": "prose-li",
        "strong": "prose-strong",
        "table": "prose-table",
        "thead": "prose-thead",
        "tbody": "prose-tbody",
        "td": "prose-td",
        "th": "prose-th",
        "tr": "prose-tr"
      },
      "highlight": false,
      "wsUrl": "",
      "documentDriven": false,
      "host": "",
      "trailingSlash": false,
      "search": "",
      "contentHead": true,
      "anchorLinks": {
        "depth": 4,
        "exclude": [
          1
        ]
      }
    },
    "stripe": {
      "key": "pk_test_TGFHNcnqSJVQLaJzCtIkwKd8",
      "options": {}
    }
  },
  "stripeToken": "",
  "content": {
    "cacheVersion": 2,
    "cacheIntegrity": "1u7ztP1WaG",
    "transformers": [],
    "base": "",
    "api": {
      "baseURL": "/api/_content"
    },
    "watch": {
      "ws": {
        "port": {
          "port": 4000,
          "portRange": [
            4000,
            4040
          ]
        },
        "hostname": "localhost",
        "showURL": false
      }
    },
    "sources": {},
    "ignores": [],
    "locales": [],
    "defaultLocale": "",
    "highlight": false,
    "markdown": {
      "tags": {
        "p": "prose-p",
        "a": "prose-a",
        "blockquote": "prose-blockquote",
        "code-inline": "prose-code-inline",
        "code": "ProseCodeInline",
        "em": "prose-em",
        "h1": "prose-h1",
        "h2": "prose-h2",
        "h3": "prose-h3",
        "h4": "prose-h4",
        "h5": "prose-h5",
        "h6": "prose-h6",
        "hr": "prose-hr",
        "img": "prose-img",
        "ul": "prose-ul",
        "ol": "prose-ol",
        "li": "prose-li",
        "strong": "prose-strong",
        "table": "prose-table",
        "thead": "prose-thead",
        "tbody": "prose-tbody",
        "td": "prose-td",
        "th": "prose-th",
        "tr": "prose-tr"
      },
      "anchorLinks": {
        "depth": 4,
        "exclude": [
          1
        ]
      },
      "remarkPlugins": {
        "remark-emoji": {}
      },
      "rehypePlugins": {
        "rehype-external-links": {
          "target": "_blank"
        }
      }
    },
    "yaml": {},
    "csv": {
      "delimeter": ",",
      "json": true
    },
    "navigation": {
      "fields": []
    },
    "contentHead": true,
    "documentDriven": false,
    "respectPathCase": false,
    "experimental": {
      "clientDB": false,
      "cacheContents": true,
      "stripQueryParameters": false,
      "advanceQuery": false,
      "search": ""
    }
  },
  "stripe": {
    "key": "sk_test_ZbLfmsKsXRfctGpYFltbCwYC",
    "options": {}
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const HASH_RE$2 = /#/g;
const AMPERSAND_RE$2 = /&/g;
const SLASH_RE$2 = /\//g;
const EQUAL_RE$2 = /=/g;
const PLUS_RE$2 = /\+/g;
const ENC_CARET_RE$2 = /%5e/gi;
const ENC_BACKTICK_RE$2 = /%60/gi;
const ENC_PIPE_RE$2 = /%7c/gi;
const ENC_SPACE_RE$2 = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode$2(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE$2, "|");
}
function encodeQueryValue$2(input) {
  return encode$2(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE$2, "%2B").replace(ENC_SPACE_RE$2, "+").replace(HASH_RE$2, "%23").replace(AMPERSAND_RE$2, "%26").replace(ENC_BACKTICK_RE$2, "`").replace(ENC_CARET_RE$2, "^").replace(SLASH_RE$2, "%2F");
}
function encodeQueryKey$2(text) {
  return encodeQueryValue$2(text).replace(EQUAL_RE$2, "%3D");
}
function decode$2(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$2(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey$2(text) {
  return decode$2(text.replace(PLUS_RE$2, " "));
}
function decodeQueryValue$2(text) {
  return decode$2(text.replace(PLUS_RE$2, " "));
}

function parseQuery$2(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey$2(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue$2(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem$2(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey$2(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey$2(key)}=${encodeQueryValue$2(_value)}`).join("&");
  }
  return `${encodeQueryKey$2(key)}=${encodeQueryValue$2(value)}`;
}
function stringifyQuery$2(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem$2(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX$2 = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX$2 = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX$2 = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE$2 = /^\.?\//;
function hasProtocol$2(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX$2.test(inputString);
  }
  return PROTOCOL_REGEX$2.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX$2.test(inputString) : false);
}
function hasTrailingSlash$1(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash$1(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash$1(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash$2(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash$1(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash$1(input = "") {
  return hasLeadingSlash$1(input) ? input : "/" + input;
}
function withoutBase(input, base) {
  if (isEmptyURL$1(base)) {
    return input;
  }
  const _base = withoutTrailingSlash$1(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery$2(input, query) {
  const parsed = parseURL$2(input);
  const mergedQuery = { ...parseQuery$2(parsed.search), ...query };
  parsed.search = stringifyQuery$2(mergedQuery);
  return stringifyParsedURL$2(parsed);
}
function getQuery(input) {
  return parseQuery$2(parseURL$2(input).search);
}
function isEmptyURL$1(url) {
  return !url || url === "/";
}
function isNonEmptyURL$2(url) {
  return url && url !== "/";
}
function joinURL$2(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL$2(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE$2, "");
      url = withTrailingSlash$2(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative$2 = Symbol.for("ufo:protocolRelative");
function parseURL$2(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol$2(input, { acceptRelative: true })) {
    return defaultProto ? parseURL$2(defaultProto + input) : parsePath$2(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  const [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  const { pathname, search, hash } = parsePath$2(
    path.replace(/\/(?=[A-Za-z]:)/, "")
  );
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative$2]: !protocol
  };
}
function parsePath$2(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL$2(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative$2] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
function checkBufferSupport() {
  if (typeof Buffer === void 0) {
    throw new TypeError("[unstorage] Buffer is not supported!");
  }
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  checkBufferSupport();
  const base64 = Buffer.from(value).toString("base64");
  return BASE64_PREFIX + base64;
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  checkBufferSupport();
  return Buffer.from(value.slice(BASE64_PREFIX.length), "base64");
}

const storageKeyProperties = [
  "hasItem",
  "getItem",
  "getItemRaw",
  "setItem",
  "setItemRaw",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  return nsStorage;
}
function normalizeKey$2(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}
function joinKeys(...keys) {
  return normalizeKey$2(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$2(base);
  return base ? base + ":" : "";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$3 = "memory";
const memory$1 = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$3,
    options: {},
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return Array.from(data.keys());
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory$1() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$2(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$2(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      for (const mount of mounts) {
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        const keys = rawKeys.map((key) => mount.mountpoint + normalizeKey$2(key)).filter((key) => !maskedMounts.some((p) => key.startsWith(p)));
        allKeys.push(...keys);
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      return base ? allKeys.filter((key) => key.startsWith(base) && !key.endsWith("$")) : allKeys.filter((key) => !key.endsWith("$"));
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$2(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$2(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    }
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {
  ["nitro:bundled:cache:content:content-index.json"]: {
    import: () => import('../../raw/content-index.mjs').then(r => r.default || r),
    meta: {"type":"application/json","etag":"\"165a-fZ6ezzKOYZ29n9FPTqw1IboLjTo\"","mtime":"2024-08-08T07:59:00.740Z"}
  },
  ["nitro:bundled:cache:content:content-navigation.json"]: {
    import: () => import('../../raw/content-navigation.mjs').then(r => r.default || r),
    meta: {"type":"application/json","etag":"\"163a-jNzRE7loO+4CqO7t4sSsG01LcnM\"","mtime":"2024-08-08T07:59:00.740Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:links.yaml"]: {
    import: () => import('../../raw/links.mjs').then(r => r.default || r),
    meta: {"type":"text/yaml; charset=utf-8","etag":"\"31c-Qje8e8TxLUblzErCnPKXw0eCri0\"","mtime":"2024-08-08T07:59:00.741Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:mentions:conditions-generales-de-vente.md"]: {
    import: () => import('../../raw/conditions-generales-de-vente.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"6704-hwdb5BSSpw7tgd4Wi7Rgeh/eSFE\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:mentions:mentions-legales.md"]: {
    import: () => import('../../raw/mentions-legales.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"2afe-nk7wY/KRKZfGWdeLmEDdquS7coI\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:projects:Poils--Fminit.md"]: {
    import: () => import('../../raw/Poils--Fminit.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"2c0-mDG+1UbeFZEXvvFnTfi8AmpPzec\"","mtime":"2024-08-08T07:59:00.742Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:projects:Skinz.md"]: {
    import: () => import('../../raw/Skinz.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"948-st7o34znBfN+LVokjKiXUmUSZqg\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:projects:projet-lang.md"]: {
    import: () => import('../../raw/projet-lang.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1421-ttWfzxRQMA5lsLV9yEAduJGJJWg\"","mtime":"2024-08-08T07:59:00.749Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:runs:1.lancement.md"]: {
    import: () => import('../../raw/1.lancement.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"637-PI4o5TNlV8tFhcTOMCX50ZxcbSU\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:runs:2.le-rituel.md"]: {
    import: () => import('../../raw/2.le-rituel.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"5b4-yETgfN9JgkJTiaLeWqHat/T0+Cw\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:runs:3.jardins-de-balata.md"]: {
    import: () => import('../../raw/3.jardins-de-balata.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"825-XL8XsUFYsLzNBJd0smcXxyiFuOg\"","mtime":"2024-08-08T07:59:00.742Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:runs:4.vol-au-vent.md"]: {
    import: () => import('../../raw/4.vol-au-vent.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"721-yPQs9f07fsag0jkkbc4rPvf3p9c\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:runs:5.dorures-salon-francais.md"]: {
    import: () => import('../../raw/5.dorures-salon-francais.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"ecc-q72YRKQHzSYST2226jFcqvvWjvY\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:runs:6.amer.md"]: {
    import: () => import('../../raw/6.amer.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"688-T3tCELXdw9v4MLX8tJQA8Zuciik\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:runs:7.petit-cadre-sexy.md"]: {
    import: () => import('../../raw/7.petit-cadre-sexy.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"769-i0GVZxgKhJSmtjKKDgO/7FkZ3Vs\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-04-yellow-world.md"]: {
    import: () => import('../../raw/2016-06-04-yellow-world.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1558-Kw6/aEkdDYz+VHCFPwCxcLxGbHw\"","mtime":"2024-08-08T07:59:00.749Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-09-ergojaunemie.md"]: {
    import: () => import('../../raw/2016-06-09-ergojaunemie.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1c87-0EbVeINk8eWymaT0DDeUQbgR4Cc\"","mtime":"2024-08-08T07:59:00.740Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-13-jaune-et-content.md"]: {
    import: () => import('../../raw/2016-06-13-jaune-et-content.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"18b6-e+zf0otkpwAayWyaAMwQRqwXhNc\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-14-indiana-jaune.md"]: {
    import: () => import('../../raw/2016-06-14-indiana-jaune.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"e52-kRQmJxz+eiGwZWdhznOJ4Hu+gFc\"","mtime":"2024-08-08T07:59:00.749Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-14-yellove-is-beautiful.md"]: {
    import: () => import('../../raw/2016-06-14-yellove-is-beautiful.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"18c5-veqDoaPyF9CF9+j0XFVGCLPPx3Q\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-23-yellow-rider-bmx.md"]: {
    import: () => import('../../raw/2016-06-23-yellow-rider-bmx.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1178-fLm9TeqCbq4atysZiNHgFg//A3c\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-27-jaune-veux-travailler.md"]: {
    import: () => import('../../raw/2016-06-27-jaune-veux-travailler.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1e79-OqTXP0MSpU709l92yDmQfz4uV8c\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-06-28-le-jaune-et-la-tortue.md"]: {
    import: () => import('../../raw/2016-06-28-le-jaune-et-la-tortue.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"ff6-azcyhjnCf8ri3XR5cv5S7Qz6elE\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-07-07-allo-docteur-jaune-suis-malade.md"]: {
    import: () => import('../../raw/2016-07-07-allo-docteur-jaune-suis-malade.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"15a2-zD0t3QiBbtUi5rPWXueenppPLkc\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-07-08-operation-10k.md"]: {
    import: () => import('../../raw/2016-07-08-operation-10k.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"10e1-BuNl2MWvxxPdy86gs/ABPefoxR8\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-07-28-nappy-de-compagnie-cheveu-langue.md"]: {
    import: () => import('../../raw/2016-07-28-nappy-de-compagnie-cheveu-langue.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"32b0-FhvX86D0iLWosTNMMVBLOSJvlCw\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-09-08-yellowcation.md"]: {
    import: () => import('../../raw/2016-09-08-yellowcation.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1225-YOF+iYGF42bdyR75Ox82SZ38V+s\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-11-08-jaune-vie.md"]: {
    import: () => import('../../raw/2016-11-08-jaune-vie.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1b05-V3oJbcZxuKN6Np0xk0KlN2dYNSk\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-11-08-startup-weekend-2016-johnny-etait.md"]: {
    import: () => import('../../raw/2016-11-08-startup-weekend-2016-johnny-etait.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"546e-phpBZ5NBjRkCGabJC41z2/PhwBw\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-11-08-yellow-dans-le-gaz.md"]: {
    import: () => import('../../raw/2016-11-08-yellow-dans-le-gaz.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1927-SGlU+SBU/2seSh0YkZ6mdgqWkVo\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2016-12-29-yellowhack.md"]: {
    import: () => import('../../raw/2016-12-29-yellowhack.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"171a-yS94/Cr0FZvDAmYdqTgG2AWcewc\"","mtime":"2024-08-08T07:59:00.743Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2017-01-23-des-jaunes-et-des-couvertes.md"]: {
    import: () => import('../../raw/2017-01-23-des-jaunes-et-des-couvertes.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"17a7-H318Q0tGNFvpWZP/l35Wkcn9yfM\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2017-01-24-le-spot-coworking.md"]: {
    import: () => import('../../raw/2017-01-24-le-spot-coworking.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1c35-o6QLM50qorv8jRYTfzYtyiYweaU\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2017-05-30-the-yellow-shooter.md"]: {
    import: () => import('../../raw/2017-05-30-the-yellow-shooter.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"3ca5-wQ8idnbrIuoprHYNzZ/qz5kjnuI\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2017-06-01-jai-vu-jaune.md"]: {
    import: () => import('../../raw/2017-06-01-jai-vu-jaune.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"21c5-nyflk7xaTEpZ0eNPH6VwRyl8JP4\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2017-09-04-yellographie.md"]: {
    import: () => import('../../raw/2017-09-04-yellographie.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"9dbb-iW0qtrG1qJ3OAMZatVMx12IyWRU\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2017-11-10-route-de-briques-jaunes.md"]: {
    import: () => import('../../raw/2017-11-10-route-de-briques-jaunes.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"5d1d-PEnFkoTvzdbtEZ3Y0IILmq2uM74\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-01-05-ys-circuit-national-tir-martinique.md"]: {
    import: () => import('../../raw/2018-01-05-ys-circuit-national-tir-martinique.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"26d4-u2LTE2YL8FUXgBrxm4pF4qSojyI\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-04-11-le-maco-jaune-lance-son-podcast.md"]: {
    import: () => import('../../raw/2018-04-11-le-maco-jaune-lance-son-podcast.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"d88-k/ahKRnag1Q5nb701Zz17QHoJhE\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-04-18-mangezbouffez-fr.md"]: {
    import: () => import('../../raw/2018-04-18-mangezbouffez-fr.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"7906-/jti7L6ccyxn7cdf38T2JmgJSrU\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-05-10-komodo-ide-v11-logo-jaune-ok-efficace.md"]: {
    import: () => import('../../raw/2018-05-10-komodo-ide-v11-logo-jaune-ok-efficace.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"411a-WxXHJAXzIStwFEXKGBHIBuQ7Ffw\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-05-12-vie-belle-jaune.md"]: {
    import: () => import('../../raw/2018-05-12-vie-belle-jaune.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"3882-h1MLST/d/aYV2lmuwMf66fgYJLY\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-05-14-dis-moi-ce-que-tu-manges-je-te-dirais-pourquoi-tu-glandes.md"]: {
    import: () => import('../../raw/2018-05-14-dis-moi-ce-que-tu-manges-je-te-dirais-pourquoi-tu-glandes.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"32a6-9OPmNkYtXmOmgiySLYJ/Jpt0wvQ\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-10-13-90-jours-pour-demissionner.md"]: {
    import: () => import('../../raw/2018-10-13-90-jours-pour-demissionner.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"28fd-H5thM64Pcwc6KbntdUoAnwLwINI\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-10-15-ton-bureau-veut-te-tuer-reagis.md"]: {
    import: () => import('../../raw/2018-10-15-ton-bureau-veut-te-tuer-reagis.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"10f7-k4VeG4mTgGwsFzMgcM909bIDKoQ\"","mtime":"2024-08-08T07:59:00.744Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-10-16-ton-fauteuil-veut-te-tuer-debout.md"]: {
    import: () => import('../../raw/2018-10-16-ton-fauteuil-veut-te-tuer-debout.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"3b52-sSsXL1Uhem3I6ZRyhhvycUttIdE\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-11-14-boudoum-episode-zero.md"]: {
    import: () => import('../../raw/2018-11-14-boudoum-episode-zero.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"22b7-Yh0dgYNOBJ9JcrDl1RK1wuUzSJg\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-21-11-Je-ne-sais-pas-pourquoi.md"]: {
    import: () => import('../../raw/2018-21-11-Je-ne-sais-pas-pourquoi.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1fe4-panWFUjIresMV3LXcGkJTFgCscM\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2018-28-08-questions-actions.md"]: {
    import: () => import('../../raw/2018-28-08-questions-actions.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1b2e-yPi6xcSAeThrKIyMBXAdx70xRIU\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2019-01-25-scorpion-intelligent-ne-frappe-qu-une-fois.md"]: {
    import: () => import('../../raw/2019-01-25-scorpion-intelligent-ne-frappe-qu-une-fois.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"2545-FpYpxMipqEEZEBpshCmlqpKTGCE\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2019-05-21-est-il-en-vie.md"]: {
    import: () => import('../../raw/2019-05-21-est-il-en-vie.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1079-l7/p9HA3y55abyTEZO9CMuGHhnQ\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2019-07-05-burnout-cest-pour-les-autres.md"]: {
    import: () => import('../../raw/2019-07-05-burnout-cest-pour-les-autres.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"28c4-MjaEwhZ/tx6CwbWbgfaFEkgmAZw\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2019-07-20-plus-envie.md"]: {
    import: () => import('../../raw/2019-07-20-plus-envie.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"28b0-xhjEjiEYLua8MpD8Fatx7keJSZY\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2019-09-10-nouveau-défi- -100daysofcode.md"]: {
    import: () => import('../../raw/2019-09-10-nouveau-défi- -100daysofcode.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"2422-8+1jX7maMkCvgkUl3RU1+jaREHc\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2019-12-29-forestry-io-un-cms pour-ton-blog-site.md"]: {
    import: () => import('../../raw/2019-12-29-forestry-io-un-cms pour-ton-blog-site.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"25d7-TBqWC9WMueSQgWcocvhs6iO2AN8\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2020-01-31-rien-envie-de-faire-ou-l-envie-de-ne-rien-faire.md"]: {
    import: () => import('../../raw/2020-01-31-rien-envie-de-faire-ou-l-envie-de-ne-rien-faire.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"151e-dMKPrQ5nsFNaZnJYkfBdHWA9XKo\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2020-03-04-design-yellowgist.md"]: {
    import: () => import('../../raw/2020-03-04-design-yellowgist.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"3a4f-APAcK3IiHWuwvyFAAdcjybVP9Xg\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2020-03-30-yellowatch-veille-tech-du-30 mars-2020.md"]: {
    import: () => import('../../raw/2020-03-30-yellowatch-veille-tech-du-30 mars-2020.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"4c3a-FZNpCYnrpQuH4swaG17rMlZpBhQ\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2020-05-21-on-a-avorte.md"]: {
    import: () => import('../../raw/2020-05-21-on-a-avorte.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1cc2-QIdaptjcSotZgkzoQQOqmy7ma3A\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2021-02-10-moi-formateur.md"]: {
    import: () => import('../../raw/2021-02-10-moi-formateur.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1671-GLzEFpAzIxy3jGvBN4k+2ydHrlg\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2021-05-21-des-claviers-encore-des-claviers.md"]: {
    import: () => import('../../raw/2021-05-21-des-claviers-encore-des-claviers.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"54d5-rR8WXfCR2WRkbe9TJMplZphr+xE\"","mtime":"2024-08-08T07:59:00.745Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:2022-04-24-web3-yellowgist.md"]: {
    import: () => import('../../raw/2022-04-24-web3-yellowgist.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"2b15-3nHTQaErkVKBuX9HWVieDOUFS7w\"","mtime":"2024-08-08T07:59:00.747Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:Artistes--Tenez--un-conseil-prim.md"]: {
    import: () => import('../../raw/Artistes--Tenez--un-conseil-prim.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"135a-6J4sgGqe3i2BRl+Xzu/DUVjtO5o\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:Ce-serait-vraiment-bien-si.md"]: {
    import: () => import('../../raw/Ce-serait-vraiment-bien-si.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1154-vwkGZGKVcu6ChMK5UF2pZNrjfJY\"","mtime":"2024-08-08T07:59:00.746Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:Je-ralise-mes-rves--ma-DUCATI.md"]: {
    import: () => import('../../raw/Je-ralise-mes-rves--ma-DUCATI.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1209-/dhHOHvI1ldKvFa1GBbRwleOCFE\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:Un-retour-peut-etre.md"]: {
    import: () => import('../../raw/Un-retour-peut-etre.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"1013-MDU0NOzInlAacUEHQQf9sbiXZJQ\"","mtime":"2024-08-08T07:59:00.748Z"}
  },
  ["nitro:bundled:cache:content:parsed:content:blog:cho-kache.md"]: {
    import: () => import('../../raw/cho-kache.mjs').then(r => r.default || r),
    meta: {"type":"text/markdown; charset=utf-8","etag":"\"116d-0ndaoF5U2YWoyAc8dESoSDtSj7E\"","mtime":"2024-08-08T07:59:00.747Z"}
  }
};

const normalizeKey$1 = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey$1(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey$1(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey$1(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.replace(/[/\\]/g, ":").replace(/^:|:$/g, "");
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        const dirFiles = await readdirRecursive(entryPath, ignore);
        files.push(...dirFiles.map((f) => entry.name + "/" + f));
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.\:|\.\.$/;
const DRIVER_NAME$2 = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME$2, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME$2,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME$2,
    options: opts,
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys() {
      return readdirRecursive(r("."), opts.ignore);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const OVERLAY_REMOVED = "__OVERLAY_REMOVED__";
const DRIVER_NAME$1 = "overlay";
const overlay = defineDriver((options) => {
  return {
    name: DRIVER_NAME$1,
    options,
    async hasItem(key, opts) {
      for (const layer of options.layers) {
        if (await layer.hasItem(key, opts)) {
          if (layer === options.layers[0]) {
            if (await options.layers[0]?.getItem(key) === OVERLAY_REMOVED) {
              return false;
            }
          }
          return true;
        }
      }
      return false;
    },
    async getItem(key) {
      for (const layer of options.layers) {
        const value = await layer.getItem(key);
        if (value === OVERLAY_REMOVED) {
          return null;
        }
        if (value !== null) {
          return value;
        }
      }
      return null;
    },
    // TODO: Support native meta
    // async getMeta (key) {},
    async setItem(key, value, opts) {
      await options.layers[0]?.setItem?.(key, value, opts);
    },
    async removeItem(key, opts) {
      await options.layers[0]?.setItem?.(key, OVERLAY_REMOVED, opts);
    },
    async getKeys(base, opts) {
      const allKeys = await Promise.all(
        options.layers.map(async (layer) => {
          const keys = await layer.getKeys(base, opts);
          return keys.map((key) => normalizeKey(key));
        })
      );
      const uniqueKeys = Array.from(new Set(allKeys.flat()));
      const existingKeys = await Promise.all(
        uniqueKeys.map(async (key) => {
          if (await options.layers[0]?.getItem(key) === OVERLAY_REMOVED) {
            return false;
          }
          return key;
        })
      );
      return existingKeys.filter(Boolean);
    },
    async dispose() {
      await Promise.all(
        options.layers.map(async (layer) => {
          if (layer.dispose) {
            await layer.dispose();
          }
        })
      );
    }
  };
});

const DRIVER_NAME = "memory";
const memoryDriver = defineDriver(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME,
    options: {},
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return Array.from(data.keys());
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"/Users/marvinl/Documents/DEV/macojaune-web/.data/kv"}));

const bundledStorage = ["/cache/content"];
for (const base of bundledStorage) {
  storage.mount(base, overlay({
    layers: [
      memoryDriver(),
      // TODO
      // prefixStorage(storage, base),
      prefixStorage(storage, 'assets:nitro:bundled:' + base)
    ]
  }));
}

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[nitro] [cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          const promise = useStorage().setItem(cacheKey, entry).catch((error) => {
            console.error(`[nitro] [cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event && event.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[nitro] [cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length > 0 ? hash(args, {}) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      const _pathname = escapeKey(decodeURI(parseURL$2(_path).pathname)).slice(0, 16) || "index";
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        variableHeaders[header] = incomingEvent.node.req.headers[header];
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            for (const header in headers2) {
              this.setHeader(header, headers2[header]);
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.context = incomingEvent.context;
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(event);
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        event.node.res.setHeader(name, value);
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function normalizeError(error) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}
function _captureError(error, type) {
  console.error(`[nitro] [${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL$2(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery$2(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL$2(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery$2(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

const plugins = [
  
];

const HASH_RE$1 = /#/g;
const AMPERSAND_RE$1 = /&/g;
const SLASH_RE$1 = /\//g;
const EQUAL_RE$1 = /=/g;
const PLUS_RE$1 = /\+/g;
const ENC_CARET_RE$1 = /%5e/gi;
const ENC_BACKTICK_RE$1 = /%60/gi;
const ENC_PIPE_RE$1 = /%7c/gi;
const ENC_SPACE_RE$1 = /%20/gi;
function encode$1(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE$1, "|");
}
function encodeQueryValue$1(input) {
  return encode$1(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE$1, "%2B").replace(ENC_SPACE_RE$1, "+").replace(HASH_RE$1, "%23").replace(AMPERSAND_RE$1, "%26").replace(ENC_BACKTICK_RE$1, "`").replace(ENC_CARET_RE$1, "^").replace(SLASH_RE$1, "%2F");
}
function encodeQueryKey$1(text) {
  return encodeQueryValue$1(text).replace(EQUAL_RE$1, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey$1(text) {
  return decode$1(text.replace(PLUS_RE$1, " "));
}
function decodeQueryValue$1(text) {
  return decode$1(text.replace(PLUS_RE$1, " "));
}

function parseQuery$1(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey$1(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue$1(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem$1(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey$1(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey$1(key)}=${encodeQueryValue$1(_value)}`).join("&");
  }
  return `${encodeQueryKey$1(key)}=${encodeQueryValue$1(value)}`;
}
function stringifyQuery$1(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem$1(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX$1 = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX$1 = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX$1 = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE$1 = /^\.?\//;
function hasProtocol$1(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX$1.test(inputString);
  }
  return PROTOCOL_REGEX$1.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX$1.test(inputString) : false);
}
function withTrailingSlash$1(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function withQuery$1(input, query) {
  const parsed = parseURL$1(input);
  const mergedQuery = { ...parseQuery$1(parsed.search), ...query };
  parsed.search = stringifyQuery$1(mergedQuery);
  return stringifyParsedURL$1(parsed);
}
function isNonEmptyURL$1(url) {
  return url && url !== "/";
}
function joinURL$1(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL$1(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE$1, "");
      url = withTrailingSlash$1(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol$1(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative$1 = Symbol.for("ufo:protocolRelative");
function parseURL$1(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol$1(input, { acceptRelative: true })) {
    return parsePath$1(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  const [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  const { pathname, search, hash } = parsePath$1(
    path.replace(/\/(?=[A-Za-z]:)/, "")
  );
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative$1]: !protocol
  };
}
function parsePath$1(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL$1(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative$1] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.path,
    statusCode,
    statusMessage,
    message,
    stack: "",
    // TODO: check and validate error.data for serialisation into query
    data: error.data
  };
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (event.handled) {
    return;
  }
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    return send(event, JSON.stringify(errorObject));
  }
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery$1(joinURL$1(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (!res) {
    const { template } = await import('../../_/error-500.mjs');
    if (event.handled) {
      return;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  if (event.handled) {
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
  return send(event, html);
});

const assets = {
  "/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"2804-XPqXLWj8kBOlgzPNH49OcuDdqLU\"",
    "mtime": "2024-08-08T07:59:00.656Z",
    "size": 10244,
    "path": "../public/.DS_Store"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"47e-bqxSIpuZUasBtput7mBu74tjM50\"",
    "mtime": "2024-08-08T07:59:00.658Z",
    "size": 1150,
    "path": "../public/favicon.ico"
  },
  "/icon.png": {
    "type": "image/png",
    "etag": "\"d02f-23S9P2qEpyEbw3msfNVfMS5pA10\"",
    "mtime": "2024-08-08T07:59:00.662Z",
    "size": 53295,
    "path": "../public/icon.png"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"18-DBFBhvs62ls69Xnj+zfm/NwOmv0\"",
    "mtime": "2024-08-08T07:59:00.663Z",
    "size": 24,
    "path": "../public/robots.txt"
  },
  "/admin/.gitignore": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"12-TFX3Pg/FlmmvKZkEukYTYhTKTfQ\"",
    "mtime": "2024-08-08T07:58:59.828Z",
    "size": 18,
    "path": "../public/admin/.gitignore"
  },
  "/admin/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"72a-0so1hxUjmj+eyJ3U8w37V8CEBSI\"",
    "mtime": "2024-08-08T07:58:59.933Z",
    "size": 1834,
    "path": "../public/admin/index.html"
  },
  "/_nuxt/1itAcQdi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13b-N8esvjLoR14H78s3C3Lmc/rxIds\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 315,
    "path": "../public/_nuxt/1itAcQdi.js"
  },
  "/_nuxt/4mJqVQM8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ab-8cx+sheDccJpdtMe6pnxMtqtw4Q\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 171,
    "path": "../public/_nuxt/4mJqVQM8.js"
  },
  "/_nuxt/67w0ZCNd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"95c-AFA/WHahPuYDQVjwFynTDVkmeeA\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 2396,
    "path": "../public/_nuxt/67w0ZCNd.js"
  },
  "/_nuxt/8Mno1ogy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b8a-W630+ZRvWjuoaRP1fzZZbZuWSao\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 2954,
    "path": "../public/_nuxt/8Mno1ogy.js"
  },
  "/_nuxt/B30MCGxM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-dZdHb+C7BnMdRyyZBME4aVsG2VU\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 207,
    "path": "../public/_nuxt/B30MCGxM.js"
  },
  "/_nuxt/BA7RDG0L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"164f-W3qiF4xsts4AHf73j7NuTxX2qXQ\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 5711,
    "path": "../public/_nuxt/BA7RDG0L.js"
  },
  "/_nuxt/BAuQZ0l3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-jXx7HBMI7reNyHYJ9pYRghHuIbY\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 207,
    "path": "../public/_nuxt/BAuQZ0l3.js"
  },
  "/_nuxt/BCJnMJ4P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"54b3-RU1zC1SksQzELj9BhhZNkA0+WXs\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 21683,
    "path": "../public/_nuxt/BCJnMJ4P.js"
  },
  "/_nuxt/BDHcVqZw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bcf-qBOQVLLGYbT9eAxo9p/JeHNmgCw\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 3023,
    "path": "../public/_nuxt/BDHcVqZw.js"
  },
  "/_nuxt/BVfltJ3Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d3-IT+Rv5aPbhYefduDippVmjg50eU\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 211,
    "path": "../public/_nuxt/BVfltJ3Y.js"
  },
  "/_nuxt/BbwKarqr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17b-kDwxH1rcyiV6DUJPPwn3hT5ug6k\"",
    "mtime": "2024-08-08T07:58:59.792Z",
    "size": 379,
    "path": "../public/_nuxt/BbwKarqr.js"
  },
  "/_nuxt/BcfPUx3P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-mKKN8Bi24W6x/g4OhcLS6sinhc0\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 207,
    "path": "../public/_nuxt/BcfPUx3P.js"
  },
  "/_nuxt/BdMPgPrL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11a-9fZYgeRigOAPrZM3SFblhI0W0Ww\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 282,
    "path": "../public/_nuxt/BdMPgPrL.js"
  },
  "/_nuxt/BextT2R9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-M7s9X1jO6TA6YOw+Py6ncM5qNJg\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 207,
    "path": "../public/_nuxt/BextT2R9.js"
  },
  "/_nuxt/Bk13dZ_l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-WFsP++LmgyLVQgs+aq7L4oN4tx8\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 207,
    "path": "../public/_nuxt/Bk13dZ_l.js"
  },
  "/_nuxt/BsWfLpGy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9c4-8Y1/y7xe4d7NIEAg1aBqPnzSlis\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 2500,
    "path": "../public/_nuxt/BsWfLpGy.js"
  },
  "/_nuxt/Bt2mXL16.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ce-l4ejdZvUUMyRpokFlIhUc8/4fmw\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 206,
    "path": "../public/_nuxt/Bt2mXL16.js"
  },
  "/_nuxt/BzUn-7FM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9eb8-4b80IrepHby15LMCNntORBsoFZE\"",
    "mtime": "2024-08-08T07:58:59.794Z",
    "size": 40632,
    "path": "../public/_nuxt/BzUn-7FM.js"
  },
  "/_nuxt/C-v3KzvZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ea-5DAAbu6tArfeYyY6Qf21UAkKRUs\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 746,
    "path": "../public/_nuxt/C-v3KzvZ.js"
  },
  "/_nuxt/C2JJD8N1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d-0tt9kN+Sr8jAHeXJ1Litqzy9O30\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 573,
    "path": "../public/_nuxt/C2JJD8N1.js"
  },
  "/_nuxt/C2o1q9wR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d1-tePChAlpMSFf8o3TsHHhxcKICBI\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 721,
    "path": "../public/_nuxt/C2o1q9wR.js"
  },
  "/_nuxt/C5S46NFB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ed8a-9cXpkyBmTSIncKMH9TiUfwS5L6Q\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 60810,
    "path": "../public/_nuxt/C5S46NFB.js"
  },
  "/_nuxt/CECjSeQN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c3b-qtt8lFBr127rV0qHiRYbnrr0Jms\"",
    "mtime": "2024-08-08T07:58:59.793Z",
    "size": 3131,
    "path": "../public/_nuxt/CECjSeQN.js"
  },
  "/_nuxt/CIGTmQr-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20c-377mm1trofbx8779M8HuXC9mCps\"",
    "mtime": "2024-08-08T07:58:59.794Z",
    "size": 524,
    "path": "../public/_nuxt/CIGTmQr-.js"
  },
  "/_nuxt/CLR0pWxB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36c-P4CTDENedonJIhtcViL0gNMssIs\"",
    "mtime": "2024-08-08T07:58:59.794Z",
    "size": 876,
    "path": "../public/_nuxt/CLR0pWxB.js"
  },
  "/_nuxt/COL0k1lo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d-cMqmE0O0YONtmy7cuBHJKGlp7c8\"",
    "mtime": "2024-08-08T07:58:59.794Z",
    "size": 573,
    "path": "../public/_nuxt/COL0k1lo.js"
  },
  "/_nuxt/COuvC_4m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"347b-3Bnpqd8uEuu1mdrTmwezYbmnpos\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 13435,
    "path": "../public/_nuxt/COuvC_4m.js"
  },
  "/_nuxt/CRRXwYJ_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1179-32GWDX/OcAn/8y0VV/TlyAMIvDw\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 4473,
    "path": "../public/_nuxt/CRRXwYJ_.js"
  },
  "/_nuxt/CXLP6oQD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e9-JhtG2xjU5jpbO/j7B/ydIe0QoDI\"",
    "mtime": "2024-08-08T07:58:59.794Z",
    "size": 2025,
    "path": "../public/_nuxt/CXLP6oQD.js"
  },
  "/_nuxt/CZVKObis.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"99-9vNk38HCve189ZSqMCAjXIGQz5M\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 153,
    "path": "../public/_nuxt/CZVKObis.js"
  },
  "/_nuxt/C_gRvYTm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aa4-vFO1GPce9N+041XwPo1OGrJLDfw\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 2724,
    "path": "../public/_nuxt/C_gRvYTm.js"
  },
  "/_nuxt/CbURklIN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ef-zZgk5r0Ef9YJd/R6h5EzF9XFm7M\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 751,
    "path": "../public/_nuxt/CbURklIN.js"
  },
  "/_nuxt/Cc0ZhJja.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2-0XsxwPeBqgx+hohXwt0U8MzvSV4\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 210,
    "path": "../public/_nuxt/Cc0ZhJja.js"
  },
  "/_nuxt/CcJJxlw2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ace-dfBuMbhXPZCiFhzwFHjL4dDNEhY\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 2766,
    "path": "../public/_nuxt/CcJJxlw2.js"
  },
  "/_nuxt/Cgxh1svJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2167-6FFrY/srjxdfxRJ1eJ3/dXpPUhE\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 8551,
    "path": "../public/_nuxt/Cgxh1svJ.js"
  },
  "/_nuxt/ChoT5QJB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10ea-Cknm24Ka7ueiMkrcZKi1EPEH6Ko\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 4330,
    "path": "../public/_nuxt/ChoT5QJB.js"
  },
  "/_nuxt/Cj2RBtPT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b6-s2MR3bvgWF32aD4Yl6cWjaUJfYI\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 694,
    "path": "../public/_nuxt/Cj2RBtPT.js"
  },
  "/_nuxt/Cpj98o6Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ec-QtY1KaLA8vnMK3l2IvajpxyuPmY\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 236,
    "path": "../public/_nuxt/Cpj98o6Y.js"
  },
  "/_nuxt/Crl73c9p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"72c-WdhGQQilefksc8hS2iRECXG1xhw\"",
    "mtime": "2024-08-08T07:58:59.795Z",
    "size": 1836,
    "path": "../public/_nuxt/Crl73c9p.js"
  },
  "/_nuxt/CyFLiFcP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2-DbgP/u+vIZA8FQh9T5Ff+9+mRMk\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 210,
    "path": "../public/_nuxt/CyFLiFcP.js"
  },
  "/_nuxt/CzzqKoLM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14d-guv20zz8TdXqr3sChON4e0UPLic\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 333,
    "path": "../public/_nuxt/CzzqKoLM.js"
  },
  "/_nuxt/D-KPdEy7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ca-6mijUJknjari3iz/fgRjRD5ZyeQ\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 202,
    "path": "../public/_nuxt/D-KPdEy7.js"
  },
  "/_nuxt/D1eosTY1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10a1-fWGVu/ZCLNmeZx0/VzevbvG2Dp4\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 4257,
    "path": "../public/_nuxt/D1eosTY1.js"
  },
  "/_nuxt/D1iuW2M8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bf3-7BErdyQjxKMMpnVjCJJRkfYQPBM\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 3059,
    "path": "../public/_nuxt/D1iuW2M8.js"
  },
  "/_nuxt/DEIozXMi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"237-cD2PFz3f0ygbitxgVWU2vQQnvvg\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 567,
    "path": "../public/_nuxt/DEIozXMi.js"
  },
  "/_nuxt/DKtO6K8a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5e85-/9Ora8nqGBTcN3Ysvq2MKNt3yNA\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 24197,
    "path": "../public/_nuxt/DKtO6K8a.js"
  },
  "/_nuxt/DSUjlJwx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d-tNgvXPtbb9D/hJyucnC9imqY5uM\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 573,
    "path": "../public/_nuxt/DSUjlJwx.js"
  },
  "/_nuxt/DZz55msv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d1-/Lwmq4WW24gZR/J+z9Xd+bjnpkQ\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 465,
    "path": "../public/_nuxt/DZz55msv.js"
  },
  "/_nuxt/DaG4y3J9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"926-wcz11JgYG8q5mklhRizTr22CTJY\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 2342,
    "path": "../public/_nuxt/DaG4y3J9.js"
  },
  "/_nuxt/DabpUYHh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"375-NK6r66woGjO5fyuszyKNkkRH2+0\"",
    "mtime": "2024-08-08T07:58:59.796Z",
    "size": 885,
    "path": "../public/_nuxt/DabpUYHh.js"
  },
  "/_nuxt/DcRUaPBC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4e-yAFY/kV3NXJfC4qedSEMFnJos1o\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 78,
    "path": "../public/_nuxt/DcRUaPBC.js"
  },
  "/_nuxt/DipYG4pL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1168-nQQbbCpSpLjW3f9OtNKVFWopAE0\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 4456,
    "path": "../public/_nuxt/DipYG4pL.js"
  },
  "/_nuxt/DlAUqK2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b-eFCz/UrraTh721pgAl0VxBNR1es\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 91,
    "path": "../public/_nuxt/DlAUqK2U.js"
  },
  "/_nuxt/Dnd51l0P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"454-nRFS6XJvhFXjKl5SUYB6FRqWSOU\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 1108,
    "path": "../public/_nuxt/Dnd51l0P.js"
  },
  "/_nuxt/DpXI2ZI8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-c9l77uyX2Vx+x4o/fr9F8pdwn6g\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 207,
    "path": "../public/_nuxt/DpXI2ZI8.js"
  },
  "/_nuxt/DyE1UV5R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2-LWMkNY3u5wUhLsk7YiyRZQx913s\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 210,
    "path": "../public/_nuxt/DyE1UV5R.js"
  },
  "/_nuxt/Hh9UIHuH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"101e-vmiBb3JsBS5LRlZy05bmy8EozzY\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 4126,
    "path": "../public/_nuxt/Hh9UIHuH.js"
  },
  "/_nuxt/KGRcU5QF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"458-q0Oxc1CHfms8vShWspxfHapEAm0\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 1112,
    "path": "../public/_nuxt/KGRcU5QF.js"
  },
  "/_nuxt/ProsePre.CchFRBtv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2e-GbvrqT5j9gSWlpa8e36U/Kv6Zx0\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 46,
    "path": "../public/_nuxt/ProsePre.CchFRBtv.css"
  },
  "/_nuxt/WPgs8xoL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"90-1llIGDArLm/mnOjZb+GhtglASlY\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 144,
    "path": "../public/_nuxt/WPgs8xoL.js"
  },
  "/_nuxt/XIgi3NvZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d9-W/SyQcmrv+u3LSgzbxo+TiGJ2sI\"",
    "mtime": "2024-08-08T07:58:59.797Z",
    "size": 1241,
    "path": "../public/_nuxt/XIgi3NvZ.js"
  },
  "/_nuxt/_productSlug_.D6RoJONZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"31-tTBDhfTTuV/xDaPfgNeYTIceHLc\"",
    "mtime": "2024-08-08T07:58:59.798Z",
    "size": 49,
    "path": "../public/_nuxt/_productSlug_.D6RoJONZ.css"
  },
  "/_nuxt/acTAl3uS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"293a0-xzveZoM11heYtw3rXYKj4E7PSOc\"",
    "mtime": "2024-08-08T07:58:59.801Z",
    "size": 168864,
    "path": "../public/_nuxt/acTAl3uS.js"
  },
  "/_nuxt/axwpfyAk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ee7a-yYa6bGLWYkyNI3F/UHOJyp6yBRA\"",
    "mtime": "2024-08-08T07:58:59.799Z",
    "size": 61050,
    "path": "../public/_nuxt/axwpfyAk.js"
  },
  "/_nuxt/cf8i6z_s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"42d-Za2gtwVHM/V45GmBqaXPgCYvnpE\"",
    "mtime": "2024-08-08T07:58:59.798Z",
    "size": 1069,
    "path": "../public/_nuxt/cf8i6z_s.js"
  },
  "/_nuxt/entry.CCAcP7Uk.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4d95-2CMcnZ7gDwvnT5wEZCGRdtkZka8\"",
    "mtime": "2024-08-08T07:58:59.799Z",
    "size": 19861,
    "path": "../public/_nuxt/entry.CCAcP7Uk.css"
  },
  "/_nuxt/error-404.JekaaCis.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"de4-+wA7grMyiBYWUxUrDrQgnZGsVuQ\"",
    "mtime": "2024-08-08T07:58:59.798Z",
    "size": 3556,
    "path": "../public/_nuxt/error-404.JekaaCis.css"
  },
  "/_nuxt/error-500.CNP9nqm1.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75c-Juu+xpvMf6y/oBf0WsXvPEH0ie4\"",
    "mtime": "2024-08-08T07:58:59.798Z",
    "size": 1884,
    "path": "../public/_nuxt/error-500.CNP9nqm1.css"
  },
  "/_nuxt/faffLu6w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d1-c0vLveh+vOc5L06xAww728PVlVM\"",
    "mtime": "2024-08-08T07:58:59.799Z",
    "size": 209,
    "path": "../public/_nuxt/faffLu6w.js"
  },
  "/_nuxt/gpKhfdTg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ad-ARYJVuGfg00IoEDVkE3mHdNLqyM\"",
    "mtime": "2024-08-08T07:58:59.799Z",
    "size": 941,
    "path": "../public/_nuxt/gpKhfdTg.js"
  },
  "/_nuxt/jYLzKGRL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d-TXRiyCFtUbciR47Ukptb+hq4jCA\"",
    "mtime": "2024-08-08T07:58:59.799Z",
    "size": 573,
    "path": "../public/_nuxt/jYLzKGRL.js"
  },
  "/_nuxt/links.Co47y-gR.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"416-tmBbuHBv1Lh/HiNV2Ks9m9fGUdo\"",
    "mtime": "2024-08-08T07:58:59.800Z",
    "size": 1046,
    "path": "../public/_nuxt/links.Co47y-gR.css"
  },
  "/_nuxt/m75asj6d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30ff-iTtkb4n3e0LaoPkJPVVVQ/zA1cM\"",
    "mtime": "2024-08-08T07:58:59.800Z",
    "size": 12543,
    "path": "../public/_nuxt/m75asj6d.js"
  },
  "/_nuxt/nHmRWIT0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1553-bhhLuHNAB+yQ75daymevsSz0Tyc\"",
    "mtime": "2024-08-08T07:58:59.800Z",
    "size": 5459,
    "path": "../public/_nuxt/nHmRWIT0.js"
  },
  "/_nuxt/pe1Ten_8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d-WljMVcsoptp7+ENhPNOzLarhGAA\"",
    "mtime": "2024-08-08T07:58:59.800Z",
    "size": 573,
    "path": "../public/_nuxt/pe1Ten_8.js"
  },
  "/_nuxt/xw0fqDge.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e0e-kWnsRcWfgcsczvk9J7UUBF/vIgg\"",
    "mtime": "2024-08-08T07:58:59.800Z",
    "size": 3598,
    "path": "../public/_nuxt/xw0fqDge.js"
  },
  "/_nuxt/xxiRSjbs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d7-ZHRJDcjVnvbhYnMHmAycD2oSR/A\"",
    "mtime": "2024-08-08T07:58:59.800Z",
    "size": 215,
    "path": "../public/_nuxt/xxiRSjbs.js"
  },
  "/pictures/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"2804-lNuD8yo5DqHujANukcJLwNLwTJY\"",
    "mtime": "2024-08-08T07:58:59.829Z",
    "size": 10244,
    "path": "../public/pictures/.DS_Store"
  },
  "/pictures/MCO09198 (Large).jpg": {
    "type": "image/jpeg",
    "etag": "\"7c71b-ZqDzc1QkUw1Mb1yIzraBOERkLFo\"",
    "mtime": "2024-08-08T07:58:59.939Z",
    "size": 509723,
    "path": "../public/pictures/MCO09198 (Large).jpg"
  },
  "/pictures/MCO09234 (Large).jpg": {
    "type": "image/jpeg",
    "etag": "\"26925-d1if1G0bw/g8Q3B4DxfOIJKPR2s\"",
    "mtime": "2024-08-08T07:58:59.945Z",
    "size": 157989,
    "path": "../public/pictures/MCO09234 (Large).jpg"
  },
  "/pictures/MCO09842.jpg": {
    "type": "image/jpeg",
    "etag": "\"d781f-XWE/cYZHZNCBT46A8TuXAKHsNL4\"",
    "mtime": "2024-08-08T07:58:59.964Z",
    "size": 882719,
    "path": "../public/pictures/MCO09842.jpg"
  },
  "/pictures/MCO09875.jpg": {
    "type": "image/jpeg",
    "etag": "\"92e2d-kaI5f/VEz3JYsrrfp9fR8Zre/c4\"",
    "mtime": "2024-08-08T07:58:59.946Z",
    "size": 601645,
    "path": "../public/pictures/MCO09875.jpg"
  },
  "/pictures/dsc01725.jpg": {
    "type": "image/jpeg",
    "etag": "\"120663-TsWjd4M0yh2BRe0ePFT9eEkQT+c\"",
    "mtime": "2024-08-08T07:58:59.951Z",
    "size": 1181283,
    "path": "../public/pictures/dsc01725.jpg"
  },
  "/pictures/dsc01730.jpg": {
    "type": "image/jpeg",
    "etag": "\"af978-IU1yS0yVNut1hOO+yysHZ/kbue0\"",
    "mtime": "2024-08-08T07:58:59.956Z",
    "size": 719224,
    "path": "../public/pictures/dsc01730.jpg"
  },
  "/pictures/dsc01742.jpg": {
    "type": "image/jpeg",
    "etag": "\"21d831-N/gHkNt7sj6GV4Bj1hgdunw1OSs\"",
    "mtime": "2024-08-08T07:58:59.974Z",
    "size": 2218033,
    "path": "../public/pictures/dsc01742.jpg"
  },
  "/pictures/dsc01758.jpg": {
    "type": "image/jpeg",
    "etag": "\"27cc03-XBqw0NEj2meV5+3ihpy5n+JRwzg\"",
    "mtime": "2024-08-08T07:58:59.981Z",
    "size": 2608131,
    "path": "../public/pictures/dsc01758.jpg"
  },
  "/pictures/dsc01771.jpg": {
    "type": "image/jpeg",
    "etag": "\"11a52b-qSxuIZ+wFRdgXRSLs3s8SYS/cDY\"",
    "mtime": "2024-08-08T07:58:59.967Z",
    "size": 1156395,
    "path": "../public/pictures/dsc01771.jpg"
  },
  "/pictures/dsc01781.jpg": {
    "type": "image/jpeg",
    "etag": "\"12b3b7-a3guA3isxxGAmm8GjCPWQiNK/cw\"",
    "mtime": "2024-08-08T07:58:59.980Z",
    "size": 1225655,
    "path": "../public/pictures/dsc01781.jpg"
  },
  "/pictures/dsc01798.jpg": {
    "type": "image/jpeg",
    "etag": "\"1cd34d-MNY+nuzkBsCkarjDoplcGjQzzv0\"",
    "mtime": "2024-08-08T07:59:00.016Z",
    "size": 1889101,
    "path": "../public/pictures/dsc01798.jpg"
  },
  "/pictures/dsc01800.jpg": {
    "type": "image/jpeg",
    "etag": "\"15569c-H6qOaweS+nPuuU7SVIaLUv/0lxw\"",
    "mtime": "2024-08-08T07:59:00.061Z",
    "size": 1398428,
    "path": "../public/pictures/dsc01800.jpg"
  },
  "/pictures/dsc01802.jpg": {
    "type": "image/jpeg",
    "etag": "\"21cf72-Nz05bZ4T7GrZ3xmE5zdk6w2th1w\"",
    "mtime": "2024-08-08T07:59:00.005Z",
    "size": 2215794,
    "path": "../public/pictures/dsc01802.jpg"
  },
  "/pictures/dsc01807.jpg": {
    "type": "image/jpeg",
    "etag": "\"1c7d20-HkOxjb2z9KXVWOIAQdfduW6PT4A\"",
    "mtime": "2024-08-08T07:59:00.016Z",
    "size": 1867040,
    "path": "../public/pictures/dsc01807.jpg"
  },
  "/pictures/dsc06252-1.jpg": {
    "type": "image/jpeg",
    "etag": "\"95551-nCKpjGmgX71rO1/YCe8kCMN6rj8\"",
    "mtime": "2024-08-08T07:59:00.028Z",
    "size": 611665,
    "path": "../public/pictures/dsc06252-1.jpg"
  },
  "/pictures/dsc06261.jpg": {
    "type": "image/jpeg",
    "etag": "\"a6435-jz48biEd5jzSzKtc6u941iEgW6Y\"",
    "mtime": "2024-08-08T07:59:00.031Z",
    "size": 681013,
    "path": "../public/pictures/dsc06261.jpg"
  },
  "/pictures/dsc06270.jpg": {
    "type": "image/jpeg",
    "etag": "\"76dd6-CpgGp+9n535ADKiEoOOJ4peGHE0\"",
    "mtime": "2024-08-08T07:59:00.035Z",
    "size": 486870,
    "path": "../public/pictures/dsc06270.jpg"
  },
  "/pictures/dsc08950.jpg": {
    "type": "image/jpeg",
    "etag": "\"1078cb-Pm2a0p/9qpFLAZ10QMrRLv33JuU\"",
    "mtime": "2024-08-08T07:59:00.058Z",
    "size": 1079499,
    "path": "../public/pictures/dsc08950.jpg"
  },
  "/pictures/dsc09578-1.jpg": {
    "type": "image/jpeg",
    "etag": "\"6215c-azK+5NU/JFRVOwhAU+0EfYErkXA\"",
    "mtime": "2024-08-08T07:59:00.072Z",
    "size": 401756,
    "path": "../public/pictures/dsc09578-1.jpg"
  },
  "/pictures/insta_dsc07643.jpg": {
    "type": "image/jpeg",
    "etag": "\"183a9f-Tytu6hfIC326alucHVfWirx+pXo\"",
    "mtime": "2024-08-08T07:59:00.084Z",
    "size": 1587871,
    "path": "../public/pictures/insta_dsc07643.jpg"
  },
  "/pictures/insta_dsc07681-2.jpg": {
    "type": "image/jpeg",
    "etag": "\"13571d-6XAtcrDuaWW0Adh9N9OrMFzOWME\"",
    "mtime": "2024-08-08T07:59:00.073Z",
    "size": 1267485,
    "path": "../public/pictures/insta_dsc07681-2.jpg"
  },
  "/pictures/insta_dsc07780.jpg": {
    "type": "image/jpeg",
    "etag": "\"11b73e-RzKl5qx3zHb5W0QzLWKNxkrrs+Y\"",
    "mtime": "2024-08-08T07:59:00.092Z",
    "size": 1161022,
    "path": "../public/pictures/insta_dsc07780.jpg"
  },
  "/pictures/insta_dsc09720-4.jpg": {
    "type": "image/jpeg",
    "etag": "\"6f841-fGYKLsxlrduVI3IYQMyPcqNMuhA\"",
    "mtime": "2024-08-08T07:59:00.077Z",
    "size": 456769,
    "path": "../public/pictures/insta_dsc09720-4.jpg"
  },
  "/pictures/insta_dsc09845.jpg": {
    "type": "image/jpeg",
    "etag": "\"6b58f-LGKHUMVfaSEFl0oBshW7MytZiic\"",
    "mtime": "2024-08-08T07:59:00.084Z",
    "size": 439695,
    "path": "../public/pictures/insta_dsc09845.jpg"
  },
  "/pictures/insta_dsc09863.jpg": {
    "type": "image/jpeg",
    "etag": "\"42bff-LNOkbg4wnCi0VriKHUcjouaqA70\"",
    "mtime": "2024-08-08T07:59:00.085Z",
    "size": 273407,
    "path": "../public/pictures/insta_dsc09863.jpg"
  },
  "/pictures/joranieBeach1.png": {
    "type": "image/png",
    "etag": "\"4fe7e9-eQ98tHqX8OmhLbz7/QYaQqBOILs\"",
    "mtime": "2024-08-08T07:59:00.226Z",
    "size": 5236713,
    "path": "../public/pictures/joranieBeach1.png"
  },
  "/pictures/joraniebeach1-1.png": {
    "type": "image/png",
    "etag": "\"4fe7e9-eQ98tHqX8OmhLbz7/QYaQqBOILs\"",
    "mtime": "2024-08-08T07:59:00.226Z",
    "size": 5236713,
    "path": "../public/pictures/joraniebeach1-1.png"
  },
  "/pictures/monsterYellow.jpg": {
    "type": "image/jpeg",
    "etag": "\"7a1e1-yuMTnVWjuWQK1br8K7Lpv7iuXro\"",
    "mtime": "2024-08-08T07:59:00.100Z",
    "size": 500193,
    "path": "../public/pictures/monsterYellow.jpg"
  },
  "/pictures/nature.jpg": {
    "type": "image/jpeg",
    "etag": "\"29d88-fa8rL5HCJ1q7aSyX2c65iyGuawo\"",
    "mtime": "2024-08-08T07:59:00.097Z",
    "size": 171400,
    "path": "../public/pictures/nature.jpg"
  },
  "/pictures/pcs-dee.jpg": {
    "type": "image/jpeg",
    "etag": "\"26b08-T5WfjwoPwx5YuEbmRsnqpukLQ5Y\"",
    "mtime": "2024-08-08T07:59:00.102Z",
    "size": 158472,
    "path": "../public/pictures/pcs-dee.jpg"
  },
  "/pictures/pcs-dorure1.jpg": {
    "type": "image/jpeg",
    "etag": "\"14c51-AL1101ba/n1yB/cVJZTYrrCIFyw\"",
    "mtime": "2024-08-08T07:59:00.103Z",
    "size": 85073,
    "path": "../public/pictures/pcs-dorure1.jpg"
  },
  "/pictures/pcs-elephant-ears.jpg": {
    "type": "image/jpeg",
    "etag": "\"2265a-VSXg69NdFh8Cgq2m8z2zpBKvNUw\"",
    "mtime": "2024-08-08T07:59:00.106Z",
    "size": 140890,
    "path": "../public/pictures/pcs-elephant-ears.jpg"
  },
  "/pictures/pcs-fanmK.jpg": {
    "type": "image/jpeg",
    "etag": "\"26d4c-8IfVCPW4EJFNJy98JpveAn3L9VU\"",
    "mtime": "2024-08-08T07:59:00.106Z",
    "size": 159052,
    "path": "../public/pictures/pcs-fanmK.jpg"
  },
  "/pictures/pcs-lamp.jpg": {
    "type": "image/jpeg",
    "etag": "\"75e79-nJrf562hX01f/clebHo8E/9/KaE\"",
    "mtime": "2024-08-08T07:59:00.120Z",
    "size": 482937,
    "path": "../public/pictures/pcs-lamp.jpg"
  },
  "/pictures/pcs-mak.jpg": {
    "type": "image/jpeg",
    "etag": "\"a1d05-Mwyd23Y3IoYvEJas+EdOpjp7l7g\"",
    "mtime": "2024-08-08T07:59:00.130Z",
    "size": 662789,
    "path": "../public/pictures/pcs-mak.jpg"
  },
  "/pictures/pcs-paint1.jpg": {
    "type": "image/jpeg",
    "etag": "\"20f31-ltByusVELJqQ58DtjuHGJA5AbA8\"",
    "mtime": "2024-08-08T07:59:00.138Z",
    "size": 134961,
    "path": "../public/pictures/pcs-paint1.jpg"
  },
  "/pictures/pcs-paint2.jpg": {
    "type": "image/jpeg",
    "etag": "\"2165b-U+VdsR19hvM7h0lpiR47kcA6DeU\"",
    "mtime": "2024-08-08T07:59:00.125Z",
    "size": 136795,
    "path": "../public/pictures/pcs-paint2.jpg"
  },
  "/pictures/pcs-smoke.jpg": {
    "type": "image/jpeg",
    "etag": "\"21f8c-7obyoxoE41y4YjGxRX4HP+kOnYc\"",
    "mtime": "2024-08-08T07:59:00.140Z",
    "size": 139148,
    "path": "../public/pictures/pcs-smoke.jpg"
  },
  "/pictures/pexels-bakr-magrabi-9329771.jpg": {
    "type": "image/jpeg",
    "etag": "\"1c3d57-27ydeHVjCOe7wHZpVhrznl8FrY0\"",
    "mtime": "2024-08-08T07:59:00.197Z",
    "size": 1850711,
    "path": "../public/pictures/pexels-bakr-magrabi-9329771.jpg"
  },
  "/pictures/ptiCadreSexy.jpg": {
    "type": "image/jpeg",
    "etag": "\"1ab9a-Ky8b+Spj3YKBzN33EmfMj3XS2Es\"",
    "mtime": "2024-08-08T07:59:00.147Z",
    "size": 109466,
    "path": "../public/pictures/ptiCadreSexy.jpg"
  },
  "/pictures/resizeMCO00391.jpg": {
    "type": "image/jpeg",
    "etag": "\"221afb-IygBezFk6eKm38KX0YvasTdvojo\"",
    "mtime": "2024-08-08T07:59:00.210Z",
    "size": 2235131,
    "path": "../public/pictures/resizeMCO00391.jpg"
  },
  "/api/_content/cache.1723103931526.json": {
    "type": "application/json",
    "etag": "\"8eab2-Sv+KivvrQpN1PkYdo+hYaBzHBo4\"",
    "mtime": "2024-08-08T07:58:59.771Z",
    "size": 584370,
    "path": "../public/api/_content/cache.1723103931526.json"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-9dyEn48jKF1/KxAQdqImuWBvboc\"",
    "mtime": "2024-08-08T07:58:59.781Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/pictures/2016/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-qT7ZQe5CXtqlIjeIg+zi/WUyh/0\"",
    "mtime": "2024-08-08T07:58:59.830Z",
    "size": 6148,
    "path": "../public/pictures/2016/.DS_Store"
  },
  "/pictures/2017/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-8C4tS0lUx57AX2hLPRVckuXDUis\"",
    "mtime": "2024-08-08T07:58:59.829Z",
    "size": 6148,
    "path": "../public/pictures/2017/.DS_Store"
  },
  "/pictures/2018/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-hkzptUhyu0e3af1GmEL+igGXu/w\"",
    "mtime": "2024-08-08T07:58:59.829Z",
    "size": 6148,
    "path": "../public/pictures/2018/.DS_Store"
  },
  "/pictures/2021/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-90yPNozEJkHGwWXUJx51SSME9+0\"",
    "mtime": "2024-08-08T07:58:59.830Z",
    "size": 6148,
    "path": "../public/pictures/2021/.DS_Store"
  },
  "/pictures/2019/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-W62H1W6o9tF/PBLTEWfl36pOLcU\"",
    "mtime": "2024-08-08T07:58:59.829Z",
    "size": 6148,
    "path": "../public/pictures/2019/.DS_Store"
  },
  "/pictures/2020/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-c7mDuOx1wWdd2JmjHwhYL2eCuew\"",
    "mtime": "2024-08-08T07:58:59.830Z",
    "size": 6148,
    "path": "../public/pictures/2020/.DS_Store"
  },
  "/_nuxt/builds/meta/10ca9a8a-41e8-4ae8-be5c-6cbd082e5575.json": {
    "type": "application/json",
    "etag": "\"8b-gTGlMWX3lIgBhG9UUcfwVK7yyJ4\"",
    "mtime": "2024-08-08T07:58:59.778Z",
    "size": 139,
    "path": "../public/_nuxt/builds/meta/10ca9a8a-41e8-4ae8-be5c-6cbd082e5575.json"
  },
  "/pictures/2016/07/10k-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"d53-lgj/ddK5lsJ5Mf8m02vTqAFFc0c\"",
    "mtime": "2024-08-08T07:58:59.832Z",
    "size": 3411,
    "path": "../public/pictures/2016/07/10k-150x150.jpg"
  },
  "/pictures/2016/07/10k-300x81.jpg": {
    "type": "image/jpeg",
    "etag": "\"10d9-ZhBYb7GYWO1tNsVu+qHaAVbTQXY\"",
    "mtime": "2024-08-08T07:59:00.324Z",
    "size": 4313,
    "path": "../public/pictures/2016/07/10k-300x81.jpg"
  },
  "/pictures/2016/07/10k-400x108.jpg": {
    "type": "image/jpeg",
    "etag": "\"17ba-9hxjdH7b57JyIcQ9viCWYPE7X60\"",
    "mtime": "2024-08-08T07:59:00.327Z",
    "size": 6074,
    "path": "../public/pictures/2016/07/10k-400x108.jpg"
  },
  "/pictures/2016/07/10k.jpg": {
    "type": "image/jpeg",
    "etag": "\"89db-tyFH/JvlNeYqTrav2h8wIthnfBU\"",
    "mtime": "2024-08-08T07:59:00.326Z",
    "size": 35291,
    "path": "../public/pictures/2016/07/10k.jpg"
  },
  "/pictures/2016/07/20151220_111508-01-1024x184.jpeg": {
    "type": "image/jpeg",
    "etag": "\"fb1c-ip1IV9ynfkFoIYnr09ZCu5j6Tf8\"",
    "mtime": "2024-08-08T07:59:00.327Z",
    "size": 64284,
    "path": "../public/pictures/2016/07/20151220_111508-01-1024x184.jpeg"
  },
  "/pictures/2016/07/20151220_111508-01-150x150.jpeg": {
    "type": "image/jpeg",
    "etag": "\"2281-/dPjvNG95p39VlAsS2qEbCwZEQo\"",
    "mtime": "2024-08-08T07:59:00.358Z",
    "size": 8833,
    "path": "../public/pictures/2016/07/20151220_111508-01-150x150.jpeg"
  },
  "/pictures/2016/07/20151220_111508-01-300x54.jpeg": {
    "type": "image/jpeg",
    "etag": "\"1b02-XON5PfXDBOcvPXEaYrH5T5Gh9/E\"",
    "mtime": "2024-08-08T07:59:00.326Z",
    "size": 6914,
    "path": "../public/pictures/2016/07/20151220_111508-01-300x54.jpeg"
  },
  "/pictures/2016/07/20151220_111508-01-400x72.jpeg": {
    "type": "image/jpeg",
    "etag": "\"2a98-eNGQE6rFopgr92xsgzNHWL9zVf8\"",
    "mtime": "2024-08-08T07:59:00.327Z",
    "size": 10904,
    "path": "../public/pictures/2016/07/20151220_111508-01-400x72.jpeg"
  },
  "/pictures/2016/07/20151220_111508-01-768x138.jpeg": {
    "type": "image/jpeg",
    "etag": "\"91cb-1YxQruKIFOvUcLmiur/QO9tgfVY\"",
    "mtime": "2024-08-08T07:59:00.336Z",
    "size": 37323,
    "path": "../public/pictures/2016/07/20151220_111508-01-768x138.jpeg"
  },
  "/pictures/2016/07/20151220_111508-01-840x410.jpeg": {
    "type": "image/jpeg",
    "etag": "\"1db51-59zyjUHFeHDEbXxP07yh/UMqRC8\"",
    "mtime": "2024-08-08T07:59:00.331Z",
    "size": 121681,
    "path": "../public/pictures/2016/07/20151220_111508-01-840x410.jpeg"
  },
  "/pictures/2016/07/20151220_111508-01-e1470115316625-150x47.jpeg": {
    "type": "image/jpeg",
    "etag": "\"cea-7gjRsGrpEBQ08SBtvaQEGIKt/9s\"",
    "mtime": "2024-08-08T07:59:00.328Z",
    "size": 3306,
    "path": "../public/pictures/2016/07/20151220_111508-01-e1470115316625-150x47.jpeg"
  },
  "/pictures/2016/07/20151220_111508-01.jpeg": {
    "type": "image/jpeg",
    "etag": "\"62276a-vFMQwGziilIpdiWHfanI8wtmbVg\"",
    "mtime": "2024-08-08T07:59:00.545Z",
    "size": 6432618,
    "path": "../public/pictures/2016/07/20151220_111508-01.jpeg"
  },
  "/pictures/2016/07/nappydecompagnie-1024x358.jpeg": {
    "type": "image/jpeg",
    "etag": "\"1dee5-0aV/6gRWY5d7LR4dI4ld2nYzSMo\"",
    "mtime": "2024-08-08T07:59:00.333Z",
    "size": 122597,
    "path": "../public/pictures/2016/07/nappydecompagnie-1024x358.jpeg"
  },
  "/pictures/2016/07/nappydecompagnie-150x150.jpeg": {
    "type": "image/jpeg",
    "etag": "\"2097-rJoO6cTdPDAxsxVVAuBoDwF56rg\"",
    "mtime": "2024-08-08T07:59:00.332Z",
    "size": 8343,
    "path": "../public/pictures/2016/07/nappydecompagnie-150x150.jpeg"
  },
  "/pictures/2016/07/nappydecompagnie-300x105.jpeg": {
    "type": "image/jpeg",
    "etag": "\"2b54-EbTaJ0nAu5W8UyL4aPJDy/z/yj8\"",
    "mtime": "2024-08-08T07:59:00.333Z",
    "size": 11092,
    "path": "../public/pictures/2016/07/nappydecompagnie-300x105.jpeg"
  },
  "/pictures/2016/07/nappydecompagnie-400x140.jpeg": {
    "type": "image/jpeg",
    "etag": "\"4929-BWPL6bSHz8Crr42elfdjreo1c+g\"",
    "mtime": "2024-08-08T07:59:00.334Z",
    "size": 18729,
    "path": "../public/pictures/2016/07/nappydecompagnie-400x140.jpeg"
  },
  "/pictures/2016/07/nappydecompagnie-768x268.jpeg": {
    "type": "image/jpeg",
    "etag": "\"108b5-r7fQt+Bc6EnDHdwRBnV1ghog7Y4\"",
    "mtime": "2024-08-08T07:59:00.336Z",
    "size": 67765,
    "path": "../public/pictures/2016/07/nappydecompagnie-768x268.jpeg"
  },
  "/pictures/2016/07/nappydecompagnie-840x410.jpeg": {
    "type": "image/jpeg",
    "etag": "\"1d379-EfpM2FmunmZqwGIBpUZJHTo7n+w\"",
    "mtime": "2024-08-08T07:59:00.343Z",
    "size": 119673,
    "path": "../public/pictures/2016/07/nappydecompagnie-840x410.jpeg"
  },
  "/pictures/2016/07/nappydecompagnie.jpeg": {
    "type": "image/jpeg",
    "etag": "\"264345-xI1yfutKa29aEdFPG+msNOde/cE\"",
    "mtime": "2024-08-08T07:59:00.411Z",
    "size": 2507589,
    "path": "../public/pictures/2016/07/nappydecompagnie.jpeg"
  },
  "/pictures/2016/07/psycho-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"174a-tZrl20YhXVj+s/on3b4DaTK+03k\"",
    "mtime": "2024-08-08T07:59:00.344Z",
    "size": 5962,
    "path": "../public/pictures/2016/07/psycho-150x150.jpg"
  },
  "/pictures/2016/07/psycho-300x136.jpg": {
    "type": "image/jpeg",
    "etag": "\"2b29-sARO++cmh5swU0hJVl3vnmnt92M\"",
    "mtime": "2024-08-08T07:59:00.345Z",
    "size": 11049,
    "path": "../public/pictures/2016/07/psycho-300x136.jpg"
  },
  "/pictures/2016/07/psycho-400x182.jpg": {
    "type": "image/jpeg",
    "etag": "\"41d6-c0wypEa9dEkKSDTg7/jI57oqpYI\"",
    "mtime": "2024-08-08T07:59:00.346Z",
    "size": 16854,
    "path": "../public/pictures/2016/07/psycho-400x182.jpg"
  },
  "/pictures/2016/07/psycho-768x349.jpg": {
    "type": "image/jpeg",
    "etag": "\"b349-ypTXCRYCh4CVYUPz8BGF9KJynUs\"",
    "mtime": "2024-08-08T07:59:00.349Z",
    "size": 45897,
    "path": "../public/pictures/2016/07/psycho-768x349.jpg"
  },
  "/pictures/2016/07/psycho-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"d8ee-+K9Y5sfSAmA0KV7E6lvmWHKmFYs\"",
    "mtime": "2024-08-08T07:59:00.351Z",
    "size": 55534,
    "path": "../public/pictures/2016/07/psycho-840x410.jpg"
  },
  "/pictures/2016/07/psycho.jpg": {
    "type": "image/jpeg",
    "etag": "\"21e0a-WQhczK3c7rI2MQDyWLYSZ62IP6c\"",
    "mtime": "2024-08-08T07:59:00.356Z",
    "size": 138762,
    "path": "../public/pictures/2016/07/psycho.jpg"
  },
  "/pictures/2016/09/avendre-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"2a00-2QZuRJE2bJaUn8huMX85hlk065g\"",
    "mtime": "2024-08-08T07:59:00.359Z",
    "size": 10752,
    "path": "../public/pictures/2016/09/avendre-150x150.jpg"
  },
  "/pictures/2016/09/avendre-229x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"5ee6-36NAwabRPYFKgkiAPo8yNPdLLtE\"",
    "mtime": "2024-08-08T07:58:59.833Z",
    "size": 24294,
    "path": "../public/pictures/2016/09/avendre-229x300.jpg"
  },
  "/pictures/2016/09/avendre-400x523.jpg": {
    "type": "image/jpeg",
    "etag": "\"b6a2-3na8IlOnUzmDa6JNTJMSULXDs48\"",
    "mtime": "2024-08-08T07:59:00.358Z",
    "size": 46754,
    "path": "../public/pictures/2016/09/avendre-400x523.jpg"
  },
  "/pictures/2016/09/avendre-540x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"911f-Ce5jaLtZI6EdeBkh/22G1pXJW2c\"",
    "mtime": "2024-08-08T07:59:00.359Z",
    "size": 37151,
    "path": "../public/pictures/2016/09/avendre-540x410.jpg"
  },
  "/pictures/2016/09/avendre-768x768.jpg": {
    "type": "image/jpeg",
    "etag": "\"111a8-DsyJjXNTaYImRSixZZXPPWa+jS0\"",
    "mtime": "2024-08-08T07:59:00.361Z",
    "size": 70056,
    "path": "../public/pictures/2016/09/avendre-768x768.jpg"
  },
  "/pictures/2016/09/avendre.jpg": {
    "type": "image/jpeg",
    "etag": "\"fe63-ftGqhXFMsM/yhFMGiKCXrzKquGw\"",
    "mtime": "2024-08-08T07:59:00.364Z",
    "size": 65123,
    "path": "../public/pictures/2016/09/avendre.jpg"
  },
  "/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"207c-sKaJiNbyVfejAqlIn0k8OvUDRcE\"",
    "mtime": "2024-08-08T07:59:00.363Z",
    "size": 8316,
    "path": "../public/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-150x150.jpg"
  },
  "/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-300x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"5631-n0ofy/fwcinf87vQJaDuZvU+mM8\"",
    "mtime": "2024-08-08T07:59:00.364Z",
    "size": 22065,
    "path": "../public/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-300x300.jpg"
  },
  "/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-400x400.jpg": {
    "type": "image/jpeg",
    "etag": "\"82c0-2WvC+lw/AxpTgohMIIWmnnuzpkk\"",
    "mtime": "2024-08-08T07:59:00.366Z",
    "size": 33472,
    "path": "../public/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-400x400.jpg"
  },
  "/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-800x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"960d-GpgFTbpA5b9n3+KEp14IXtnXTuo\"",
    "mtime": "2024-08-08T07:59:00.368Z",
    "size": 38413,
    "path": "../public/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code-800x410.jpg"
  },
  "/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code.jpg": {
    "type": "image/jpeg",
    "etag": "\"32a33-DgdEQ5lz1Vb7KF3S5BtFVFqwL34\"",
    "mtime": "2024-08-08T07:59:00.371Z",
    "size": 207411,
    "path": "../public/pictures/2016/09/panneau-a-vendre-reutilisable-jaune-qr-code.jpg"
  },
  "/pictures/2016/11/book-1024x768-1024x768.jpg": {
    "type": "image/jpeg",
    "etag": "\"d60d-1+Mz5e37xPGHXL8b2X6KHaMKdJk\"",
    "mtime": "2024-08-08T07:58:59.835Z",
    "size": 54797,
    "path": "../public/pictures/2016/11/book-1024x768-1024x768.jpg"
  },
  "/pictures/2016/11/book-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"df2-IfibdR3s9bUj5jA3NyQ9TUpwLk0\"",
    "mtime": "2024-08-08T07:59:00.373Z",
    "size": 3570,
    "path": "../public/pictures/2016/11/book-150x150.jpg"
  },
  "/pictures/2016/11/book-300x225.jpg": {
    "type": "image/jpeg",
    "etag": "\"190b-zAzTIDMQM27UJ6KcMDEg5lUNyLA\"",
    "mtime": "2024-08-08T07:59:00.394Z",
    "size": 6411,
    "path": "../public/pictures/2016/11/book-300x225.jpg"
  },
  "/pictures/2016/11/book-400x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"257f-14m9oEGjztQinu87HCxi5PtZYUU\"",
    "mtime": "2024-08-08T07:59:00.395Z",
    "size": 9599,
    "path": "../public/pictures/2016/11/book-400x300.jpg"
  },
  "/pictures/2016/11/book-768x576.jpg": {
    "type": "image/jpeg",
    "etag": "\"6350-4e2YFxGBXpF+F7R7bxI+IP9ZxXo\"",
    "mtime": "2024-08-08T07:59:00.375Z",
    "size": 25424,
    "path": "../public/pictures/2016/11/book-768x576.jpg"
  },
  "/pictures/2016/11/book-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"5d1e-jnBMA88vY0HUMbFYUKOYRYm74HM\"",
    "mtime": "2024-08-08T07:59:00.374Z",
    "size": 23838,
    "path": "../public/pictures/2016/11/book-840x410.jpg"
  },
  "/pictures/2016/11/book.jpg": {
    "type": "image/jpeg",
    "etag": "\"107a9-VGVsSy1KTP3bYMXSj0IlT/O2nts\"",
    "mtime": "2024-08-08T07:59:00.377Z",
    "size": 67497,
    "path": "../public/pictures/2016/11/book.jpg"
  },
  "/pictures/2016/11/problem-1024x683.jpg": {
    "type": "image/jpeg",
    "etag": "\"15f33-nilX52k9XLtIYn0BET+fX/F90Yw\"",
    "mtime": "2024-08-08T07:59:00.378Z",
    "size": 89907,
    "path": "../public/pictures/2016/11/problem-1024x683.jpg"
  },
  "/pictures/2016/11/problem-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"20c0-b52KIr0OjSI5E/3OvUydGql0pLU\"",
    "mtime": "2024-08-08T07:59:00.379Z",
    "size": 8384,
    "path": "../public/pictures/2016/11/problem-150x150.jpg"
  },
  "/pictures/2016/11/problem-300x200.jpg": {
    "type": "image/jpeg",
    "etag": "\"4078-HBFvjPgtJlfMfJkicxslzKK+w3k\"",
    "mtime": "2024-08-08T07:59:00.378Z",
    "size": 16504,
    "path": "../public/pictures/2016/11/problem-300x200.jpg"
  },
  "/pictures/2016/11/problem-400x267.jpg": {
    "type": "image/jpeg",
    "etag": "\"5f96-HK6EQtnx4QFd1IaFX5ey6bCezyQ\"",
    "mtime": "2024-08-08T07:59:00.385Z",
    "size": 24470,
    "path": "../public/pictures/2016/11/problem-400x267.jpg"
  },
  "/pictures/2016/11/problem-768x513.jpg": {
    "type": "image/jpeg",
    "etag": "\"e980-aUj93nQmtkizRcFX4dfPbAdZUqE\"",
    "mtime": "2024-08-08T07:59:00.380Z",
    "size": 59776,
    "path": "../public/pictures/2016/11/problem-768x513.jpg"
  },
  "/pictures/2016/11/problem-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"e3d9-sm0Ofyk7x3AWcUqh7+/bX24111I\"",
    "mtime": "2024-08-08T07:59:00.383Z",
    "size": 58329,
    "path": "../public/pictures/2016/11/problem-840x410.jpg"
  },
  "/pictures/2016/11/problem.jpg": {
    "type": "image/jpeg",
    "etag": "\"e4687-CRBuqMilPAvFyvctg5I4W8C0v4Q\"",
    "mtime": "2024-08-08T07:59:00.407Z",
    "size": 935559,
    "path": "../public/pictures/2016/11/problem.jpg"
  },
  "/pictures/2016/11/stw-150x150.png": {
    "type": "image/png",
    "etag": "\"5a26-kfpmk0O4c+eTHO+qA8QKklIagVI\"",
    "mtime": "2024-08-08T07:59:00.386Z",
    "size": 23078,
    "path": "../public/pictures/2016/11/stw-150x150.png"
  },
  "/pictures/2016/11/stw-300x141.png": {
    "type": "image/png",
    "etag": "\"b1d4-v9K3oMZLMZbQFaaPeofKXBZa+8o\"",
    "mtime": "2024-08-08T07:59:00.388Z",
    "size": 45524,
    "path": "../public/pictures/2016/11/stw-300x141.png"
  },
  "/pictures/2016/11/stw-400x188.png": {
    "type": "image/png",
    "etag": "\"1295b-t3icW87nL6FiYt1TNWbNeBcdVvk\"",
    "mtime": "2024-08-08T07:59:00.391Z",
    "size": 76123,
    "path": "../public/pictures/2016/11/stw-400x188.png"
  },
  "/pictures/2016/11/stw.png": {
    "type": "image/png",
    "etag": "\"9e79-qbodsIiaTnzBJ8xY3L+3Mj3n5/w\"",
    "mtime": "2024-08-08T07:59:00.393Z",
    "size": 40569,
    "path": "../public/pictures/2016/11/stw.png"
  },
  "/pictures/2016/06/Back-to-Work-150x150.png": {
    "type": "image/png",
    "etag": "\"3153-Smpep7f6CuaULObnp8AFswUIJpk\"",
    "mtime": "2024-08-08T07:58:59.832Z",
    "size": 12627,
    "path": "../public/pictures/2016/06/Back-to-Work-150x150.png"
  },
  "/pictures/2016/06/Back-to-Work-300x300.png": {
    "type": "image/png",
    "etag": "\"97d8-4tVg2VUcbo0OWH0LFHYgte5Dpa0\"",
    "mtime": "2024-08-08T07:59:00.269Z",
    "size": 38872,
    "path": "../public/pictures/2016/06/Back-to-Work-300x300.png"
  },
  "/pictures/2016/06/Back-to-Work-400x400.png": {
    "type": "image/png",
    "etag": "\"f1c4-idSg1GhQN15x4jqTtUg3c0gIznY\"",
    "mtime": "2024-08-08T07:59:00.271Z",
    "size": 61892,
    "path": "../public/pictures/2016/06/Back-to-Work-400x400.png"
  },
  "/pictures/2016/06/Back-to-Work-730x410.png": {
    "type": "image/png",
    "etag": "\"bbdf-qe30sIdEpzgQ03k5q0GpH2A6OR8\"",
    "mtime": "2024-08-08T07:59:00.266Z",
    "size": 48095,
    "path": "../public/pictures/2016/06/Back-to-Work-730x410.png"
  },
  "/pictures/2016/06/Back-to-Work.png": {
    "type": "image/png",
    "etag": "\"10011-sV8MkDGlGY3Ivf8xtAXqqmoPEPY\"",
    "mtime": "2024-08-08T07:59:00.269Z",
    "size": 65553,
    "path": "../public/pictures/2016/06/Back-to-Work.png"
  },
  "/pictures/2016/06/IndianaJonesLogo-150x150.gif": {
    "type": "image/gif",
    "etag": "\"2a6c-1FIaFChjjvmCDVyZhJXEOaS5Pyc\"",
    "mtime": "2024-08-08T07:59:00.270Z",
    "size": 10860,
    "path": "../public/pictures/2016/06/IndianaJonesLogo-150x150.gif"
  },
  "/pictures/2016/06/IndianaJonesLogo-300x140.gif": {
    "type": "image/gif",
    "etag": "\"336f-wvZynkLl72H3wKwef7eb+7NOavI\"",
    "mtime": "2024-08-08T07:59:00.271Z",
    "size": 13167,
    "path": "../public/pictures/2016/06/IndianaJonesLogo-300x140.gif"
  },
  "/pictures/2016/06/IndianaJonesLogo-400x187.gif": {
    "type": "image/gif",
    "etag": "\"5cdb-VjlzauFOUkT36qYaM3Kd6ayAOZ4\"",
    "mtime": "2024-08-08T07:59:00.272Z",
    "size": 23771,
    "path": "../public/pictures/2016/06/IndianaJonesLogo-400x187.gif"
  },
  "/pictures/2016/06/IndianaJonesLogo.gif": {
    "type": "image/gif",
    "etag": "\"5f16-vS797YGlQWWzQUCm3SUtKfB7suU\"",
    "mtime": "2024-08-08T07:59:00.272Z",
    "size": 24342,
    "path": "../public/pictures/2016/06/IndianaJonesLogo.gif"
  },
  "/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1dce-AM/Itimx8KjraspApOsYOGF/NHw\"",
    "mtime": "2024-08-08T07:59:00.273Z",
    "size": 7630,
    "path": "../public/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors-150x150.jpg"
  },
  "/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors-300x187.jpg": {
    "type": "image/jpeg",
    "etag": "\"3783-S1yuYHFozRqKOY9XO19tB71QUuY\"",
    "mtime": "2024-08-08T07:59:00.273Z",
    "size": 14211,
    "path": "../public/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors-300x187.jpg"
  },
  "/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors-400x250.jpg": {
    "type": "image/jpeg",
    "etag": "\"52d1-DBSX48bCMJFjMaH5ZHpQ7SQziUE\"",
    "mtime": "2024-08-08T07:59:00.274Z",
    "size": 21201,
    "path": "../public/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors-400x250.jpg"
  },
  "/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors.jpg": {
    "type": "image/jpeg",
    "etag": "\"12ee7-B/G1qBw7rdCNovH1ida3F3x3El8\"",
    "mtime": "2024-08-08T07:59:00.275Z",
    "size": 77543,
    "path": "../public/pictures/2016/06/backlit-with-led-computer-desk-set-up-three-monitors.jpg"
  },
  "/pictures/2016/06/claviers-1024x738.jpg": {
    "type": "image/jpeg",
    "etag": "\"1c63b-8FKz9xHi1kXYiDA3c9VfueiLXMo\"",
    "mtime": "2024-08-08T07:59:00.278Z",
    "size": 116283,
    "path": "../public/pictures/2016/06/claviers-1024x738.jpg"
  },
  "/pictures/2016/06/claviers-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1c15-CenpmZqJoBgHdpdA7PtoxCQlZgs\"",
    "mtime": "2024-08-08T07:59:00.274Z",
    "size": 7189,
    "path": "../public/pictures/2016/06/claviers-150x150.jpg"
  },
  "/pictures/2016/06/claviers-300x216.jpg": {
    "type": "image/jpeg",
    "etag": "\"4076-S/HEkgx++yiW2eaxkTqq9ZXXdBA\"",
    "mtime": "2024-08-08T07:59:00.275Z",
    "size": 16502,
    "path": "../public/pictures/2016/06/claviers-300x216.jpg"
  },
  "/pictures/2016/06/claviers-400x288.jpg": {
    "type": "image/jpeg",
    "etag": "\"6678-RVIwkZPw8o0mviA6yX/G/TRJkl8\"",
    "mtime": "2024-08-08T07:59:00.276Z",
    "size": 26232,
    "path": "../public/pictures/2016/06/claviers-400x288.jpg"
  },
  "/pictures/2016/06/claviers-768x554.jpg": {
    "type": "image/jpeg",
    "etag": "\"122ac-sZniDSi8HosYn48AJPCOCDYD/fU\"",
    "mtime": "2024-08-08T07:59:00.280Z",
    "size": 74412,
    "path": "../public/pictures/2016/06/claviers-768x554.jpg"
  },
  "/pictures/2016/06/claviers-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"e48b-pLgpn4+Gn2pQiA75XyRbPMA9o5s\"",
    "mtime": "2024-08-08T07:59:00.278Z",
    "size": 58507,
    "path": "../public/pictures/2016/06/claviers-840x410.jpg"
  },
  "/pictures/2016/06/claviers.jpg": {
    "type": "image/jpeg",
    "etag": "\"e1075-UosIawigfz22JGr7epyE4abLtKI\"",
    "mtime": "2024-08-08T07:59:00.304Z",
    "size": 921717,
    "path": "../public/pictures/2016/06/claviers.jpg"
  },
  "/pictures/2016/06/logo-yellow2-150x150.png": {
    "type": "image/png",
    "etag": "\"22a6-0c1gr6HHrbjxl3zs9kAE270RYGQ\"",
    "mtime": "2024-08-08T07:59:00.285Z",
    "size": 8870,
    "path": "../public/pictures/2016/06/logo-yellow2-150x150.png"
  },
  "/pictures/2016/06/logo-yellow2-300x300.png": {
    "type": "image/png",
    "etag": "\"6e9d-Enk7w0zQ6G9u0xZ0PSubqTH/byw\"",
    "mtime": "2024-08-08T07:59:00.279Z",
    "size": 28317,
    "path": "../public/pictures/2016/06/logo-yellow2-300x300.png"
  },
  "/pictures/2016/06/logo-yellow2-400x400.png": {
    "type": "image/png",
    "etag": "\"7b77-73bAQyHlGK+syF35ubK16MyqAhM\"",
    "mtime": "2024-08-08T07:59:00.280Z",
    "size": 31607,
    "path": "../public/pictures/2016/06/logo-yellow2-400x400.png"
  },
  "/pictures/2016/06/logo-yellow2-512x410.png": {
    "type": "image/png",
    "etag": "\"31e7-fcav7kV0F/MTezyXTxmFyoD4H/A\"",
    "mtime": "2024-08-08T07:59:00.285Z",
    "size": 12775,
    "path": "../public/pictures/2016/06/logo-yellow2-512x410.png"
  },
  "/pictures/2016/06/logo-yellow2.png": {
    "type": "image/png",
    "etag": "\"86b0-Uyg24MtXQwvyz8sr0LtYddwfWi4\"",
    "mtime": "2024-08-08T07:59:00.281Z",
    "size": 34480,
    "path": "../public/pictures/2016/06/logo-yellow2.png"
  },
  "/pictures/2016/06/nappyJojow1-1024x576.jpg": {
    "type": "image/jpeg",
    "etag": "\"1698f-wrOSJgvbUKBKA59MlWCjfOzdlV8\"",
    "mtime": "2024-08-08T07:59:00.284Z",
    "size": 92559,
    "path": "../public/pictures/2016/06/nappyJojow1-1024x576.jpg"
  },
  "/pictures/2016/06/nappyJojow1-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1404-6OYaSx1dA3tzrhjB2nuXXO6CrtA\"",
    "mtime": "2024-08-08T07:59:00.285Z",
    "size": 5124,
    "path": "../public/pictures/2016/06/nappyJojow1-150x150.jpg"
  },
  "/pictures/2016/06/nappyJojow1-300x169.jpg": {
    "type": "image/jpeg",
    "etag": "\"27ff-RewRcOSZz7SvnxlE70uSZfwJmPc\"",
    "mtime": "2024-08-08T07:59:00.285Z",
    "size": 10239,
    "path": "../public/pictures/2016/06/nappyJojow1-300x169.jpg"
  },
  "/pictures/2016/06/nappyJojow1-400x225.jpg": {
    "type": "image/jpeg",
    "etag": "\"4032-Ah60AgsW6WyV31Ke2SxJQt5eeE8\"",
    "mtime": "2024-08-08T07:59:00.286Z",
    "size": 16434,
    "path": "../public/pictures/2016/06/nappyJojow1-400x225.jpg"
  },
  "/pictures/2016/06/nappyJojow1-768x432.jpg": {
    "type": "image/jpeg",
    "etag": "\"ce45-CDRpLX9+5YUaSFjL3IELapiPUmE\"",
    "mtime": "2024-08-08T07:59:00.288Z",
    "size": 52805,
    "path": "../public/pictures/2016/06/nappyJojow1-768x432.jpg"
  },
  "/pictures/2016/06/nappyJojow1-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"e15d-uMZ0vN+bYDRhhYx8crCXwxZX5Bc\"",
    "mtime": "2024-08-08T07:59:00.288Z",
    "size": 57693,
    "path": "../public/pictures/2016/06/nappyJojow1-840x410.jpg"
  },
  "/pictures/2016/06/nappyJojow1.jpg": {
    "type": "image/jpeg",
    "etag": "\"27d99d-OGoVHtB17fVIU2dyxyWsXlgHmdQ\"",
    "mtime": "2024-08-08T07:59:00.355Z",
    "size": 2611613,
    "path": "../public/pictures/2016/06/nappyJojow1.jpg"
  },
  "/pictures/2016/06/photo562882930912896963-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1dd5-M3qdYkLLZ2A5ASJ4vVMaGK0XiDg\"",
    "mtime": "2024-08-08T07:59:00.288Z",
    "size": 7637,
    "path": "../public/pictures/2016/06/photo562882930912896963-150x150.jpg"
  },
  "/pictures/2016/06/photo562882930912896963-256x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"513e-1f/GtAeSu6KGlqcl4bo1Cmzrg3o\"",
    "mtime": "2024-08-08T07:59:00.290Z",
    "size": 20798,
    "path": "../public/pictures/2016/06/photo562882930912896963-256x300.jpg"
  },
  "/pictures/2016/06/photo562882930912896963-400x469.jpg": {
    "type": "image/jpeg",
    "etag": "\"b839-cm6w1EOhxAxP7YJe2rnPNTyDijY\"",
    "mtime": "2024-08-08T07:59:00.292Z",
    "size": 47161,
    "path": "../public/pictures/2016/06/photo562882930912896963-400x469.jpg"
  },
  "/pictures/2016/06/photo562882930912896963-768x901.jpg": {
    "type": "image/jpeg",
    "etag": "\"26605-DcqCURS4Uzl4AcECBcO6ioDjs58\"",
    "mtime": "2024-08-08T07:59:00.297Z",
    "size": 157189,
    "path": "../public/pictures/2016/06/photo562882930912896963-768x901.jpg"
  },
  "/pictures/2016/06/photo562882930912896963-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"1847a-zpYKMZGiHGnO4waVBMqNyhJuT/c\"",
    "mtime": "2024-08-08T07:59:00.313Z",
    "size": 99450,
    "path": "../public/pictures/2016/06/photo562882930912896963-840x410.jpg"
  },
  "/pictures/2016/06/photo562882930912896963-873x1024.jpg": {
    "type": "image/jpeg",
    "etag": "\"3097c-Td0MOOKj0XLUNCJDYBkcy8y0/q0\"",
    "mtime": "2024-08-08T07:59:00.303Z",
    "size": 199036,
    "path": "../public/pictures/2016/06/photo562882930912896963-873x1024.jpg"
  },
  "/pictures/2016/06/photo562882930912896963.jpg": {
    "type": "image/jpeg",
    "etag": "\"4f467-V3RScZthg2Kg5REkC87oM2cRyY0\"",
    "mtime": "2024-08-08T07:59:00.312Z",
    "size": 324711,
    "path": "../public/pictures/2016/06/photo562882930912896963.jpg"
  },
  "/pictures/2016/06/timerun-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"189c-2zIooVM1dCNen4R1NbevsF2RWoM\"",
    "mtime": "2024-08-08T07:59:00.310Z",
    "size": 6300,
    "path": "../public/pictures/2016/06/timerun-150x150.jpg"
  },
  "/pictures/2016/06/timerun-300x161.jpg": {
    "type": "image/jpeg",
    "etag": "\"260c-hKiUQ4IiTTjz43t4yeiOTZZeae8\"",
    "mtime": "2024-08-08T07:59:00.305Z",
    "size": 9740,
    "path": "../public/pictures/2016/06/timerun-300x161.jpg"
  },
  "/pictures/2016/06/timerun-400x214.jpg": {
    "type": "image/jpeg",
    "etag": "\"36e0-OZoO50Ezq1htZuZ03YWrYAT4JNA\"",
    "mtime": "2024-08-08T07:59:00.311Z",
    "size": 14048,
    "path": "../public/pictures/2016/06/timerun-400x214.jpg"
  },
  "/pictures/2016/06/timerun-768x411.jpg": {
    "type": "image/jpeg",
    "etag": "\"7c17-eg53YC4/UUN1VRDKvSBdXTO9XO4\"",
    "mtime": "2024-08-08T07:59:00.306Z",
    "size": 31767,
    "path": "../public/pictures/2016/06/timerun-768x411.jpg"
  },
  "/pictures/2016/06/timerun-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"80f0-LqJQEglkeRDMN1v8re06QlwMfCU\"",
    "mtime": "2024-08-08T07:59:00.310Z",
    "size": 33008,
    "path": "../public/pictures/2016/06/timerun-840x410.jpg"
  },
  "/pictures/2016/06/timerun.jpg": {
    "type": "image/jpeg",
    "etag": "\"b1e0-HozSNvhz8r+JjJU1BM5xnW/Ullo\"",
    "mtime": "2024-08-08T07:59:00.308Z",
    "size": 45536,
    "path": "../public/pictures/2016/06/timerun.jpg"
  },
  "/pictures/2016/06/typemachine-yellow-1024x768.jpg": {
    "type": "image/jpeg",
    "etag": "\"19697-oMGelt6bHbTTGzN1Io1TJVDe82o\"",
    "mtime": "2024-08-08T07:59:00.315Z",
    "size": 104087,
    "path": "../public/pictures/2016/06/typemachine-yellow-1024x768.jpg"
  },
  "/pictures/2016/06/typemachine-yellow-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1b74-VKJCSbLBKaDMo1Ss2KWKwCe8rm8\"",
    "mtime": "2024-08-08T07:59:00.312Z",
    "size": 7028,
    "path": "../public/pictures/2016/06/typemachine-yellow-150x150.jpg"
  },
  "/pictures/2016/06/typemachine-yellow-300x225.jpg": {
    "type": "image/jpeg",
    "etag": "\"3739-1uh2PUqpNxNgT/fWy6t5VvdRYuw\"",
    "mtime": "2024-08-08T07:59:00.312Z",
    "size": 14137,
    "path": "../public/pictures/2016/06/typemachine-yellow-300x225.jpg"
  },
  "/pictures/2016/06/typemachine-yellow-400x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"557e-9F71fhU7cKEsq1aC5PY6k4F/nfg\"",
    "mtime": "2024-08-08T07:59:00.313Z",
    "size": 21886,
    "path": "../public/pictures/2016/06/typemachine-yellow-400x300.jpg"
  },
  "/pictures/2016/06/typemachine-yellow-768x576.jpg": {
    "type": "image/jpeg",
    "etag": "\"f50f-runDIw0tQ8Zxa9i8LY6lwzUuD1c\"",
    "mtime": "2024-08-08T07:59:00.314Z",
    "size": 62735,
    "path": "../public/pictures/2016/06/typemachine-yellow-768x576.jpg"
  },
  "/pictures/2016/06/typemachine-yellow-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"ea08-8lgoHh9JH/j9eowupouYvbLUby4\"",
    "mtime": "2024-08-08T07:59:00.318Z",
    "size": 59912,
    "path": "../public/pictures/2016/06/typemachine-yellow-840x410.jpg"
  },
  "/pictures/2016/06/typemachine-yellow.jpg": {
    "type": "image/jpeg",
    "etag": "\"59831-wXXSMjS3GtfKNuluSECFDdL06Zk\"",
    "mtime": "2024-08-08T07:59:00.325Z",
    "size": 366641,
    "path": "../public/pictures/2016/06/typemachine-yellow.jpg"
  },
  "/pictures/2016/06/yellowlogo-150x150.png": {
    "type": "image/png",
    "etag": "\"22a6-0c1gr6HHrbjxl3zs9kAE270RYGQ\"",
    "mtime": "2024-08-08T07:59:00.315Z",
    "size": 8870,
    "path": "../public/pictures/2016/06/yellowlogo-150x150.png"
  },
  "/pictures/2016/06/yellowlogo-180x180.png": {
    "type": "image/png",
    "etag": "\"2d86-UR5G0LGztMy6i1S4fbGVb0KRDrw\"",
    "mtime": "2024-08-08T07:59:00.315Z",
    "size": 11654,
    "path": "../public/pictures/2016/06/yellowlogo-180x180.png"
  },
  "/pictures/2016/06/yellowlogo-192x192.png": {
    "type": "image/png",
    "etag": "\"1357-yoGAuWG4Kv3J7U1gwSJLnOlXorM\"",
    "mtime": "2024-08-08T07:59:00.320Z",
    "size": 4951,
    "path": "../public/pictures/2016/06/yellowlogo-192x192.png"
  },
  "/pictures/2016/06/yellowlogo-270x270.png": {
    "type": "image/png",
    "etag": "\"59b9-WRbIfBPb2PEYXQ8nmoxzQ3IjuTM\"",
    "mtime": "2024-08-08T07:59:00.321Z",
    "size": 22969,
    "path": "../public/pictures/2016/06/yellowlogo-270x270.png"
  },
  "/pictures/2016/06/yellowlogo-300x300.png": {
    "type": "image/png",
    "etag": "\"6e9d-Enk7w0zQ6G9u0xZ0PSubqTH/byw\"",
    "mtime": "2024-08-08T07:59:00.318Z",
    "size": 28317,
    "path": "../public/pictures/2016/06/yellowlogo-300x300.png"
  },
  "/pictures/2016/06/yellowlogo-32x32.png": {
    "type": "image/png",
    "etag": "\"243-d+ggp7RAvnSj0RgO/JP3EW2rmwo\"",
    "mtime": "2024-08-08T07:59:00.319Z",
    "size": 579,
    "path": "../public/pictures/2016/06/yellowlogo-32x32.png"
  },
  "/pictures/2016/06/yellowlogo-400x400.png": {
    "type": "image/png",
    "etag": "\"7b77-73bAQyHlGK+syF35ubK16MyqAhM\"",
    "mtime": "2024-08-08T07:59:00.320Z",
    "size": 31607,
    "path": "../public/pictures/2016/06/yellowlogo-400x400.png"
  },
  "/pictures/2016/06/yellowlogo-512x410.png": {
    "type": "image/png",
    "etag": "\"31e7-fcav7kV0F/MTezyXTxmFyoD4H/A\"",
    "mtime": "2024-08-08T07:59:00.320Z",
    "size": 12775,
    "path": "../public/pictures/2016/06/yellowlogo-512x410.png"
  },
  "/pictures/2016/06/yellowlogo.png": {
    "type": "image/png",
    "etag": "\"371b-nUdSNd8taDfMFwXV12fQYhlnseo\"",
    "mtime": "2024-08-08T07:59:00.321Z",
    "size": 14107,
    "path": "../public/pictures/2016/06/yellowlogo.png"
  },
  "/pictures/2016/06/yellowsuit-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"18c7-lnOPpWM4B4G4GVACSQpfBJEQKy8\"",
    "mtime": "2024-08-08T07:59:00.321Z",
    "size": 6343,
    "path": "../public/pictures/2016/06/yellowsuit-150x150.jpg"
  },
  "/pictures/2016/06/yellowsuit-199x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"3b8b-+E00yx5WgXOOXxdIL8WUgCOjnKI\"",
    "mtime": "2024-08-08T07:59:00.322Z",
    "size": 15243,
    "path": "../public/pictures/2016/06/yellowsuit-199x300.jpg"
  },
  "/pictures/2016/06/yellowsuit-388x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"a95b-U6B7XqFXZrO0m7np5VFCh6/oyyY\"",
    "mtime": "2024-08-08T07:59:00.324Z",
    "size": 43355,
    "path": "../public/pictures/2016/06/yellowsuit-388x410.jpg"
  },
  "/pictures/2016/06/yellowsuit.jpg": {
    "type": "image/jpeg",
    "etag": "\"d39a-6iCDRhI5cnwSb9jDMUL1ZH2VeeA\"",
    "mtime": "2024-08-08T07:59:00.324Z",
    "size": 54170,
    "path": "../public/pictures/2016/06/yellowsuit.jpg"
  },
  "/pictures/2016/12/anonymous-150x150.png": {
    "type": "image/png",
    "etag": "\"1c70-o34OQ8Y3YhQ7GAIZGlNaSAkVkNA\"",
    "mtime": "2024-08-08T07:59:00.369Z",
    "size": 7280,
    "path": "../public/pictures/2016/12/anonymous-150x150.png"
  },
  "/pictures/2016/12/anonymous-300x150.png": {
    "type": "image/png",
    "etag": "\"211d-xfF+CgGzhm8rKQW7yJrQfhZZ8qE\"",
    "mtime": "2024-08-08T07:59:00.372Z",
    "size": 8477,
    "path": "../public/pictures/2016/12/anonymous-300x150.png"
  },
  "/pictures/2016/12/anonymous-400x200.png": {
    "type": "image/png",
    "etag": "\"1e52-w3mT/gWncNq3Xa5zlFzwptYVRD0\"",
    "mtime": "2024-08-08T07:58:59.833Z",
    "size": 7762,
    "path": "../public/pictures/2016/12/anonymous-400x200.png"
  },
  "/pictures/2016/12/anonymous-768x384.png": {
    "type": "image/png",
    "etag": "\"12b69-inJqaB8Jk2eCG4NPcgD9HkdxkTQ\"",
    "mtime": "2024-08-08T07:59:00.373Z",
    "size": 76649,
    "path": "../public/pictures/2016/12/anonymous-768x384.png"
  },
  "/pictures/2016/12/anonymous.png": {
    "type": "image/png",
    "etag": "\"1947-aYl9WlDjEvnV0HWYD+0Di1vHA08\"",
    "mtime": "2024-08-08T07:59:00.373Z",
    "size": 6471,
    "path": "../public/pictures/2016/12/anonymous.png"
  },
  "/pictures/2017/01/FabLab-Maastricht-2-1024x682.jpg": {
    "type": "image/jpeg",
    "etag": "\"1fb88-nR5kHV18o3ZPrlt5VRHRgF/E2yE\"",
    "mtime": "2024-08-08T07:58:59.834Z",
    "size": 129928,
    "path": "../public/pictures/2017/01/FabLab-Maastricht-2-1024x682.jpg"
  },
  "/pictures/2017/01/FabLab-Maastricht-2-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"203a-MeGt1SIMeEfxzjkTdY4VqLv14hQ\"",
    "mtime": "2024-08-08T07:59:00.204Z",
    "size": 8250,
    "path": "../public/pictures/2017/01/FabLab-Maastricht-2-150x150.jpg"
  },
  "/pictures/2017/01/FabLab-Maastricht-2-300x200.jpg": {
    "type": "image/jpeg",
    "etag": "\"4c6f-NkV2p49FHN8XGIYalx8PedO0ZUk\"",
    "mtime": "2024-08-08T07:59:00.210Z",
    "size": 19567,
    "path": "../public/pictures/2017/01/FabLab-Maastricht-2-300x200.jpg"
  },
  "/pictures/2017/01/FabLab-Maastricht-2-400x267.jpg": {
    "type": "image/jpeg",
    "etag": "\"77bc-tUTiWNeyCL1xbSNM/YtT21AKQvQ\"",
    "mtime": "2024-08-08T07:59:00.216Z",
    "size": 30652,
    "path": "../public/pictures/2017/01/FabLab-Maastricht-2-400x267.jpg"
  },
  "/pictures/2017/01/FabLab-Maastricht-2-768x512.jpg": {
    "type": "image/jpeg",
    "etag": "\"14cba-72ww4rBRt2iTbSX4pDOoIJ7Toz8\"",
    "mtime": "2024-08-08T07:59:00.215Z",
    "size": 85178,
    "path": "../public/pictures/2017/01/FabLab-Maastricht-2-768x512.jpg"
  },
  "/pictures/2017/01/FabLab-Maastricht-2-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"1396b-dcTVjWB6lq2nSeT3D4J1iV1+B5w\"",
    "mtime": "2024-08-08T07:59:00.206Z",
    "size": 80235,
    "path": "../public/pictures/2017/01/FabLab-Maastricht-2-840x410.jpg"
  },
  "/pictures/2017/01/FabLab-Maastricht-2.jpg": {
    "type": "image/jpeg",
    "etag": "\"1f7a0-AuznJoXFV1khD4KD/2gR0Nqblo0\"",
    "mtime": "2024-08-08T07:59:00.210Z",
    "size": 128928,
    "path": "../public/pictures/2017/01/FabLab-Maastricht-2.jpg"
  },
  "/pictures/2017/01/brice-de-nice-photo-559110fdac800-1024x567.jpg": {
    "type": "image/jpeg",
    "etag": "\"f935-28pw1u9zNifhA/eyj4TPdWCY7yY\"",
    "mtime": "2024-08-08T07:59:00.212Z",
    "size": 63797,
    "path": "../public/pictures/2017/01/brice-de-nice-photo-559110fdac800-1024x567.jpg"
  },
  "/pictures/2017/01/brice-de-nice-photo-559110fdac800-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1eb4-75X/4eLaL0v598oxP8sYzZbwqtE\"",
    "mtime": "2024-08-08T07:59:00.212Z",
    "size": 7860,
    "path": "../public/pictures/2017/01/brice-de-nice-photo-559110fdac800-150x150.jpg"
  },
  "/pictures/2017/01/brice-de-nice-photo-559110fdac800-300x166.jpg": {
    "type": "image/jpeg",
    "etag": "\"33b3-HGy/umENy3XH9sdDvgFcJ68KX8U\"",
    "mtime": "2024-08-08T07:59:00.215Z",
    "size": 13235,
    "path": "../public/pictures/2017/01/brice-de-nice-photo-559110fdac800-300x166.jpg"
  },
  "/pictures/2017/01/brice-de-nice-photo-559110fdac800-400x221.jpg": {
    "type": "image/jpeg",
    "etag": "\"4a51-4lA3Qg142F4HHSKr5L27/MutESI\"",
    "mtime": "2024-08-08T07:59:00.214Z",
    "size": 19025,
    "path": "../public/pictures/2017/01/brice-de-nice-photo-559110fdac800-400x221.jpg"
  },
  "/pictures/2017/01/brice-de-nice-photo-559110fdac800-768x425.jpg": {
    "type": "image/jpeg",
    "etag": "\"adb3-78RcIMF0Oj2Mv0JXpgaImWHrWhE\"",
    "mtime": "2024-08-08T07:59:00.217Z",
    "size": 44467,
    "path": "../public/pictures/2017/01/brice-de-nice-photo-559110fdac800-768x425.jpg"
  },
  "/pictures/2017/01/brice-de-nice-photo-559110fdac800-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"b1c8-LTXpmU6rShGOJ3KvTX2tq2hcdHw\"",
    "mtime": "2024-08-08T07:59:00.217Z",
    "size": 45512,
    "path": "../public/pictures/2017/01/brice-de-nice-photo-559110fdac800-840x410.jpg"
  },
  "/pictures/2017/01/brice-de-nice-photo-559110fdac800.jpg": {
    "type": "image/jpeg",
    "etag": "\"31e12-uZsohR54MaEapcwZpApJZduQCJo\"",
    "mtime": "2024-08-08T07:59:00.221Z",
    "size": 204306,
    "path": "../public/pictures/2017/01/brice-de-nice-photo-559110fdac800.jpg"
  },
  "/pictures/2017/01/le-spot-150x150.png": {
    "type": "image/png",
    "etag": "\"3638-ELXRFgvzukHIjWJllrRTE0eYLyI\"",
    "mtime": "2024-08-08T07:59:00.226Z",
    "size": 13880,
    "path": "../public/pictures/2017/01/le-spot-150x150.png"
  },
  "/pictures/2017/01/le-spot-300x300.png": {
    "type": "image/png",
    "etag": "\"a74d-f/EIewJw+DF/e0mkz3X4Q7+03Fc\"",
    "mtime": "2024-08-08T07:59:00.219Z",
    "size": 42829,
    "path": "../public/pictures/2017/01/le-spot-300x300.png"
  },
  "/pictures/2017/01/le-spot-400x400.png": {
    "type": "image/png",
    "etag": "\"101b4-+sDOpVhUof8ptoqRJiB8VkJjr8E\"",
    "mtime": "2024-08-08T07:59:00.226Z",
    "size": 65972,
    "path": "../public/pictures/2017/01/le-spot-400x400.png"
  },
  "/pictures/2017/01/le-spot-497x410.png": {
    "type": "image/png",
    "etag": "\"a96a-jm9ugqwWSFroKIJFJAJhP6pryc8\"",
    "mtime": "2024-08-08T07:59:00.225Z",
    "size": 43370,
    "path": "../public/pictures/2017/01/le-spot-497x410.png"
  },
  "/pictures/2017/01/le-spot.png": {
    "type": "image/png",
    "etag": "\"c1b7-4dJoVhfIcg2Lk2PfvNrWXzXM9oI\"",
    "mtime": "2024-08-08T07:59:00.220Z",
    "size": 49591,
    "path": "../public/pictures/2017/01/le-spot.png"
  },
  "/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"e64-OgNDoRA4ULRPoffH6SItLgBBLjk\"",
    "mtime": "2024-08-08T07:58:59.831Z",
    "size": 3684,
    "path": "../public/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande-150x150.jpg"
  },
  "/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande-300x129.jpg": {
    "type": "image/jpeg",
    "etag": "\"1817-Gp5RuGHJUNThRPLqY+pknMtGNaA\"",
    "mtime": "2024-08-08T07:59:00.203Z",
    "size": 6167,
    "path": "../public/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande-300x129.jpg"
  },
  "/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande-400x171.jpg": {
    "type": "image/jpeg",
    "etag": "\"2148-OT/R/cgQ30z87aDwvfavqyJkkN0\"",
    "mtime": "2024-08-08T07:59:00.201Z",
    "size": 8520,
    "path": "../public/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande-400x171.jpg"
  },
  "/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande.jpg": {
    "type": "image/jpeg",
    "etag": "\"2f05-JR6LGCRoImLMl9og5CeYz1NLsjk\"",
    "mtime": "2024-08-08T07:59:00.202Z",
    "size": 12037,
    "path": "../public/pictures/2017/06/vizion-vintage-gaming-glasses-blue-light-blocking-anti-fatigue-eyewear-7_grande.jpg"
  },
  "/pictures/2017/05/antchutz900-1024x290.jpg": {
    "type": "image/jpeg",
    "etag": "\"6df6-qheJ31zaDrGSpY6ITHdVKRHSMdE\"",
    "mtime": "2024-08-08T07:58:59.831Z",
    "size": 28150,
    "path": "../public/pictures/2017/05/antchutz900-1024x290.jpg"
  },
  "/pictures/2017/05/antchutz900-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"d4e-LFJTbgd2C/ljAfhljiNSGhRhiCM\"",
    "mtime": "2024-08-08T07:59:00.234Z",
    "size": 3406,
    "path": "../public/pictures/2017/05/antchutz900-150x150.jpg"
  },
  "/pictures/2017/05/antchutz900-300x85.jpg": {
    "type": "image/jpeg",
    "etag": "\"11fa-9eJjCLSz8b7Xy5Vor8d9QkTZyKw\"",
    "mtime": "2024-08-08T07:59:00.233Z",
    "size": 4602,
    "path": "../public/pictures/2017/05/antchutz900-300x85.jpg"
  },
  "/pictures/2017/05/antchutz900-400x113.jpg": {
    "type": "image/jpeg",
    "etag": "\"1a21-DgABJe9qecsUGXZkmXytfjuwml0\"",
    "mtime": "2024-08-08T07:59:00.233Z",
    "size": 6689,
    "path": "../public/pictures/2017/05/antchutz900-400x113.jpg"
  },
  "/pictures/2017/05/antchutz900-768x218.jpg": {
    "type": "image/jpeg",
    "etag": "\"441f-jjr7ZuVXd3hx5MiYCTfrb+xyuuk\"",
    "mtime": "2024-08-08T07:59:00.234Z",
    "size": 17439,
    "path": "../public/pictures/2017/05/antchutz900-768x218.jpg"
  },
  "/pictures/2017/05/antchutz900-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"7613-9wxVqphTKMOMEYKya8aJnaK6Qrs\"",
    "mtime": "2024-08-08T07:59:00.234Z",
    "size": 30227,
    "path": "../public/pictures/2017/05/antchutz900-840x410.jpg"
  },
  "/pictures/2017/05/antchutz900.jpg": {
    "type": "image/jpeg",
    "etag": "\"1ae718-iFY9xvw3Hkt/EybpE8YiFweY7/M\"",
    "mtime": "2024-08-08T07:59:00.283Z",
    "size": 1763096,
    "path": "../public/pictures/2017/05/antchutz900.jpg"
  },
  "/pictures/2017/05/bgTir2-1024x645.jpg": {
    "type": "image/jpeg",
    "etag": "\"10790-AVMtvFD1BRWaIGzuBI8CJiO3pG8\"",
    "mtime": "2024-08-08T07:59:00.237Z",
    "size": 67472,
    "path": "../public/pictures/2017/05/bgTir2-1024x645.jpg"
  },
  "/pictures/2017/05/bgTir2-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"18c0-9+RXvy391QCP9kuPqEpVQS6QiB4\"",
    "mtime": "2024-08-08T07:59:00.234Z",
    "size": 6336,
    "path": "../public/pictures/2017/05/bgTir2-150x150.jpg"
  },
  "/pictures/2017/05/bgTir2-300x189.jpg": {
    "type": "image/jpeg",
    "etag": "\"2f9d-4mhKuAvmL9RqK6LKmhixrCGacx8\"",
    "mtime": "2024-08-08T07:59:00.235Z",
    "size": 12189,
    "path": "../public/pictures/2017/05/bgTir2-300x189.jpg"
  },
  "/pictures/2017/05/bgTir2-400x252.jpg": {
    "type": "image/jpeg",
    "etag": "\"4503-Ja9vKAU+4YM2jEERrxOnG+rX2rk\"",
    "mtime": "2024-08-08T07:59:00.241Z",
    "size": 17667,
    "path": "../public/pictures/2017/05/bgTir2-400x252.jpg"
  },
  "/pictures/2017/05/bgTir2-768x484.jpg": {
    "type": "image/jpeg",
    "etag": "\"abed-j32lZ+i3DdxbrwnQgGhXcZdwGs4\"",
    "mtime": "2024-08-08T07:59:00.254Z",
    "size": 44013,
    "path": "../public/pictures/2017/05/bgTir2-768x484.jpg"
  },
  "/pictures/2017/05/bgTir2-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"9ef3-ad96b0HB9/Yy9zAcHQfAmMDF7y4\"",
    "mtime": "2024-08-08T07:59:00.248Z",
    "size": 40691,
    "path": "../public/pictures/2017/05/bgTir2-840x410.jpg"
  },
  "/pictures/2017/05/bgTir2.jpg": {
    "type": "image/jpeg",
    "etag": "\"20243-XAZIuZdbKT4Wj8f5Wg2a+fVjR+k\"",
    "mtime": "2024-08-08T07:59:00.250Z",
    "size": 131651,
    "path": "../public/pictures/2017/05/bgTir2.jpg"
  },
  "/pictures/2017/09/photography-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1536-loohOR8Ae2xgO07lJ9Uphtq3dK0\"",
    "mtime": "2024-08-08T07:58:59.831Z",
    "size": 5430,
    "path": "../public/pictures/2017/09/photography-150x150.jpg"
  },
  "/pictures/2017/09/photography-300x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"386e-JBNaw3YRQzZkF6/o/+1of2gm8Ug\"",
    "mtime": "2024-08-08T07:59:00.226Z",
    "size": 14446,
    "path": "../public/pictures/2017/09/photography-300x300.jpg"
  },
  "/pictures/2017/09/photography-400x400.jpg": {
    "type": "image/jpeg",
    "etag": "\"55dc-uw4pmeuTEVvAzqfusBX9iyF9Z1w\"",
    "mtime": "2024-08-08T07:59:00.232Z",
    "size": 21980,
    "path": "../public/pictures/2017/09/photography-400x400.jpg"
  },
  "/pictures/2017/09/photography-768x768.jpg": {
    "type": "image/jpeg",
    "etag": "\"eaf8-NDK9ENDfd2u0kOKUazk4QfkUSM0\"",
    "mtime": "2024-08-08T07:59:00.233Z",
    "size": 60152,
    "path": "../public/pictures/2017/09/photography-768x768.jpg"
  },
  "/pictures/2017/09/photography-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"bb89-Z/XKDgFFGllnngS406wby3THe4o\"",
    "mtime": "2024-08-08T07:59:00.232Z",
    "size": 48009,
    "path": "../public/pictures/2017/09/photography-840x410.jpg"
  },
  "/pictures/2017/09/photography.jpg": {
    "type": "image/jpeg",
    "etag": "\"28e8e-XBm48yonq6Wh0QH7aAq6CeQqhcI\"",
    "mtime": "2024-08-08T07:59:00.249Z",
    "size": 167566,
    "path": "../public/pictures/2017/09/photography.jpg"
  },
  "/pictures/2017/10/cheminjaune-1024x576.png": {
    "type": "image/png",
    "etag": "\"e9ac4-Pas2opYXoGYSYJKMLCNSdlriPTg\"",
    "mtime": "2024-08-08T07:58:59.863Z",
    "size": 957124,
    "path": "../public/pictures/2017/10/cheminjaune-1024x576.png"
  },
  "/pictures/2017/10/cheminjaune-150x150.png": {
    "type": "image/png",
    "etag": "\"bb0f-WwRZ01Okcanx5g5rLrEOz1NxbXs\"",
    "mtime": "2024-08-08T07:59:00.254Z",
    "size": 47887,
    "path": "../public/pictures/2017/10/cheminjaune-150x150.png"
  },
  "/pictures/2017/10/cheminjaune-300x169.png": {
    "type": "image/png",
    "etag": "\"18a18-ctSQ5ICSBR9zh5doWH8hs/7E9Cw\"",
    "mtime": "2024-08-08T07:59:00.252Z",
    "size": 100888,
    "path": "../public/pictures/2017/10/cheminjaune-300x169.png"
  },
  "/pictures/2017/10/cheminjaune-400x225.png": {
    "type": "image/png",
    "etag": "\"2abe7-SormPS+P+Yr1x2o+gDYsQUjUiFk\"",
    "mtime": "2024-08-08T07:59:00.252Z",
    "size": 175079,
    "path": "../public/pictures/2017/10/cheminjaune-400x225.png"
  },
  "/pictures/2017/10/cheminjaune-768x432.png": {
    "type": "image/png",
    "etag": "\"8dd26-kao4u846qTHyKDMLEkp9mZtuACE\"",
    "mtime": "2024-08-08T07:59:00.264Z",
    "size": 580902,
    "path": "../public/pictures/2017/10/cheminjaune-768x432.png"
  },
  "/pictures/2017/10/cheminjaune-840x410.png": {
    "type": "image/png",
    "etag": "\"8ed30-+SbwzNwcsWDPJNnpQLQ88X1ajG0\"",
    "mtime": "2024-08-08T07:59:00.267Z",
    "size": 585008,
    "path": "../public/pictures/2017/10/cheminjaune-840x410.png"
  },
  "/pictures/2017/10/cheminjaune.png": {
    "type": "image/png",
    "etag": "\"231770-QMmKB6yThL81ajR53QVdIo25jJw\"",
    "mtime": "2024-08-08T07:59:00.308Z",
    "size": 2299760,
    "path": "../public/pictures/2017/10/cheminjaune.png"
  },
  "/pictures/2018/04/butter-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"10ca-iOi7I5V3/TvHG6gFue4QCMdUvLc\"",
    "mtime": "2024-08-08T07:58:59.834Z",
    "size": 4298,
    "path": "../public/pictures/2018/04/butter-150x150.jpg"
  },
  "/pictures/2018/04/butter-300x201.jpg": {
    "type": "image/jpeg",
    "etag": "\"2029-Oovi7/3eS6hFq3fIZvZz0WsdDqc\"",
    "mtime": "2024-08-08T07:59:00.397Z",
    "size": 8233,
    "path": "../public/pictures/2018/04/butter-300x201.jpg"
  },
  "/pictures/2018/04/butter-400x268.jpg": {
    "type": "image/jpeg",
    "etag": "\"2f32-WQeRklVjlqLOq4Mwh/neh4pRqxs\"",
    "mtime": "2024-08-08T07:59:00.402Z",
    "size": 12082,
    "path": "../public/pictures/2018/04/butter-400x268.jpg"
  },
  "/pictures/2018/04/butter-768x515.jpg": {
    "type": "image/jpeg",
    "etag": "\"78ea-umTQJnCD9i3AZcEa90cwIhpGM+s\"",
    "mtime": "2024-08-08T07:59:00.399Z",
    "size": 30954,
    "path": "../public/pictures/2018/04/butter-768x515.jpg"
  },
  "/pictures/2018/04/butter-820x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"7389-/6++cOqBWXEE5ocVwvPdhfm4y5Q\"",
    "mtime": "2024-08-08T07:59:00.396Z",
    "size": 29577,
    "path": "../public/pictures/2018/04/butter-820x410.jpg"
  },
  "/pictures/2018/04/butter.jpg": {
    "type": "image/jpeg",
    "etag": "\"66ba-6Juy8dUZ/oWCc5wirq4Q6dpGpyQ\"",
    "mtime": "2024-08-08T07:59:00.401Z",
    "size": 26298,
    "path": "../public/pictures/2018/04/butter.jpg"
  },
  "/pictures/2018/04/theyellowmaco-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"fe9-xDScEb84GOdeGzBQlnQlqN2h7Wc\"",
    "mtime": "2024-08-08T07:59:00.404Z",
    "size": 4073,
    "path": "../public/pictures/2018/04/theyellowmaco-150x150.jpg"
  },
  "/pictures/2018/04/theyellowmaco-300x300.jpg": {
    "type": "image/jpeg",
    "etag": "\"23cf-zo9mw8upbmtlUXQvgoeYovMo/5U\"",
    "mtime": "2024-08-08T07:59:00.405Z",
    "size": 9167,
    "path": "../public/pictures/2018/04/theyellowmaco-300x300.jpg"
  },
  "/pictures/2018/04/theyellowmaco-400x400.jpg": {
    "type": "image/jpeg",
    "etag": "\"3305-ufiRrGcGjR3PhsskwuVyJ9wWwkw\"",
    "mtime": "2024-08-08T07:59:00.403Z",
    "size": 13061,
    "path": "../public/pictures/2018/04/theyellowmaco-400x400.jpg"
  },
  "/pictures/2018/04/theyellowmaco.jpg": {
    "type": "image/jpeg",
    "etag": "\"3b23-A51bC1NHzf8VdPlJsY1h+/wXZg4\"",
    "mtime": "2024-08-08T07:59:00.406Z",
    "size": 15139,
    "path": "../public/pictures/2018/04/theyellowmaco.jpg"
  },
  "/pictures/2018/05/Capture-d’écran-2018-05-10-à-13.48.29.png": {
    "type": "image/png",
    "etag": "\"3947a-5F0jTkKTQU+FF0PPQz11NRBbc3s\"",
    "mtime": "2024-08-08T07:58:59.842Z",
    "size": 234618,
    "path": "../public/pictures/2018/05/Capture-d’écran-2018-05-10-à-13.48.29.png"
  },
  "/pictures/2018/05/komodo-1024x311.png": {
    "type": "image/png",
    "etag": "\"2eaae-XFhSe8DxzEQOiUEx0ifmmJNV9hE\"",
    "mtime": "2024-08-08T07:59:00.413Z",
    "size": 191150,
    "path": "../public/pictures/2018/05/komodo-1024x311.png"
  },
  "/pictures/2018/05/komodo-150x150.png": {
    "type": "image/png",
    "etag": "\"45e9-ziEhRUBlgdz5QTyTZHsMI44KnT8\"",
    "mtime": "2024-08-08T07:59:00.409Z",
    "size": 17897,
    "path": "../public/pictures/2018/05/komodo-150x150.png"
  },
  "/pictures/2018/05/komodo-300x91.png": {
    "type": "image/png",
    "etag": "\"6285-5BLsVzFnhweuQK3ozZ5zSJ8Lbis\"",
    "mtime": "2024-08-08T07:59:00.417Z",
    "size": 25221,
    "path": "../public/pictures/2018/05/komodo-300x91.png"
  },
  "/pictures/2018/05/komodo-400x121.png": {
    "type": "image/png",
    "etag": "\"9d83-JTKJciBOpmkwZF/R6+qLvpiP74A\"",
    "mtime": "2024-08-08T07:59:00.414Z",
    "size": 40323,
    "path": "../public/pictures/2018/05/komodo-400x121.png"
  },
  "/pictures/2018/05/komodo-768x233.png": {
    "type": "image/png",
    "etag": "\"1df24-cUc0zle7h4bzF8KzHBOFqO3rrlw\"",
    "mtime": "2024-08-08T07:59:00.414Z",
    "size": 122660,
    "path": "../public/pictures/2018/05/komodo-768x233.png"
  },
  "/pictures/2018/05/komodo-840x382.png": {
    "type": "image/png",
    "etag": "\"1614a-Wc0rUaOA6IPDHWixWewu7lvdK2I\"",
    "mtime": "2024-08-08T07:59:00.416Z",
    "size": 90442,
    "path": "../public/pictures/2018/05/komodo-840x382.png"
  },
  "/pictures/2018/05/komodo.png": {
    "type": "image/png",
    "etag": "\"16439-XvQXEVeUilsMMV1Dc6vnRocdPQ8\"",
    "mtime": "2024-08-08T07:59:00.417Z",
    "size": 91193,
    "path": "../public/pictures/2018/05/komodo.png"
  },
  "/pictures/2018/05/komodologo-1024x188.png": {
    "type": "image/png",
    "etag": "\"d3ac-iXTpitUPn4DA9nJQAxH1dNKmTiE\"",
    "mtime": "2024-08-08T07:59:00.418Z",
    "size": 54188,
    "path": "../public/pictures/2018/05/komodologo-1024x188.png"
  },
  "/pictures/2018/05/komodologo-150x150.png": {
    "type": "image/png",
    "etag": "\"17f6-hAerdN8VHQ0KN3hKeRwyY25hpmA\"",
    "mtime": "2024-08-08T07:59:00.417Z",
    "size": 6134,
    "path": "../public/pictures/2018/05/komodologo-150x150.png"
  },
  "/pictures/2018/05/komodologo-300x55.png": {
    "type": "image/png",
    "etag": "\"20fb-uQcditwpWM8349as/op4YsG2QIU\"",
    "mtime": "2024-08-08T07:59:00.418Z",
    "size": 8443,
    "path": "../public/pictures/2018/05/komodologo-300x55.png"
  },
  "/pictures/2018/05/komodologo-400x73.png": {
    "type": "image/png",
    "etag": "\"31bc-gB5IP5dnLMuCHJNf7WIpAm6uzj8\"",
    "mtime": "2024-08-08T07:59:00.418Z",
    "size": 12732,
    "path": "../public/pictures/2018/05/komodologo-400x73.png"
  },
  "/pictures/2018/05/komodologo-768x141.png": {
    "type": "image/png",
    "etag": "\"89d1-tf4kK2FdDMbxiBhxEcKzDdrq9GA\"",
    "mtime": "2024-08-08T07:59:00.422Z",
    "size": 35281,
    "path": "../public/pictures/2018/05/komodologo-768x141.png"
  },
  "/pictures/2018/05/komodologo-840x410.png": {
    "type": "image/png",
    "etag": "\"94dd-x+PYDI4Lr7bKkFXhoWpTmQGCRYc\"",
    "mtime": "2024-08-08T07:59:00.420Z",
    "size": 38109,
    "path": "../public/pictures/2018/05/komodologo-840x410.png"
  },
  "/pictures/2018/05/komodologo.png": {
    "type": "image/png",
    "etag": "\"59de-r6OvxrwhmwmvOCG6NJ+dPB3krBc\"",
    "mtime": "2024-08-08T07:59:00.419Z",
    "size": 23006,
    "path": "../public/pictures/2018/05/komodologo.png"
  },
  "/pictures/2018/05/logo-1024x188.png": {
    "type": "image/png",
    "etag": "\"d3ac-iXTpitUPn4DA9nJQAxH1dNKmTiE\"",
    "mtime": "2024-08-08T07:59:00.420Z",
    "size": 54188,
    "path": "../public/pictures/2018/05/logo-1024x188.png"
  },
  "/pictures/2018/05/logo-150x150.png": {
    "type": "image/png",
    "etag": "\"17f6-hAerdN8VHQ0KN3hKeRwyY25hpmA\"",
    "mtime": "2024-08-08T07:59:00.420Z",
    "size": 6134,
    "path": "../public/pictures/2018/05/logo-150x150.png"
  },
  "/pictures/2018/05/logo-300x55.png": {
    "type": "image/png",
    "etag": "\"20fb-uQcditwpWM8349as/op4YsG2QIU\"",
    "mtime": "2024-08-08T07:59:00.420Z",
    "size": 8443,
    "path": "../public/pictures/2018/05/logo-300x55.png"
  },
  "/pictures/2018/05/logo-400x73.png": {
    "type": "image/png",
    "etag": "\"31bc-gB5IP5dnLMuCHJNf7WIpAm6uzj8\"",
    "mtime": "2024-08-08T07:59:00.421Z",
    "size": 12732,
    "path": "../public/pictures/2018/05/logo-400x73.png"
  },
  "/pictures/2018/05/logo-768x141.png": {
    "type": "image/png",
    "etag": "\"89d1-tf4kK2FdDMbxiBhxEcKzDdrq9GA\"",
    "mtime": "2024-08-08T07:59:00.423Z",
    "size": 35281,
    "path": "../public/pictures/2018/05/logo-768x141.png"
  },
  "/pictures/2018/05/logo-840x410.png": {
    "type": "image/png",
    "etag": "\"94dd-x+PYDI4Lr7bKkFXhoWpTmQGCRYc\"",
    "mtime": "2024-08-08T07:59:00.422Z",
    "size": 38109,
    "path": "../public/pictures/2018/05/logo-840x410.png"
  },
  "/pictures/2018/05/logo-e1525977312522.png": {
    "type": "image/png",
    "etag": "\"15935-LrBRr4nIBxq8IwLjvsEk/U5O4OM\"",
    "mtime": "2024-08-08T07:59:00.425Z",
    "size": 88373,
    "path": "../public/pictures/2018/05/logo-e1525977312522.png"
  },
  "/pictures/2018/05/logo.png": {
    "type": "image/png",
    "etag": "\"140d9-R32qYvIsYuByeBXV/XHTLIqZqMw\"",
    "mtime": "2024-08-08T07:59:00.429Z",
    "size": 82137,
    "path": "../public/pictures/2018/05/logo.png"
  },
  "/pictures/2018/05/mindblown-150x150.png": {
    "type": "image/png",
    "etag": "\"610d-KK/Y3BzzaQRmcxLgqsXxtje0coo\"",
    "mtime": "2024-08-08T07:59:00.424Z",
    "size": 24845,
    "path": "../public/pictures/2018/05/mindblown-150x150.png"
  },
  "/pictures/2018/05/mindblown-300x226.png": {
    "type": "image/png",
    "etag": "\"f243-PE4a+TbSjbKORjt+dN0He9sJeNw\"",
    "mtime": "2024-08-08T07:59:00.425Z",
    "size": 62019,
    "path": "../public/pictures/2018/05/mindblown-300x226.png"
  },
  "/pictures/2018/05/mindblown-400x301.png": {
    "type": "image/png",
    "etag": "\"198c7-aBI66fHEPqVmsIKwuIPUrQIyrR4\"",
    "mtime": "2024-08-08T07:59:00.427Z",
    "size": 104647,
    "path": "../public/pictures/2018/05/mindblown-400x301.png"
  },
  "/pictures/2018/05/mindblown-549x410.png": {
    "type": "image/png",
    "etag": "\"16122-RxRURRoullSqcqWslOWsbG6gyUY\"",
    "mtime": "2024-08-08T07:59:00.433Z",
    "size": 90402,
    "path": "../public/pictures/2018/05/mindblown-549x410.png"
  },
  "/pictures/2018/05/mindblown.png": {
    "type": "image/png",
    "etag": "\"1b332-7sSNGw30Of6rF8+2mnAH9cmdFSw\"",
    "mtime": "2024-08-08T07:59:00.430Z",
    "size": 111410,
    "path": "../public/pictures/2018/05/mindblown.png"
  },
  "/pictures/2018/05/overcoming-laziness-1-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"17bb-INt11bd0Al1ukaq2v/QL2GusEjE\"",
    "mtime": "2024-08-08T07:59:00.428Z",
    "size": 6075,
    "path": "../public/pictures/2018/05/overcoming-laziness-1-150x150.jpg"
  },
  "/pictures/2018/05/overcoming-laziness-1-300x178.jpg": {
    "type": "image/jpeg",
    "etag": "\"2ebf-MqWJCPd9VRmarlix3ZXGTvcPBVI\"",
    "mtime": "2024-08-08T07:59:00.429Z",
    "size": 11967,
    "path": "../public/pictures/2018/05/overcoming-laziness-1-300x178.jpg"
  },
  "/pictures/2018/05/overcoming-laziness-1-400x237.jpg": {
    "type": "image/jpeg",
    "etag": "\"4758-sTStOO+R6ol/62OV2mhpWHywKGc\"",
    "mtime": "2024-08-08T07:59:00.432Z",
    "size": 18264,
    "path": "../public/pictures/2018/05/overcoming-laziness-1-400x237.jpg"
  },
  "/pictures/2018/05/overcoming-laziness-1-725x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"b0c2-puNhK3vj4E7xme8QtzXeAIt1IFY\"",
    "mtime": "2024-08-08T07:59:00.434Z",
    "size": 45250,
    "path": "../public/pictures/2018/05/overcoming-laziness-1-725x410.jpg"
  },
  "/pictures/2018/05/overcoming-laziness-1.jpg": {
    "type": "image/jpeg",
    "etag": "\"ed71-yVzUemsJOMblrL6qKF+pFwnIiWc\"",
    "mtime": "2024-08-08T07:59:00.432Z",
    "size": 60785,
    "path": "../public/pictures/2018/05/overcoming-laziness-1.jpg"
  },
  "/pictures/2018/10/aaron-burden-521422-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"385cf2-I096rPNDcwjalbEIxZlpSTFI+pQ\"",
    "mtime": "2024-08-08T07:58:59.930Z",
    "size": 3693810,
    "path": "../public/pictures/2018/10/aaron-burden-521422-unsplash.jpg"
  },
  "/pictures/2018/10/bad_posture_resized-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"1732-Nt0k6GsG2dmEihShqpyolr/Ow94\"",
    "mtime": "2024-08-08T07:59:00.434Z",
    "size": 5938,
    "path": "../public/pictures/2018/10/bad_posture_resized-150x150.jpg"
  },
  "/pictures/2018/10/bad_posture_resized-300x205.jpg": {
    "type": "image/jpeg",
    "etag": "\"2bb2-hTW1YXBZDw4MWMIYf0umxqIr0Ls\"",
    "mtime": "2024-08-08T07:59:00.434Z",
    "size": 11186,
    "path": "../public/pictures/2018/10/bad_posture_resized-300x205.jpg"
  },
  "/pictures/2018/10/bad_posture_resized-400x273.jpg": {
    "type": "image/jpeg",
    "etag": "\"3e8a-m5+zImm5weDS2wvu8jU3LcIdMeI\"",
    "mtime": "2024-08-08T07:59:00.433Z",
    "size": 16010,
    "path": "../public/pictures/2018/10/bad_posture_resized-400x273.jpg"
  },
  "/pictures/2018/10/bad_posture_resized-768x525.jpg": {
    "type": "image/jpeg",
    "etag": "\"8d50-LC/3C3+K8wUUppI6+EQlRXYrNIs\"",
    "mtime": "2024-08-08T07:59:00.435Z",
    "size": 36176,
    "path": "../public/pictures/2018/10/bad_posture_resized-768x525.jpg"
  },
  "/pictures/2018/10/bad_posture_resized-840x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"7bbf-eGmgQCO7e8Gr6n4Lx5uVt/IW6Uk\"",
    "mtime": "2024-08-08T07:59:00.435Z",
    "size": 31679,
    "path": "../public/pictures/2018/10/bad_posture_resized-840x410.jpg"
  },
  "/pictures/2018/10/bad_posture_resized.jpg": {
    "type": "image/jpeg",
    "etag": "\"9139-3EVdfa26jEP3qACrrP7qKQynsQ8\"",
    "mtime": "2024-08-08T07:59:00.436Z",
    "size": 37177,
    "path": "../public/pictures/2018/10/bad_posture_resized.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"2240-5SPkPE4mzXKXHUMLjUNBO/kRqxY\"",
    "mtime": "2024-08-08T07:59:00.438Z",
    "size": 8768,
    "path": "../public/pictures/2018/10/i-quit-5b525e-150x150.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-300x248.jpg": {
    "type": "image/jpeg",
    "etag": "\"4d6d-3O96bdf66nrbstB6KLjCbR+fGwk\"",
    "mtime": "2024-08-08T07:59:00.439Z",
    "size": 19821,
    "path": "../public/pictures/2018/10/i-quit-5b525e-300x248.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-400x331.jpg": {
    "type": "image/jpeg",
    "etag": "\"6e67-EFmbHXfF0R29G7C9dn+9IfSpJHE\"",
    "mtime": "2024-08-08T07:59:00.437Z",
    "size": 28263,
    "path": "../public/pictures/2018/10/i-quit-5b525e-400x331.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-600x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"b664-boxzhr6I1tUSI4r3Maa4dut0338\"",
    "mtime": "2024-08-08T07:59:00.437Z",
    "size": 46692,
    "path": "../public/pictures/2018/10/i-quit-5b525e-600x410.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-e1539476090996-150x150.jpg": {
    "type": "image/jpeg",
    "etag": "\"240c-vATVym4r24Ljd69gmF6ZwMh7Tw4\"",
    "mtime": "2024-08-08T07:59:00.437Z",
    "size": 9228,
    "path": "../public/pictures/2018/10/i-quit-5b525e-e1539476090996-150x150.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-e1539476090996-300x222.jpg": {
    "type": "image/jpeg",
    "etag": "\"49c9-PbuT0qL6RFpyWwVRHNSfnhpwfjs\"",
    "mtime": "2024-08-08T07:59:00.438Z",
    "size": 18889,
    "path": "../public/pictures/2018/10/i-quit-5b525e-e1539476090996-300x222.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-e1539476090996-400x296.jpg": {
    "type": "image/jpeg",
    "etag": "\"689f-vybk4oqByHnbfvFxDsN1DA6UxuI\"",
    "mtime": "2024-08-08T07:59:00.439Z",
    "size": 26783,
    "path": "../public/pictures/2018/10/i-quit-5b525e-e1539476090996-400x296.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-e1539476090996-600x410.jpg": {
    "type": "image/jpeg",
    "etag": "\"b3e5-wxIpuFvmztFFy+7C9ItNKvV1qEI\"",
    "mtime": "2024-08-08T07:59:00.439Z",
    "size": 46053,
    "path": "../public/pictures/2018/10/i-quit-5b525e-e1539476090996-600x410.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e-e1539476090996.jpg": {
    "type": "image/jpeg",
    "etag": "\"b339-j/9dAy1/ZmOJxFr5+pqVgs6HGSY\"",
    "mtime": "2024-08-08T07:59:00.441Z",
    "size": 45881,
    "path": "../public/pictures/2018/10/i-quit-5b525e-e1539476090996.jpg"
  },
  "/pictures/2018/10/i-quit-5b525e.jpg": {
    "type": "image/jpeg",
    "etag": "\"ace1-N1lrVdHssO4CSXwKsri2gyyIj8k\"",
    "mtime": "2024-08-08T07:59:00.443Z",
    "size": 44257,
    "path": "../public/pictures/2018/10/i-quit-5b525e.jpg"
  },
  "/pictures/2018/10/samule-sun-645270-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"3e80ae-4jLG3kIsgS/rE4bhgispYCE5uLE\"",
    "mtime": "2024-08-08T07:59:00.603Z",
    "size": 4096174,
    "path": "../public/pictures/2018/10/samule-sun-645270-unsplash.jpg"
  },
  "/pictures/2018/11/chris-spiegl-614973-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"252d91-t2ofdezj1Lo2wXvrapVZq9Qpysc\"",
    "mtime": "2024-08-08T07:59:00.552Z",
    "size": 2436497,
    "path": "../public/pictures/2018/11/chris-spiegl-614973-unsplash.jpg"
  },
  "/pictures/2018/11/dane-deaner-272368-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"e7c9a-ZRCfdu+NBm8E07hCTv9qhin6Zrk\"",
    "mtime": "2024-08-08T07:58:59.873Z",
    "size": 949402,
    "path": "../public/pictures/2018/11/dane-deaner-272368-unsplash.jpg"
  },
  "/pictures/2018/11/ergo.jpg": {
    "type": "image/jpeg",
    "etag": "\"eea7-9noy0dbkkHTW6qJrO2r0n0hnczY\"",
    "mtime": "2024-08-08T07:59:00.446Z",
    "size": 61095,
    "path": "../public/pictures/2018/11/ergo.jpg"
  },
  "/pictures/2018/11/marcelo-leal-483685-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"37d30f-iiQ6/d7l5SYmq5St/Ki4eXJUwac\"",
    "mtime": "2024-08-08T07:59:00.694Z",
    "size": 3658511,
    "path": "../public/pictures/2018/11/marcelo-leal-483685-unsplash.jpg"
  },
  "/pictures/2018/11/martin-sanchez-647743-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"24084e-Iq6jbxysmSfVIJLLsqlHnMLeRTI\"",
    "mtime": "2024-08-08T07:59:00.545Z",
    "size": 2361422,
    "path": "../public/pictures/2018/11/martin-sanchez-647743-unsplash.jpg"
  },
  "/pictures/2018/11/rawpixel-620232-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"1108d4-JsaMGMwNMP6Y1Ha8AjfGckqrmvE\"",
    "mtime": "2024-08-08T07:59:00.606Z",
    "size": 1116372,
    "path": "../public/pictures/2018/11/rawpixel-620232-unsplash.jpg"
  },
  "/pictures/2018/11/standup.jpg": {
    "type": "image/jpeg",
    "etag": "\"fbbf-H3IXfEebdUrm8PQK2iWmpSa3h20\"",
    "mtime": "2024-08-08T07:59:00.559Z",
    "size": 64447,
    "path": "../public/pictures/2018/11/standup.jpg"
  },
  "/pictures/2021/04/philippe-bout-93W0xn4961g-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"325cb0-yjD/kinxpdRzO04O4YiPpiBKdus\"",
    "mtime": "2024-08-08T07:59:00.004Z",
    "size": 3300528,
    "path": "../public/pictures/2021/04/philippe-bout-93W0xn4961g-unsplash.jpg"
  },
  "/pictures/2021/05/blurrystock-HIbAmybJHVs-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"5d3e3-oEIN8HKG4TewO//TS8qqQilYxgQ\"",
    "mtime": "2024-08-08T07:59:00.039Z",
    "size": 381923,
    "path": "../public/pictures/2021/05/blurrystock-HIbAmybJHVs-unsplash.jpg"
  },
  "/pictures/2019/01/aisha-askhadova-1266466-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"2c07e4-tKaUuuCVjdfa+rdAUDCDkXtrmdA\"",
    "mtime": "2024-08-08T07:58:59.925Z",
    "size": 2885604,
    "path": "../public/pictures/2019/01/aisha-askhadova-1266466-unsplash.jpg"
  },
  "/pictures/2019/05/frank-park-39270-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"2d501-hOiw5C7+8sQQTZkSwuTMB0R3l2o\"",
    "mtime": "2024-08-08T07:58:59.930Z",
    "size": 185601,
    "path": "../public/pictures/2019/05/frank-park-39270-unsplash.jpg"
  },
  "/pictures/2019/07/jo-szczepanska-lCYoIM-fbuU-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"266a89-aBLVgTnFlZ6iuNgAvqRLFt6UYlI\"",
    "mtime": "2024-08-08T07:58:59.927Z",
    "size": 2517641,
    "path": "../public/pictures/2019/07/jo-szczepanska-lCYoIM-fbuU-unsplash.jpg"
  },
  "/pictures/2019/07/priscilla-du-preez-ksMmG5vk9pE-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"8f635-oRtIRxY0sEsfrWDruDMmHW21/j4\"",
    "mtime": "2024-08-08T07:59:00.586Z",
    "size": 587317,
    "path": "../public/pictures/2019/07/priscilla-du-preez-ksMmG5vk9pE-unsplash.jpg"
  },
  "/pictures/2019/08/ross-findon-mG28olYFgHI-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"1659f5-WMorNc4q2zHYXZR71/A+OKUVvjI\"",
    "mtime": "2024-08-08T07:58:59.921Z",
    "size": 1464821,
    "path": "../public/pictures/2019/08/ross-findon-mG28olYFgHI-unsplash.jpg"
  },
  "/pictures/2019/09/code.png": {
    "type": "image/png",
    "etag": "\"33bd9-T0nMIb0VXdOmUwn6zdRdpLnpwDY\"",
    "mtime": "2024-08-08T07:58:59.937Z",
    "size": 211929,
    "path": "../public/pictures/2019/09/code.png"
  },
  "/pictures/2019/12/forestry.png": {
    "type": "image/png",
    "etag": "\"2360d-69ZyAGy2cWs2+gnHxvkLm08wI+4\"",
    "mtime": "2024-08-08T07:58:59.931Z",
    "size": 144909,
    "path": "../public/pictures/2019/12/forestry.png"
  },
  "/pictures/2020/03/frank-busch-ChDWtI3N9w4-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"207ef9-ULA11d4CVK1zuSJwP60wvBvrL0A\"",
    "mtime": "2024-08-08T07:58:59.948Z",
    "size": 2129657,
    "path": "../public/pictures/2020/03/frank-busch-ChDWtI3N9w4-unsplash.jpg"
  },
  "/pictures/2020/03/joanna-kosinska-bF2vsubyHcQ-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"2b46bc-rVRPRFA7M5oi22SxsWL/d1FKqs0\"",
    "mtime": "2024-08-08T07:59:00.703Z",
    "size": 2836156,
    "path": "../public/pictures/2020/03/joanna-kosinska-bF2vsubyHcQ-unsplash.jpg"
  },
  "/pictures/2020/06/avinash-kumar-K1T4pKWpr8k-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"7244f-+0u6qn6uAuzX0A4Gg3owcRRliZc\"",
    "mtime": "2024-08-08T07:58:59.937Z",
    "size": 468047,
    "path": "../public/pictures/2020/06/avinash-kumar-K1T4pKWpr8k-unsplash.jpg"
  },
  "/pictures/2020/06/toa-heftiba-9GFyyS-Rl2M-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"1c18e7-FLvMsTS5gcGfjEWxYZmmjau83W8\"",
    "mtime": "2024-08-08T07:59:00.664Z",
    "size": 1841383,
    "path": "../public/pictures/2020/06/toa-heftiba-9GFyyS-Rl2M-unsplash.jpg"
  },
  "/pictures/2022/04/kanchanara-FNZDYyI6rwc-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"d0f08-XYC4gR2R8FuRQeZQX083AfENsRY\"",
    "mtime": "2024-08-08T07:59:00.654Z",
    "size": 855816,
    "path": "../public/pictures/2022/04/kanchanara-FNZDYyI6rwc-unsplash.jpg"
  },
  "/pictures/2022/04/kanchanara-ow-rGjlqJkM-unsplash.jpg": {
    "type": "image/jpeg",
    "etag": "\"b7d93-f9dgm1jb+IYUijqER/kHxcz5wGQ\"",
    "mtime": "2024-08-08T07:59:00.690Z",
    "size": 753043,
    "path": "../public/pictures/2022/04/kanchanara-ow-rGjlqJkM-unsplash.jpg"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const _EXTNAME_RE = /.(\.[^./]+)$/;
const extname = function(p) {
  const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
  return match && match[1] || "";
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises$1.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta":{"maxAge":31536000},"/_nuxt/builds":{"maxAge":1},"/_nuxt":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash$1(withoutTrailingSlash$1(parseURL$2(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    setResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL$2(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function isRelative(inputString) {
  return ["./", "../"].some((string_) => inputString.startsWith(string_));
}
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function isSamePath(p1, p2) {
  return decode(withoutTrailingSlash(p1)) === decode(withoutTrailingSlash(p2));
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const get = (obj, path) => path.split(".").reduce((acc, part) => acc && acc[part], obj);
const _pick = (obj, condition) => Object.keys(obj).filter(condition).reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {});
const omit = (keys) => (obj) => keys && keys.length ? _pick(obj, (key) => !keys.includes(key)) : obj;
const apply = (fn) => (data) => Array.isArray(data) ? data.map((item) => fn(item)) : fn(data);
const detectProperties = (keys) => {
  const prefixes = [];
  const properties = [];
  for (const key of keys) {
    if (["$", "_"].includes(key)) {
      prefixes.push(key);
    } else {
      properties.push(key);
    }
  }
  return { prefixes, properties };
};
const withoutKeys = (keys = []) => (obj) => {
  if (keys.length === 0 || !obj) {
    return obj;
  }
  const { prefixes, properties } = detectProperties(keys);
  return _pick(obj, (key) => !properties.includes(key) && !prefixes.includes(key[0]));
};
const withKeys = (keys = []) => (obj) => {
  if (keys.length === 0 || !obj) {
    return obj;
  }
  const { prefixes, properties } = detectProperties(keys);
  return _pick(obj, (key) => properties.includes(key) || prefixes.includes(key[0]));
};
const sortList = (data, params) => {
  const comperable = new Intl.Collator(params.$locale, {
    numeric: params.$numeric,
    caseFirst: params.$caseFirst,
    sensitivity: params.$sensitivity
  });
  const keys = Object.keys(params).filter((key) => !key.startsWith("$"));
  for (const key of keys) {
    data = data.sort((a, b) => {
      const values = [get(a, key), get(b, key)].map((value) => {
        if (value === null) {
          return void 0;
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      if (params[key] === -1) {
        values.reverse();
      }
      return comperable.compare(values[0], values[1]);
    });
  }
  return data;
};
const assertArray = (value, message = "Expected an array") => {
  if (!Array.isArray(value)) {
    throw new TypeError(message);
  }
};
const ensureArray = (value) => {
  return Array.isArray(value) ? value : [void 0, null].includes(value) ? [] : [value];
};

const arrayParams = ["sort", "where", "only", "without"];
function createQuery(fetcher, opts = {}) {
  const queryParams = {};
  for (const key of Object.keys(opts.initialParams || {})) {
    queryParams[key] = arrayParams.includes(key) ? ensureArray(opts.initialParams[key]) : opts.initialParams[key];
  }
  const $set = (key, fn = (v) => v) => {
    return (...values) => {
      queryParams[key] = fn(...values);
      return query;
    };
  };
  const resolveResult = (result) => {
    if (opts.legacy) {
      if (result?.surround) {
        return result.surround;
      }
      if (!result) {
        return result;
      }
      if (result?.dirConfig) {
        result.result = {
          _path: result.dirConfig?._path,
          ...result.result,
          _dir: result.dirConfig
        };
      }
      return result?._path || Array.isArray(result) || !Object.prototype.hasOwnProperty.call(result, "result") ? result : result?.result;
    }
    return result;
  };
  const query = {
    params: () => ({
      ...queryParams,
      ...queryParams.where ? { where: [...ensureArray(queryParams.where)] } : {},
      ...queryParams.sort ? { sort: [...ensureArray(queryParams.sort)] } : {}
    }),
    only: $set("only", ensureArray),
    without: $set("without", ensureArray),
    where: $set("where", (q) => [...ensureArray(queryParams.where), ...ensureArray(q)]),
    sort: $set("sort", (sort) => [...ensureArray(queryParams.sort), ...ensureArray(sort)]),
    limit: $set("limit", (v) => parseInt(String(v), 10)),
    skip: $set("skip", (v) => parseInt(String(v), 10)),
    // find
    find: () => fetcher(query).then(resolveResult),
    findOne: () => fetcher($set("first")(true)).then(resolveResult),
    count: () => fetcher($set("count")(true)).then(resolveResult),
    // locale
    locale: (_locale) => query.where({ _locale }),
    withSurround: $set("surround", (surroundQuery, options) => ({ query: surroundQuery, ...options })),
    withDirConfig: () => $set("dirConfig")(true)
  };
  if (opts.legacy) {
    query.findSurround = (surroundQuery, options) => {
      return query.withSurround(surroundQuery, options).find().then(resolveResult);
    };
    return query;
  }
  return query;
}

const defineTransformer = (transformer) => {
  return transformer;
};

function createTokenizer(parser, initialize, from) {
  let point = Object.assign(
    {
      line: 1,
      column: 1,
      offset: 0
    },
    {
      _index: 0,
      _bufferIndex: -1
    }
  );
  const columnStart = {};
  const resolveAllConstructs = [];
  let chunks = [];
  let stack = [];
  const effects = {
    consume,
    enter,
    exit,
    attempt: constructFactory(onsuccessfulconstruct),
    check: constructFactory(onsuccessfulcheck),
    interrupt: constructFactory(onsuccessfulcheck, {
      interrupt: true
    })
  };
  const context = {
    previous: null,
    code: null,
    containerState: {},
    events: [],
    parser,
    sliceStream,
    sliceSerialize,
    now,
    defineSkip,
    write
  };
  let state = initialize.tokenize.call(context, effects);
  if (initialize.resolveAll) {
    resolveAllConstructs.push(initialize);
  }
  return context;
  function write(slice) {
    chunks = push(chunks, slice);
    main();
    if (chunks[chunks.length - 1] !== null) {
      return [];
    }
    addResult(initialize, 0);
    context.events = resolveAll(resolveAllConstructs, context.events, context);
    return context.events;
  }
  function sliceSerialize(token, expandTabs) {
    return serializeChunks(sliceStream(token), expandTabs);
  }
  function sliceStream(token) {
    return sliceChunks(chunks, token);
  }
  function now() {
    return Object.assign({}, point);
  }
  function defineSkip(value) {
    columnStart[value.line] = value.column;
    accountForPotentialSkip();
  }
  function main() {
    let chunkIndex;
    while (point._index < chunks.length) {
      const chunk = chunks[point._index];
      if (typeof chunk === "string") {
        chunkIndex = point._index;
        if (point._bufferIndex < 0) {
          point._bufferIndex = 0;
        }
        while (point._index === chunkIndex && point._bufferIndex < chunk.length) {
          go(chunk.charCodeAt(point._bufferIndex));
        }
      } else {
        go(chunk);
      }
    }
  }
  function go(code) {
    state = state(code);
  }
  function consume(code) {
    if (markdownLineEnding(code)) {
      point.line++;
      point.column = 1;
      point.offset += code === -3 ? 2 : 1;
      accountForPotentialSkip();
    } else if (code !== -1) {
      point.column++;
      point.offset++;
    }
    if (point._bufferIndex < 0) {
      point._index++;
    } else {
      point._bufferIndex++;
      if (point._bufferIndex === chunks[point._index].length) {
        point._bufferIndex = -1;
        point._index++;
      }
    }
    context.previous = code;
  }
  function enter(type, fields) {
    const token = fields || {};
    token.type = type;
    token.start = now();
    context.events.push(["enter", token, context]);
    stack.push(token);
    return token;
  }
  function exit(type) {
    const token = stack.pop();
    token.end = now();
    context.events.push(["exit", token, context]);
    return token;
  }
  function onsuccessfulconstruct(construct, info) {
    addResult(construct, info.from);
  }
  function onsuccessfulcheck(_, info) {
    info.restore();
  }
  function constructFactory(onreturn, fields) {
    return hook;
    function hook(constructs, returnState, bogusState) {
      let listOfConstructs;
      let constructIndex;
      let currentConstruct;
      let info;
      return Array.isArray(constructs) ? (
        /* c8 ignore next 1 */
        handleListOfConstructs(constructs)
      ) : "tokenize" in constructs ? handleListOfConstructs([constructs]) : handleMapOfConstructs(constructs);
      function handleMapOfConstructs(map) {
        return start;
        function start(code) {
          const def = code !== null && map[code];
          const all = code !== null && map.null;
          const list = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(def) ? def : def ? [def] : [],
            ...Array.isArray(all) ? all : all ? [all] : []
          ];
          return handleListOfConstructs(list)(code);
        }
      }
      function handleListOfConstructs(list) {
        listOfConstructs = list;
        constructIndex = 0;
        if (list.length === 0) {
          return bogusState;
        }
        return handleConstruct(list[constructIndex]);
      }
      function handleConstruct(construct) {
        return start;
        function start(code) {
          info = store();
          currentConstruct = construct;
          if (!construct.partial) {
            context.currentConstruct = construct;
          }
          if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) {
            return nok();
          }
          return construct.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            fields ? Object.assign(Object.create(context), fields) : context,
            effects,
            ok,
            nok
          )(code);
        }
      }
      function ok(code) {
        onreturn(currentConstruct, info);
        return returnState;
      }
      function nok(code) {
        info.restore();
        if (++constructIndex < listOfConstructs.length) {
          return handleConstruct(listOfConstructs[constructIndex]);
        }
        return bogusState;
      }
    }
  }
  function addResult(construct, from2) {
    if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
      resolveAllConstructs.push(construct);
    }
    if (construct.resolve) {
      splice(
        context.events,
        from2,
        context.events.length - from2,
        construct.resolve(context.events.slice(from2), context)
      );
    }
    if (construct.resolveTo) {
      context.events = construct.resolveTo(context.events, context);
    }
  }
  function store() {
    const startPoint = now();
    const startPrevious = context.previous;
    const startCurrentConstruct = context.currentConstruct;
    const startEventsIndex = context.events.length;
    const startStack = Array.from(stack);
    return {
      restore,
      from: startEventsIndex
    };
    function restore() {
      point = startPoint;
      context.previous = startPrevious;
      context.currentConstruct = startCurrentConstruct;
      context.events.length = startEventsIndex;
      stack = startStack;
      accountForPotentialSkip();
    }
  }
  function accountForPotentialSkip() {
    if (point.line in columnStart && point.column < 2) {
      point.column = columnStart[point.line];
      point.offset += columnStart[point.line] - 1;
    }
  }
}
function sliceChunks(chunks, token) {
  const startIndex = token.start._index;
  const startBufferIndex = token.start._bufferIndex;
  const endIndex = token.end._index;
  const endBufferIndex = token.end._bufferIndex;
  let view;
  if (startIndex === endIndex) {
    view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
  } else {
    view = chunks.slice(startIndex, endIndex);
    if (startBufferIndex > -1) {
      view[0] = view[0].slice(startBufferIndex);
    }
    if (endBufferIndex > 0) {
      view.push(chunks[endIndex].slice(0, endBufferIndex));
    }
  }
  return view;
}
function serializeChunks(chunks, expandTabs) {
  let index = -1;
  const result = [];
  let atTab;
  while (++index < chunks.length) {
    const chunk = chunks[index];
    let value;
    if (typeof chunk === "string") {
      value = chunk;
    } else
      switch (chunk) {
        case -5: {
          value = "\r";
          break;
        }
        case -4: {
          value = "\n";
          break;
        }
        case -3: {
          value = "\r\n";
          break;
        }
        case -2: {
          value = expandTabs ? " " : "	";
          break;
        }
        case -1: {
          if (!expandTabs && atTab) continue;
          value = " ";
          break;
        }
        default: {
          value = String.fromCharCode(chunk);
        }
      }
    atTab = chunk === -2;
    result.push(value);
  }
  return result.join("");
}

function initializeDocument(effects) {
  const self = this;
  const delimiter = (this.parser.delimiter || ",").charCodeAt(0);
  return enterRow;
  function enterRow(code) {
    return effects.attempt(
      { tokenize: attemptLastLine },
      (code2) => {
        effects.consume(code2);
        return enterRow;
      },
      (code2) => {
        effects.enter("row");
        return enterColumn(code2);
      }
    )(code);
  }
  function enterColumn(code) {
    effects.enter("column");
    return content(code);
  }
  function content(code) {
    if (code === null) {
      effects.exit("column");
      effects.exit("row");
      effects.consume(code);
      return content;
    }
    if (code === 34) {
      return quotedData(code);
    }
    if (code === delimiter) {
      if (self.previous === delimiter || markdownLineEnding(self.previous) || self.previous === null) {
        effects.enter("data");
        effects.exit("data");
      }
      effects.exit("column");
      effects.enter("columnSeparator");
      effects.consume(code);
      effects.exit("columnSeparator");
      effects.enter("column");
      return content;
    }
    if (markdownLineEnding(code)) {
      effects.exit("column");
      effects.enter("newline");
      effects.consume(code);
      effects.exit("newline");
      effects.exit("row");
      return enterRow;
    }
    return data(code);
  }
  function data(code) {
    effects.enter("data");
    return dataChunk(code);
  }
  function dataChunk(code) {
    if (code === null || markdownLineEnding(code) || code === delimiter) {
      effects.exit("data");
      return content(code);
    }
    if (code === 92) {
      return escapeCharacter(code);
    }
    effects.consume(code);
    return dataChunk;
  }
  function escapeCharacter(code) {
    effects.consume(code);
    return function(code2) {
      effects.consume(code2);
      return content;
    };
  }
  function quotedData(code) {
    effects.enter("quotedData");
    effects.enter("quotedDataChunk");
    effects.consume(code);
    return quotedDataChunk;
  }
  function quotedDataChunk(code) {
    if (code === 92) {
      return escapeCharacter(code);
    }
    if (code === 34) {
      return effects.attempt(
        { tokenize: attemptDoubleQuote },
        (code2) => {
          effects.exit("quotedDataChunk");
          effects.enter("quotedDataChunk");
          return quotedDataChunk(code2);
        },
        (code2) => {
          effects.consume(code2);
          effects.exit("quotedDataChunk");
          effects.exit("quotedData");
          return content;
        }
      )(code);
    }
    effects.consume(code);
    return quotedDataChunk;
  }
}
function attemptDoubleQuote(effects, ok, nok) {
  return startSequence;
  function startSequence(code) {
    if (code !== 34) {
      return nok(code);
    }
    effects.enter("quoteFence");
    effects.consume(code);
    return sequence;
  }
  function sequence(code) {
    if (code !== 34) {
      return nok(code);
    }
    effects.consume(code);
    effects.exit("quoteFence");
    return (code2) => ok(code2);
  }
}
function attemptLastLine(effects, ok, nok) {
  return enterLine;
  function enterLine(code) {
    if (!markdownSpace(code) && code !== null) {
      return nok(code);
    }
    effects.enter("emptyLine");
    return continueLine(code);
  }
  function continueLine(code) {
    if (markdownSpace(code)) {
      effects.consume(code);
      return continueLine;
    }
    if (code === null) {
      effects.exit("emptyLine");
      return ok(code);
    }
    return nok(code);
  }
}
const parse = (options) => {
  return createTokenizer(
    { ...options },
    { tokenize: initializeDocument });
};

const own = {}.hasOwnProperty;
const initialPoint = {
  line: 1,
  column: 1,
  offset: 0
};
const fromCSV = function(value, encoding, options) {
  if (typeof encoding !== "string") {
    options = encoding;
    encoding = void 0;
  }
  return compiler()(
    postprocess(
      parse(options).write(preprocess()(value, encoding, true))
    )
  );
};
function compiler() {
  const config = {
    enter: {
      column: opener(openColumn),
      row: opener(openRow),
      data: onenterdata,
      quotedData: onenterdata
    },
    exit: {
      row: closer(),
      column: closer(),
      data: onexitdata,
      quotedData: onexitQuotedData
    }
  };
  return compile;
  function compile(events) {
    const tree = {
      type: "root",
      children: []
    };
    const stack = [tree];
    const tokenStack = [];
    const context = {
      stack,
      tokenStack,
      config,
      enter,
      exit,
      resume
    };
    let index = -1;
    while (++index < events.length) {
      const handler = config[events[index][0]];
      if (own.call(handler, events[index][1].type)) {
        handler[events[index][1].type].call(
          Object.assign(
            {
              sliceSerialize: events[index][2].sliceSerialize
            },
            context
          ),
          events[index][1]
        );
      }
    }
    if (tokenStack.length > 0) {
      const tail = tokenStack[tokenStack.length - 1];
      const handler = tail[1] || defaultOnError;
      handler.call(context, void 0, tail[0]);
    }
    tree.position = {
      start: point(
        events.length > 0 ? events[0][1].start : initialPoint
      ),
      end: point(
        events.length > 0 ? events[events.length - 2][1].end : initialPoint
      )
    };
    return tree;
  }
  function point(d) {
    return {
      line: d.line,
      column: d.column,
      offset: d.offset
    };
  }
  function opener(create, and) {
    return open;
    function open(token) {
      enter.call(this, create(token), token);
    }
  }
  function enter(node, token, errorHandler) {
    const parent = this.stack[this.stack.length - 1];
    parent.children.push(node);
    this.stack.push(node);
    this.tokenStack.push([token, errorHandler]);
    node.position = {
      start: point(token.start)
    };
    return node;
  }
  function closer(and) {
    return close;
    function close(token) {
      exit.call(this, token);
    }
  }
  function exit(token, onExitError) {
    const node = this.stack.pop();
    const open = this.tokenStack.pop();
    if (!open) {
      throw new Error(
        "Cannot close `" + token.type + "` (" + stringifyPosition({
          start: token.start,
          end: token.end
        }) + "): it\u2019s not open"
      );
    } else if (open[0].type !== token.type) {
      if (onExitError) {
        onExitError.call(this, token, open[0]);
      } else {
        const handler = open[1] || defaultOnError;
        handler.call(this, token, open[0]);
      }
    }
    node.position.end = point(token.end);
    return node;
  }
  function resume() {
    return toString(this.stack.pop());
  }
  function onenterdata(token) {
    const parent = this.stack[this.stack.length - 1];
    let tail = parent.children[parent.children.length - 1];
    if (!tail || tail.type !== "text") {
      tail = text();
      tail.position = {
        start: point(token.start)
      };
      parent.children.push(tail);
    }
    this.stack.push(tail);
  }
  function onexitdata(token) {
    const tail = this.stack.pop();
    tail.value += this.sliceSerialize(token).trim().replace(/""/g, '"');
    tail.position.end = point(token.end);
  }
  function onexitQuotedData(token) {
    const tail = this.stack.pop();
    const value = this.sliceSerialize(token);
    tail.value += this.sliceSerialize(token).trim().substring(1, value.length - 1).replace(/""/g, '"');
    tail.position.end = point(token.end);
  }
  function text() {
    return {
      type: "text",
      value: ""
    };
  }
  function openColumn() {
    return {
      type: "column",
      children: []
    };
  }
  function openRow() {
    return {
      type: "row",
      children: []
    };
  }
}
function defaultOnError(left, right) {
  if (left) {
    throw new Error(
      "Cannot close `" + left.type + "` (" + stringifyPosition({
        start: left.start,
        end: left.end
      }) + "): a different token (`" + right.type + "`, " + stringifyPosition({
        start: right.start,
        end: right.end
      }) + ") is open"
    );
  } else {
    throw new Error(
      "Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
        start: right.start,
        end: right.end
      }) + ") is still open"
    );
  }
}

function csvParse(options) {
  const parser = (doc) => {
    return fromCSV(doc, options);
  };
  Object.assign(this, { Parser: parser });
  const toJsonObject = (tree) => {
    const [header, ...rows] = tree.children;
    const columns = header.children.map((col) => col.children[0].value);
    const data = rows.map((row) => {
      return row.children.reduce((acc, col, i) => {
        acc[String(columns[i])] = col.children[0]?.value;
        return acc;
      }, {});
    });
    return data;
  };
  const toJsonArray = (tree) => {
    const data = tree.children.map((row) => {
      return row.children.map((col) => col.children[0]?.value);
    });
    return data;
  };
  const compiler = (doc) => {
    if (options.json) {
      return toJsonObject(doc);
    }
    return toJsonArray(doc);
  };
  Object.assign(this, { Compiler: compiler });
}
const csv = defineTransformer({
  name: "csv",
  extensions: [".csv"],
  parse: async (_id, content, options = {}) => {
    const stream = unified().use(csvParse, {
      delimiter: ",",
      json: true,
      ...options
    });
    const { result } = await stream.process(content);
    return {
      _id,
      _type: "csv",
      body: result
    };
  }
});

function isTag(vnode, tag) {
  if (vnode.type === tag) {
    return true;
  }
  if (typeof vnode.type === "object" && vnode.type.tag === tag) {
    return true;
  }
  if (vnode.tag === tag) {
    return true;
  }
  return false;
}
function isText(vnode) {
  return isTag(vnode, "text") || isTag(vnode, Symbol.for("v-txt"));
}
function nodeChildren(node) {
  if (Array.isArray(node.children) || typeof node.children === "string") {
    return node.children;
  }
  if (typeof node.children?.default === "function") {
    return node.children.default();
  }
  return [];
}
function nodeTextContent(node) {
  if (!node) {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map(nodeTextContent).join("");
  }
  if (isText(node)) {
    return node.children || node.value || "";
  }
  const children = nodeChildren(node);
  if (Array.isArray(children)) {
    return children.map(nodeTextContent).filter(Boolean).join("");
  }
  return "";
}

const useProcessorPlugins = async (processor, plugins = {}) => {
  const toUse = Object.entries(plugins).filter((p) => p[1] !== false);
  for (const plugin of toUse) {
    const instance = plugin[1].instance || await import(
      /* @vite-ignore */
      plugin[0]
    ).then((m) => m.default || m);
    processor.use(instance, plugin[1].options);
  }
};

function emphasis(state, node) {
  const result = {
    type: "element",
    tagName: "em",
    properties: node.attributes || {},
    children: state.all(node)
  };
  state.patch(node, result);
  return state.applyData(node, result);
}

function parseThematicBlock(lang) {
  if (!lang?.trim()) {
    return {
      language: void 0,
      highlights: void 0,
      filename: void 0,
      meta: void 0
    };
  }
  const languageMatches = lang.replace(/[{|[](.+)/, "").match(/^[^ \t]+(?=[ \t]|$)/);
  const highlightTokensMatches = lang.match(/\{([^}]*)\}/);
  const filenameMatches = lang.match(/\[((\\\]|[^\]])*)\]/);
  const meta = lang.replace(languageMatches?.[0] ?? "", "").replace(highlightTokensMatches?.[0] ?? "", "").replace(filenameMatches?.[0] ?? "", "").trim();
  return {
    language: languageMatches?.[0] || void 0,
    highlights: parseHighlightedLines(highlightTokensMatches?.[1] || void 0),
    // https://github.com/nuxt/content/pull/2169
    filename: filenameMatches?.[1].replace(/\\\]/g, "]") || void 0,
    meta
  };
}
function parseHighlightedLines(lines) {
  const lineArray = String(lines || "").split(",").filter(Boolean).flatMap((line) => {
    const [start, end] = line.trim().split("-").map((a) => Number(a.trim()));
    return Array.from({ length: (end || start) - start + 1 }).map((_, i) => start + i);
  });
  return lineArray.length ? lineArray : void 0;
}
const TAG_NAME_REGEXP = /^<\/?([\w-]+)(\s[^>]*?)?\/?>/;
function getTagName(value) {
  const result = String(value).match(TAG_NAME_REGEXP);
  return result && result[1];
}

const code = (state, node) => {
  const lang = (node.lang || "") + " " + (node.meta || "");
  const { language, highlights, filename, meta } = parseThematicBlock(lang);
  const value = node.value ? detab(node.value + "\n") : "";
  let result = {
    type: "element",
    tagName: "code",
    properties: { __ignoreMap: "" },
    children: [{ type: "text", value }]
  };
  if (meta) {
    result.data = {
      meta
    };
  }
  state.patch(node, result);
  result = state.applyData(node, result);
  const properties = {
    language,
    filename,
    highlights,
    meta,
    code: value
  };
  if (language) {
    properties.className = ["language-" + language];
  }
  result = { type: "element", tagName: "pre", properties, children: [result] };
  state.patch(node, result);
  return result;
};

function html(state, node) {
  const tagName = getTagName(node.value);
  if (tagName && /[A-Z]/.test(tagName)) {
    node.value = node.value.replace(tagName, kebabCase(tagName));
  }
  if (state.dangerous || state.options?.allowDangerousHtml) {
    const result = { type: "raw", value: node.value };
    state.patch(node, result);
    return state.applyData(node, result);
  }
  return void 0;
}

function link$1(state, node) {
  const properties = {
    ...node.attributes || {},
    href: normalizeUri(node.url)
  };
  if (node.title !== null && node.title !== void 0) {
    properties.title = node.title;
  }
  const result = {
    type: "element",
    tagName: "a",
    properties,
    children: state.all(node)
  };
  state.patch(node, result);
  return state.applyData(node, result);
}

function list(state, node) {
  const properties = {};
  const results = state.all(node);
  let index = -1;
  if (typeof node.start === "number" && node.start !== 1) {
    properties.start = node.start;
  }
  while (++index < results.length) {
    const child = results[index];
    if (child.type === "element" && child.tagName === "li" && child.properties && Array.isArray(child.properties.className) && child.properties.className.includes("task-list-item")) {
      properties.className = ["contains-task-list"];
      break;
    }
  }
  if ((node.children || []).some((child) => typeof child.checked === "boolean")) {
    properties.className = ["contains-task-list"];
  }
  const result = {
    type: "element",
    tagName: node.ordered ? "ol" : "ul",
    properties,
    children: state.wrap(results, true)
  };
  state.patch(node, result);
  return state.applyData(node, result);
}

const htmlTags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "math",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];

function paragraph(state, node) {
  if (node.children && node.children[0] && node.children[0].type === "html") {
    const tagName = kebabCase(getTagName(node.children[0].value) || "div");
    if (!htmlTags.includes(tagName)) {
      return state.all(node);
    }
  }
  const result = {
    type: "element",
    tagName: "p",
    properties: {},
    children: state.all(node)
  };
  state.patch(node, result);
  return state.applyData(node, result);
}

function image(state, node) {
  const properties = { ...node.attributes, src: normalizeUri(node.url) };
  if (node.alt !== null && node.alt !== void 0) {
    properties.alt = node.alt;
  }
  if (node.title !== null && node.title !== void 0) {
    properties.title = node.title;
  }
  const result = { type: "element", tagName: "img", properties, children: [] };
  state.patch(node, result);
  return state.applyData(node, result);
}

function strong(state, node) {
  const result = {
    type: "element",
    tagName: "strong",
    properties: node.attributes || {},
    children: state.all(node)
  };
  state.patch(node, result);
  return state.applyData(node, result);
}

function inlineCode(state, node) {
  const language = node.attributes?.language || node.attributes?.lang;
  const text = { type: "text", value: node.value.replace(/\r?\n|\r/g, " ") };
  state.patch(node, text);
  const result = {
    type: "element",
    tagName: "code",
    properties: node.attributes || {},
    children: [text]
  };
  const classes = (result.properties.class || "").split(" ");
  delete result.properties.class;
  if (language) {
    result.properties.language = language;
    delete result.properties.lang;
    classes.push("language-" + language);
  }
  result.properties.className = classes.join(" ");
  state.patch(node, result);
  return state.applyData(node, result);
}

function containerComponent(state, node) {
  const result = {
    type: "element",
    tagName: node.name,
    properties: {
      ...node.attributes,
      ...node.data?.hProperties
    },
    children: state.all(node)
  };
  state.patch(node, result);
  result.attributes = node.attributes;
  result.fmAttributes = node.fmAttributes;
  return result;
}

const handlers$1 = {
  emphasis,
  code,
  link: link$1,
  paragraph,
  html,
  list,
  image,
  strong,
  inlineCode,
  containerComponent
};

const defaults = {
  remark: {
    plugins: {
      "remark-mdc": {
        instance: remarkMDC
      },
      "remark-emoji": {
        instance: remarkEmoji
      },
      "remark-gfm": {
        instance: remarkGFM
      }
    }
  },
  rehype: {
    options: {
      handlers: handlers$1,
      allowDangerousHtml: true
    },
    plugins: {
      "rehype-external-links": {
        instance: rehypeExternalLinks
      },
      "rehype-sort-attribute-values": {
        instance: rehypeSortAttributeValues
      },
      "rehype-sort-attributes": {
        instance: rehypeSortAttributes
      },
      "rehype-raw": {
        instance: rehypeRaw,
        options: {
          passThrough: ["element"]
        }
      }
    }
  },
  highlight: false,
  toc: {
    searchDepth: 2,
    depth: 2
  }
};

function flattenNodeText(node) {
  if (node.type === "comment") {
    return "";
  }
  if (node.type === "text") {
    return node.value || "";
  } else {
    return (node.children || []).reduce((text, child) => {
      return text.concat(flattenNodeText(child));
    }, "");
  }
}
function flattenNode(node, maxDepth = 2, _depth = 0) {
  if (!Array.isArray(node.children) || _depth === maxDepth) {
    return [node];
  }
  return [
    node,
    ...node.children.reduce((acc, child) => acc.concat(flattenNode(child, maxDepth, _depth + 1)), [])
  ];
}

const TOC_TAGS = ["h2", "h3", "h4", "h5", "h6"];
const TOC_TAGS_DEPTH = TOC_TAGS.reduce((tags, tag) => {
  tags[tag] = Number(tag.charAt(tag.length - 1));
  return tags;
}, {});
const getHeaderDepth = (node) => TOC_TAGS_DEPTH[node.tag];
const getTocTags = (depth) => {
  if (depth < 1 || depth > 5) {
    console.log(`\`toc.depth\` is set to ${depth}. It should be a number between 1 and 5. `);
    depth = 1;
  }
  return TOC_TAGS.slice(0, depth);
};
function nestHeaders(headers) {
  if (headers.length <= 1) {
    return headers;
  }
  const toc = [];
  let parent;
  headers.forEach((header) => {
    if (!parent || header.depth <= parent.depth) {
      header.children = [];
      parent = header;
      toc.push(header);
    } else {
      parent.children.push(header);
    }
  });
  toc.forEach((header) => {
    if (header.children?.length) {
      header.children = nestHeaders(header.children);
    } else {
      delete header.children;
    }
  });
  return toc;
}
function generateFlatToc(body, options) {
  const { searchDepth, depth, title = "" } = options;
  const tags = getTocTags(depth);
  const headers = flattenNode(body, searchDepth).filter((node) => tags.includes(node.tag || ""));
  const links = headers.map((node) => ({
    id: node.props?.id,
    depth: getHeaderDepth(node),
    text: flattenNodeText(node)
  }));
  return {
    title,
    searchDepth,
    depth,
    links
  };
}
function generateToc(body, options) {
  const toc = generateFlatToc(body, options);
  toc.links = nestHeaders(toc.links);
  return toc;
}

const unsafeLinkPrefix = [
  "javascript:",
  "data:text/html",
  "vbscript:",
  "data:text/javascript",
  "data:text/vbscript",
  "data:text/css",
  "data:text/plain",
  "data:text/xml"
];
const validateProp = (attribute, value) => {
  if (attribute.startsWith("on")) {
    return false;
  }
  if (attribute === "href" || attribute === "src") {
    return !unsafeLinkPrefix.some((prefix) => value.toLowerCase().startsWith(prefix));
  }
  return true;
};
const validateProps = (type, props) => {
  if (!props) {
    return {};
  }
  props = Object.fromEntries(
    Object.entries(props).filter(([name, value]) => {
      const isValid = validateProp(name, value);
      if (!isValid) {
        console.warn(`[@nuxtjs/mdc] removing unsafe attribute: ${name}="${value}"`);
      }
      return isValid;
    })
  );
  if (type === "pre") {
    if (typeof props.highlights === "string") {
      props.highlights = props.highlights.split(" ").map((i) => Number.parseInt(i));
    }
  }
  return props;
};

function compileHast(options = {}) {
  const slugs = new Slugger();
  function compileToJSON(node, parent) {
    if (node.type === "root") {
      return {
        type: "root",
        children: node.children.map((child) => compileToJSON(child, node)).filter(Boolean)
      };
    }
    if (node.type === "element") {
      if (node.tagName === "p" && node.children.every((child) => child.type === "text" && /^\s*$/.test(child.value))) {
        return null;
      }
      if (node.tagName === "li") {
        let hasPreviousParagraph = false;
        node.children = node.children?.flatMap((child) => {
          if (child.type === "element" && child.tagName === "p") {
            if (hasPreviousParagraph) {
              child.children.unshift({
                type: "element",
                tagName: "br",
                properties: {},
                children: []
              });
            }
            hasPreviousParagraph = true;
            return child.children;
          }
          return child;
        });
      }
      if (node.tagName?.match(/^h\d$/)) {
        node.properties = node.properties || {};
        node.properties.id = String(node.properties?.id || slugs.slug(toString$1(node))).replace(/-+/g, "-").replace(/^-|-$/g, "").replace(/^(\d)/, "_$1");
      }
      if (node.tagName === "component-slot") {
        node.tagName = "template";
      }
      const children = (node.tagName === "template" && node.content?.children.length ? node.content.children : node.children).map((child) => compileToJSON(child, node)).filter(Boolean);
      return {
        type: "element",
        tag: node.tagName,
        props: validateProps(node.tagName, node.properties),
        children
      };
    }
    if (node.type === "text") {
      if (!/^\n+$/.test(node.value || "") || parent?.properties?.emptyLinePlaceholder) {
        return {
          type: "text",
          value: node.value
        };
      }
    }
    if (options.keepComments && node.type === "comment") {
      return {
        type: "comment",
        value: node.value
      };
    }
    return null;
  }
  this.Compiler = (tree) => {
    const body = compileToJSON(tree);
    let excerpt = void 0;
    const excerptIndex = tree.children.findIndex((node) => node.type === "comment" && node.value?.trim() === "more");
    if (excerptIndex !== -1) {
      excerpt = compileToJSON({
        type: "root",
        children: tree.children.slice(0, excerptIndex)
      });
      if (excerpt.children.find((node) => node.type === "element" && node.tag === "pre")) {
        const lastChild = body.children[body.children.length - 1];
        if (lastChild.type === "element" && lastChild.tag === "style") {
          excerpt.children.push(lastChild);
        }
      }
    }
    body.children = (body.children || []).filter((child) => child.type !== "text");
    return {
      body,
      excerpt
    };
  };
}

let moduleOptions;
let generatedMdcConfigs;
const createMarkdownParser = async (inlineOptions = {}) => {
  if (!moduleOptions) {
    moduleOptions = await import(
      '../../build/mdc-imports.mjs'
      /* @vite-ignore */
    ).catch(() => ({}));
  }
  if (!generatedMdcConfigs) {
    generatedMdcConfigs = await import(
      '../../build/mdc-configs.mjs'
      /* @vite-ignore */
    ).then((r) => r.getMdcConfigs()).catch(() => []);
  }
  const mdcConfigs = [
    ...generatedMdcConfigs || [],
    ...inlineOptions.configs || []
  ];
  if (inlineOptions.highlight != null && inlineOptions.highlight != false && inlineOptions.highlight.highlighter !== void 0 && typeof inlineOptions.highlight.highlighter !== "function") {
    inlineOptions = {
      ...inlineOptions,
      highlight: {
        ...inlineOptions.highlight
      }
    };
    delete inlineOptions.highlight.highlighter;
  }
  const options = defu(inlineOptions, {
    remark: { plugins: moduleOptions?.remarkPlugins },
    rehype: { plugins: moduleOptions?.rehypePlugins },
    highlight: moduleOptions?.highlight
  }, defaults);
  if (options.rehype?.plugins?.highlight) {
    options.rehype.plugins.highlight.options = {
      ...options.rehype.plugins.highlight.options || {},
      ...options.highlight || {}
    };
  }
  let processor = unified();
  for (const config of mdcConfigs) {
    processor = await config.unified?.pre?.(processor) || processor;
  }
  processor.use(remarkParse);
  for (const config of mdcConfigs) {
    processor = await config.unified?.remark?.(processor) || processor;
  }
  await useProcessorPlugins(processor, options.remark?.plugins);
  processor.use(remark2rehype, options.rehype?.options);
  for (const config of mdcConfigs) {
    processor = await config.unified?.rehype?.(processor) || processor;
  }
  await useProcessorPlugins(processor, options.rehype?.plugins);
  processor.use(compileHast, options);
  for (const config of mdcConfigs) {
    processor = await config.unified?.post?.(processor) || processor;
  }
  return async (md) => {
    const { content, data: frontmatter } = await parseFrontMatter(md);
    const processedFile = await processor.process({ value: content, data: frontmatter });
    const result = processedFile.result;
    const data = Object.assign(
      contentHeading(result.body),
      frontmatter,
      processedFile?.data || {}
    );
    let toc;
    if (data.toc !== false) {
      const tocOption = defu(data.toc || {}, options.toc);
      toc = generateToc(result.body, tocOption);
    }
    return {
      data,
      body: result.body,
      excerpt: result.excerpt,
      toc
    };
  };
};
const parseMarkdown = async (md, inlineOptions = {}) => {
  const parser = await createMarkdownParser(inlineOptions);
  return parser(md);
};
function contentHeading(body) {
  let title = "";
  let description = "";
  const children = body.children.filter((node) => node.type === "element" && node.tag !== "hr");
  if (children.length && children[0].tag === "h1") {
    const node = children.shift();
    title = nodeTextContent(node);
  }
  if (children.length && children[0].tag === "p") {
    const node = children.shift();
    description = nodeTextContent(node);
  }
  return {
    title,
    description
  };
}

const SEMVER_REGEX = /^(\d+)(\.\d+)*(\.x)?$/;
const describeId = (id) => {
  const [_source, ...parts] = id.split(":");
  const [, basename, _extension] = parts[parts.length - 1]?.match(/(.*)\.([^.]+)$/) || [];
  if (basename) {
    parts[parts.length - 1] = basename;
  }
  const _path = (parts || []).join("/");
  return {
    _source,
    _path,
    _extension,
    _file: _extension ? `${_path}.${_extension}` : _path,
    _basename: basename || ""
  };
};
const pathMeta = defineTransformer({
  name: "path-meta",
  extensions: [".*"],
  transform(content, options = {}) {
    const { locales = [], defaultLocale = "en", respectPathCase = false } = options;
    const { _source, _file, _path, _extension, _basename } = describeId(content._id);
    const parts = _path.split("/");
    const _locale = locales.includes(parts[0]) ? parts.shift() : defaultLocale;
    const filePath = generatePath(parts.join("/"), { respectPathCase });
    return {
      _path: filePath,
      _dir: filePath.split("/").slice(-2)[0],
      _draft: content._draft ?? isDraft(_path),
      _partial: isPartial(_path),
      _locale,
      ...content,
      // TODO: move title to Markdown parser
      title: content.title || generateTitle(refineUrlPart(_basename)),
      _source,
      _file,
      _stem: _path,
      _extension
    };
  }
});
const isDraft = (path) => !!path.match(/\.draft(\/|\.|$)/);
const isPartial = (path) => path.split(/[:/]/).some((part) => part.match(/^_.*/));
const generatePath = (path, { forceLeadingSlash = true, respectPathCase = false } = {}) => {
  path = path.split("/").map((part) => slugify(refineUrlPart(part), { lower: !respectPathCase })).join("/");
  return forceLeadingSlash ? withLeadingSlash(withoutTrailingSlash(path)) : path;
};
const generateTitle = (path) => path.split(/[\s-]/g).map(pascalCase).join(" ");
function refineUrlPart(name) {
  name = name.split(/[/:]/).pop();
  if (SEMVER_REGEX.test(name)) {
    return name;
  }
  return name.replace(/(\d+\.)?(.*)/, "$2").replace(/^index(\.draft)?$/, "").replace(/\.draft$/, "");
}

const markdown = defineTransformer({
  name: "markdown",
  extensions: [".md"],
  parse: async (_id, content, options = {}) => {
    const config = { ...options };
    config.rehypePlugins = await importPlugins(config.rehypePlugins);
    config.remarkPlugins = await importPlugins(config.remarkPlugins);
    const highlightOptions = options.highlight ? {
      ...options.highlight,
      // Pass only when it's an function. String values are handled by `@nuxtjs/mdc`
      highlighter: typeof options.highlight?.highlighter === "function" ? options.highlight.highlighter : void 0
    } : void 0;
    const parsed = await parseMarkdown(content, {
      ...config,
      highlight: highlightOptions,
      remark: {
        plugins: config.remarkPlugins
      },
      rehype: {
        options: {
          handlers: {
            link
          }
        },
        plugins: config.rehypePlugins
      },
      toc: config.toc
    });
    return {
      ...parsed.data,
      excerpt: parsed.excerpt,
      body: {
        ...parsed.body,
        toc: parsed.toc
      },
      _type: "markdown",
      _id
    };
  }
});
async function importPlugins(plugins = {}) {
  const resolvedPlugins = {};
  for (const [name, plugin] of Object.entries(plugins)) {
    if (plugin) {
      resolvedPlugins[name] = {
        instance: plugin.instance || await import(
          /* @vite-ignore */
          name
        ).then((m) => m.default || m),
        options: plugin
      };
    } else {
      resolvedPlugins[name] = false;
    }
  }
  return resolvedPlugins;
}
function link(state, node) {
  const properties = {
    ...node.attributes || {},
    href: normalizeUri(normalizeLink(node.url))
  };
  if (node.title !== null && node.title !== void 0) {
    properties.title = node.title;
  }
  const result = {
    type: "element",
    tagName: "a",
    properties,
    children: state.all(node)
  };
  state.patch(node, result);
  return state.applyData(node, result);
}
function normalizeLink(link2) {
  const match = link2.match(/#.+$/);
  const hash = match ? match[0] : "";
  if (link2.replace(/#.+$/, "").endsWith(".md") && (isRelative(link2) || !/^https?/.test(link2) && !link2.startsWith("/"))) {
    return generatePath(link2.replace(".md" + hash, ""), { forceLeadingSlash: false }) + hash;
  } else {
    return link2;
  }
}

const yaml = defineTransformer({
  name: "Yaml",
  extensions: [".yml", ".yaml"],
  parse: (_id, content) => {
    const { data } = parseFrontMatter(`---
${content}
---`);
    let parsed = data;
    if (Array.isArray(data)) {
      console.warn(`YAML array is not supported in ${_id}, moving the array into the \`body\` key`);
      parsed = { body: data };
    }
    return {
      ...parsed,
      _id,
      _type: "yaml"
    };
  }
});

const json = defineTransformer({
  name: "Json",
  extensions: [".json", ".json5"],
  parse: async (_id, content) => {
    let parsed;
    if (typeof content === "string") {
      if (_id.endsWith("json5")) {
        parsed = (await import('json5').then((m) => m.default || m)).parse(content);
      } else if (_id.endsWith("json")) {
        parsed = destr(content);
      }
    } else {
      parsed = content;
    }
    if (Array.isArray(parsed)) {
      console.warn(`JSON array is not supported in ${_id}, moving the array into the \`body\` key`);
      parsed = {
        body: parsed
      };
    }
    return {
      ...parsed,
      _id,
      _type: "json"
    };
  }
});

const TRANSFORMERS = [
  csv,
  markdown,
  json,
  yaml,
  pathMeta
];
function getParser(ext, additionalTransformers = []) {
  let parser = additionalTransformers.find((p) => ext.match(new RegExp(p.extensions.join("|"), "i")) && p.parse);
  if (!parser) {
    parser = TRANSFORMERS.find((p) => ext.match(new RegExp(p.extensions.join("|"), "i")) && p.parse);
  }
  return parser;
}
function getTransformers(ext, additionalTransformers = []) {
  return [
    ...additionalTransformers.filter((p) => ext.match(new RegExp(p.extensions.join("|"), "i")) && p.transform),
    ...TRANSFORMERS.filter((p) => ext.match(new RegExp(p.extensions.join("|"), "i")) && p.transform)
  ];
}
async function transformContent(id, content, options = {}) {
  const { transformers = [] } = options;
  const file = { _id: id, body: content };
  const ext = extname(id);
  const parser = getParser(ext, transformers);
  if (!parser) {
    console.warn(`${ext} files are not supported, "${id}" falling back to raw content`);
    return file;
  }
  const parserOptions = options[camelCase(parser.name)] || {};
  const parsed = await parser.parse(file._id, file.body, parserOptions);
  const matchedTransformers = getTransformers(ext, transformers);
  const result = await matchedTransformers.reduce(async (prev, cur) => {
    const next = await prev || parsed;
    const transformOptions = options[camelCase(cur.name)];
    if (transformOptions === false) {
      return next;
    }
    return cur.transform(next, transformOptions || {});
  }, Promise.resolve(parsed));
  return result;
}

function makeIgnored(ignores) {
  const rxAll = ["/\\.", "/-", ...ignores.filter((p) => p)].map((p) => new RegExp(p));
  return function isIgnored(key) {
    const path = "/" + key.replace(/:/g, "/");
    return rxAll.some((rx) => rx.test(path));
  };
}

function createMatch(opts = {}) {
  const operators = createOperators(match, opts.operators);
  function match(item, conditions) {
    if (typeof conditions !== "object" || conditions instanceof RegExp) {
      return operators.$eq(item, conditions);
    }
    return Object.keys(conditions || {}).every((key) => {
      const condition = conditions[key];
      if (key.startsWith("$") && operators[key]) {
        const fn = operators[key];
        return typeof fn === "function" ? fn(item, condition) : false;
      }
      return match(get(item, key), condition);
    });
  }
  return match;
}
function createOperators(match, operators = {}) {
  return {
    $match: (item, condition) => match(item, condition),
    /**
     * Match if item equals condition
     **/
    $eq: (item, condition) => condition instanceof RegExp ? condition.test(item) : item === condition,
    /**
     * Match if item not equals condition
     **/
    $ne: (item, condition) => condition instanceof RegExp ? !condition.test(item) : item !== condition,
    /**
     * Match is condition is false
     **/
    $not: (item, condition) => !match(item, condition),
    /**
     * Match only if all of nested conditions are true
     **/
    $and: (item, condition) => {
      assertArray(condition, "$and requires an array as condition");
      return condition.every((cond) => match(item, cond));
    },
    /**
     * Match if any of nested conditions is true
     **/
    $or: (item, condition) => {
      assertArray(condition, "$or requires an array as condition");
      return condition.some((cond) => match(item, cond));
    },
    /**
     * Match if item is in condition array
     **/
    $in: (item, condition) => ensureArray(condition).some(
      (cond) => Array.isArray(item) ? match(item, { $contains: cond }) : match(item, cond)
    ),
    /**
     * Match if item contains every condition or match every rule in condition array
     **/
    $contains: (item, condition) => {
      item = Array.isArray(item) ? item : String(item);
      return ensureArray(condition).every((i) => item.includes(i));
    },
    /**
     * Ignore case contains
     **/
    $icontains: (item, condition) => {
      if (typeof condition !== "string") {
        throw new TypeError("$icontains requires a string, use $contains instead");
      }
      item = String(item).toLocaleLowerCase();
      return ensureArray(condition).every((i) => item.includes(i.toLocaleLowerCase()));
    },
    /**
     * Match if item contains at least one rule from condition array
     */
    $containsAny: (item, condition) => {
      assertArray(condition, "$containsAny requires an array as condition");
      item = Array.isArray(item) ? item : String(item);
      return condition.some((i) => item.includes(i));
    },
    /**
     * Check key existence
     */
    $exists: (item, condition) => condition ? typeof item !== "undefined" : typeof item === "undefined",
    /**
     * Match if type of item equals condition
     */
    $type: (item, condition) => typeof item === String(condition),
    /**
     * Provides regular expression capabilities for pattern matching strings.
     */
    $regex: (item, condition) => {
      if (!(condition instanceof RegExp)) {
        const matched = String(condition).match(/\/(.*)\/([dgimsuy]*)$/);
        condition = matched?.[1] ? new RegExp(matched[1], matched[2] || "") : new RegExp(condition);
      }
      return condition.test(String(item || ""));
    },
    /**
     * Check if item is less than condition
     */
    $lt: (item, condition) => {
      return item < condition;
    },
    /**
     * Check if item is less than or equal to condition
     */
    $lte: (item, condition) => {
      return item <= condition;
    },
    /**
     * Check if item is greater than condition
     */
    $gt: (item, condition) => {
      return item > condition;
    },
    /**
     * Check if item is greater than or equal to condition
     */
    $gte: (item, condition) => {
      return item >= condition;
    },
    ...operators || {}
  };
}

function createPipelineFetcher(getContentsList) {
  const match = createMatch();
  const surround = (data, { query, before, after }) => {
    const matchQuery = typeof query === "string" ? { _path: query } : query;
    const index = data.findIndex((item) => match(item, matchQuery));
    before = before ?? 1;
    after = after ?? 1;
    const slice = new Array(before + after).fill(null, 0);
    return index === -1 ? slice : slice.map((_, i) => data[index - before + i + Number(i >= before)] || null);
  };
  const matchingPipelines = [
    // Conditions
    (state, params) => {
      const filtered = state.result.filter((item) => ensureArray(params.where).every((matchQuery) => match(item, matchQuery)));
      return {
        ...state,
        result: filtered,
        total: filtered.length
      };
    },
    // Sort data
    (state, params) => ensureArray(params.sort).forEach((options) => sortList(state.result, options)),
    function fetchSurround(state, params, db) {
      if (params.surround) {
        let _surround = surround(state.result?.length === 1 ? db : state.result, params.surround);
        _surround = apply(withoutKeys(params.without))(_surround);
        _surround = apply(withKeys(params.only))(_surround);
        state.surround = _surround;
      }
      return state;
    }
  ];
  const transformingPiples = [
    // Skip first items
    (state, params) => {
      if (params.skip) {
        return {
          ...state,
          result: state.result.slice(params.skip),
          skip: params.skip
        };
      }
    },
    // Pick first items
    (state, params) => {
      if (params.limit) {
        return {
          ...state,
          result: state.result.slice(0, params.limit),
          limit: params.limit
        };
      }
    },
    function fetchDirConfig(state, params, db) {
      if (params.dirConfig) {
        const path = state.result[0]?._path || params.where?.find((w) => w._path)?._path;
        if (typeof path === "string") {
          const dirConfig = db.find((item) => item._path === joinURL(path, "_dir"));
          if (dirConfig) {
            state.dirConfig = { _path: dirConfig._path, ...withoutKeys(["_"])(dirConfig) };
          }
        }
      }
      return state;
    },
    // Remove unwanted fields
    (state, params) => ({
      ...state,
      result: apply(withoutKeys(params.without))(state.result)
    }),
    // Select only wanted fields
    (state, params) => ({
      ...state,
      result: apply(withKeys(params.only))(state.result)
    })
  ];
  return async (query) => {
    const db = await getContentsList();
    const params = query.params();
    const result1 = {
      result: db,
      limit: 0,
      skip: 0,
      total: db.length
    };
    const matchedData = matchingPipelines.reduce(($data, pipe) => pipe($data, params, db) || $data, result1);
    if (params.count) {
      return {
        result: matchedData.result.length
      };
    }
    const result = transformingPiples.reduce(($data, pipe) => pipe($data, params, db) || $data, matchedData);
    if (params.first) {
      return {
        ...omit(["skip", "limit", "total"])(result),
        result: result.result[0]
      };
    }
    return result;
  };
}

const isPreview = (event) => {
  const previewToken = getQuery$1(event).previewToken || getCookie(event, "previewToken");
  return !!previewToken;
};
const getPreview = (event) => {
  const key = getQuery$1(event).previewToken || getCookie(event, "previewToken");
  return { key };
};

async function getContentIndex(event) {
  const defaultLocale = useRuntimeConfig().content.defaultLocale;
  let contentIndex = await cacheStorage().getItem("content-index.json");
  if (!contentIndex) {
    const data = await getContentsList(event);
    contentIndex = data.reduce((acc, item) => {
      acc[item._path] = acc[item._path] || [];
      if (item._locale === defaultLocale) {
        acc[item._path].unshift(item._id);
      } else {
        acc[item._path].push(item._id);
      }
      return acc;
    }, {});
    await cacheStorage().setItem("content-index.json", contentIndex);
  }
  return contentIndex;
}
async function getIndexedContentsList(event, query) {
  const params = query.params();
  const path = params?.where?.find((wh) => wh._path)?._path;
  if (!isPreview(event) && !params.surround && !params.dirConfig && (typeof path === "string" || path instanceof RegExp)) {
    const index = await getContentIndex(event);
    const keys = Object.keys(index).filter((key) => path.test ? path.test(key) : key === String(path)).flatMap((key) => index[key]);
    const keyChunks = [...chunksFromArray(keys, 10)];
    const contents = [];
    for await (const chunk of keyChunks) {
      const result = await Promise.all(chunk.map((key) => getContent(event, key)));
      contents.push(...result);
    }
    return contents;
  }
  return getContentsList(event);
}

const transformers = [];

let _sourceStorage;
let _cacheStorage;
let _cacheParsedStorage;
const sourceStorage = () => {
  if (!_sourceStorage) {
    _sourceStorage = prefixStorage(useStorage(), "content:source");
  }
  return _sourceStorage;
};
const cacheStorage = () => {
  if (!_cacheStorage) {
    _cacheStorage = prefixStorage(useStorage(), "cache:content");
  }
  return _cacheStorage;
};
const cacheParsedStorage = () => {
  if (!_cacheParsedStorage) {
    _cacheParsedStorage = prefixStorage(useStorage(), "cache:content:parsed");
  }
  return _cacheParsedStorage;
};
const contentConfig = () => useRuntimeConfig().content;
const invalidKeyCharacters = `'"?#/`.split("");
const contentIgnorePredicate = (key) => {
  const isIgnored = makeIgnored(contentConfig().ignores);
  if (key.startsWith("preview:") || isIgnored(key)) {
    return false;
  }
  if (invalidKeyCharacters.some((ik) => key.includes(ik))) {
    console.warn(`Ignoring [${key}]. File name should not contain any of the following characters: ${invalidKeyCharacters.join(", ")}`);
    return false;
  }
  return true;
};
const getContentsIds = async (event, prefix) => {
  let keys = [];
  {
    keys = await cacheParsedStorage().getKeys(prefix);
  }
  const source = sourceStorage();
  if (keys.length === 0) {
    keys = await source.getKeys(prefix);
  }
  if (isPreview(event)) {
    const { key } = getPreview(event);
    const previewPrefix = `preview:${key}:${prefix || ""}`;
    const previewKeys = await source.getKeys(previewPrefix);
    if (previewKeys.length) {
      const keysSet = new Set(keys);
      await Promise.all(
        previewKeys.map(async (key2) => {
          const meta = await source.getMeta(key2);
          if (meta?.__deleted) {
            keysSet.delete(key2.substring(previewPrefix.length));
          } else {
            keysSet.add(key2.substring(previewPrefix.length));
          }
        })
      );
      keys = Array.from(keysSet);
    }
  }
  return keys.filter(contentIgnorePredicate);
};
function* chunksFromArray(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}
const getContentsList = /* @__PURE__ */ (() => {
  let pendingContentsListPromise = null;
  const _getContentsList = async (event, prefix) => {
    const keys = await getContentsIds(event, prefix);
    const keyChunks = [...chunksFromArray(keys, 10)];
    const contents = [];
    for (const chunk of keyChunks) {
      const result = await Promise.all(chunk.map((key) => getContent(event, key)));
      contents.push(...result);
    }
    return contents.filter((c) => c && c._path);
  };
  return (event, prefix) => {
    if (event.context.__contentList) {
      return event.context.__contentList;
    }
    if (!pendingContentsListPromise) {
      pendingContentsListPromise = _getContentsList(event, prefix);
      pendingContentsListPromise.then((result) => {
        event.context.__contentList = result;
        pendingContentsListPromise = null;
      });
    }
    return pendingContentsListPromise;
  };
})();
const pendingPromises = {};
const getContent = async (event, id) => {
  const contentId = id;
  if (!contentIgnorePredicate(id)) {
    return { _id: contentId, body: null };
  }
  const source = sourceStorage();
  const cache = cacheParsedStorage();
  if (isPreview(event)) {
    const { key } = getPreview(event);
    const previewId = `preview:${key}:${id}`;
    const draft = await source.getItem(previewId);
    if (draft) {
      id = previewId;
    }
  }
  const cached = await cache.getItem(id);
  if (cached) {
    return cached.parsed;
  }
  const config = contentConfig();
  const meta = await source.getMeta(id);
  const mtime = meta.mtime;
  const size = meta.size || 0;
  const hash$1 = hash({
    // Last modified time
    mtime,
    // File size
    size,
    // Add Content version to the hash, to revalidate the cache on content update
    version: config.cacheVersion,
    integrity: config.cacheIntegrity
  });
  if (cached?.hash === hash$1) {
    return cached.parsed;
  }
  if (!pendingPromises[id + hash$1]) {
    pendingPromises[id + hash$1] = new Promise(async (resolve) => {
      const body = await source.getItem(id);
      if (body === null) {
        return resolve({ _id: contentId, body: null });
      }
      const parsed = await parseContent(contentId, body);
      await cache.setItem(id, { parsed, hash: hash$1 }).catch(() => {
      });
      resolve(parsed);
      delete pendingPromises[id + hash$1];
    });
  }
  return pendingPromises[id + hash$1];
};
const parseContent = async (id, content, opts = {}) => {
  const nitroApp = useNitroApp();
  const config = contentConfig();
  const options = defu(
    opts,
    {
      markdown: {
        ...config.markdown,
        highlight: config.highlight
      },
      csv: config.csv,
      yaml: config.yaml,
      transformers: transformers,
      pathMeta: {
        defaultLocale: config.defaultLocale,
        locales: config.locales,
        respectPathCase: config.respectPathCase
      }
    }
  );
  const file = { _id: id, body: typeof content === "string" ? content.replace(/\r\n|\r/g, "\n") : content };
  await nitroApp.hooks.callHook("content:file:beforeParse", file);
  const result = await transformContent(id, file.body, options);
  await nitroApp.hooks.callHook("content:file:afterParse", result);
  return result;
};
const createServerQueryFetch = (event) => (query) => {
  return createPipelineFetcher(() => getIndexedContentsList(event, query))(query);
};
function serverQueryContent(event, query, ...pathParts) {
  const { advanceQuery } = useRuntimeConfig().public.content.experimental;
  const config = contentConfig();
  const queryBuilder = advanceQuery ? createQuery(createServerQueryFetch(event), { initialParams: typeof query !== "string" ? query || {} : {}, legacy: false }) : createQuery(createServerQueryFetch(event), { initialParams: typeof query !== "string" ? query || {} : {}, legacy: true });
  let path;
  if (typeof query === "string") {
    path = withLeadingSlash(joinURL(query, ...pathParts));
  }
  const originalParamsFn = queryBuilder.params;
  queryBuilder.params = () => {
    const params = originalParamsFn();
    if (path) {
      params.where = params.where || [];
      if (params.first && (params.where || []).length === 0) {
        params.where.push({ _path: withoutTrailingSlash(path) });
      } else {
        params.where.push({ _path: new RegExp(`^${path.replace(/[-[\]{}()*+.,^$\s/]/g, "\\$&")}`) });
      }
    }
    if (!params.sort?.length) {
      params.sort = [{ _stem: 1, $numeric: true }];
    }
    {
      params.where = params.where || [];
      if (!params.where.find((item) => typeof item._draft !== "undefined")) {
        params.where.push({ _draft: { $ne: true } });
      }
    }
    if (config.locales.length) {
      const queryLocale = params.where?.find((w) => w._locale)?._locale;
      if (!queryLocale) {
        params.where = params.where || [];
        params.where.push({ _locale: config.defaultLocale });
      }
    }
    return params;
  };
  return queryBuilder;
}

function jsonParse(value) {
  return JSON.parse(value, regExpReviver);
}
function regExpReviver(_key, value) {
  const withOperator = typeof value === "string" && value.match(/^--([A-Z]+) (.+)$/) || [];
  if (withOperator[1] === "REGEX") {
    const regex = withOperator[2]?.match(/\/(.*)\/([dgimsuy]*)$/);
    return regex?.[1] ? new RegExp(regex[1], regex[2] || "") : value;
  }
  return value;
}

const parseJSONQueryParams = (body) => {
  try {
    return jsonParse(body);
  } catch (e) {
    throw createError$1({ statusCode: 400, message: "Invalid _params query" });
  }
};
const decodeQueryParams = (encoded) => {
  encoded = encoded.replace(/\//g, "");
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  encoded = encoded.padEnd(encoded.length + (4 - encoded.length % 4) % 4, "=");
  return parseJSONQueryParams(typeof Buffer !== "undefined" ? Buffer.from(encoded, "base64").toString() : atob(encoded));
};
const memory = {};
const getContentQuery = (event) => {
  const { params } = event.context.params || {};
  if (params) {
    return decodeQueryParams(params.replace(/.json$/, ""));
  }
  const qid = event.context.params?.qid?.replace(/.json$/, "");
  const query = getQuery$1(event) || {};
  if (qid && query._params) {
    memory[qid] = parseJSONQueryParams(decodeURIComponent(query._params));
    if (memory[qid]?.where && !Array.isArray(memory[qid]?.where)) {
      memory[qid].where = [memory[qid].where];
    }
    return memory[qid];
  }
  if (qid && memory[qid]) {
    return memory[qid];
  }
  if (query._params) {
    return parseJSONQueryParams(decodeURIComponent(query._params));
  }
  if (typeof query.only === "string" && query.only.includes(",")) {
    query.only = query.only.split(",").map((s) => s.trim());
  }
  if (typeof query.without === "string" && query.without.includes(",")) {
    query.without = query.without.split(",").map((s) => s.trim());
  }
  const where = query.where || {};
  for (const key of ["draft", "partial", "empty"]) {
    if (query[key] && ["true", "false"].includes(query[key])) {
      where[key] = query[key] === "true";
      delete query[key];
    }
  }
  if (query.sort) {
    query.sort = String(query.sort).split(",").map((s) => {
      const [key, order] = s.split(":");
      return [key, Number.parseInt(order || "0", 10)];
    });
  }
  const reservedKeys = ["partial", "draft", "only", "without", "where", "sort", "limit", "skip"];
  for (const key of Object.keys(query)) {
    if (reservedKeys.includes(key)) {
      continue;
    }
    query.where = query.where || {};
    query.where[key] = query[key];
  }
  if (Object.keys(where).length > 0) {
    query.where = [where];
  } else {
    delete query.where;
  }
  return query;
};

const _vmP9J5 = defineEventHandler(async (event) => {
  const query = getContentQuery(event);
  const { advanceQuery } = useRuntimeConfig().public.content.experimental;
  if (query.first) {
    let contentQuery = serverQueryContent(event, query);
    if (!advanceQuery) {
      contentQuery = contentQuery.withDirConfig();
    }
    const content = await contentQuery.findOne();
    const _result = advanceQuery ? content?.result : content;
    const missing = !_result && !content?.dirConfig?.navigation?.redirect && !content?._dir?.navigation?.redirect;
    if (missing) {
      throw createError$1({
        statusMessage: "Document not found!",
        statusCode: 404,
        data: {
          description: "Could not find document for the given query.",
          query
        }
      });
    }
    return content;
  }
  if (query.count) {
    return serverQueryContent(event, query).count();
  }
  return serverQueryContent(event, query).find();
});

const _azf43q = defineEventHandler(async (event) => {
  const { content } = useRuntimeConfig();
  const now = Date.now();
  const contents = await serverQueryContent(event).find();
  await getContentIndex(event);
  const navigation = await $fetch(`${content.api.baseURL}/navigation`);
  await cacheStorage().setItem("content-navigation.json", navigation);
  return {
    generatedAt: now,
    generateTime: Date.now() - now,
    contents: content.experimental.cacheContents ? contents : [],
    navigation
  };
});

function createNav(contents, configs) {
  const { navigation } = useRuntimeConfig().public.content;
  if (navigation === false) {
    return [];
  }
  const pickNavigationFields = (content) => ({
    ...pick(["title", ...navigation.fields])(content),
    ...isObject(content?.navigation) ? content.navigation : {}
  });
  const nav = contents.sort((a, b) => a._path.localeCompare(b._path)).reduce((nav2, content) => {
    const parts = content._path.substring(1).split("/");
    const idParts = content._id.split(":").slice(1);
    const isIndex = !!idParts[idParts.length - 1]?.match(/([1-9][0-9]*\.)?index.md/g);
    const getNavItem = (content2) => ({
      title: content2.title,
      _path: content2._path,
      _file: content2._file,
      children: [],
      ...pickNavigationFields(content2),
      ...content2._draft ? { _draft: true } : {}
    });
    const navItem = getNavItem(content);
    if (isIndex) {
      const dirConfig = configs[navItem._path];
      if (typeof dirConfig?.navigation !== "undefined" && !dirConfig?.navigation) {
        return nav2;
      }
      if (content._path !== "/") {
        const indexItem = getNavItem(content);
        navItem.children.push(indexItem);
      }
      if (dirConfig) {
        Object.assign(
          navItem,
          pickNavigationFields(dirConfig)
        );
      }
    }
    if (parts.length === 1) {
      nav2.push(navItem);
      return nav2;
    }
    const siblings = parts.slice(0, -1).reduce((nodes, part, i) => {
      const currentPathPart = "/" + parts.slice(0, i + 1).join("/");
      const conf = configs[currentPathPart];
      if (typeof conf?.navigation !== "undefined" && !conf.navigation) {
        return [];
      }
      let parent = nodes.find((n) => n._path === currentPathPart);
      if (!parent) {
        parent = {
          title: generateTitle(part),
          _path: currentPathPart,
          _file: content._file,
          children: [],
          ...conf && pickNavigationFields(conf)
        };
        nodes.push(parent);
      }
      return parent.children;
    }, nav2);
    siblings.push(navItem);
    return nav2;
  }, []);
  return sortAndClear(nav);
}
const collator = new Intl.Collator(void 0, { numeric: true, sensitivity: "base" });
function sortAndClear(nav) {
  nav.forEach((item) => {
    item._file = item._file.split(".").slice(0, -1).join(".");
  });
  const sorted = nav.sort((a, b) => collator.compare(a._file, b._file));
  for (const item of sorted) {
    if (item.children?.length) {
      sortAndClear(item.children);
    } else {
      delete item.children;
    }
    delete item._file;
  }
  return nav;
}
function pick(keys) {
  return (obj) => {
    obj = obj || {};
    if (keys && keys.length) {
      return keys.filter((key) => typeof obj[key] !== "undefined").reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {});
    }
    return obj;
  };
}
function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

const _z0dc41 = defineEventHandler(async (event) => {
  const query = getContentQuery(event);
  if (!isPreview(event) && Object.keys(query).length === 0) {
    const cache = await cacheStorage().getItem("content-navigation.json");
    if (cache) {
      return cache;
    }
  }
  const contents = await serverQueryContent(event, query).where({
    /**
     * Partial contents are not included in the navigation
     * A partial content is a content that has `_` prefix in its path
     */
    _partial: false,
    /**
     * Exclude any pages which have opted out of navigation via frontmatter.
     */
    navigation: {
      $ne: false
    }
  }).find();
  const dirConfigs = await serverQueryContent(event).where({ _path: /\/_dir$/i, _partial: true }).find();
  const configs = (dirConfigs?.result || dirConfigs).reduce((configs2, conf) => {
    if (conf.title?.toLowerCase() === "dir") {
      conf.title = void 0;
    }
    const key = conf._path.split("/").slice(0, -1).join("/") || "/";
    configs2[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body
    };
    return configs2;
  }, {});
  return createNav(contents?.result || contents, configs);
});

const _lazy_hCXbjC = () => Promise.resolve().then(function () { return checkout; });
const _lazy_xdrRhm = () => import('./payme.mjs');
const _lazy_BfyYKP = () => import('../renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '/api/checkout', handler: _lazy_hCXbjC, lazy: true, middleware: false, method: undefined },
  { route: '/api/payme', handler: _lazy_xdrRhm, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_BfyYKP, lazy: true, middleware: false, method: undefined },
  { route: '/api/_content/query/:qid/**:params', handler: _vmP9J5, lazy: false, middleware: false, method: "get" },
  { route: '/api/_content/query/:qid', handler: _vmP9J5, lazy: false, middleware: false, method: "get" },
  { route: '/api/_content/query', handler: _vmP9J5, lazy: false, middleware: false, method: "get" },
  { route: '/api/_content/cache.1723103931526.json', handler: _azf43q, lazy: false, middleware: false, method: "get" },
  { route: '/api/_content/navigation/:qid/**:params', handler: _z0dc41, lazy: false, middleware: false, method: "get" },
  { route: '/api/_content/navigation/:qid', handler: _z0dc41, lazy: false, middleware: false, method: "get" },
  { route: '/api/_content/navigation', handler: _z0dc41, lazy: false, middleware: false, method: "get" },
  { route: '/**', handler: _lazy_BfyYKP, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((_err) => {
      console.error("Error while capturing another error", _err);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const localCall = createCall(toNodeListener(h3App));
  const _localFetch = createFetch(localCall, globalThis.fetch);
  const localFetch = (input, init) => _localFetch(input, init).then(
    (response) => normalizeFetchResponse(response)
  );
  const $fetch = createFetch$1({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  h3App.use(
    eventHandler((event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const envContext = event.node.req?.__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
    })
  );
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  for (const plugin of plugins) {
    try {
      plugin(app);
    } catch (err) {
      captureError(err, { tags: ["plugin"] });
      throw err;
    }
  }
  return app;
}
const nitroApp = createNitroApp();
const useNitroApp = () => nitroApp;

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((err) => {
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
  }
  server.on("request", function(req, res) {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", function() {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", function(socket) {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", function() {
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    if (options.development) {
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        return Promise.resolve(false);
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((err) => {
      const errString = typeof err === "string" ? err : JSON.stringify(err);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((err) => {
          console.error(err);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

const checkout = /*#__PURE__*/Object.freeze({
  __proto__: null
});

export { $fetch$1 as $, toRouteMatcher as A, createRouter$1 as B, klona as C, parse$1 as D, getRequestHeader as E, isEqual as F, setCookie as G, getCookie as H, deleteCookie as I, eventHandler as J, setResponseHeader as K, send as L, getResponseStatus as M, setResponseStatus as N, useNitroApp as O, setResponseHeaders as P, joinRelativeURL as Q, getRouteRules as R, getResponseStatusText as S, nodeServer as T, withoutTrailingSlash as a, hash as b, withLeadingSlash as c, destr as d, withBase as e, parseURL as f, parseQuery as g, hasProtocol as h, encodeQueryItem as i, joinURL as j, kebabCase as k, defu as l, prefixStorage as m, createStorage as n, memoryDriver as o, pascalCase as p, defineEventHandler as q, getQuery$1 as r, createError$1 as s, withQuery as t, useRuntimeConfig as u, isScriptProtocol as v, withTrailingSlash as w, sanitizeStatusCode as x, createHooks as y, isSamePath as z };
//# sourceMappingURL=checkout.mjs.map
