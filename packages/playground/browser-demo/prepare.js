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
    src: path.resolve(rootDir, '../../core/dist/worker/hash.worker.mjs'),
    dest: path.resolve(rootDir, './worker/hash.worker.mjs'),
  },
]

// 执行文件复制
copyFiles(filesToCopy)
