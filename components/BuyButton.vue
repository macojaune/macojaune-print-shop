<template>
    <form action="/api/checkout-product" method="POST">
        <input type="hidden" name="product" :value="JSON.stringify(product)">
        <button
            class="snipcart-add-item px-8 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-amber-400 active:bg-amber-500"
            type="submit">
            Acheter
        </button>
    </form>
</template>
<script setup lang="ts">
const { product } = defineProps<{ product: { sku: string, title: string, price: string, stock: string, images: string[] } }>()
const doBuy = async () => {
    try { await $fetch("/api/checkout-product", { method: "POST", body: JSON.stringify({ product }) }) } catch (e) {
        console.error(e)
    }
}
</script>
