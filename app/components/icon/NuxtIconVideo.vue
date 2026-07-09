<template>
  <NuxtIcon
      name="material-symbols:video-camera-back"
      :size="size || 18"
      :color="color"
      class="has-text-link-70"
  />
</template>

<script setup lang="ts">
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

interface Props {
  size?: string | number;
  color?: string;
}

defineProps<Props>();
</script>

<style scoped>

</style>