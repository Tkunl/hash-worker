import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [ 'src/index.ts', 'src/benchmark.ts' ],
  format: [ 'esm' ],
})
