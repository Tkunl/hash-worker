import * as rand from './rand'
import * as arr from './arrayUtils'
import * as miniSubject from './miniSubject'
import * as fileUtils from './fileUtils'
import * as is from './is'

/**
 * 兼容 import utils from './utils'; utils.someFn() 写法
 */
export default {
  ...rand,
  ...arr,
  ...miniSubject,
  ...fileUtils,
  ...is,
}

/**
 * 兼容 import { someFunctionFromRand } from './utils' 写法
 */
export * from './rand'
export * from './arrayUtils'
export * from './miniSubject'
export * from './fileUtils'
export * from './is'
