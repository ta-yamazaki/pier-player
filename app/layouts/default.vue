<template>
  <SideMenu/>
  <main>
    <Notification/>
    <slot/>
  </main>
</template>

<script lang="ts" setup>
import SideMenu from "~/components/menu/SideMenu.vue";
import Notification from "~/components/notification/Notification.vue";
</script>

<style scoped>
</style>
