<template>
  <SideMenu/>
  <main style="background-color: whitesmoke">
    <slot/>
  </main>
</template>

<script setup lang="ts">
import SideMenu from "~/components/menu/SideMenu.vue";
</script>

<style scoped>

</style>