import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import _sfc_main$3 from './ContentList-BLe4egNq.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-img-EV08YrHH.mjs';
import { useSSRContext, defineComponent, mergeProps, withCtx, createVNode, unref, toDisplayString, openBlock, createBlock, createCommentVNode, createTextVNode, Fragment, renderList } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import moment$1 from 'moment/moment.js';
import { useHead } from 'unhead';
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
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import '@unhead/shared';
import 'vue-router';
import './ContentQuery-D_Ct98fW.mjs';
import './asyncData-d0deaCOf.mjs';
import './query-x0nbLBj8.mjs';
import './preview-DpDThw_7.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ProjectsSection",
  __ssrInlineRender: true,
  setup(__props) {
    const projectQuery = {
      path: "/projects",
      where: { draft: { $eq: false } },
      limit: 4,
      sort: { date: -1 }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentList = _sfc_main$3;
      const _component_nuxt_link = __nuxt_component_0;
      const _component_nuxt_img = __nuxt_component_0$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<!--[--><h2 class="mb-3 leading-10 font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl"> Participe \xE0 mes projets photo en cours <small class="font-sans text-base font-normal italic text-red-500">c&#39;est le moment !</small></h2>`);
      _push(ssrRenderComponent(_component_ContentList, { query: projectQuery }, {
        default: withCtx(({ list }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-2 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:grid-rows-none"${_scopeId}><!--[-->`);
            ssrRenderList(list, (project) => {
              _push2(ssrRenderComponent(_component_nuxt_link, {
                key: project.id,
                to: `/projets/${project.permalink}?project=${project.permalink}`,
                class: "group relative aspect-video rounded-sm"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm"${_scopeId2}></div>`);
                    _push3(ssrRenderComponent(_component_nuxt_img, {
                      src: project.image,
                      format: "webp",
                      sizes: "xs:100vw lg:33vw",
                      placeholder: ""
                    }, null, _parent3, _scopeId2));
                    _push3(`<div class="absolute bottom-0 z-20 p-5"${_scopeId2}><h4 class="font-display text-4xl text-white group-hover:text-amber-600"${_scopeId2}>${ssrInterpolate(project.title)}</h4>`);
                    if (project.date) {
                      _push3(`<p${_scopeId2}>${ssrInterpolate(unref(moment$1)(project.date).format("ll"))}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm" }),
                      createVNode(_component_nuxt_img, {
                        src: project.image,
                        format: "webp",
                        sizes: "xs:100vw lg:33vw",
                        placeholder: ""
                      }, null, 8, ["src"]),
                      createVNode("div", { class: "absolute bottom-0 z-20 p-5" }, [
                        createVNode("h4", { class: "font-display text-4xl text-white group-hover:text-amber-600" }, toDisplayString(project.title), 1),
                        project.date ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(moment$1)(project.date).format("ll")), 1)) : createCommentVNode("", true)
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
            if (list.length > 3) {
              _push2(`<div class="mt-5 flex w-full justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "font-bold bg-amber-400 p-3 text-black hover:text-amber-600",
                to: "/projets"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Voir tous les projets `);
                  } else {
                    return [
                      createTextVNode(" Voir tous les projets ")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "mb-2 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:grid-rows-none" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(list, (project) => {
                  return openBlock(), createBlock(_component_nuxt_link, {
                    key: project.id,
                    to: `/projets/${project.permalink}?project=${project.permalink}`,
                    class: "group relative aspect-video rounded-sm"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm" }),
                      createVNode(_component_nuxt_img, {
                        src: project.image,
                        format: "webp",
                        sizes: "xs:100vw lg:33vw",
                        placeholder: ""
                      }, null, 8, ["src"]),
                      createVNode("div", { class: "absolute bottom-0 z-20 p-5" }, [
                        createVNode("h4", { class: "font-display text-4xl text-white group-hover:text-amber-600" }, toDisplayString(project.title), 1),
                        project.date ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(moment$1)(project.date).format("ll")), 1)) : createCommentVNode("", true)
                      ])
                    ]),
                    _: 2
                  }, 1032, ["to"]);
                }), 128))
              ]),
              list.length > 3 ? (openBlock(), createBlock("div", {
                key: 0,
                class: "mt-5 flex w-full justify-center"
              }, [
                createVNode(_component_NuxtLink, {
                  class: "font-bold bg-amber-400 p-3 text-black hover:text-amber-600",
                  to: "/projets"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Voir tous les projets ")
                  ]),
                  _: 1
                })
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProjectsSection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BlogSection",
  __ssrInlineRender: true,
  setup(__props) {
    const blogQuery = {
      path: "/blog",
      where: { draft: { $eq: false } },
      limit: 4,
      sort: { date: -1 }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ContentList = _sfc_main$3;
      const _component_nuxt_link = __nuxt_component_0;
      const _component_nuxt_img = __nuxt_component_0$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<!--[--><h2 class="mt-10 mb-5 text-center font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl"> Mon blog s&#39;installe ici <small class="font-sans text-base font-normal italic text-red-500">fini JauneAttitude.fr</small></h2>`);
      _push(ssrRenderComponent(_component_ContentList, { query: blogQuery }, {
        default: withCtx(({ list }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-2 grid grid-rows-4 gap-5 lg:grid-cols-4 lg:grid-rows-none"${_scopeId}><!--[-->`);
            ssrRenderList(list, (blog) => {
              _push2(ssrRenderComponent(_component_nuxt_link, {
                key: blog.id,
                to: `/blog/${blog.permalink}`,
                class: "group relative aspect-square rounded-sm bg-amber-400/60"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm"${_scopeId2}></div>`);
                    _push3(ssrRenderComponent(_component_nuxt_img, {
                      src: blog.image,
                      class: "absolute inset-0 z-0 h-full",
                      format: "webp",
                      placeholder: "",
                      sizes: "xs:25vw lg:360px"
                    }, null, _parent3, _scopeId2));
                    _push3(`<div class="absolute bottom-0 z-20 p-5"${_scopeId2}><h4 class="font-display text-4xl text-white group-hover:text-amber-600"${_scopeId2}>${ssrInterpolate(blog.title)}</h4>`);
                    if (blog.date) {
                      _push3(`<p${_scopeId2}>${ssrInterpolate(unref(moment$1)(blog.date).format("ll"))}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm" }),
                      createVNode(_component_nuxt_img, {
                        src: blog.image,
                        class: "absolute inset-0 z-0 h-full",
                        format: "webp",
                        placeholder: "",
                        sizes: "xs:25vw lg:360px"
                      }, null, 8, ["src"]),
                      createVNode("div", { class: "absolute bottom-0 z-20 p-5" }, [
                        createVNode("h4", { class: "font-display text-4xl text-white group-hover:text-amber-600" }, toDisplayString(blog.title), 1),
                        blog.date ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(moment$1)(blog.date).format("ll")), 1)) : createCommentVNode("", true)
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div><div class="mt-5 flex w-full justify-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "font-bold bg-amber-400 p-3 text-black hover:text-amber-600",
              to: "/blog"
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` C&#39;est tout ? `);
                } else {
                  return [
                    createTextVNode(" C'est tout ? ")
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "mb-2 grid grid-rows-4 gap-5 lg:grid-cols-4 lg:grid-rows-none" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(list, (blog) => {
                  return openBlock(), createBlock(_component_nuxt_link, {
                    key: blog.id,
                    to: `/blog/${blog.permalink}`,
                    class: "group relative aspect-square rounded-sm bg-amber-400/60"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm" }),
                      createVNode(_component_nuxt_img, {
                        src: blog.image,
                        class: "absolute inset-0 z-0 h-full",
                        format: "webp",
                        placeholder: "",
                        sizes: "xs:25vw lg:360px"
                      }, null, 8, ["src"]),
                      createVNode("div", { class: "absolute bottom-0 z-20 p-5" }, [
                        createVNode("h4", { class: "font-display text-4xl text-white group-hover:text-amber-600" }, toDisplayString(blog.title), 1),
                        blog.date ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(moment$1)(blog.date).format("ll")), 1)) : createCommentVNode("", true)
                      ])
                    ]),
                    _: 2
                  }, 1032, ["to"]);
                }), 128))
              ]),
              createVNode("div", { class: "mt-5 flex w-full justify-center" }, [
                createVNode(_component_NuxtLink, {
                  class: "font-bold bg-amber-400 p-3 text-black hover:text-amber-600",
                  to: "/blog"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" C'est tout ? ")
                  ]),
                  _: 1
                })
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BlogSection.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const description = "Rencontrez Macojaune, le photographe-entrepreneur-d\xE9veloppeur m\xE9ga curieux ! Ce personnage public jeune et dynamique est avide de d\xE9couvertes et ne recule devant rien pour vivre pleinement sa vie. Avec ses comp\xE9tences en photographie et en d\xE9veloppement web, il vous emm\xE8ne dans un univers fascinant o\xF9 la cr\xE9ativit\xE9 et la technologie se m\xEAlent harmonieusement. Suivez ses aventures entrepreneuriales les plus folles et ses projets les plus \xE9tonnants sur son site. Et n'oubliez pas de le rejoindre sur les r\xE9seaux sociaux pour vivre l'exp\xE9rience Macojaune \xE0 fond !";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    moment.locale("fr-FR");
    useHead({
      title: "Yellow art shop - La boutique du Macojaune",
      meta: [
        {
          name: "title",
          content: "Macojaune.com - Photographe, D\xE9veloppeur Web, Entrepreneur et Grand Curieux"
        },
        {
          name: "description",
          content: description
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://macojaune.com/" },
        { property: "og:title", content: "Macojaune.com - Photographe, D\xE9veloppeur Web, Entrepreneur et Grand Curieux" },
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
        { property: "twitter:title", content: "Macojaune.com - Photographe, D\xE9veloppeur Web, Entrepreneur et Grand Curieux" },
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
                }
              ]
            }
          ]
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_nuxt_link = __nuxt_component_0;
      const _component_ProjectsSection = _sfc_main$2;
      const _component_BlogSection = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative w-full px-4 py-8" }, _attrs))}><div class="flex flex-col gap-5 lg:flex-row lg:justify-around"><section class="lg:w-1/4"><h2 class="mb-2 font-display text-2xl text-amber-600 lg:text-3xl"> Selon notre ami CHATGPT: </h2><p class="text-white lg:text-right"> Macojaune est un personnage public jeune et dynamique, passionn\xE9 par la vie, la photographie et l&#39;entrepreneuriat. Il est connu pour ses talents de photographe et ses comp\xE9tences en d\xE9veloppement web, ainsi que pour son parcours et sa personnalit\xE9 atypique. Macojaune partage r\xE9guli\xE8rement son travail et ses projets sur les r\xE9seaux sociaux et son site internet, o\xF9 il vend \xE9galement des tirages de ses clich\xE9s. </p></section><section class="lg:w-2/4"><h2 class="mb-2 font-display text-2xl text-amber-400 lg:text-3xl"> Selon moi\u2026 </h2><p class="text-white lg:text-lg"> C&#39;est plut\xF4t juste, oui ? Assez bluff\xE9 je suis. <br class="inline lg:hidden"> Bon, d&#39;accord\u2026 <br class="hidden lg:inline"> Poster r\xE9guli\xE8rement sur son site internet c&#39;est pas sp\xE9cialement vrai. <br class="inline lg:hidden"> Si tu lis ceci, c&#39;est que j&#39;ai publi\xE9 cette mise \xE0 jour tant repouss\xE9e et que je tente d&#39;organiser un fonctionnement cool et dynamique par ici. </p><div class="group mt-12 rounded-sm bg-amber-400/40 p-5 transition-all ease-in hover:bg-amber-400/40"><h3 class="mb-4 font-display text-4xl text-white lg:mb-2"> La boutique s&#39;est d\xE9plac\xE9e ! </h3><p class="font-sans text-base text-white"> Elle n&#39;a pas r\xE9sist\xE9 \xE0 l&#39;appel du mouvement #DigitalNomad et a fait ses valises pour un nouvel emplacement ! <br class="inline lg:hidden"> Pour d\xE9couvrir ma s\xE9lection de tirages et ajouter une touche de cr\xE9ativit\xE9 \xE0 ton salon </p><div class="mt-2 flex w-full justify-end">`);
      _push(ssrRenderComponent(_component_nuxt_link, {
        class: "bg-black p-3 text-white transition-colors hover:text-yellow-400 group-hover:animate-pulse",
        to: "/shop"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-white hover:text-yellow-400"${_scopeId}>C&#39;est par ici !</span>`);
          } else {
            return [
              createVNode("span", { class: "text-white hover:text-yellow-400" }, "C'est par ici !")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section></div><div class="pt-8"><p class="mb-2 text-white lg:mb-0"> On continue avec les nouveaut\xE9s </p>`);
      _push(ssrRenderComponent(_component_ProjectsSection, null, null, _parent));
      _push(ssrRenderComponent(_component_BlogSection, null, null, _parent));
      _push(`</div><div class="mt-8 flex flex-col gap-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-5 lg:pt-5"><h2 class="block font-display text-4xl/7 text-white lg:hidden lg:text-4xl"> Ma derni\xE8re vid\xE9o Youtube <small class="font-sans text-base italic text-red-500">On reste dans la verticalit\xE9.</small></h2><div class="aspect-portrait w-auto lg:h-screen"><iframe class="aspect-portrait w-full" src="https://www.youtube.com/embed?list=UULF4b9BIgf07NzGhrdL2zpQ8w"></iframe></div><div class="mt-4 flex flex-col justify-evenly lg:mt-0 lg:size-full"><h2 class="hidden font-display text-6xl/7 text-white lg:block"> Ma derni\xE8re vid\xE9o Youtube <br><small class="font-sans text-base italic text-red-500">On reste dans la verticalit\xE9.</small></h2><div class="flex aspect-square flex-col gap-4 bg-amber-400/20 p-4 lg:ml-auto lg:mt-24 lg:self-end"><h2 class="font-display text-4xl text-white lg:text-right"> Le podcast est toujours dispo </h2><iframe class="h-full grow" src="https://pod.link/1369562721"></iframe></div></div></div><p class="my-4 text-center font-sans text-base text-white lg:my-16"> J&#39;ai surement d&#39;autres choses \xE0 rajouter mais je s\xE8che\u2026 il est 4H du mat, je crois que c&#39;est le moment de publier cette mise \xE0 jour </p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D__c5JTB.mjs.map
