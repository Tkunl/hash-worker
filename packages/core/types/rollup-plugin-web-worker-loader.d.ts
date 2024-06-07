declare module 'rollup-plugin-web-worker-loader' {
  interface WebWorkerLoaderOptions {
    targetPlatform?: 'auto' | 'browser' | 'node' | 'base64'
    'web-worker'?: RegExp
    'shared-worker'?: RegExp
    'service-worker'?: RegExp
    'audio-worklet'?: RegExp
    'paint-worklet'?: RegExp
    sourcemap?: boolean
    inline?: boolean
    extensions?: string[]
    preserveSource?: boolean
    preserveFileNames?: boolean
    enableUnicodeSupport?: boolean
    outputFolder?: string
    loadPath?: string
    skipPlugins?: string[]
  }

  function webWorkerLoader(options: WebWorkerLoaderOptions): any
  export default webWorkerLoader
}
