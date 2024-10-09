import _sfc_main$1 from './ContentList-BLe4egNq.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import __nuxt_component_2 from './ProseP-4-Gxrelx.mjs';
import { u as useHead } from './server.mjs';
import { defineComponent, withCtx, unref, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import moment from 'moment/moment.js';
import './ContentQuery-D_Ct98fW.mjs';
import './asyncData-d0deaCOf.mjs';
import './query-x0nbLBj8.mjs';
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
import './preview-DpDThw_7.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';

const title = "Les Projets photo du Macojaune";
const description = "Moodboards, id\xE9es de projets photo, inspirations, et tout ce qu'il faut pour y participer. Cr\xE9ons ensemble des \u0153uvres qui nous ressemblent.";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const query = { path: "/projects", where: [{ draft: false }], sort: [{ date: -1 }] };
    useHead({
      title,
      meta: [
        {
          name: "title",
          content: title
        },
        {
          name: "description",
          content: description
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://macojaune.com/projets" },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: description
        },
        { property: "og:image", content: "/pictures/MCO09198 (Large).jpg" },
        {
          property: "twitter:card",
          content: "summary_large_image"
        },
        { property: "twitter:url", content: "https://macojaune.com/projets" },
        { property: "twitter:title", content: title },
        {
          property: "twitter:description",
          content: description
        },
        { property: "twitter:image", content: "https://macojaune.com/pictures/MCO09198 (Large).jpg" }
      ],
      script: [
        {
          type: "application/ld+json",
          innerHTML: [
            { "@context": "http://schema.org/" },
            { "@type": "BreadcrumbList" },
            {
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
                    "@id": "https://macojaune.com/projets",
                    name: "Projets photographiques"
                  }
                }
              ]
            }
          ]
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentList = _sfc_main$1;
      const _component_nuxt_link = __nuxt_component_0;
      const _component_prose_p = __nuxt_component_2;
      _push(`<!--[--><div class="my-6 lg:my-10"><h1 class="text-4xl lg:text-5xl text-amber-600 font-display mb-4">Projets photographiques</h1><p class="text-white text-base">Je me suis enfin d\xE9cid\xE9 \xE0 publier mes id\xE9es de projets photo sur ce site. Le but est bien entendu d&#39;arriver \xE0 les mener \xE0 bien. <br> Tu retrouveras le brief, les moodboards, inspirations et un formulaire pour y participer si \xE7a te chante ! </p></div>`);
      _push(ssrRenderComponent(_component_ContentList, { query }, {
        default: withCtx(({ list }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-2 flex flex-col gap-5"${_scopeId}><!--[-->`);
            ssrRenderList(list, (project) => {
              _push2(ssrRenderComponent(_component_nuxt_link, {
                key: project.permalink,
                to: `/projets/${project.permalink}?project=${project.permalink}`,
                class: "group flex flex-row justify-between"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div${_scopeId2}><h3 class="font-display text-4xl text-amber-300 group-hover:text-amber-600"${_scopeId2}>${ssrInterpolate(project.title)} <span class="font-sans text-sm"${_scopeId2}>${ssrInterpolate(unref(moment)(project.date).format("ll"))}</span></h3>`);
                    _push3(ssrRenderComponent(_component_prose_p, { class: "text-white text-base ml-6 w-4/5 lg:w-8/12 line-clamp-4" }, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(project == null ? void 0 : project.description)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(project == null ? void 0 : project.description), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", null, [
                        createVNode("h3", { class: "font-display text-4xl text-amber-300 group-hover:text-amber-600" }, [
                          createTextVNode(toDisplayString(project.title) + " ", 1),
                          createVNode("span", { class: "font-sans text-sm" }, toDisplayString(unref(moment)(project.date).format("ll")), 1)
                        ]),
                        createVNode(_component_prose_p, { class: "text-white text-base ml-6 w-4/5 lg:w-8/12 line-clamp-4" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(project == null ? void 0 : project.description), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "mb-2 flex flex-col gap-5" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(list, (project) => {
                  return openBlock(), createBlock(_component_nuxt_link, {
                    key: project.permalink,
                    to: `/projets/${project.permalink}?project=${project.permalink}`,
                    class: "group flex flex-row justify-between"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", null, [
                        createVNode("h3", { class: "font-display text-4xl text-amber-300 group-hover:text-amber-600" }, [
                          createTextVNode(toDisplayString(project.title) + " ", 1),
                          createVNode("span", { class: "font-sans text-sm" }, toDisplayString(unref(moment)(project.date).format("ll")), 1)
                        ]),
                        createVNode(_component_prose_p, { class: "text-white text-base ml-6 w-4/5 lg:w-8/12 line-clamp-4" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(project == null ? void 0 : project.description), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ])
                    ]),
                    _: 2
                  }, 1032, ["to"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/projets/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-ByxidD-a.mjs.map
