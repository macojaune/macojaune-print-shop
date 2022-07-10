<template lang="pug">
.app
  .main
    Header
    .container.mx-auto
      //.p-3.rounded-md.bg-gradient-to-r.from-red-500.to-orange-500.text-black.font-semibold.text-center
        | La boutique est momentanément suspendue. Les tirages reviennent bientôt
        |
        b.font-bold.text-white #stayConnect
      slot
    Footer
</template>

<script>

</script>

<style lang="stylus">
header
  padding 128px 0 175px

  h1
    font-size 77px

  h3
    font-size 66px
  @media screen and (max-width: 767px)
    padding 0
    h1
      font-size 66px

    h3
      font-size 40px

h1, h2, h3, h4, h5, h6
  font-family "Righteous"

.app
  background-color: #000000;
  background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23fbc02d' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");
  animation: move-background 100s linear infinite;

@keyframes move-background
  from
    background-position 0 0
  to
    background-position 1000px 1000px
</style>
