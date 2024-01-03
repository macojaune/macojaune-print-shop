import { defineConfig } from "tinacms";

import { pageFields } from "./templates";
import { runFields } from "./templates";

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

  client: { skip: true },
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
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
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
          {type:"string", label: 'Title',name:'title'},
          {type:"rich-text", label: 'Description',name:'description'},
          {type:"string", label: 'Slug',name:'slug'},
          {type:"datetime", label: 'Date',name:'date'},
          {type:"object", label: 'Products',name:'products', list:true,fields:[
              {type:"string", label: 'SKU',name:'sku'},
              {type:"string", label: 'Title',name:'title'},
              {type:"string", label: 'Slug',name:'slug'},
              {type:"rich-text", label: 'Description',name:'description'},
              {type:"number", label: 'Price',name:'price'},
              {type:"number", label: 'Stock',name:'stock'},
              {type:"image", label: 'Images',name:'images',list:true},
            ]},
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
