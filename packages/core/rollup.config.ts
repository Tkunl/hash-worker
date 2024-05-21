import { defineConfig } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { minify, swc } from 'rollup-plugin-swc3'
// @ts-expect-error
import webWorkerLoader from 'rollup-plugin-web-worker-loader'

const bundleName = 'kunHash'

// 一般来说现代项目不需要自行压缩这些cjs/esm模块，因为现代构建工具会自动处理
// 其次发包发布压缩的包意义在于减少安装大小，但是实际上这个行为可有可无
// 关于iife/umd 面向现代的前端提供iife就是最好的文明了。
// 因此你不需要过多复杂的配置。

export default defineConfig([
  {
    input: 'src/main.ts',
    output: [
      { file: 'dist/index.mjs', format: 'esm', exports: 'named' },
      { file: 'dist/index.js', format: 'cjs', exports: 'named' },
    ],
    plugins: [nodeResolve(), swc(), webWorkerLoader({ extensions: ['.ts'] })],
  },
  {
    input: 'src/main.ts',
    output: { file: 'dist/index.d.ts' },
    plugins: [dts()],
  },
  {
    input: 'src/main.ts',
    output: { file: 'dist/global.js', format: 'iife', name: bundleName },
    plugins: [
      nodeResolve(),
      swc(),
      minify({ mangle: true, module: true, compress: true, sourceMap: true }),
    ],
  },
  {
    input: 'src/iife.ts',
    output: { file: 'dist/global.d.ts', format: 'es' },
    plugins: [dts()],
  },
])
