import { getSchemas, formatErrorMessages } from './util'
import path from 'path'

describe('util', () => {
  describe('getSchemas', () => {
    test('should return a js object from a path of `components.schemas`', () => {
      const specPath = path.join(__dirname, '../../mocks/getSchemas.json')
      const schemas = getSchemas(specPath)

      expect(typeof schemas).toBe('object')
      expect(Object.keys(schemas).length).toBe(3)
    })
  })

  describe('formatErrorMessages', () => {
    test('should return an array of formatted error messages', () => {
      const error = {
        details: [
          { path: ['one', 'two', 'three'], message: 'message one' },
          { path: ['a', 'b', 'c'], message: 'message two' },
          { path: ['x', 'y', 'z'], message: 'message three' },
        ],
      }
      const messages = formatErrorMessages(error)

      expect(messages.length).toBe(3)
      expect(messages[0]).toBe('one/two/three: message one')
    })

    test('should return null if not given an object with details', () => {
      const error = {}
      const messages = formatErrorMessages(error)

      expect(messages).toBe(null)
    })
  })
})
