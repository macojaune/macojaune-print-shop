<template>
  <div>
    <section class="relative h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0">
        <!-- <img src="/images/photozine-cover.jpg" alt="Photozine cover" class="w-full h-full object-cover" /> -->
        <div class="absolute inset-0 bg-opacity-50" />
      </div>
      <div class="relative text-center flex flex-col z-10 max-w-3xl px-4">
        <h1 class="text-5xl md:text-7xl text-amber-400 font-bold mb-6">Jòn - PhotoZine #1</h1>

        <p class="text-xl md:text-2xl mb-8 font-sans leading-relaxed">
          T'es un peu en avance, et c'est parfait. Bèf douvan bwè dlo klè !
        </p>
        <span class="text-5xl font-light text-white font-display mb-8">18€</span>
        <a class="bg-amber-400 p-3 transition-colors hover:bg-black hover:border-amber-400 border border-transparent hover:text-amber-400 hover:animate-pulse text-black text-lg w-fit self-center"
          href="https://buy.stripe.com/aEU3cZ96PbZ14zS3cc" target="_blank">Précommander
          en avant-avant-première</a>
      </div>
    </section>
  </div>
</template>


<script lang="ts" setup>
definePageMeta({
  layout: false,
  pageTitle: 'Photozine #1 : Jòn - Macojaune',
  pageDescription: "Si tu vois ceci, c'est que tu es un·e super curieu·se, tu as découvert mon prochain produit avant que je l'annonce, tu peux donc le précommander en avant-première !"
});
</script>
