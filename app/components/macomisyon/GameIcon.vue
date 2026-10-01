<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })

const paths: Record<string, string> = {
  bank: 'm2 8 10-5 10 5H2Zm2 12h16M2 23h20M5 11v6m5-6v6m4-6v6m5-6v6',
  chat: 'M3 4h18v12H9l-6 5V4Zm4 4h10M7 12h6',
  mail: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
  file: 'M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8m-8 4h6',
  tape: 'M3 5h18v14H3V5Zm4 3h10v6H7V8Zm2 2v2m6-2v2M8 19v-2h8v2',
  check: 'm4 12 5 5L20 5',
  parcel: 'm3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v10M7 5l9 4v5',
  camera: 'M3 7h5l2-3h5l2 3h4v13H3V7Zm13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  close: 'm6 6 12 12M6 18 18 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  pause: 'M8 5v14M16 5v14',
  play: 'm8 5 11 7-11 7V5Z',
  home: 'm3 10 9-7 9 7v10H3V10Zm6 10v-7h6v7',
  locate: 'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6M8 12h8m-4-4v8',
  map: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16',
  lock: 'M5 10h14v11H5V10Zm3 0V7a4 4 0 0 1 8 0v3m-4 5v2',
  help: 'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 4h.01M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z',
}
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
    <path :d="paths[name] || paths.map" />
  </svg>
</template>
