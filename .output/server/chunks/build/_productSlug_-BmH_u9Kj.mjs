import _sfc_main$1 from './ContentRenderer-DCyB6YLG.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import { M as Meta } from './components-BTRMzG-F.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-img-EV08YrHH.mjs';
import { a as useRoute, u as useHead } from './server.mjs';
import { useSSRContext, defineComponent, withAsyncContext, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, renderSlot as renderSlot$1 } from 'vue';
import { q as queryContent } from './query-x0nbLBj8.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrRenderSlot as ssrRenderSlot$1 } from 'vue/server-renderer';
import { f as flatUnwrap } from './node-04k6j4dz.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import './preview-DpDThw_7.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const ssrRenderSlot = (slots, name, props, fallbackRenderFn, push, parentComponent, slotScopeId) => {
  if (slots[name]) {
    return ssrRenderSlot$1({ ...slots, [name]: () => flatUnwrap(slots[name](), props == null ? void 0 : props.unwrap) }, name, props, fallbackRenderFn, push, parentComponent, slotScopeId);
  }
  return ssrRenderSlot$1(slots, name, props, fallbackRenderFn, push, parentComponent, slotScopeId);
};
const renderSlot = (slots, name, props, ...rest) => {
  if (slots[name]) {
    return renderSlot$1({ ...slots, [name]: () => flatUnwrap(slots[name](), props == null ? void 0 : props.unwrap) }, name, props, ...rest);
  }
  return renderSlot$1(slots, name, props, ...rest);
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[productSlug]",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d;
    let __temp, __restore;
    const router = useRoute();
    const serie = ([__temp, __restore] = withAsyncContext(() => queryContent("runs").where({ slug: router.params.slug }).findOne()), __temp = await __temp, __restore(), __temp);
    const product = serie.products.find(
      (p) => p.slug === router.params.productSlug
    );
    const title = product.title + " - S\xE9rie " + serie.title + " - Macojaune.com";
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
        { property: "og:title", content: `D\xE9couvre la photo ${product.title} de la s\xE9rie ${serie.title} sur le site de @macojaune` },
        {
          property: "og:description",
          content: serie.description
        },
        { property: "og:image", content: `https://macojaune.com/${(_b = (_a = serie == null ? void 0 : serie.products) == null ? void 0 : _a[0].images) == null ? void 0 : _b[0]}` },
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
        { property: "twitter:image", content: `https://macojaune.com${(_d = (_c = serie == null ? void 0 : serie.products) == null ? void 0 : _c[0].images) == null ? void 0 : _d[0]}` }
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
                  "@id": "https://macojaune.com/series/" + router.params.slug,
                  name: router.params.slug
                }
              },
              {
                "@type": "ListItem",
                position: 3,
                item: {
                  "@id": "https://macojaune.com" + router.fullPath,
                  name: router.params.productSlug
                }
              }
            ]
          })
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentRenderer = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Meta = Meta;
      const _component_NuxtImg = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "serie-page px-4" }, _attrs))} data-v-414871ae>`);
      _push(ssrRenderComponent(_component_ContentRenderer, { value: unref(serie) }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, { to: "./" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p class="mt-6 mb-3 text-2xl uppercase text-amber-400 font-display" data-v-414871ae${_scopeId2}>&lt; ${ssrInterpolate(unref(serie).title)}</p>`);
                } else {
                  return [
                    createVNode("p", { class: "mt-6 mb-3 text-2xl uppercase text-amber-400 font-display" }, "< " + toDisplayString(unref(serie).title), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<h1 class="mt-6 mb-3 text-5xl uppercase text-amber-500 font-display" itemprop="name" data-v-414871ae${_scopeId}>${ssrInterpolate(unref(product).title)}<br data-v-414871ae${_scopeId}><small class="font-sans text-sm text-white normal-case" data-v-414871ae${_scopeId}>`);
            if (unref(product).stock > 0) {
              _push2(`<span class="text-caption text-decoration-line-through" itemprop="availability" href="http://schema.org/InStock" data-v-414871ae${_scopeId}>\xC9dition limit\xE9e \xE0 ${ssrInterpolate(unref(product).stock)} exemplaires</span>`);
            } else {
              _push2(`<span class="font-bold text-red-500" itemprop="availability" href="http://schema.org/OutOfStock" data-v-414871ae${_scopeId}>\xC9puis\xE9</span>`);
            }
            _push2(`</small></h1><p class="text-white text-lg text-base md:text-lg" data-v-414871ae${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            _push2(`</p>`);
            if (unref(product).stock > 0 && unref(product).price) {
              _push2(`<div class="flex flex-col justify-end pt-4 gap-4 items-center" data-v-414871ae${_scopeId}>`);
              if (unref(product).price) {
                _push2(`<p class="text-2xl text-center text-amber-400 font-semibold" data-v-414871ae${_scopeId}>${ssrInterpolate(unref(product).price)}\u20AC`);
                _push2(ssrRenderComponent(_component_Meta, {
                  itemprop: "price",
                  content: unref(product).price
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_Meta, {
                  itemprop: "priceCurrency",
                  content: "EUR"
                }, null, _parent2, _scopeId));
                _push2(`</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button class="snipcart-add-item px-8 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-amber-400 active:bg-amber-500"${ssrRenderAttr("data-item-id", unref(product).sku)}${ssrRenderAttr("data-item-name", unref(product).title)}${ssrRenderAttr("data-item-price", unref(product).price)}${ssrRenderAttr("data-item-image", unref(product).images[0])}${ssrRenderAttr("data-item-max-quantity", unref(product).stock)}${ssrRenderAttr("data-item-url", `https://macojaune.com${unref(router).path}/${unref(product).slug}`)} data-v-414871ae${_scopeId}>Acheter</button></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="${ssrRenderClass([`grid-cols-1 ${unref(product).images.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`, "picture-list my-6 grid grid-flow-row-dense gap-4 justify-around items-end"])}" data-v-414871ae${_scopeId}><!--[-->`);
            ssrRenderList(unref(product).images, (imageURL, index) => {
              _push2(`<div class="picture hover:cursor-pointer" data-v-414871ae${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtImg, {
                class: "border-radius",
                src: imageURL,
                sizes: "xs:100vw lg:800px",
                quality: "80",
                format: "webp",
                itemprop: "image",
                alt: unref(product).title
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode(_component_NuxtLink, { to: "./" }, {
                default: withCtx(() => [
                  createVNode("p", { class: "mt-6 mb-3 text-2xl uppercase text-amber-400 font-display" }, "< " + toDisplayString(unref(serie).title), 1)
                ]),
                _: 1
              }),
              createVNode("h1", {
                class: "mt-6 mb-3 text-5xl uppercase text-amber-500 font-display",
                itemprop: "name"
              }, [
                createTextVNode(toDisplayString(unref(product).title), 1),
                createVNode("br"),
                createVNode("small", { class: "font-sans text-sm text-white normal-case" }, [
                  unref(product).stock > 0 ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-caption text-decoration-line-through",
                    itemprop: "availability",
                    href: "http://schema.org/InStock"
                  }, "\xC9dition limit\xE9e \xE0 " + toDisplayString(unref(product).stock) + " exemplaires", 1)) : (openBlock(), createBlock("span", {
                    key: 1,
                    class: "font-bold text-red-500",
                    itemprop: "availability",
                    href: "http://schema.org/OutOfStock"
                  }, "\xC9puis\xE9"))
                ])
              ]),
              createVNode("p", { class: "text-white text-lg text-base md:text-lg" }, [
                renderSlot(_ctx.$slots, "default", {
                  innerHTML: unref(product).description
                }, void 0, true)
              ]),
              unref(product).stock > 0 && unref(product).price ? (openBlock(), createBlock("div", {
                key: 0,
                class: "flex flex-col justify-end pt-4 gap-4 items-center"
              }, [
                unref(product).price ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-2xl text-center text-amber-400 font-semibold"
                }, [
                  createTextVNode(toDisplayString(unref(product).price) + "\u20AC", 1),
                  createVNode(_component_Meta, {
                    itemprop: "price",
                    content: unref(product).price
                  }, null, 8, ["content"]),
                  createVNode(_component_Meta, {
                    itemprop: "priceCurrency",
                    content: "EUR"
                  })
                ])) : createCommentVNode("", true),
                createVNode("button", {
                  class: "snipcart-add-item px-8 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-amber-400 active:bg-amber-500",
                  "data-item-id": unref(product).sku,
                  "data-item-name": unref(product).title,
                  "data-item-price": unref(product).price,
                  "data-item-image": unref(product).images[0],
                  "data-item-max-quantity": unref(product).stock,
                  "data-item-url": `https://macojaune.com${unref(router).path}/${unref(product).slug}`
                }, "Acheter", 8, ["data-item-id", "data-item-name", "data-item-price", "data-item-image", "data-item-max-quantity", "data-item-url"])
              ])) : createCommentVNode("", true),
              createVNode("div", {
                class: ["picture-list my-6 grid grid-flow-row-dense gap-4 justify-around items-end", `grid-cols-1 ${unref(product).images.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`]
              }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(product).images, (imageURL, index) => {
                  return openBlock(), createBlock("div", {
                    class: "picture hover:cursor-pointer",
                    key: index
                  }, [
                    createVNode(_component_NuxtImg, {
                      class: "border-radius",
                      src: imageURL,
                      sizes: "xs:100vw lg:800px",
                      quality: "80",
                      format: "webp",
                      itemprop: "image",
                      alt: unref(product).title
                    }, null, 8, ["src", "alt"])
                  ]);
                }), 128))
              ], 2)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/series/[slug]/[productSlug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _productSlug_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-414871ae"]]);

export { _productSlug_ as default };
//# sourceMappingURL=_productSlug_-BmH_u9Kj.mjs.map
