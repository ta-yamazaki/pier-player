<template>
  <NuxtIcon
      :color="color"
      :size="size || 18"
      class="has-text-warning-40"
      name="solar:music-notes-bold"
  />
</template>

<script lang="ts" setup>
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

interface Props {
  size?: string | number;
  color?: string;
}

defineProps<Props>();
</script>

<style scoped>

</style>