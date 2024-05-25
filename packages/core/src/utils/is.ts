function isEmpty(value: any) {
  if (value === void 0 || value === null || value === '') {
    return true
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0
  }
  if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    return Object.keys(value).length === 0
  }
  return false
}

export { isEmpty }
