<template>
  <NuxtIcon
      :color="color"
      :size="size"
      name="material-symbols:folder"
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