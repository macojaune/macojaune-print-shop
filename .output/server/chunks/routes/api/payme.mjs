import { u as useRuntimeConfig, q as defineEventHandler, r as getQuery, s as createError } from './checkout.mjs';
import { z } from 'zod';
import Stripe from 'stripe';
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

const useServerStripe = async (event) => {
  const { stripe: { key, options } } = useRuntimeConfig();
  if (event.context._stripe)
    return event.context._stripe;
  if (!key)
    console.warn("no key given for server service");
  const stripe = new Stripe(key, options);
  event.context._stripe = stripe;
  return event.context._stripe;
};

z.object({
  name: z.string().optional(),
  amount: z.number()
});
const payme = defineEventHandler(async (event) => {
  useRuntimeConfig(event);
  const { amount } = getQuery(event);
  const s = await useServerStripe(event);
  try {
    const paymentIntent = await s.paymentIntents.create({
      amount: amount * 1e3,
      currency: "eur",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true
      }
    });
    return { clientSecret: paymentIntent.client_secret };
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e.message });
  }
});

export { payme as default };
//# sourceMappingURL=payme.mjs.map
