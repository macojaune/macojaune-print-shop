<template>
  <div>
    <section class="relative h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0">
        <!-- <img src="/images/photozine-cover.jpg" alt="Photozine cover" class="w-full h-full object-cover" /> -->
        <div class="absolute inset-0 bg-opacity-50" />
      </div>
      <div class="relative text-center flex flex-col z-10 max-w-3xl px-4">
        <h1 class="text-5xl md:text-7xl text-amber-400 font-bold mb-6">Jòn - PhotoZine #1</h1>

        <p class="text-xl md:text-2xl mb-8 font-sans leading-relaxed ">
          Je lance les pré-commandes pour mon premier <b>PhotoZine</b> !
        </p>
        <h2 class="text-amber-500 text-4xl text-left mb-4">Photo-Quoi<i>ent</i> ?</h2>

        <p class="text-base font-sans leading-relaxed text-justify">
          Zine ! C'est un petit livret photo un peu moins formel qu'un livre.
          <br/>
          Il sera imprimé, coupé, plié et relié à la main par mes soins.
          <br />
          Environ 80 pages au format A5 avec une sélection de mes photos préférées qui contiennent la couleur Jaune
          d'où le nom "Jòn" <i class="text-amber-400">(Jaune en créole)</i>.
          <br />
          <br />
J'ai choisi un papier mat de haute qualité, pour qu'il dure au moins 100 ans. <i class="text-base text-amber-400">Comme
          toi !</i>
        </p>
        <h2 class="text-amber-500 text-4xl text-left mb-4">Numéro 1 ?</h2>
        <p class="text-base font-sans leading-relaxed text-justify">Oui, c'est <b>le premier</b> d'une série <i>(d'au
          moins
          4)</i>.
          Avis aux collectionneurs et collectionneuses !
        <br/>
        <br/>
        Chaque édition sera signée et numérotée. <br/>
        Personnalisée aussi si tu veux l'offrir pour Noel par exemple</p>
        <h2 class="text-amber-500 text-4xl text-left mb-4">Livraison</h2>
        <p class="text-base font-sans leading-relaxed text-justify">
          <b>Livraison dans le monde entier, inclus dans le prix !</b><br/>
          Et le but c'est que j'arrive à tout finaliser et tu puisses <b>le recevoir pour Noel.</b>
          <br/>
          <br/>
          Je te tiens au courant de l'avancement de la production, par tous les moyens que tu connais (email, réseaux
          sociaux, signaux de fumée…)
        </p>
        <h2 class="text-amber-500 text-4xl text-left mb-4">Prix</h2>
        <p class="text-base mb-8 font-sans leading-relaxed text-justify">
          <b>Le prix augmente à chaque vente</b>, en suivant la fameuse suite de Fibonnaci.
          <br />
        Pour récompenser les plus rapides, et les plus
          fidèles
          d'entre vous.
          <br />
          <br />
          Et surtout pour limiter naturellement le nombre d'éditions de la série.
          <br />
          <br />
        Vu que <b>c'est mon anniversaire</b> je
          mets mon
          age (32 ans) en prix de départ.
        </p>

        <span class="text-5xl font-light text-white font-display mb-8" v-if="data">
          {{ data.price }} €
        </span>

        <form action="/api/checkout" method="POST" >
          <input type="hidden" :value="product.title" name="title"
          />
          <input type="hidden" :value="product.description" name="description"/>
          <input type="hidden" name="url" value="/photozine" />
          <button type="submit" role="link" class="bg-amber-400 p-3 transition-colors hover:bg-black hover:border-amber-400 border border-transparent hover:text-amber-400 hover:animate-pulse text-black text-lg w-fit self-center"
>Pré-commander</button>
        </form>
      </div>
    </section>
  </div>
</template>


<script lang="ts" setup>
definePageMeta({
  layout: false,
  pageTitle: 'Photozine #1 : Jòn - Macojaune',
  pageDescription:
    "Si tu vois ceci, c'est que tu es un·e super curieu·se, tu as découvert mon prochain produit avant que je l'annonce, tu peux donc le précommander en avant-avant-première !"
});
            const product
                =ref({title:"PhotoZine #1 - Jòn",
              description:"Le Zine c’est un format un peu plus libre que le livre photo. Les miens seront imprimés par mes soins, sur du papier mat de haute qualité, coupés, pliés, reliés à la main. Signés, numérotés. Format A5. J’ai compté 80pages environ…"})
const config = useRuntimeConfig()
const {data} = await useFetch('/api/photozinePrice',{pick: ['price']})

</script>
