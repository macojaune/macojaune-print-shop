import type { Form, TinaField } from "tinacms"
import { defineConfig } from "tinacms"
import { slugifyRunValue } from "../utils/runs"

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.BRANCH ||
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main"

type TinaValues = Record<string, unknown>
type TinaProductValue = TinaValues & { title?: string; slug?: string }

const stringValue = (value: unknown) => (typeof value === "string" ? value : "")
const listValue = <T>(value: unknown) => (Array.isArray(value) ? (value as T[]) : [])

const galleryImageFields: TinaField[] = [
  { type: "image", label: "Source", name: "src", required: true },
  { type: "string", label: "Alt text", name: "alt" },
  { type: "string", label: "Caption", name: "caption", ui: { component: "textarea" } },
  {
    type: "string",
    label: "Orientation",
    name: "orientation",
    options: [
      { value: "landscape", label: "Landscape" },
      { value: "portrait", label: "Portrait" },
      { value: "square", label: "Square" },
      { value: "detail", label: "Detail" },
    ],
  },
] 

const storyBlockFields: TinaField[] = [
  {
    type: "string",
    label: "Block type",
    name: "type",
    options: [
      { value: "text", label: "Text" },
      { value: "image", label: "Image" },
      { value: "quote", label: "Quote" },
      { value: "callout", label: "Callout" },
    ],
    required: true,
  },
  { type: "string", label: "Eyebrow", name: "eyebrow" },
  { type: "string", label: "Title", name: "title" },
  { type: "rich-text", label: "Body", name: "body" },
  { type: "image", label: "Image", name: "image" },
  { type: "string", label: "Image alt text", name: "imageAlt" },
]

export default defineConfig({
  branch,
  // Get this from tina.io
  clientId: process.env.TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,
  client: { skip: true },
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    loadCustomStore: async () => {
      const mod = await import("./r2-media-store")
      return mod.R2MediaStore
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
          { type: "string", label: "Slug", name: "slug" },
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
            form: _form,
            cms: _cms,
            values,
          }: {
            form: Form
            cms: unknown
            values: TinaValues
          }) => {
            return {
              ...values,
              slug: slugifyRunValue(stringValue(values.title)),
            }
          },
        },
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
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
          },
          { type: "string", label: "Description", name: "description", ui: { component: "textarea" } },
          { type: "string", label: "Slug", name: "slug" },
          { type: "datetime", label: "Date", name: "date" },
          {
            type: "string",
            label: "Status",
            name: "status",
            required: true,
            options: [
              { value: "draft", label: "Draft" },
              { value: "scheduled", label: "Scheduled" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ],
          },
          {
            type: "image",
            label: "Series cover image",
            name: "coverImage",
            description: "Primary thumbnail for listing pages and social previews.",
          },
          {
            type: "image",
            label: "Series hero image",
            name: "heroImage",
            description: "Lead visual for the series page. Falls back to the cover image.",
          },
          {
            type: "object",
            label: "Series gallery",
            name: "gallery",
            list: true,
            fields: galleryImageFields,
          },
          {
            type: "object",
            label: "Story blocks",
            name: "storyBlocks",
            list: true,
            fields: storyBlockFields,
          },
          {
            type: "object",
            label: "Products",
            name: "products",
            list: true,
            fields: [
              { type: "string", label: "SKU", name: "sku" },
              { type: "string", label: "Title", name: "title" },
              { type: "string", label: "Slug", name: "slug" },
              { type: "rich-text", label: "Description", name: "description" },
              { type: "number", label: "Price", name: "price" },
              { type: "number", label: "Stock", name: "stock" },
              {
                type: "image",
                label: "Hero image",
                name: "heroImage",
                description: "Primary image for cards and Open Graph previews.",
              },
              {
                type: "object",
                label: "Gallery",
                name: "gallery",
                list: true,
                fields: galleryImageFields,
              },
              {
                type: "image",
                label: "Legacy images",
                name: "images",
                list: true,
                description: "Legacy fallback. The migration script keeps this in sync for older templates.",
              },
            ],
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
            form,
            cms: _cms,
            values,
          }: {
            form: Form
            cms: unknown
            values: TinaValues
          }) => {
            const title = stringValue(values.title)

            return {
              ...values,
              slug: stringValue(values.slug) || slugifyRunValue(title),
              date:
                form.crudType === "create"
                  ? new Date().toISOString()
                  : values.date,
              status: stringValue(values.status) || "draft",
              products: listValue<TinaProductValue>(values.products).map((product) => ({
                ...product,
                slug: stringValue(product.slug) || slugifyRunValue(stringValue(product.title)),
              })),
            }
          },
        },
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
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
            searchable: true,
          },
          { type: "string", label: "Permalink", name: "permalink" },
          { type: "string", label: "Author", name: "author" },
          { type: "datetime", label: "Date", name: "date" },
          { type: "datetime", label: "Last update", name: "updatedAt" },
          {
            type: "string",
            label: "Layout",
            name: "layout",
            options: [{ value: "post", label: "post" }],
          },
          { type: "image", label: "Cover", name: "image" },
          {
            type: "string",
            label: "Categories",
            name: "categories",
            list: true,
            searchable: true,
          },
          {
            type: "string",
            label: "Tags",
            name: "tags",
            list: true,
            searchable: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
          {
            name: "draft",
            type: "boolean",
            label: "Draft",
            description: "This is a draft",
            required: true,
          },
        ],
        ui: {
          beforeSubmit: async ({
            form,
            values,
          }: {
            form: Form
            cms: unknown
            values: TinaValues
          }) => {
            return {
              ...values,
              permalink:
                form.crudType === "create"
                  ? slugifyRunValue(stringValue(values.title))
                  : values.permalink,
              date:
                form.crudType === "create"
                  ? new Date().toISOString()
                  : values.date,
              updatedAt: new Date().toISOString(),
            }
          },
        },
      },
      {
        format: "md",
        label: "Projets",
        name: "project",
        path: "content/projects",
        match: {
          include: "**/*",
        },
        fields: [
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
            searchable: true,
          },
          { type: "string", label: "Permalink", name: "permalink" },
          { type: "datetime", label: "Date", name: "date" },
          { type: "datetime", label: "Last update", name: "updatedAt" },
          { type: "image", label: "Cover", name: "image" },
          {
            type: "string",
            label: "Categories",
            name: "categories",
            list: true,
            searchable: true,
          },
          {
            type: "string",
            label: "Tags",
            name: "tags",
            list: true,
            searchable: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
          { type: "string", label: "Pinterest Board", name: "pinterestUrl" },
          {
            name: "draft",
            type: "boolean",
            label: "Draft",
            description: "This is a draft",
            required: true,
          },
        ],
        ui: {
          beforeSubmit: async ({
            form,
            values,
          }: {
            form: Form
            cms: unknown
            values: TinaValues
          }) => {
            return {
              ...values,
              permalink:
                form.crudType === "create"
                  ? slugifyRunValue(stringValue(values.title))
                  : values.permalink,
              date:
                form.crudType === "create"
                  ? new Date().toISOString()
                  : values.date,
              updatedAt: new Date().toISOString(),
            }
          },
        },
      },

      {
        name: "links",
        format: "yaml",
        path: "content/",
        label: "Links",
        fields: [
          {
            label: "link",
            name: "link",
            type: "object",
            list: true,
            fields: [
              {
                type: "string",
                label: "Title",
                name: "text",
                isTitle: true,
                required: true,
              },
              {
                type: "string",
                label: "URL",
                name: "url",
              },
              { type: "string", label: "Description", name: "description" },
            ],
            ui: {
              itemProps: (item) => ({
                label: item?.text,
              }),
            },
          },
        ],
        ui: {
          allowedActions: { create: false, delete: false },
        },
      },
    ],
  },
  // search: {
  //   tina: {
  //     indexerToken: process.env.TINA_TOKEN,
  //     // stopwordLanguages: ['en', 'fra'],
  //   }
  // }
})
