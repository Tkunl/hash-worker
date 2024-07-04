import { defineConfig } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { minify, swc } from 'rollup-plugin-swc3'

const bundleName = 'HashWorker'

// 一般来说现代项目不需要自行压缩这些 cjs/esm 模块，因为现代构建工具会自动处理
// 其次发包发布压缩的包意义在于减少安装大小，但是实际上这个行为可有可无
// 关于 iife/umd 面向现代的前端提供 iife 就可以了。
// 因此你不需要过多复杂的配置。

export default defineConfig([
  // esm 产物
  {
    input: 'src/main.ts',
    output: [
      { file: 'dist/index.mjs', format: 'esm', exports: 'named' },
      { file: 'dist/index.js', format: 'cjs', exports: 'named' },
    ],
    plugins: [nodeResolve(), swc({ sourceMaps: true })],
    external: ['worker_threads'],
  },
  // esm 类型产物
  {
    input: 'src/main.ts',
    output: { file: 'dist/index.d.ts' },
    plugins: [dts()],
    external: ['worker_threads'],
  },
  // iife 产物
  {
    input: 'src/main.ts',
    output: { file: 'dist/global.js', format: 'iife', name: bundleName },
    plugins: [
      nodeResolve(),
      swc({ sourceMaps: true }),
      minify({ mangle: true, module: false, compress: true, sourceMap: true }),
    ],
    external: ['worker_threads'],
  },
  // iife 类型产物
  {
    input: 'src/iife.ts',
    output: { file: 'dist/global.d.ts', format: 'es' },
    plugins: [dts()],
    external: ['worker_threads'],
  },
  // Worker
  {
    input: 'src/worker/crc32.worker.ts',
    output: { file: 'dist/worker/crc32.worker.mjs', format: 'esm' },
    plugins: [
      nodeResolve(),
      swc({ sourceMaps: true }),
      minify({ mangle: true, module: true, compress: true }),
    ],
  },
  {
    input: 'src/worker/md5.worker.ts',
    output: { file: 'dist/worker/md5.worker.mjs', format: 'esm' },
    plugins: [
      nodeResolve(),
      swc({ sourceMaps: true }),
      minify({ mangle: true, module: true, compress: true }),
    ],
  },
])
