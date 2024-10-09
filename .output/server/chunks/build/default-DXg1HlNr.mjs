import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import { useSSRContext, mergeProps, defineComponent, withCtx, unref, openBlock, createBlock, createTextVNode, createVNode, toDisplayString } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
import { _ as _sfc_main$2 } from './Footer-Jj2SQELA.mjs';
import { u as useHead } from './server.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Header",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "flex items-center md:justify-center py-6 md:py-20 flex-col md:flex-row" }, _attrs))}><nav class="md:flex-2 md:mr-auto md:grow">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-center text-amber-400 hover:text-orange-600 transition-colors ease-in-out duration-150",
        to: "/",
        itemprop: "brand",
        itemtype: "http://schema.org/Organization"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(route).path === "/") {
              _push2(`<h1 class="text-5xl/7 md:text-7xl font-display"${_scopeId}> @MACOJAUNE<br class="block md:hidden"${_scopeId}>`);
              if (unref(route).path.includes("blog")) {
                _push2(`<span class="text-xl text-white"${_scopeId}> LE BLOG</span>`);
              } else {
                _push2(`<span class="text-xl text-white"${_scopeId}> LE SITE</span>`);
              }
              _push2(`</h1>`);
            } else if (unref(route).path !== "/shop") {
              _push2(`<h2 class="text-5xl/7 md:text-7xl font-display"${_scopeId}> @MACOJAUNE<br class="block md:hidden"${_scopeId}>`);
              if (unref(route).path.includes("blog")) {
                _push2(`<span class="text-xl text-white"${_scopeId}> LE BLOG</span>`);
              } else {
                _push2(`<span class="text-xl text-white"${_scopeId}> LE SITE</span>`);
              }
              _push2(`</h2>`);
            } else {
              _push2(`<h1 class="text-3xl font-display text-3xl md:text-6xl" itemprop="name"${_scopeId}> YELLOW ART SHOP <p class="text-lg text-center text-white font-semibold uppercase"${_scopeId}>${ssrInterpolate(unref(route).path === "/shop" ? "La boutique" : "Le site")}</p></h1>`);
            }
          } else {
            return [
              unref(route).path === "/" ? (openBlock(), createBlock("h1", {
                key: 0,
                class: "text-5xl/7 md:text-7xl font-display"
              }, [
                createTextVNode(" @MACOJAUNE"),
                createVNode("br", { class: "block md:hidden" }),
                unref(route).path.includes("blog") ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-xl text-white"
                }, " LE BLOG")) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-xl text-white"
                }, " LE SITE"))
              ])) : unref(route).path !== "/shop" ? (openBlock(), createBlock("h2", {
                key: 1,
                class: "text-5xl/7 md:text-7xl font-display"
              }, [
                createTextVNode(" @MACOJAUNE"),
                createVNode("br", { class: "block md:hidden" }),
                unref(route).path.includes("blog") ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-xl text-white"
                }, " LE BLOG")) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-xl text-white"
                }, " LE SITE"))
              ])) : (openBlock(), createBlock("h1", {
                key: 2,
                class: "text-3xl font-display text-3xl md:text-6xl",
                itemprop: "name"
              }, [
                createTextVNode(" YELLOW ART SHOP "),
                createVNode("p", { class: "text-lg text-center text-white font-semibold uppercase" }, toDisplayString(unref(route).path === "/shop" ? "La boutique" : "Le site"), 1)
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></header>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Header.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      script: [
        {
          src: "https://analytics.marvinl.com/script.js",
          "data-website-id": "0b0e019d-fed5-4e0d-aa0b-01c8811b7a53",
          defer: true
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Header = _sfc_main$1;
      const _component_Footer = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "main flex flex-col justify-between h-full w-full overflow-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Header, null, null, _parent));
      _push(`<div class="container mx-auto px-4 w-full"><div class="mb-4 p-3 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-black font-semibold text-center">La boutique est momentan\xE9ment suspendue. <b class="font-bold text-white">Contacte-moi en DM (IG, Twitter) pour commander tes tirages photo</b></div>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
      _push(ssrRenderComponent(_component_Footer, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-DXg1HlNr.mjs.map
