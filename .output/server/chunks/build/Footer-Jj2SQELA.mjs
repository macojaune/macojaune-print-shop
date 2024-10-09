import { _ as __nuxt_component_0 } from './nuxt-link-CFXPg0gv.mjs';
import { mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';

const instagram = '<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/> <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/> <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>';
const twitter = '<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path    d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>';
const facebook = '<svg class="h-8 w-8"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>';
const _sfc_main = {
  __name: "Footer",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "mt-20 pt-12 bg-black justify-self-end" }, _attrs))}><div class="text-center"><p class="text-white"> Machouill\xE9 avec <svg class="inline h-8 w-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg> par <a class="text-red-500 text-semibold hover:text-amber-400 hover:text-bold ease-in transition-all hover:underline" href="https://marvinl.com?ref=yellowartshop" target="_blank">MarvinL.com</a></p></div><div class="my-6 flex flex-row justify-center gap-4 md:gap-3"><a class="text-white hover:text-amber-400" href="https://facebook.com/macojaune">${facebook}</a><a class="text-white hover:text-amber-400" href="https://twitter.com/macojaune">${twitter}</a><a class="text-white hover:text-amber-400" href="https://instagram.com/macojaune">${instagram}</a></div><div class="container mx-auto py-8"><div class="grid grid-cols-2 lg:grid-cols-5 justify-center gap-5 grid-flow-row-dense text-amber-300">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-center text-amber-400 hover:text-orange-500",
        to: "/a-propos"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\xC0 propos `);
          } else {
            return [
              createTextVNode("\xC0 propos ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-center lg:text-left text-amber-400 hover:text-orange-500",
        to: "/payer"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Paiement `);
          } else {
            return [
              createTextVNode("Paiement ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-center lg:text-left text-amber-400 hover:text-orange-500",
        to: "/link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Liens utiles `);
          } else {
            return [
              createTextVNode("Liens utiles ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-center lg:text-left text-amber-400 hover:text-orange-500",
        to: "/mentions-legales"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Mentions L\xE9gales `);
          } else {
            return [
              createTextVNode("Mentions L\xE9gales ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-center lg:text-left text-amber-400 hover:text-orange-500",
        to: "/conditions-generales-de-vente"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`CGV `);
          } else {
            return [
              createTextVNode("CGV ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-center lg:text-left text-amber-400 hover:text-orange-500",
        to: "/blog"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Blog `);
          } else {
            return [
              createTextVNode("Blog ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></footer>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Footer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Footer-Jj2SQELA.mjs.map
