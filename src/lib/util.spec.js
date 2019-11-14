import { getSchemas, formatErrorMessages } from './util'
import path from 'path'

describe('util', () => {
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
