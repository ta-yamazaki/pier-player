<template>
  <SideMenu/>
  <main>
    <slot/>
    <footer class="footer mt-6">
      <div class="content has-text-centered">
        <p>Pier Player - v{{ version }}</p>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import SideMenu from "~/components/menu/SideMenu.vue";

// state
const version = ref("");

// init
onMounted(async () => {
  version.value = await api.getVersion();
});

// methods
const isVideo = (type) => type.match(/video\/.*/);
</script>

<style scoped>

</style>