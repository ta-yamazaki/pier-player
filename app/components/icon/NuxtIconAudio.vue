<template>
  <NuxtIcon
      name="solar:music-notes-bold"
      :size="size || 18"
      :color="color"
      class="has-text-warning-40"
  />
</template>

<script setup lang="ts">
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

interface Props {
  size?: string | number;
  color?: string;
}

const props = defineProps<Props>();
</script>

<style scoped>

</style>