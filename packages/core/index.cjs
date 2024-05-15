'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./output/fastUpload.cjs.prod.js')
} else {
  module.exports = require('./output/fastUpload.cjs.js')
}
