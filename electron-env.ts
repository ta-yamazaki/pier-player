/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
    interface ProcessEnv {
        /**
         * The built directory structure
         *
         * ```tree
         * ├─┬─┬ dist
         * │ │ └── index.html
         * │ │
         * │ ├─┬ dist-electron
         * │ │ ├── main.js
         * │ │ └── preload.js
         * │
         * ```
         */
        APP_ROOT: string
        /** /dist/ or /public/ */
        VITE_PUBLIC: string
    }
}

// レンダラーに expose される API の型は app/types/window.d.ts を参照
