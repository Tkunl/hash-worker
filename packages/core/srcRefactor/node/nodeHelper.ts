import fs from 'fs'
import { BaseHelper } from '../shared'
import { HashChksParam } from '../types'

export async function normalizeNodeParam(param: HashChksParam) {
  if (!param.filePath) {
    throw new Error('The filePath attribute is required in node environment')
  }

  try {
    const stats = fs.statSync(param.filePath)
    if (!stats.isFile()) {
      throw new Error('Invalid filePath: Path does not point to a file')
    }
  } catch (err) {
    const error = err as NodeJS.ErrnoException
    if (error.code === 'ENOENT') {
      throw new Error('Invalid filePath: File does not exist')
    }
    throw err
  }

  return {
    ...param,
    config: BaseHelper.mergeConfig(param.config),
    filePath: param.filePath,
  }
}
