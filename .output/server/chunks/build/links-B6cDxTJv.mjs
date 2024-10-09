import { _ as __nuxt_component_0$1 } from './nuxt-link-CFXPg0gv.mjs';
import { useSSRContext, defineComponent, mergeProps, withCtx, createVNode, createTextVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import 'vue-router';

function ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$1;
  _push(`<header${ssrRenderAttrs(mergeProps({ class: "py-6 md:py-32" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: "text-center text-amber-400 hover:text-orange-600 transition-colors ease-in-out duration-150",
    to: "/"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h1 class="text-5xl md:text-7xl font-display"${_scopeId}>MACOJAUNE<small class="text-2xl text-grey-500"${_scopeId}>.COM</small></h1><p class="text-center"${_scopeId}>T&#39;as cliqu\xE9 sur le lien dans ma bio ? Tu fais partie de l&#39;\xE9lite.</p>`);
      } else {
        return [
          createVNode("h1", { class: "text-5xl md:text-7xl font-display" }, [
            createTextVNode("MACOJAUNE"),
            createVNode("small", { class: "text-2xl text-grey-500" }, ".COM")
          ]),
          createVNode("p", { class: "text-center" }, "T'as cliqu\xE9 sur le lien dans ma bio ? Tu fais partie de l'\xE9lite.")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</header>`);
}
const _sfc_main$1 = {};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/links/LinksHeader.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", ssrRender]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "links",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ script: [{ src: "https://analytics.marvinl.com/script.js", "data-website-id": "0b0e019d-fed5-4e0d-aa0b-01c8811b7a53", defer: true }] });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LinksHeader = __nuxt_component_0;
      const _component_Footer = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "main flex flex-col justify-between h-full overflow-auto" }, _attrs))} data-v-9d3cb355>`);
      _push(ssrRenderComponent(_component_LinksHeader, null, null, _parent));
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(ssrRenderComponent(_component_Footer, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/links.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const links = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9d3cb355"]]);

export { links as default };
//# sourceMappingURL=links-B6cDxTJv.mjs.map
