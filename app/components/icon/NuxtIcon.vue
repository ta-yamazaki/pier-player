<template>
  <Icon
      :name="name"
      :size="size"
      :color="color"
      mode="svg"
  />
</template>

<script setup lang="ts">
interface Props {
  name: string;
  size?: string | number;
  color?: string;
}

defineProps<Props>();
</script>

<style scoped>

</style>