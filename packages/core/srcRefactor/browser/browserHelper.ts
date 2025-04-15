import { BaseHelper } from '../shared'
import { HashChksParam } from '../types'

export function normalizeBrowserParam(param: HashChksParam) {
  if (!param.file) {
    throw new Error('The file attribute is required in browser environment')
  }

  return {
    ...param,
    config: BaseHelper.mergeConfig(param.config),
    file: param.file,
  }
}
