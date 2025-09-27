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

// withDefaults を使って default 値を指定
const props = withDefaults(defineProps<Props>(), {
  size: "24",
  color: "'var(--bulma-primary-dark)'"
});
</script>

<style scoped>

</style>