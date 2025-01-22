const rimraf = require('rimraf')
const path = require('path')

const nodeModulesDir = [
  '',
  'packages/benchmark/',
  'packages/core/',
  'packages/playground/benchmark-demo/',
  'packages/playground/node-demo/',
  'packages/playground/react-webpack-demo/',
  'packages/playground/vue-vite-demo/',
].map((dir) => dir + 'node_modules')

const distToBeBundled = [
  'packages/benchmark/',
  'packages/core/',
  'packages/playground/benchmark-demo/',
  'packages/playground/node-demo/',
]

const distDir = distToBeBundled.map((dir) => dir + 'dist')
const turboCacheDir = distToBeBundled.map((dir) => dir + '.turbo')
const iifeDemoDeps = [
  'packages/playground/iife-demo/global.js',
  'packages/playground/iife-demo/worker',
]

const coverageDir = ['packages/core/coverage']

// 主函数来删除所有路径，并处理错误
function removePaths(paths) {
  paths.forEach((path) => {
    try {
      rimraf.sync(path)
      console.log(`Successfully deleted: ${path}`)
    } catch (err) {
      console.error(`Failed to delete: ${path}, Error: ${err.message}`)
    }
  })

  console.log('All deletion attempts have been processed.')
}

function processArgs() {
  const args = process.argv.slice(2)
  let pattern = ''

  args.forEach((arg) => {
    const [key, value] = arg.split('=')
    if (key === '--pattern') {
      pattern = value
    }
  })
  return pattern
}

;(() => {
  const startTime = Date.now() // 记录开始时间
  const pattern = processArgs() // 获取执行参数

  // 定义目录映射
  const dirMap = {
    node_modules: nodeModulesDir,
    dist: distDir,
    cache: turboCacheDir,
    coverage: coverageDir,
  }

  let pathsToDelete = []

  if (pattern === 'all') {
    pathsToDelete = [
      ...nodeModulesDir,
      ...distDir,
      ...turboCacheDir,
      ...iifeDemoDeps,
      ...coverageDir,
    ]
  } else if (dirMap[pattern]) {
    pathsToDelete = dirMap[pattern]
  }

  // 解析路径并删除
  pathsToDelete = pathsToDelete.map((p) => path.resolve(process.cwd(), p))

  removePaths(pathsToDelete)

  const endTime = Date.now() // 记录结束时间
  const timeTaken = endTime - startTime // 计算总耗时
  console.log(`Total time taken: ${timeTaken}ms`)
})()
