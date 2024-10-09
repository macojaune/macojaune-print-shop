import { a as useRoute } from './server.mjs';
import { mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import '../routes/api/checkout.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import 'unified';
import 'mdast-util-to-string';
import 'micromark';
import 'unist-util-stringify-position';
import 'micromark-util-character';
import 'micromark-util-chunked';
import 'micromark-util-resolve-all';
import 'micromark-util-sanitize-uri';
import 'slugify';
import 'remark-parse';
import 'remark-rehype';
import 'remark-mdc';
import 'remark-emoji';
import 'remark-gfm';
import 'rehype-external-links';
import 'rehype-sort-attribute-values';
import 'rehype-sort-attributes';
import 'rehype-raw';
import 'detab';
import 'hast-util-to-string';
import 'github-slugger';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const _sfc_main = {
  __name: "[amount]",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const route = useRoute();
    const amount = parseInt(((_a = route.params) == null ? void 0 : _a.amount) || "1000", 10);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "merci mt-8 container mx-auto" }, _attrs))}><h1 class="text-8xl text-white text-center text-amber-500 uppercase">Merci</h1><p class="text-white text-center mb-8">Il y a exactement<span class="text-orange-400 text-3xl font-bold">${ssrInterpolate(unref(amount))}</span> merci${ssrInterpolate(unref(amount) > 0 ? "s" : "")} sur cette page.</p><div class="flex flex-wrap gap-2 items-evenly"><!--[-->`);
      ssrRenderList(unref(amount), (i) => {
        _push(`<span class="p-4 text-white animate-bounce cursor-default hover:cursor-default hover:text-amber-500 transition-colors delay-500">merci</span>`);
      });
      _push(`<!--]--></div><p class="text-center font-bold text-orange-400">T&#39;es vraiment en train de les compter l\xE0 ? \u{1F610}\u{1F610}</p></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/merci/[amount].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_amount_-ZEgZ_8w3.mjs.map
