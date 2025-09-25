<template>
  <NuxtIcon
      name="solar:music-notes-bold"
      :size="size"
      :color="color"
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