<template>
  <aside class="menu is-flex is-flex-direction-column">
    <div class="is-flex-grow-1">
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
          <NuxtLink
to="/vimeo/showcase" style="vertical-align: middle;"
                    :class="{ 'router-link-active': isVimeoActive }">
            <img src="@/assets/img/Vimeo.webp" height="18" width="18" class="mr-2">
            <small>Vimeo</small>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
to="/timeline" style="vertical-align: middle;"
                    :class="{ 'router-link-active': isTimelineActive }">
            <img src="@/assets/img/Timeline.webp" height="18" width="18" class="mr-2">
            <small>タイムライン</small>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
to="/convert/pitch" style="vertical-align: middle;"
                    :class="{ 'router-link-active': isConvertActive }">
            <img src="@/assets/img/ConvertPitch.webp" height="18" width="18" class="mr-2">
            <small>ピッチ変更</small>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <footer class="footer py-4" style="background-color: transparent">
      <div class="content has-text-centered">
        <p>Pier Player<br>v{{ version }}
        </p>
      </div>
    </footer>
  </aside>
</template>

<script setup lang="ts">
  import {onMounted, ref} from "vue";

  const route = useRoute()
  const isVimeoActive = computed(() => route.path.startsWith('/vimeo'))
  const isTimelineActive = computed(() => route.path.startsWith('/timeline'))
  const isConvertActive = computed(() => route.path.startsWith('/convert'))

  // state
  const version = ref("");

  // init
  onMounted(async () => {
    version.value = await window.commonApi.getCurrentVersion();
  });
</script>

<style scoped>
  aside.menu {
    position: fixed; /* サイドメニューを固定 */
    top: 0;
    left: 0;
    width: var(--sidebar-width);
    height: 100vh; /* 画面の高さいっぱい */
    overflow-y: auto; /* メニューが長ければスクロール */
    z-index: 9999;
    background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
    linear-gradient(
        125deg,
        rgb(9, 150, 175),
        rgb(151, 136, 218),
        rgb(168, 15, 137)
    );
  }

  aside.menu .menu-list a {
    border-radius: 0;
  }

  li a {
    background-color: transparent;
  }

  li a.router-link-active {
    background-color: whitesmoke;
    font-weight: bold;
  }
</style>