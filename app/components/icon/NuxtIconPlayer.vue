<template>
  <NuxtIcon
      :name="name"
      :size="size"
      :color="color"
      class="is-clickable"
  />
</template>

<script setup lang="ts">
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

interface Props {
  name: string;
  size?: string | number;
  color?: string;
}

// color未指定時は currentColor を継承し、親のCSSで色を制御する
withDefaults(defineProps<Props>(), {
  size: "24",
  color: undefined
});
</script>

<style scoped>

</style>