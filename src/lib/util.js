import { readFileSync } from 'fs'

export const getSchemas = filePath => {
  const doc = JSON.parse(readFileSync(filePath, 'utf8'))
  return doc.components.schemas
}

export const formatErrorMessages = error => {
  if (!error.details) return null
  return error.details.map(item => {
    var paths = item.path.join('/')
    return `${paths}: ${item.message}`
  })
}
