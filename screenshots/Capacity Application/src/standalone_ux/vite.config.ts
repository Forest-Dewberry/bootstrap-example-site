// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'
import mkcert from 'vite-plugin-mkcert'
import viteCompression from 'vite-plugin-compression';

// Utilities
import { defineConfig } from 'vite'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import { fileURLToPath, URL } from 'node:url'

const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'development',
  base: '/',
  includeAssets: ['favicon.svg'],
  manifest: {
    "name":"Break Free Scrum Capacity Application",
    "short_name":"capp",
    "start_url":"/",
    "background_color": "#3367D6",
    "theme_color": "#3367D6",
    "display":"standalone",
    icons: [
      {
        "src":"/android-chrome-192x192.png",
        "sizes":"192x192",
        "type":"image/png",
        "purpose": "any maskable"
      },
      {
        "src":"/android-chrome-512x512.png",
        "sizes":"512x512",
        "type":"image/png"
      }
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    /* when using generateSW the PWA plugin will switch to classic */
    type: 'module',
    navigateFallback: 'index.html',
  },
}

const replaceOptions = { values:{ __DATE__: new Date().toISOString()}, preventAssignment:true }
const claims = process.env.CLAIMS === 'true'
const reload = process.env.RELOAD_SW === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src'
  pwaOptions.filename = claims ? 'claims-sw.ts' : 'prompt-sw.ts'
  pwaOptions.strategies = 'injectManifest'
}

if (claims)
  pwaOptions.registerType = 'autoUpdate'

if (reload) {
  // @ts-expect-error overrides
  replaceOptions.__RELOAD_SW__ = 'true'
}

if (selfDestroying)
  pwaOptions.selfDestroying = selfDestroying

export default defineConfig({
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
    outDir: './dist'
  },
  plugins: [
    mkcert(),
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify(),
    VitePWA(pwaOptions),
    replace(replaceOptions),
    chunkSplitPlugin({
      strategy: 'single-vendor',
/*      customChunk: (args)=>{
        // files into pages directory is export in single files
        let { file, id, moduleId, root } = args;
        if(file.startsWith('src/components/')){
          file = file.substring(4);
          file = file.replace(/\.[^.$]+$/, '');
          return file;
        }
        return null;
      },*/
      customSplitting: {
        // `react` and `react-dom` will be bundled together in the `react-vendor` chunk (with their dependencies, such as object-assign)
        'react-vendor': ['vuetify', 'vue'],
        'lib': [/src\/lib/]
      }
    }),
    viteCompression({ algorithm: 'gzip'})
  ],
  define: { 'process.env': {BASE_URL:"src/"} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3030,
    https: true
  },
})
