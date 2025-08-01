import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 8889,
    open: false,
  },
  html: {
    title: 'React Rsbuild Demo',
  },
})
