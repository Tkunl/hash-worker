const path = require('path')
const { copyFiles } = require('./fileCopier')

// 获取项目的根目录路径
const rootDir = process.cwd()

// 定义要复制的文件列表
const filesToCopy = [
  {
    src: path.resolve(rootDir, 'README.md'),
    dest: path.resolve(rootDir, 'packages/core/README.md'),
  },
  {
    src: path.resolve(rootDir, 'README-zh.md'),
    dest: path.resolve(rootDir, 'packages/core/README-zh.md'),
  },
]

// 执行文件复制
copyFiles(filesToCopy)
