import _sfc_main$1 from './ContentRenderer-DCyB6YLG.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import { a as useRoute, u as useHead } from './server.mjs';
import { u as useAsyncData } from './asyncData-d0deaCOf.mjs';
import { q as queryContent } from './query-x0nbLBj8.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import './ContentRendererMarkdown-Cz1dd9SR.mjs';
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
import 'property-information';
import './node-04k6j4dz.mjs';
import './preview-DpDThw_7.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[permalink]",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e, _f, _g;
    let __temp, __restore;
    const { path, params } = useRoute();
    const { data } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("get-document", () => queryContent("/blog").where({ permalink: `${params == null ? void 0 : params.permalink}` }).findOne())), __temp = await __temp, __restore(), __temp);
    const nextPost = ([__temp, __restore] = withAsyncContext(() => {
      var _a2;
      return queryContent("/blog").where({ date: { $lt: (_a2 = data.value) == null ? void 0 : _a2.date } }).sort({ _id: -1 }).findOne();
    }), __temp = await __temp, __restore(), __temp);
    const title = ((_a = data.value) == null ? void 0 : _a.title) ? `${(_b = data.value) == null ? void 0 : _b.title} | Le blog du Macojaune` : "Le blog du Macojaune";
    useHead({
      title,
      meta: [
        {
          name: "title",
          content: title + " | Le blog du Macojaune"
        },
        {
          name: "description",
          content: (_c = data.value) == null ? void 0 : _c.description
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://macojaune.com${path}` },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: (_d = data.value) == null ? void 0 : _d.description
        },
        { property: "og:image", content: `https://macojaune.com/${(_e = data.value) == null ? void 0 : _e.image}` },
        {
          property: "twitter:card",
          content: "summary_large_image"
        },
        { property: "twitter:url", content: `https://macojaune.com${path}` },
        { property: "twitter:title", content: title + " | Le blog du Macojaune" },
        {
          property: "twitter:description",
          content: (_f = data.value) == null ? void 0 : _f.description
        },
        { property: "twitter:image", content: `https://macojaune.com/${(_g = data.value) == null ? void 0 : _g.image}` }
      ],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "http://schema.org/",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                item: {
                  "@id": "https://macojaune.com",
                  name: "Homepage"
                }
              },
              {
                "@type": "ListItem",
                position: 2,
                item: {
                  "@id": "https://macojaune.com/blog/",
                  name: "Blog"
                }
              },
              {
                "@type": "ListItem",
                position: 3,
                item: {
                  "@id": "https://macojaune.com/blog/" + params.permalink,
                  name: params.permalink
                }
              }
            ]
          })
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a3;
      var _a2;
      const _component_ContentRenderer = _sfc_main$1;
      const _component_nuxt_link = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full px-4" }, _attrs))}><div><h1 class="my-4 font-display text-5xl uppercase text-amber-600 lg:my-3 lg:text-7xl">${ssrInterpolate((_a3 = (_a2 = unref(data)) == null ? void 0 : _a2.title) != null ? _a3 : "")}</h1><div class="w-full lg:w-7/12">`);
      if (unref(data)) {
        _push(ssrRenderComponent(_component_ContentRenderer, {
          class: "text-white",
          value: unref(data)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(nextPost)) {
        _push(`<div class="mt-8 flex w-full flex-row justify-end px-0 lg:mt-12 lg:px-8">`);
        _push(ssrRenderComponent(_component_nuxt_link, {
          href: `/blog/${unref(nextPost).permalink}`,
          class: "w-1/2 text-right md:w-auto"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a32, _b2, _c2, _d2;
            if (_push2) {
              _push2(`<span class="font-display text-xl font-medium text-white lg:text-3xl"${_scopeId}>${ssrInterpolate(((_b2 = (_a32 = unref(nextPost)) == null ? void 0 : _a32.title) == null ? void 0 : _b2.toLowerCase().startsWith("[projet]")) ? "Projet" : "Article")} suivant</span><br${_scopeId}><span class="font-sans text-base/snug italic text-amber-300 md:text-lg"${_scopeId}>${ssrInterpolate(unref(nextPost).title)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-display text-xl font-medium text-white lg:text-3xl" }, toDisplayString(((_d2 = (_c2 = unref(nextPost)) == null ? void 0 : _c2.title) == null ? void 0 : _d2.toLowerCase().startsWith("[projet]")) ? "Projet" : "Article") + " suivant", 1),
                createVNode("br"),
                createVNode("span", { class: "font-sans text-base/snug italic text-amber-300 md:text-lg" }, toDisplayString(unref(nextPost).title), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/blog/[permalink].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_permalink_-f-3GoBVm.mjs.map
