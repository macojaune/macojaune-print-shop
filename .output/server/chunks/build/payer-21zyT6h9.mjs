import { defineComponent, ref, provide, createElementBlock, useSSRContext, withAsyncContext, reactive, mergeProps, unref } from 'vue';
import { u as useState } from './state-DVSaO_PC.mjs';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { useHead } from 'unhead';
import { useRoute } from 'vue-router';
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
import '@unhead/shared';

async function useClientStripe() {
  const stripe = useState("stripe-client", () => null);
  useState("stripe-client-loading", () => false);
  return stripe;
}
const clientOnlySymbol = Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  // eslint-disable-next-line vue/require-prop-types
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots, attrs }) {
    const mounted = ref(false);
    provide(clientOnlySymbol, true);
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? void 0 : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "payer",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useHead({
      title: "Payer - Macojaune.com"
    });
    const route = useRoute();
    [__temp, __restore] = withAsyncContext(() => useClientStripe()), __temp = await __temp, __restore();
    const state = reactive({
      show: false,
      error: "",
      loading: false,
      intent: {},
      amount: route.params.amount,
      name: route.params.name,
      card: null
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "page-payer px-4" }, _attrs))} data-v-23e216ea><h1 class="mt-8 mb-3 text-5xl text-amber-400 uppercase" data-v-23e216ea>Par ici les paiements !</h1><p class="text-white" data-v-23e216ea>R\xE9gler une s\xE9ance, un tirage, ou un simple don ? C&#39;est possible.</p><div class="amount mt-8" style="${ssrRenderStyle(!unref(state).show ? null : { display: "none" })}" data-v-23e216ea><div class="flex gap-3 flex-col md:flex-row justify-center" data-v-23e216ea><div class="relative grow" data-v-23e216ea><input class="p-4 pr-12 w-full block rounded-md bg-stone-800 text-white font-bold focus:outline-none focus:ring-amber-300"${ssrRenderAttr("value", unref(state).amount)} type="number" placeholder="Rentre le montant ici (ex: 667.00)" autofocus data-v-23e216ea><div class="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none" data-v-23e216ea><span class="text-white font-bold leading-none" data-v-23e216ea>\u20AC</span></div></div><button class="p-4 rounded-md bg-amber-400 text-black text-center" data-v-23e216ea>`);
      if (!unref(state).loading) {
        _push(`<span class="font-bold text-center" data-v-23e216ea>Ensuite, clique ici</span>`);
      } else {
        _push(`<svg class="text-center animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-23e216ea><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-23e216ea></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-23e216ea></path></svg>`);
      }
      _push(`</button></div></div><div class="info mt-8" style="${ssrRenderStyle(unref(state).show ? null : { display: "none" })}" data-v-23e216ea><p class="mb-4 text-2xl text-white text-center" data-v-23e216ea>R\xE9gler<span class="text-4xl font-bold text-orange-400 mx-2" data-v-23e216ea>${ssrInterpolate(unref(state).amount)}\u20AC</span><span class="text-white mr-2" data-v-23e216ea>?</span><span class="text-xl" data-v-23e216ea>Simple comme bonjour.</span></p></div><div class="payment" style="${ssrRenderStyle(unref(state).show ? null : { display: "none" })}" data-v-23e216ea><p class="text-center text-white" data-v-23e216ea>Ins\xE8re tes informations en toute tranquilit\xE9.</p><form id="payme-form" data-v-23e216ea><div class="text-red-500 font-bold my-4" id="card-errors" role="alert" data-v-23e216ea>${ssrInterpolate(unref(state).error)}</div><div class="p-4 rounded" id="card" data-v-23e216ea></div><div class="p-4" data-v-23e216ea><button class="p-5 block w-full text-center bg-amber-400 text-black rounded-md font-bold" type="submit" data-v-23e216ea>BOOM !</button></div></form></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/payer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const payer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-23e216ea"]]);

export { payer as default };
//# sourceMappingURL=payer-21zyT6h9.mjs.map
