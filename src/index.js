/** Needs
 * yaml file to use for validation
 * selector to use in the validation file to identify the model
 * some validator method?? Might not need
 * optionally receives a logger object/method
 *
 * returns:
 * if errors out, responds negatively
 * - responds with messages from JOI
 * - if logger exists, use it to log an error (should it be always logged?)
 *
 * else, moves on with next()
 *
 *
 * extra: logger object???
 *  */
import Joi from '@hapi/joi'
import { parse } from './lib/parser'
import { formatErrorMessages as format } from './lib/util'
import { isArray } from 'util'

export { parse } from './lib/parser'
export { formatErrorMessages } from './lib/util'

export const respond = ({ errors, logger }) => {
  const formattedErrors = errors.map(error => {
    const errorMessageArray = format(error)
    return { error: { messages: errorMessageArray } }
  })

  if (logger) {
    logger('VALIDATION_ERROR', {
      _Data: formattedErrors,
    })
  }

  return formattedErrors
}

export class OpenApiValidator {
  constructor({ doc, logger }) {
    this.doc = doc
    this.logger = logger
  }

  validate(key) {
    return (req, res, next) => {
      const schemas = parse(this.doc)
      const selectors = isArray(key) ? key : [key]
      const errors = []

      if (!req.body) return res.status(400).send('req.body must be valid JSON')

      selectors.forEach(item => {
        if (!req.body[item]) return res.status(400).send(`payload missing: ${item}`)

        const { error } = Joi.validate(req.body[item], schemas[item])

        if (error) errors.push(error)
      })

      if (errors.length) {
        const formattedErrors = respond({ errors, logger: this.logger })

        return res.status(400).send(formattedErrors)
      }

      next()
    }
  }
}
// TODO Figure out how to leverage the 'RequestBodies' portion of the OpenAPI spec
