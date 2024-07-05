import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/worker-container.ts'],
  format: ['esm'],
})
