<template>
  <NuxtIcon
      name="mdi:minus"
      :size="size"
      :color="color"
      class="is-clickable"
      style="transform: scale(1.2)"
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