// client/vite.config.js
import { defineConfig } from 'vite'
import { vitePlugin as swcPlugin } from '@swc/core'

export default defineConfig({
  plugins: [swcPlugin()],
  base: import.meta.env.PROD ? '/client/' : '/'
})

