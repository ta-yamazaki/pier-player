// @ts-check
// Nuxt 3.6.5 では @nuxt/eslint モジュールが .nuxt/eslint.config.mjs を生成しないため、
// 生成ファイルに依存しないスタンドアロン構成にしている
import {createConfigForNuxt} from '@nuxt/eslint-config/flat'

export default createConfigForNuxt().append({
    ignores: [
        '.nuxt/**',
        '.output/**',
        'dist-electron/**',
        'release/**',
        'app/public/**',
        'electron-env.ts', // vite-plugin-electron 由来のambient宣言
    ],
}).append({
    rules: {
        // any の解消は段階的に進める（app/types/models.ts 参照）
        '@typescript-eslint/no-explicit-any': 'warn',
        // Vue 3 では複数ルートtemplateは合法
        'vue/no-multiple-template-root': 'off',
    },
}).append({
    // メインプロセス側のプレーンJS: 未使用の先頭引数は _ プレフィックスで許可
    files: ['electron/**/*.js', '*.js'],
    rules: {
        'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
    },
})
