// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    srcDir: 'app/',
    devtools: {
        enabled: false
    },
    modules: [
        "nuxt-electron",
        '@nuxt/eslint',
        '@nuxt/icon'
    ],
    electron: {
        build: [
            {
                // Main-Process entry file of the Electron App.
                entry: 'electron/main.ts',
            },
            {
                entry: 'electron/preload.ts',
                onstart(args) {
                    // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
                    // instead of restarting the entire Electron App.
                    args.reload()
                },
            },
        ],
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want to use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
    },
    ssr: false, // #43
    css: [
        "bulma/css/bulma.css"
    ]
})