<template>
  <SideMenu/>
  <main style="background-color: whitesmoke">
    <slot/>
    <footer class="footer mt-6 has-background-white">
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
  version.value = await window.api.getVersion();
});

// methods
</script>

<style scoped>

</style>