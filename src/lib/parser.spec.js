import { parse, parseSchema, convert } from './parser'
import { readFileSync } from 'fs'
import { inspect } from 'util'
import path from 'path'

describe('parser', () => {
  const specPath = path.join(__dirname, '../../mocks/openapi.json')
  const doc = JSON.parse(readFileSync(specPath, 'utf8'))
  const spec = doc.components.schemas

  describe('parse', () => {
    test('should return an object of Joi schemas', () => {
      const schemas = parse(doc)
      const name = 'schema_01'

      expect(schemas[name].isJoi).toBe(true)
      expect(schemas[name]._type).toBe('object')
      expect(schemas[name]._inner.children.length).toBe(3)
      expect(Object.keys(schemas).length).toEqual(Object.keys(spec).length)
    })
  })
  describe('convert', () => {
    test('should console an error if enjoi is given an invalid schema', () => {
      // setup
      const errorMethod = console.error
      console.error = jest.fn()

      const parsedSchemas = {
        schema_one: {
          type: 'bad_type',
        },
      }
      const converted = convert(parsedSchemas)

      expect(console.error).toHaveBeenCalled()

      // cleanup
      console.error = errorMethod
    })
  })
  describe('parseSchema', () => {
    test('should remove all swagger-style references', () => {
      const prefix = '#/components/schemas/'
      const schema = {
        $ref: `${prefix}test`,
      }
      const parsed = parseSchema({ schema })

      expect(parsed.$ref.includes(prefix)).toBe(false)
      expect(parsed.$ref).toBe('test')
    })
    test('should remove all description and readOnly objects from `allOf` arrays', () => {
      const schema = {
        allOf: [
          { description: 'some description' },
          { readOnly: true },
          { anotherProp: true },
        ],
      }
      const parsed = parseSchema({ schema })
      const hasDescription = parsed.allOf.find(item => item.description)
      const hasReadOnly = parsed.allOf.find(item => item.readOnly)

      expect(hasDescription).toBe(undefined)
      expect(hasReadOnly).toBe(undefined)
    })
  })
})
