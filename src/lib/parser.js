import Enjoi from 'enjoi'

export const parseSchema = ({ schema }) => {
  const baseSchema = {
    type: 'object',
  }

  if (schema.$ref) {
    const key = schema.$ref.replace('#/components/schemas/', '')
    schema.$ref = `${key}#`
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

export const parse = doc => {
  const schemas = doc.components.schemas // throw an error if not here?
  const parsedSchemas = {}

  Object.keys(schemas).forEach(name => {
    parsedSchemas[name] = parseSchema({
      schema: schemas[name],
    })
  })

  return convert(parsedSchemas)
}
