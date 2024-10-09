import _sfc_main$1 from './ContentList-BLe4egNq.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-img-EV08YrHH.mjs';
import { u as useHead } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, createVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import moment from 'moment';
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

const description = "Offrez-vous un morceau de l'univers artistique de Macojaune avec sa s\xE9lection de tirages photographiques uniques. Chacune de ces \u0153uvres a \xE9t\xE9 soigneusement s\xE9lectionn\xE9e pour repr\xE9senter l'esth\xE9tique fascinante et la cr\xE9ativit\xE9 d\xE9bordante de notre photographe-entrepreneur-d\xE9veloppeur ultra curieux. Nos tirages sont imprim\xE9s sur des mat\xE9riaux de haute qualit\xE9 pour garantir une durabilit\xE9 \xE0 long terme et une exp\xE9rience visuelle inoubliable. Vous pouvez les offrir en cadeau ou les garder pour vous-m\xEAme pour ajouter une touche d'originalit\xE9 et de beaut\xE9 \xE0 votre environnement. Parcourez notre s\xE9lection de tirages photographiques d\xE8s maintenant et laissez-vous transporter dans l'univers Macojaune !";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "shop",
  __ssrInlineRender: true,
  setup(__props) {
    moment.locale("fr-FR");
    const formatDate = (date) => moment(date).format("ll");
    useHead({
      title: "Yellow art shop - La boutique du Macojaune",
      meta: [
        {
          name: "title",
          content: "Achetez les Tirages Uniques de Macojaune - Photographe-Entrepreneur-D\xE9veloppeur Ultra Curieux"
        },
        {
          name: "description",
          content: description
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://macojaune.com/" },
        { property: "og:title", content: "YELLOW ART SHOP" },
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
        { property: "twitter:title", content: "YELLOW ART SHOP" },
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
                    "@id": "https://macojaune.com/",
                    name: "Macojaune.com"
                  }
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  item: {
                    "@id": "https://macojaune.com/shop",
                    name: "La Boutique du Macojaune"
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
      const _component_NuxtLink = __nuxt_component_0;
      const _component_nuxt_img = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "shop-page w-full px-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_ContentList, { path: "/runs" }, {
        default: withCtx(({ list }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="list runs flex flex-col-reverse gap-12"${_scopeId}><!--[-->`);
            ssrRenderList(list, (run) => {
              _push2(`<div class="run flex flex-col lg:flex-row justify-between items-between"${_scopeId}><div class="run-text basis-full lg:basis-2/4 mt-3 lg:mt-0 order-2 lg:order-1"${_scopeId}><small class="run-date text-white"${_scopeId}>${ssrInterpolate(formatDate(run.date))}</small><br${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "mb-2 uppercase text-amber-400 font-display text-4xl lg:text-7xl hover:text-orange-600",
                to: `/series/${run.slug}/`
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(run.title)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(run.title), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`<p class="run-description text-white"${_scopeId}>${ssrInterpolate(run.description)}</p></div><div class="run-pictures flex gap-3 basis-full lg:basis-2/5 order-1 lg:order-2"${_scopeId}><!--[-->`);
              ssrRenderList(run.products.slice(0, 3), (product, index) => {
                _push2(`<div class="run-picture grow hover:scale-150 hover:rounded-none transition-all ease-in-out"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  class: "h-full",
                  to: `/series/${run.slug}/${product.slug}`
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      if (product.images.length > 0) {
                        _push3(ssrRenderComponent(_component_nuxt_img, {
                          class: "rounded-md h-full",
                          src: product.images[0],
                          sizes: "xs:33vw lg:300px",
                          format: "webp",
                          loading: index > 1 ? "lazy" : "",
                          alt: index + 1 + "-" + product.title,
                          quality: "30"
                        }, null, _parent3, _scopeId2));
                      } else {
                        _push3(`<span class="white--text"${_scopeId2}>${ssrInterpolate(product.title)}</span>`);
                      }
                    } else {
                      return [
                        product.images.length > 0 ? (openBlock(), createBlock(_component_nuxt_img, {
                          key: 0,
                          class: "rounded-md h-full",
                          src: product.images[0],
                          sizes: "xs:33vw lg:300px",
                          format: "webp",
                          loading: index > 1 ? "lazy" : "",
                          alt: index + 1 + "-" + product.title,
                          quality: "30"
                        }, null, 8, ["src", "loading", "alt"])) : (openBlock(), createBlock("span", {
                          key: 1,
                          class: "white--text"
                        }, toDisplayString(product.title), 1))
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div>`);
              });
              _push2(`<!--]--></div></div>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "list runs flex flex-col-reverse gap-12" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(list, (run) => {
                  return openBlock(), createBlock("div", {
                    class: "run flex flex-col lg:flex-row justify-between items-between",
                    key: run._path
                  }, [
                    createVNode("div", { class: "run-text basis-full lg:basis-2/4 mt-3 lg:mt-0 order-2 lg:order-1" }, [
                      createVNode("small", { class: "run-date text-white" }, toDisplayString(formatDate(run.date)), 1),
                      createVNode("br"),
                      createVNode(_component_NuxtLink, {
                        class: "mb-2 uppercase text-amber-400 font-display text-4xl lg:text-7xl hover:text-orange-600",
                        to: `/series/${run.slug}/`
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(run.title), 1)
                        ]),
                        _: 2
                      }, 1032, ["to"]),
                      createVNode("p", { class: "run-description text-white" }, toDisplayString(run.description), 1)
                    ]),
                    createVNode("div", { class: "run-pictures flex gap-3 basis-full lg:basis-2/5 order-1 lg:order-2" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(run.products.slice(0, 3), (product, index) => {
                        return openBlock(), createBlock("div", {
                          class: "run-picture grow hover:scale-150 hover:rounded-none transition-all ease-in-out",
                          key: index
                        }, [
                          createVNode(_component_NuxtLink, {
                            class: "h-full",
                            to: `/series/${run.slug}/${product.slug}`
                          }, {
                            default: withCtx(() => [
                              product.images.length > 0 ? (openBlock(), createBlock(_component_nuxt_img, {
                                key: 0,
                                class: "rounded-md h-full",
                                src: product.images[0],
                                sizes: "xs:33vw lg:300px",
                                format: "webp",
                                loading: index > 1 ? "lazy" : "",
                                alt: index + 1 + "-" + product.title,
                                quality: "30"
                              }, null, 8, ["src", "loading", "alt"])) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "white--text"
                              }, toDisplayString(product.title), 1))
                            ]),
                            _: 2
                          }, 1032, ["to"])
                        ]);
                      }), 128))
                    ])
                  ]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/shop.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=shop-DhwqOW-U.mjs.map
