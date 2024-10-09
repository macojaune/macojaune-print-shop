<template>
  <div
    ref="galleryContainer"
    class="w-screen h-screen overflow-hidden relative touch-none"
    @wheel="handleScroll"
    @mousedown="startDrag"
    @mousemove="drag"
    @mouseup="endDrag"
    @mouseleave="endDrag"
    @touchstart="startTouch"
    @touchmove="moveTouch"
    @touchend="endTouch"
  >
    <div
      class="absolute top-0 left-0 w-full h-full transition-transform duration-75 ease-linear"
      :style="{ transform: `translate(${offsetX}px, ${offsetY}px)` }"
    >
      <div
        v-for="(column, columnIndex) in masonryColumns"
        :key="columnIndex"
        class="absolute top-0"
        :style="{
          left: `${columnIndex * (columnWidth + gap)}px`,
          width: `${columnWidth}px`,
        }"
      >
        <div
          v-for="(image, imageIndex) in column"
          :key="imageIndex"
          class="absolute transition-transform duration-300 ease-in-out hover:scale-105 hover:z-10"
          :style="{ top: `${image.y}px` }"
        >
          <img
            :src="image.src"
            :alt="image.alt"
            :style="{ width: `${columnWidth}px`, height: `${image.height}px` }"
            class="object-cover shadow-md rounded"
            @load="onImageLoad(columnIndex, imageIndex)"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
export type Image = { src: string; alt: string; height: number; y: number };
const images = ref<Image[]>([]);
const masonryColumns = ref<Array<Image[]>>([]);
const columnWidth = ref(300);
const gap = ref(20);
const numColumns = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const isMobile = ref(false);
const galleryContainer = ref();

onMounted(() => {
  checkMobile();
  loadImages();
  initializeMasonryLayout();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const loadImages = () => {
  // Simulating image loading. Replace this with your actual image loading logic
  for (let i = 0; i < 100; i++) {
    images.value.push({
      src: `https://picsum.photos/400/${
        200 + Math.floor(Math.random() * 200)
      }?random=${i}`,
      alt: `Random image ${i}`,
      height: 200 + Math.floor(Math.random() * 200), // Random height between 200 and 400
      y: 0,
    });
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  columnWidth.value = isMobile.value ? window.innerWidth - gap.value : 300;
};
const initializeMasonryLayout = () => {
  const containerWidth = galleryContainer.value.clientWidth;
  numColumns.value = isMobile.value
    ? 1
    : Math.floor(containerWidth / (columnWidth.value + gap.value));
  masonryColumns.value = Array(numColumns.value)
    .fill()
    .map(() => []);
  console.log("masonryColumns", masonryColumns.value);
  distributeImagesToColumns();
};
const distributeImagesToColumns = () => {
  masonryColumns.value.forEach((column) => (column.length = 0));
  images.value.forEach((image) => {
    const shortestColumnIndex = getShortestColumnIndex();
    const column = masonryColumns.value[shortestColumnIndex];
    const y = column.length
      ? column[column.length - 1].y +
        column[column.length - 1].height +
        gap.value
      : 0;
    masonryColumns.value[shortestColumnIndex].push({ ...image, y });
  });
};

const getShortestColumnIndex = () => {
  return masonryColumns.value.reduce(
    (shortestIndex, column, currentIndex, columns) => {
      const currentHeight = column.length
        ? column[column.length - 1].y + column[column.length - 1].height
        : 0;
      const shortestHeight = columns[shortestIndex].length
        ? columns[shortestIndex][columns[shortestIndex].length - 1].y +
          columns[shortestIndex][columns[shortestIndex].length - 1].height
        : 0;
      return currentHeight < shortestHeight ? currentIndex : shortestIndex;
    },
    0
  );
};
const onImageLoad = (columnIndex: number, imageIndex: number) => {
  const img = masonryColumns.value[columnIndex][imageIndex];
  // if (img.height !== img.element.naturalHeight) {
  //   img.height = img.element.naturalHeight;
  //   updateColumnLayout(columnIndex);
  // }
};
const updateColumnLayout = (columnIndex: number) => {
  let accumulatedHeight = 0;
  masonryColumns.value[columnIndex].forEach((img) => {
    img.y = accumulatedHeight;
    accumulatedHeight += img.height + gap.value;
  });
};
const handleScroll = (event) => {
  event.preventDefault();
  offsetX.value -= event.deltaX;
  offsetY.value -= event.deltaY;
};
const startDrag = (event) => {
  isDragging.value = true;
  startX.value = event.clientX - offsetX.value;
  startY.value = event.clientY - offsetY.value;
};
const drag = (event) => {
  if (!isDragging.value) return;
  offsetX.value = event.clientX - startX.value;
  offsetY.value = event.clientY - startY.value;
};
const endDrag = () => {
  isDragging.value = false;
};
const startTouch = (event) => {
  isDragging.value = true;
  startX.value = event.touches[0].clientX - offsetX.value;
  startY.value = event.touches[0].clientY - offsetY.value;
};

const moveTouch = (event) => {
  if (!isDragging.value) return;
  event.preventDefault();
  offsetX.value = event.touches[0].clientX - startX.value;
  offsetY.value = event.touches[0].clientY - startY.value;
};
const endTouch = () => {
  isDragging.value = false;
};
const handleResize = () => {
  checkMobile();
  initializeMasonryLayout();
};
</script>
