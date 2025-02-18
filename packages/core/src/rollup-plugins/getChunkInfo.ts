import type { Plugin } from 'rollup'

function getChunkInfoPlugin() {
  const plugin: Plugin = {
    name: 'get-chunk-info',
  }
  return plugin
}

export default getChunkInfoPlugin
