import _sfc_main$1 from './ContentList-BLe4egNq.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import __nuxt_component_2 from './ProseP-4-Gxrelx.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-img-EV08YrHH.mjs';
import { u as useHead } from './server.mjs';
import { defineComponent, mergeProps, withCtx, unref, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
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

const description = "Pens\xE9es et tribulations d'un grand curieux guadeloup\xE9en, artiste photographe, geek, d\xE9veloppeur et entrepreneur.";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const query = { path: "/blog", where: [{ draft: false }], sort: [{ date: -1 }] };
    useHead({
      title: "Le Blog du Macojaune",
      meta: [
        {
          name: "title",
          content: "Le blog du Macojaune"
        },
        {
          name: "description",
          content: description
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://macojaune.com/blog" },
        { property: "og:title", content: "Le blog du Macojaune" },
        {
          property: "og:description",
          content: description
        },
        { property: "og:image", content: "/pictures/dsc06261.jpg" },
        {
          property: "twitter:card",
          content: "summary_large_image"
        },
        { property: "twitter:url", content: "https://macojaune.com/" },
        { property: "twitter:title", content: "Le blog du Macojaune" },
        {
          property: "twitter:description",
          content: description
        },
        { property: "twitter:image", content: "https://macojaune.com/pictures/dsc06261.jpg" }
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
                    "@id": "https://macojaune.com/blog",
                    name: "Blog"
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
      const _component_nuxt_img = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_ContentList, mergeProps({ query }, _attrs), {
        default: withCtx(({ list }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-2 flex flex-col gap-5"${_scopeId}><!--[-->`);
            ssrRenderList(list, (blog) => {
              _push2(ssrRenderComponent(_component_nuxt_link, {
                key: blog.permalink,
                to: `/blog/${blog.permalink}`,
                class: "group flex flex-row justify-between"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div${_scopeId2}><h4 class="font-display text-4xl text-amber-300 group-hover:text-amber-600"${_scopeId2}>${ssrInterpolate(blog.title)} <span class="font-sans text-sm"${_scopeId2}>${ssrInterpolate(unref(moment)(blog.date).format("ll"))}</span></h4>`);
                    _push3(ssrRenderComponent(_component_prose_p, { class: "text-white text-base ml-6 w-8/12 line-clamp-2" }, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(blog == null ? void 0 : blog.description)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(blog == null ? void 0 : blog.description), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(`</div><div${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_nuxt_img, {
                      src: blog.image,
                      sizes: "xs:25vw lg:360px",
                      format: "webp",
                      placeholder: "",
                      class: ""
                    }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", null, [
                        createVNode("h4", { class: "font-display text-4xl text-amber-300 group-hover:text-amber-600" }, [
                          createTextVNode(toDisplayString(blog.title) + " ", 1),
                          createVNode("span", { class: "font-sans text-sm" }, toDisplayString(unref(moment)(blog.date).format("ll")), 1)
                        ]),
                        createVNode(_component_prose_p, { class: "text-white text-base ml-6 w-8/12 line-clamp-2" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(blog == null ? void 0 : blog.description), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      createVNode("div", null, [
                        createVNode(_component_nuxt_img, {
                          src: blog.image,
                          sizes: "xs:25vw lg:360px",
                          format: "webp",
                          placeholder: "",
                          class: ""
                        }, null, 8, ["src"])
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
                (openBlock(true), createBlock(Fragment, null, renderList(list, (blog) => {
                  return openBlock(), createBlock(_component_nuxt_link, {
                    key: blog.permalink,
                    to: `/blog/${blog.permalink}`,
                    class: "group flex flex-row justify-between"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", null, [
                        createVNode("h4", { class: "font-display text-4xl text-amber-300 group-hover:text-amber-600" }, [
                          createTextVNode(toDisplayString(blog.title) + " ", 1),
                          createVNode("span", { class: "font-sans text-sm" }, toDisplayString(unref(moment)(blog.date).format("ll")), 1)
                        ]),
                        createVNode(_component_prose_p, { class: "text-white text-base ml-6 w-8/12 line-clamp-2" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(blog == null ? void 0 : blog.description), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      createVNode("div", null, [
                        createVNode(_component_nuxt_img, {
                          src: blog.image,
                          sizes: "xs:25vw lg:360px",
                          format: "webp",
                          placeholder: "",
                          class: ""
                        }, null, 8, ["src"])
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
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/blog/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index--6stSViN.mjs.map
