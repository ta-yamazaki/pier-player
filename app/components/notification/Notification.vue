<template>
  <transition name="slide-fade">
    <article v-if="message" class="message m-0 is-success">
      <div class="message-body is-flex is-align-items-center">
        <b class="is-flex-grow-1">{{ message }}</b>
        <button
class="delete has-background-success-dark"
                style="opacity: 0.5"
                @click="message = null"/>
      </div>
    </article>
  </transition>
  <transition name="slide-fade">
    <article v-if="errorMessage" class="message m-0 is-danger">
      <div class="message-body is-flex is-align-items-center">
        <b class="is-flex-grow-1">{{ errorMessage }}</b>
        <button
class="delete has-background-danger-dark"
                style="opacity: 0.5"
                @click="errorMessage = null"/>
      </div>
    </article>
  </transition>
</template>

<script setup lang="ts">
import {useNotification} from "@/composables/useNotification";

const {message, errorMessage} = useNotification();
</script>

<style scoped>
article.message {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s;
}

.slide-fade-leave-active {
  transition: all 0.5s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-80px);
}
</style>