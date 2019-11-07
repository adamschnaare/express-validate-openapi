import Enjoi from 'enjoi'
import { inspect } from 'util'
import { getSchemas, formatErrorMessages } from './util'

export const parseSchema = ({ schema }) => {
  const baseSchema = {
    type: 'object',
  }

  // if (schema.discriminator) delete schema.discriminator
  if (schema.$ref) {
    schema.$ref = schema.$ref.replace('#/components/schemas/', '')
    return schema
  }
  if (schema.allOf) {
    const parsedSchemas = []
    schema.allOf.forEach((item, index, arr) => {
      if (!item.description && !item.readOnly) {
        parsedSchemas.push(parseSchema({ schema: item }))
      }
    })
    schema.allOf = [...parsedSchemas]
  }
  if (schema.oneOf) {
    schema.oneOf.forEach((item, index, arr) => {
      schema.oneOf[index] = parseSchema({
        schema: item,
      })
    })
  }
  if (schema.items) {
    // Note: may be fragile, but fulfills requirement for current openapi spec
    schema.items = parseSchema({
      schema: schema.items,
    })
  }
  if (schema.properties) {
    Object.keys(schema.properties).forEach(prop => {
      schema.properties[prop] = parseSchema({
        schema: schema.properties[prop],
      })
    })
  }
  return { ...baseSchema, ...schema }
}

export const convert = parsedSchemas => {
  const enjoi = Enjoi.defaults({ subSchemas: parsedSchemas })
  const joiSchemas = {}

  Object.keys(parsedSchemas).forEach(item => {
    try {
      joiSchemas[item] = enjoi.schema(parsedSchemas[item])
    } catch (error) {
      console.error(error)
    }
  })
  return joiSchemas
}

export const parse = filePath => {
  const docSchemas = getSchemas(filePath)
  const parsedSchemas = {}

  Object.keys(docSchemas).forEach(name => {
    parsedSchemas[name] = parseSchema({
      schema: docSchemas[name],
    })
  })

  return convert(parsedSchemas)
}
