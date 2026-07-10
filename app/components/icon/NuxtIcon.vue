<template>
  <Icon
      :color="color"
      :name="name"
      :size="size"
      mode="svg"
  />
</template>

<script lang="ts" setup>
interface Props {
  name: string;
  size?: string | number;
  color?: string;
}

defineProps<Props>();
</script>

<style scoped>

</style>