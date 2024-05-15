import { md5 } from 'hash-wasm'

function main() {
  console.log('main.....')
  md5('abc').then((md5) => {
    console.log('md5', md5)
  })
}

export { main }
