import _sfc_main$1 from './ContentRenderer-DCyB6YLG.mjs';
import _sfc_main$2 from './ContentRendererMarkdown-Cz1dd9SR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-img-EV08YrHH.mjs';
import { M as Meta } from './components-BTRMzG-F.mjs';
import { a as useRoute, u as useHead } from './server.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, withCtx, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, createVNode, Fragment, renderList, useSSRContext } from 'vue';
import { q as queryContent } from './query-x0nbLBj8.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import moment from 'moment';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d;
    let __temp, __restore;
    moment.locale("fr");
    const router = useRoute();
    const serie = ([__temp, __restore] = withAsyncContext(() => queryContent("runs").where({ slug: router.params.slug }).findOne()), __temp = await __temp, __restore(), __temp);
    const title = "S\xE9rie photo " + serie.title + " - Macojaune.com";
    useHead({
      title,
      meta: [
        {
          name: "title",
          content: title
        },
        {
          name: "description",
          content: serie.description
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://macojaune.com${router.path}` },
        { property: "og:title", content: `D\xE9couvre la s\xE9rie ${serie.title} sur le site de @macojaune` },
        {
          property: "og:description",
          content: serie.description
        },
        { property: "og:image", content: `https://macojaune.com/pictures/${(_b = (_a = serie == null ? void 0 : serie.products) == null ? void 0 : _a[0].images) == null ? void 0 : _b[0]}` },
        {
          property: "twitter:card",
          content: "summary_large_image"
        },
        { property: "twitter:url", content: `https://macojaune.com${router.path}` },
        { property: "twitter:title", content: `D\xE9couvre la s\xE9rie ${serie.title} sur le site de @macojaune` },
        {
          property: "twitter:description",
          content: serie.description
        },
        { property: "twitter:image", content: `https://macojaune.com/pictures/${(_d = (_c = serie == null ? void 0 : serie.products) == null ? void 0 : _c[0].images) == null ? void 0 : _d[0]}` }
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
                  "@id": "https://macojaune.com" + router.fullPath,
                  name: serie.title
                }
              }
            ]
          })
        }
      ]
    });
    const formatDate = (date) => moment(date).format("ll");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentRenderer = _sfc_main$1;
      const _component_ContentRendererMarkdown = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_NuxtImg = __nuxt_component_0$1;
      const _component_Meta = Meta;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "serie-page px-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_ContentRenderer, { value: unref(serie) }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="content"${_scopeId}><h1 class="mt-6 mb-3 text-5xl uppercase text-amber-500 font-display"${_scopeId}>${ssrInterpolate(unref(serie).title)}<small class="font-sans text-sm text-white"${_scopeId}>${ssrInterpolate(formatDate(unref(serie).date))}</small></h1>`);
            _push2(ssrRenderComponent(_component_ContentRendererMarkdown, {
              class: "text-white text-lg text-base md:text-lg",
              value: unref(serie)
            }, null, _parent2, _scopeId));
            _push2(`<div class="${ssrRenderClass([`grid-cols-1 ${unref(serie).products.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`, "picture-list my-6 grid grid-flow-row-dense gap-4 justify-evenly items-end"])}"${_scopeId}><!--[-->`);
            ssrRenderList(unref(serie).products, (product, index) => {
              _push2(`<div class="picture"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: product.slug
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    if (product.images) {
                      _push3(ssrRenderComponent(_component_NuxtImg, {
                        class: "primary border-radius mb-2",
                        src: `${product.images[0]}`,
                        sizes: "xs:100vw lg:500px",
                        format: "webp",
                        quality: "60",
                        itemprop: "image",
                        alt: product.title
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    if (product.price) {
                      _push3(`<p class="text-2xl text-center text-amber-400 font-semibold"${_scopeId2}>${ssrInterpolate(product.price)}\u20AC`);
                      _push3(ssrRenderComponent(_component_Meta, {
                        itemprop: "price",
                        content: product.price
                      }, null, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_Meta, {
                        itemprop: "priceCurrency",
                        content: "EUR"
                      }, null, _parent3, _scopeId2));
                      _push3(`</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<p class="mt-2 text-2xl text-center text-white font-display" itemprop="name"${_scopeId2}>${ssrInterpolate(product.title)}<br${_scopeId2}>`);
                    if (product.stock > 0) {
                      _push3(`<span class="font-sans text-base text-caption text-decoration-line-through" itemprop="availability" href="http://schema.org/InStock"${_scopeId2}>\xC9dition limit\xE9e \xE0 ${ssrInterpolate(product.stock)} exemplaires</span>`);
                    } else {
                      _push3(`<span class="font-bold text-red-500" itemprop="availability" href="http://schema.org/OutOfStock"${_scopeId2}>\xC9puis\xE9</span>`);
                    }
                    _push3(`</p>`);
                  } else {
                    return [
                      product.images ? (openBlock(), createBlock(_component_NuxtImg, {
                        key: 0,
                        class: "primary border-radius mb-2",
                        src: `${product.images[0]}`,
                        sizes: "xs:100vw lg:500px",
                        format: "webp",
                        quality: "60",
                        itemprop: "image",
                        alt: product.title
                      }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                      product.price ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "text-2xl text-center text-amber-400 font-semibold"
                      }, [
                        createTextVNode(toDisplayString(product.price) + "\u20AC", 1),
                        createVNode(_component_Meta, {
                          itemprop: "price",
                          content: product.price
                        }, null, 8, ["content"]),
                        createVNode(_component_Meta, {
                          itemprop: "priceCurrency",
                          content: "EUR"
                        })
                      ])) : createCommentVNode("", true),
                      createVNode("p", {
                        class: "mt-2 text-2xl text-center text-white font-display",
                        itemprop: "name"
                      }, [
                        createTextVNode(toDisplayString(product.title), 1),
                        createVNode("br"),
                        product.stock > 0 ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "font-sans text-base text-caption text-decoration-line-through",
                          itemprop: "availability",
                          href: "http://schema.org/InStock"
                        }, "\xC9dition limit\xE9e \xE0 " + toDisplayString(product.stock) + " exemplaires", 1)) : (openBlock(), createBlock("span", {
                          key: 1,
                          class: "font-bold text-red-500",
                          itemprop: "availability",
                          href: "http://schema.org/OutOfStock"
                        }, "\xC9puis\xE9"))
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              if (product.stock > 0 && product.price) {
                _push2(`<div class="flex justify-center pt-4"${_scopeId}><button class="snipcart-add-item px-8 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-amber-400 active:bg-amber-500"${ssrRenderAttr("data-item-id", product.sku)}${ssrRenderAttr("data-item-name", product.title)}${ssrRenderAttr("data-item-price", product.price)}${ssrRenderAttr("data-item-image", `${product.images[0]}`)}${ssrRenderAttr("data-item-max-quantity", product.stock)}${ssrRenderAttr("data-item-url", `https://macojaune.com${unref(router).path}/${product.slug}`)}${_scopeId}>Acheter</button></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", { class: "content" }, [
                createVNode("h1", { class: "mt-6 mb-3 text-5xl uppercase text-amber-500 font-display" }, [
                  createTextVNode(toDisplayString(unref(serie).title), 1),
                  createVNode("small", { class: "font-sans text-sm text-white" }, toDisplayString(formatDate(unref(serie).date)), 1)
                ]),
                createVNode(_component_ContentRendererMarkdown, {
                  class: "text-white text-lg text-base md:text-lg",
                  value: unref(serie)
                }, null, 8, ["value"]),
                createVNode("div", {
                  class: ["picture-list my-6 grid grid-flow-row-dense gap-4 justify-evenly items-end", `grid-cols-1 ${unref(serie).products.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`]
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(serie).products, (product, index) => {
                    return openBlock(), createBlock("div", {
                      class: "picture",
                      key: index
                    }, [
                      createVNode(_component_NuxtLink, {
                        to: product.slug
                      }, {
                        default: withCtx(() => [
                          product.images ? (openBlock(), createBlock(_component_NuxtImg, {
                            key: 0,
                            class: "primary border-radius mb-2",
                            src: `${product.images[0]}`,
                            sizes: "xs:100vw lg:500px",
                            format: "webp",
                            quality: "60",
                            itemprop: "image",
                            alt: product.title
                          }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                          product.price ? (openBlock(), createBlock("p", {
                            key: 1,
                            class: "text-2xl text-center text-amber-400 font-semibold"
                          }, [
                            createTextVNode(toDisplayString(product.price) + "\u20AC", 1),
                            createVNode(_component_Meta, {
                              itemprop: "price",
                              content: product.price
                            }, null, 8, ["content"]),
                            createVNode(_component_Meta, {
                              itemprop: "priceCurrency",
                              content: "EUR"
                            })
                          ])) : createCommentVNode("", true),
                          createVNode("p", {
                            class: "mt-2 text-2xl text-center text-white font-display",
                            itemprop: "name"
                          }, [
                            createTextVNode(toDisplayString(product.title), 1),
                            createVNode("br"),
                            product.stock > 0 ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "font-sans text-base text-caption text-decoration-line-through",
                              itemprop: "availability",
                              href: "http://schema.org/InStock"
                            }, "\xC9dition limit\xE9e \xE0 " + toDisplayString(product.stock) + " exemplaires", 1)) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "font-bold text-red-500",
                              itemprop: "availability",
                              href: "http://schema.org/OutOfStock"
                            }, "\xC9puis\xE9"))
                          ])
                        ]),
                        _: 2
                      }, 1032, ["to"]),
                      product.stock > 0 && product.price ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex justify-center pt-4"
                      }, [
                        createVNode("button", {
                          class: "snipcart-add-item px-8 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-amber-400 active:bg-amber-500",
                          "data-item-id": product.sku,
                          "data-item-name": product.title,
                          "data-item-price": product.price,
                          "data-item-image": `${product.images[0]}`,
                          "data-item-max-quantity": product.stock,
                          "data-item-url": `https://macojaune.com${unref(router).path}/${product.slug}`
                        }, "Acheter", 8, ["data-item-id", "data-item-name", "data-item-price", "data-item-image", "data-item-max-quantity", "data-item-url"])
                      ])) : createCommentVNode("", true)
                    ]);
                  }), 128))
                ], 2)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/series/[slug]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BeFj_trD.mjs.map
