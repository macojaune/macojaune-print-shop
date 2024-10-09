import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import _sfc_main$1 from './ContentRenderer-DCyB6YLG.mjs';
import { a as useRoute, u as useHead } from './server.mjs';
import { u as useAsyncData } from './asyncData-d0deaCOf.mjs';
import { q as queryContent } from './query-x0nbLBj8.mjs';
import { defineComponent, withAsyncContext, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
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
import './ContentRendererMarkdown-Cz1dd9SR.mjs';
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
    const { data } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("get-document", () => queryContent("/projects").where({ permalink: `${params == null ? void 0 : params.permalink}` }).findOne())), __temp = await __temp, __restore(), __temp);
    const title = ((_a = data.value) == null ? void 0 : _a.title) ? `${(_b = data.value) == null ? void 0 : _b.title} | Projets photo du Macojaune` : "Le site du Macojaune";
    useHead({
      title,
      meta: [
        {
          name: "title",
          content: title
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
                  "@id": "https://macojaune.com/projets/",
                  name: "Projets"
                }
              },
              {
                "@type": "ListItem",
                position: 3,
                item: {
                  "@id": "https://macojaune.com/projets/" + params.permalink,
                  name: params.permalink
                }
              }
            ]
          })
        },
        { type: "text/javascript", src: "https://tally.so/widgets/embed.js", async: true, defer: true },
        // {type: 'text/javascript', src: "//assets.pinterest.com/js/pinit.js", async: true, defer: true, tagPosition:"bodyClose"},
        {
          type: "text/javascript",
          innerHTML: `var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a3;
      var _a2, _b2, _c2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ContentRenderer = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full px-4" }, _attrs))}><div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/projets",
        class: "text-amber-400 hover:text-amber-600 text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`&lt; Retour aux projets`);
          } else {
            return [
              createTextVNode("< Retour aux projets")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 class="mb-4 font-display text-5xl uppercase text-amber-600 lg:mb-3 lg:text-7xl">${ssrInterpolate((_a3 = (_a2 = unref(data)) == null ? void 0 : _a2.title) != null ? _a3 : "")}</h1><div class="w-full">`);
      if (unref(data)) {
        _push(ssrRenderComponent(_component_ContentRenderer, {
          class: "text-white lg:max-w-5xl",
          value: unref(data)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if ((_b2 = unref(data)) == null ? void 0 : _b2.pinterestUrl) {
        _push(`<div class="my-4 lg:my-8"><h3 class="font-display text-2xl text-amber-400 mb-3 lg:text-3xl">Le Petit Moodboard <small class="font-sans text-base font-normal italic text-red-500">pour la route</small></h3><a data-pin-do="embedBoard" data-pin-scale-height="240" data-pin-scale-width="220"${ssrRenderAttr("href", (_c2 = unref(data)) == null ? void 0 : _c2.pinterestUrl)}></a></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="mt-8 bg-stone-900/50 p-5"><h3 class="font-display my-2 text-2xl text-amber-400 lg:my-3 lg:text-3xl"> Je veux participer, comment on fait ? </h3><p class="text-xl text-white"> Tr\xE8s simple, accorde-moi 24 secondes (et demi) pour remplir ce court formulaire et c&#39;est parti ! <span class="text-sm italic text-orange-500">(ou klaxonne moi dans la rue)</span></p><iframe data-tally-src="https://tally.so/embed/n0MpAj?alignLeft=1&amp;hideTitle=1&amp;transparentBackground=1&amp;dynamicHeight=1" loading="lazy" width="100%" height="638" frameborder="0" marginheight="0" marginwidth="0" title="Participer \xE0 un Projet Photo avec Macojaune"></iframe></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/projets/[permalink].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_permalink_-Dyt7J1p3.mjs.map
