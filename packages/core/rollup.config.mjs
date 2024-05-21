import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import eslint from '@rollup/plugin-eslint'
import replace from '@rollup/plugin-replace'
import packageInfo from './package.json' assert { type: 'json' }

const version = packageInfo.version
const distName = 'output'
const fileBaseName = 'kunHash'
const rollupOutputName = 'kunHash'
const packageConfig = []

/**
 * 用于配置不同打包格式, 并且自定义不同打包格式的不同插件配置
 */
const formatsExport = {
  cjs: {
    file: 'cjs.js',
    format: 'cjs',
  },
  esm: {
    file: 'esm.js',
    format: 'esm',
  },
  'esm-bundler': {
    file: 'esm-bundler.js', // ESM 文件，专门为打包工具准备
    format: 'esm',
  },
  'esm-browser': {
    file: 'esm-browser.js', // ESM 文件，专门为现代浏览器准备
    format: 'esm',
  },
  global: {
    file: 'global.js',
    format: 'iife',
  },
}

function generateConfig(formatName, rollupOutput, plugins = []) {
  const isBundlerESMBuild = /esm-bundler/.test(formatsExport[formatName].file)
  const isBrowserESMBuild = /esm-browser/.test(formatsExport[formatName].file)
  const isProductionBuild =
    process.env.__DEV__ === 'false' || /\.prod\.js$/.test(rollupOutput.file)
  const isGlobalBuild = /global/.test(rollupOutput.file)
  const isCJSBuild = /cjs/.test(rollupOutput.file)

  if (isGlobalBuild || isBrowserESMBuild) {
    rollupOutput.name = rollupOutputName
  }

  // prod 环境下不会生成 sourcemap
  rollupOutput.sourcemap = !isProductionBuild

  return {
    input: 'src/main.ts',
    output: rollupOutput,
    plugins: [
      resolve(), // 用于包中的第三方依赖
      babel({ babelHelpers: 'bundled' }), // 会将 Babel 使用的 helpers 函数放到每个需要它们的文件模块中
      tsPluginsConfig(rollupOutput.sourcemap),
      workerPluginsConfig(),
      eslintPluginsConfig(),
      replaceConfig(),
      ...plugins,
    ],
    treeshake: { // 配置 treeshake 策略, 以下都是默认值设置
      propertyReadSideEffects: true,
      tryCatchDeoptimization: true,
      moduleSideEffects: true,
    },
  }

  /**
   * ts 插件配置
   * @param sourceMap boolean
   * @returns {Plugin}
   */
  function tsPluginsConfig(sourceMap) {
    return typescript({
      tsconfig: 'tsconfig.json',
      target: 'es2022',
      module: 'esnext',
      declaration: true,
      declarationDir: '/output/types',
      sourceMap
    })
  }

  function workerPluginsConfig() {
    return webWorkerLoader({
      extensions: ['.ts']
    })
  }

  /**
   * Eslint 插件配置
   * @returns {Plugin}
   */
  function eslintPluginsConfig() {
    return eslint({
      throwOnError: true,
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**'],
    })
  }

  /**
   * 环境变量插件配置
   * @returns {Plugin}
   */
  function replaceConfig() {
    // 代码中用到的一些环境变量, 会在此处被替换
    const resolves = {
      __VERSION__: version,
      __TEST__: false,
      __BROWSER__: isBrowserESMBuild,
      __GLOBAL__: isGlobalBuild,
      __ESM_BUNDLER__: isBundlerESMBuild,
      __ESM_BROWSER__: isBrowserESMBuild,
      __NODE_JS__: isCJSBuild,
    }

    if (isBundlerESMBuild) {
      // preserve to be handled by bundlers
      resolves['__DEV__'] = `!!(process.env.NODE_ENV !== 'production')`
    }

    if (!isBundlerESMBuild) {
      resolves.__DEV__ = String(!isProductionBuild)
    }

    // TODO 此处没太懂 for compiler-sfc browser build inlined deps
    if (isBrowserESMBuild) {
      resolves.process = {
        env: '({})',
        platform: `""`,
        stdout: 'null',
      }
    }

    return replace({
      preventAssignment: true,
      values: resolves,
    })
  }
}

function generateProductionConfig(format) {
  return generateConfig(format, {
    file: formatsExport[format].file.replace(/\.js$/, '.prod.js'),
    format: formatsExport[format].format,
  })
}

function generateMinifiedConfig(format) {
  return generateConfig(
    format,
    {
      file: formatsExport[format].file.replace(/\.js$/, '.prod.js'),
      format: formatsExport[format].format,
    },
    [terser()],
  )
}

function initConfig() {
  Reflect.ownKeys(formatsExport).forEach((formatName) => {
    const formatConfig = formatsExport[formatName]
    // 重命名输出输出文件名
    formatConfig.file = distName + '/' + fileBaseName + '.' + formatConfig.file

    packageConfig.push(generateConfig(formatName, formatConfig))

    // 打包 esm-browser 格式时使用 terser 会报错 ...
    // if (['global', 'cjs', 'esm-browser'].includes(formatName)) {
    if (['global', 'cjs'].includes(formatName)) {
      // 压缩代码
      packageConfig.push(generateMinifiedConfig(formatName))
    } else
    if (formatName !== 'esm-bundler') {
      // 额外生成生产配置的产物
      packageConfig.push(generateProductionConfig(formatName))
    }
  })

  return packageConfig
}

export default initConfig()
