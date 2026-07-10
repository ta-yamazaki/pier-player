<template>
  <aside class="dock">
    <div class="dock-brand">
      <span class="dock-beacon"/>
      <div>
        <p class="dock-name">PIER PLAYER</p>
        <p class="dock-sub">MEDIA CONSOLE</p>
      </div>
    </div>

    <div class="dock-body">
      <p class="dock-label">Playback — 再生</p>
      <ul class="dock-nav">
        <li>
          <NuxtLink to="/">
            <NuxtIcon name="mdi:folder-play-outline" size="17"/>
            <span>ファイル</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/cgm">
            <NuxtIcon name="mdi:television-play" size="17"/>
            <span>CGM</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/vimeo/showcase" :class="{ 'router-link-active': isVimeoActive }">
            <NuxtIcon name="mdi:vimeo" size="17"/>
            <span>Vimeo</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/timeline" :class="{ 'router-link-active': isTimelineActive }">
            <NuxtIcon name="mdi:chart-timeline-variant" size="17"/>
            <span>タイムライン</span>
          </NuxtLink>
        </li>
      </ul>

      <p class="dock-label mt-5">Tools — 変換</p>
      <ul class="dock-nav">
        <li>
          <NuxtLink to="/convert/pitch" :class="{ 'router-link-active': isConvertActive }">
            <NuxtIcon name="mdi:tune-variant" size="17"/>
            <span>ピッチ変更</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <footer class="dock-foot">
      <p>v{{ version }}</p>
    </footer>
  </aside>
</template>

<script setup lang="ts">
  import {onMounted, ref} from "vue";
  import NuxtIcon from "~/components/icon/NuxtIcon.vue";

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
  .dock {
    position: fixed;
    top: 0;
    left: 0;
    width: var(--sidebar-width);
    height: 100vh;
    overflow-y: auto;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    padding: 1.1rem 0.75rem 0.9rem;
    background: linear-gradient(180deg, #ffffff, hsl(213, 36%, 94%));
    border-right: 1px solid var(--pp-line-soft);
  }

  .dock-brand {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0 0.35rem 1rem;
    border-bottom: 1px solid var(--pp-line-soft);
    margin-bottom: 1rem;
  }

  .dock-beacon {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--pp-cyan);
    box-shadow: 0 0 8px hsla(190, 90%, 40%, 0.7), 0 0 18px hsla(190, 90%, 40%, 0.35);
  }

  .dock-name {
    font-family: var(--pp-font-mono);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: var(--pp-text);
    line-height: 1.5;
  }

  .dock-sub {
    font-family: var(--pp-font-mono);
    font-size: 0.5rem;
    letter-spacing: 0.24em;
    color: var(--pp-fog);
  }

  .dock-body {
    flex-grow: 1;
  }

  .dock-label {
    font-family: var(--pp-font-mono);
    font-size: 0.55rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--pp-fog);
    padding: 0 0.5rem;
    margin-bottom: 0.4rem;
  }

  .dock-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dock-nav a {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    color: var(--pp-fog);
    font-size: 0.82rem;
    font-weight: 600;
    position: relative;
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .dock-nav a:hover {
    color: var(--pp-text);
    background: hsla(215, 30%, 50%, 0.09);
  }

  .dock-nav a.router-link-active {
    color: var(--pp-cyan);
    background: var(--pp-cyan-soft);
  }

  /* アクティブ項目のタリーエッジ */
  .dock-nav a.router-link-active::before {
    content: '';
    position: absolute;
    left: -0.75rem;
    top: 20%;
    height: 60%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--pp-cyan);
    box-shadow: 0 0 6px hsla(190, 90%, 40%, 0.6);
  }

  .dock-foot {
    padding-top: 0.75rem;
    border-top: 1px solid var(--pp-line-soft);
    text-align: center;
  }

  .dock-foot p {
    font-family: var(--pp-font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    color: var(--pp-fog);
  }
</style>
