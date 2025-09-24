<template>
  <aside class="menu">
    <p class="menu-label mx-2 mt-3 mb-1">再生モード</p>
    <ul class="menu-list">
      <li>
        <NuxtLink to="/" style="vertical-align: middle;">
          <img src="@/assets/img/Files.webp" height="18" width="18" class="mr-2">
          <small>ファイル</small>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/cgm" style="vertical-align: middle;">
          <img src="@/assets/img/CGM.webp" height="18" width="18" class="mr-2">
          <small>CGM</small>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/vimeo/showcase" style="vertical-align: middle;"
                  :class="{ 'router-link-active': isVimeoActive }">
          <img src="@/assets/img/Vimeo.webp" height="18" width="18" class="mr-2">
          <small>Vimeo</small>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/timeline" style="vertical-align: middle;">
          <img src="@/assets/img/Timeline.webp" height="18" width="18" class="mr-2">
          <small>タイムライン</small>
        </NuxtLink>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
  const route = useRoute()
  const isVimeoActive = computed(() => route.path.startsWith('/vimeo'))
</script>

<style scoped>
  li a {
    background-color: transparent;
  }

  li a.router-link-active {
    background-color: whitesmoke;
    font-weight: bold;
  }
</style>