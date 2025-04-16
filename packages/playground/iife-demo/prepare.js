const path = require('path')
const { copyFiles } = require('../../../scripts/fileCopier')

const rootDir = process.cwd()

// 定义要复制的文件列表
const filesToCopy = [
  {
    src: path.resolve(rootDir, '../../core/dist/global.js'),
    dest: path.resolve(rootDir, 'global.js'),
  },
  {
    src: path.resolve(rootDir, '../../core/dist/worker/browser.worker.mjs'),
    dest: path.resolve(rootDir, './worker/browser.worker.mjs'),
  },
]

// 执行文件复制
copyFiles(filesToCopy)
