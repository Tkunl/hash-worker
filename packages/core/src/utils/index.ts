import * as rand from './rand'
import * as arr from './array-utils'
import * as miniSubject from './mini-subject'
import * as fileUtils from './file-utils'

/**
 * 兼容 import utils from './utils'; utils.someFn() 写法
 */
export default {
  ...rand,
  ...arr,
  ...miniSubject,
  ...fileUtils,
}

/**
 * 兼容 import { someFunctionFromRand } from './utils' 写法
 */
export * from './rand'
export * from './array-utils'
export * from './mini-subject'
export * from './file-utils'
