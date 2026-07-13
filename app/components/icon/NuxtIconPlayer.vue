<template>
  <NuxtIcon
      :color="color"
      :name="name"
      :size="size"
      class="is-clickable"
  />
</template>

<script lang="ts" setup>
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

interface Props {
  name: string;
  size?: string | number;
  color?: string;
}

// color未指定時は currentColor を継承し、親のCSSで色を制御する
withDefaults(defineProps<Props>(), {
  size: "24",
  color: "var(--pp-cyan)"
});
</script>

<style scoped>

</style>