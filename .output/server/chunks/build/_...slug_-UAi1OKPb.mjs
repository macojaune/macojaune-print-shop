import _sfc_main$1 from './ContentDoc-C8vWIQb2.mjs';
import _sfc_main$2 from './ContentRenderer-DCyB6YLG.mjs';
import { useSSRContext, mergeProps, withCtx, createVNode, toDisplayString } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './server.mjs';
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
import './ContentQuery-D_Ct98fW.mjs';
import './asyncData-d0deaCOf.mjs';
import './query-x0nbLBj8.mjs';
import './preview-DpDThw_7.mjs';
import './ContentRendererMarkdown-Cz1dd9SR.mjs';
import 'property-information';
import './node-04k6j4dz.mjs';

function ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_ContentDoc = _sfc_main$1;
  const _component_ContentRenderer = _sfc_main$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_ContentDoc, {
    path: `/mentions/${_ctx.$route.params.slug}`
  }, {
    default: withCtx(({ doc }, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="row"${_scopeId}><div class="col"${_scopeId}><h1 class="my-3 text-4xl uppercase text-orange-400"${_scopeId}>${ssrInterpolate(doc.title)}</h1>`);
        _push2(ssrRenderComponent(_component_ContentRenderer, {
          class: "text-white",
          value: doc
        }, null, _parent2, _scopeId));
        _push2(`</div></div>`);
      } else {
        return [
          createVNode("div", { class: "row" }, [
            createVNode("div", { class: "col" }, [
              createVNode("h1", { class: "my-3 text-4xl uppercase text-orange-400" }, toDisplayString(doc.title), 1),
              createVNode(_component_ContentRenderer, {
                class: "text-white",
                value: doc
              }, null, 8, ["value"])
            ])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_main = {};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[...slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ____slug_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", ssrRender]]);

export { ____slug_ as default };
//# sourceMappingURL=_...slug_-UAi1OKPb.mjs.map
