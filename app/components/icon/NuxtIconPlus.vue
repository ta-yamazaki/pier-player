<template>
  <NuxtIcon
      :color="color"
      :size="size"
      class="is-clickable"
      name="mdi:add"
      style="transform: scale(1.2)"
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