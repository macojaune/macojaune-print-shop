import {defineConfig, Form, TinaCMS} from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  client: {skip: true},
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "pictures",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        format: "md",
        label: "Pages",
        name: "pages",
        path: "content/mentions",
        match: {
          include: "**/*",
        },
        fields: [
          {type: "string", label: 'Slug', name: 'slug'},
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
        ui: {
          beforeSubmit: async ({
                                 form, cms, values
                               }: {
            form: Form
            cms: TinaCMS
            values: Record<string, any>
          }) => {
            return {
              ...values,
              slug: values.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            }
          }
        }
      },
      {
        format: "md",
        label: "Runs",
        name: "runs",
        path: "content/runs",
        match: {
          include: "**/*",
        },
        fields: [
          {type: "string", label: 'Title', name: 'title', isTitle: true, required: true},
          {type: "rich-text", label: 'Description', name: 'description'},
          {type: "string", label: 'Slug', name: 'slug'},
          {type: "datetime", label: 'Date', name: 'date'},
          {
            type: "object", label: 'Products', name: 'products', list: true, fields: [
              {type: "string", label: 'SKU', name: 'sku'},
              {type: "string", label: 'Title', name: 'title'},
              {type: "string", label: 'Slug', name: 'slug'},
              {type: "rich-text", label: 'Description', name: 'description'},
              {type: "number", label: 'Price', name: 'price'},
              {type: "number", label: 'Stock', name: 'stock'},
              {type: "image", label: 'Images', name: 'images', list: true},
            ]
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
        ui: {
          beforeSubmit: async ({
                                 form, cms, values
                               }: {
            form: Form
            cms: TinaCMS
            values: Record<string, any>
          }) => {
            return {
              ...values,
              slug: values.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
              date: form.crudType === 'create' ? new Date().toISOString() : values.date
            }
          }
        }
      },
      {
        format: "md",
        label: "Articles",
        name: "blog",
        path: "content/blog",
        match: {
          include: "**/*",
        },
        fields: [
          {type: "string", label: 'Title', name: 'title', isTitle: true, required: true},
          {type: "string", label: 'Permalink', name: 'permalink'},
          {type: "string", label: 'Author', name: 'author'},
          {type: "string", label: 'Disqus', name: 'dsq_thread_id'},
          {type: "number", label: 'id', name: 'id', uid: true},
          {type: "datetime", label: 'Date', name: 'date'},
          {type: "string", label: 'Layout', name: 'layout', options: [{value: 'post', label: 'post'}]},
          {type: "image", label: 'Cover', name: 'image'},
          {type: "string", label: 'Categories', name: 'categories', list: true},
          {type: "string", label: 'Tags', name: 'tags', list: true},
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
        ui: {
          beforeSubmit: async ({
                                 form, cms, values
                               }: {
            form: Form
            cms: TinaCMS
            values: Record<string, any>
          }) => {
            return {
              ...values,
              permalink: values.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
              date: form.crudType === 'create' ? new Date().toISOString() : values.date
            }
          }
        }
      }
    ],
  },
});
