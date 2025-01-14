const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {
  // 获取请求的文件路径
  let filePath = '.' + req.url
  if (filePath === './') {
    filePath = './index.html'
  }

  // 获取文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase()
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.json': 'application/json',
  }

  const contentType = mimeTypes[extname] || 'application/octet-stream'

  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 如果文件不存在，返回 404 页面
        fs.readFile('./404.html', (error404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' })
          res.end(content404, 'utf-8')
        })
      } else {
        // 其他错误，返回 500 页面
        res.writeHead(500)
        res.end(`Server Error: ${error.code}`)
      }
    } else {
      // 成功读取文件，返回内容
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf-8')
    }
  })
})

const PORT = process.env.PORT || 8891
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
})
