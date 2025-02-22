const fs = require('fs')
const path = require('path')

/**
 * 复制文件的函数
 * @param {string} src - 源文件路径
 * @param {string} dest - 目标文件路径
 */
function copyFile(src, dest) {
  // 如果目标文件已存在，则先删除
  if (fs.existsSync(dest)) {
    try {
      fs.unlinkSync(dest)
      console.log(`Deleted existing file at ${dest}`)
    } catch (err) {
      console.error(`Error deleting file at ${dest}:`, err)
      return
    }
  }

  const readStream = fs.createReadStream(src)
  const writeStream = fs.createWriteStream(dest)

  readStream.on('error', (err) => {
    console.error(`Error reading file from ${src}:`, err)
  })

  writeStream.on('error', (err) => {
    console.error(`Error writing file to ${dest}:`, err)
  })

  writeStream.on('finish', () => {
    console.log(`Successfully copied ${src} to ${dest}`)
  })

  readStream.pipe(writeStream)
}

/**
 * 复制多个文件的函数
 * @param {Array<{src: string, dest: string}>} files - 包含源文件和目标文件路径的对象数组
 */
function copyFiles(files) {
  files.forEach(({ src, dest }) => {
    // 确保目标目录存在
    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    copyFile(src, dest)
  })
}

// 使用 module.exports 导出 copyFiles 函数
module.exports = { copyFiles }
