import type { TinaField } from "tinacms";
export function pageFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "string",
      name: "slug",
      label: "slug",
    },
  ] as TinaField[];
}
export function runFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "string",
      name: "slug",
      label: "slug",
    },
    {
      type: "string",
      name: "cover",
      label: "cover",
    },
    {
      type: "string",
      name: "description",
      label: "description",
    },
    {
      type: "datetime",
      name: "date",
      label: "date",
    },
    {
      type: "object",
      name: "products",
      label: "products",
      list: true,
      fields: [
        {
          type: "string",
          name: "sku",
          label: "sku",
        },
        {
          type: "string",
          name: "title",
          label: "title",
        },
        {
          type: "string",
          name: "slug",
          label: "slug",
        },
        {
          type: "string",
          name: "description",
          label: "description",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "price",
          label: "price",
        },
        {
          type: "string",
          name: "stock",
          label: "stock",
        },
        {
          type: "image",
          name: "images",
          label: "images",
          list: true,
        },
      ],
    },
  ] as TinaField[];
}
