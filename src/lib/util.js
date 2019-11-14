import { readFileSync } from 'fs'

export const formatErrorMessages = error => {
  if (!error.details) return null
  return error.details.map(item => {
    var paths = item.path.join('/')
    return `${paths}: ${item.message}`
  })
}
