<script lang="ts" setup>
import { getProductHeroImage, getProductImages } from "../../../utils/runs"

const route = useRoute()

const serie = await queryContent("runs").where({ slug: route.params.slug }).findOne()

if (!serie) {
  throw createError({
    statusCode: 404,
    statusMessage: "Série introuvable",
  })
}

const product = serie.products.find(
  (entry: { slug: string | string[] }) => entry.slug === route.params.productSlug,
)

if (!product) {
  throw createError({
    statusCode: 404,
    statusMessage: "Photo introuvable",
  })
}

const firstImage = getProductHeroImage(product) || getProductImages(product)[0]

await navigateTo(
  {
    path: `/series/${serie.slug}`,
    query: firstImage ? { photo: firstImage } : {},
  },
  { redirectCode: 301 },
)
</script>
