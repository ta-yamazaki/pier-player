<template>
  <section class="login-wrap">
    <div class="box">
      <div class="field">
        <label class="label is-size-7">メールアドレス</label>
        <p class="control">
          <input
              v-model="email"
              class="input is-small"
              type="email"
              name="email"
              autocomplete="email"
              placeholder="mail@example.com"
              @keyup.enter="login">
        </p>
      </div>
      <div class="field">
        <label class="label is-size-7">パスワード</label>
        <p class="control">
          <input
              v-model="password"
              class="input is-small"
              type="password"
              placeholder="パスワード"
              @keyup.enter="login">
        </p>
      </div>
      <button
          :class="{'is-loading': loading}"
          :disabled="!email || !password"
          class="button is-small is-primary is-fullwidth"
          @click="login">
        ログイン
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {PraiseAuth} from "~/utils/praise/auth";

/**
 * Pier Praise へのログインフォーム。
 * ログイン成否は親が PraiseAuth.onAuthStateChanged で観測する。
 */

// state
const email = ref("");
const password = ref("");
const loading = ref(false);

const {notifyError} = useNotification();

// methods
const login = async () => {
  if (!email.value || !password.value || loading.value) return;
  loading.value = true;
  try {
    await PraiseAuth.login(email.value, password.value);
    password.value = "";
  } catch (e) {
    console.error(e);
    notifyError("ログインできませんでした。メールアドレスとパスワードを確認してください。");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrap {
  max-width: 420px;
  margin: 72px auto;
}
</style>
