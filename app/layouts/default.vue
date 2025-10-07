<template>
  <SideMenu/>
  <main class="pb-6" style="background-color: whitesmoke; min-height: 100vh;">
    <Notification/>
    <slot/>
  </main>
</template>

<script setup lang="ts">
import SideMenu from "~/components/menu/SideMenu.vue";
import Notification from "~/components/notification/Notification.vue";
</script>

<style scoped>
</style>