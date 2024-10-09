import remarkEmoji from 'remark-emoji';
import rehypeExternalLinks from 'rehype-external-links';

const remarkPlugins = {
  'remark-emoji': { instance: remarkEmoji },
};

const rehypePlugins = {
  'rehype-external-links': { instance: rehypeExternalLinks, options: {"target":"_blank"} },
};

const highlight = {};

export { highlight, rehypePlugins, remarkPlugins };
//# sourceMappingURL=mdc-imports.mjs.map
