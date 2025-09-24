<template>
  <Icon
      :name="props.name"
      :size="props.size"
      mode="svg"
  />
</template>

<script setup lang="ts">

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String | Number,
    required: false,
    default: null
  }
});
</script>

<style scoped>

</style>