#!/usr/bin/env node

import path from "node:path"
import { fileURLToPath } from "node:url"

import { finalizeSeriesImports } from "./lib/import-series-finalize.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

finalizeSeriesImports(repoRoot, {
  onProgress(_event, message) {
    console.log(`[finalize] ${message}`)
  },
}).catch((error) => {
  console.error(`\nFinalization failed: ${error.message}`)
  process.exitCode = 1
})
