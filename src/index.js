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
import { formatErrorMessages } from './lib/util'
import { isArray } from 'util'

export const validate = ({ specPath, selector, logger }) => (req, res, next) => {
  const schemas = parse(specPath)
  const selectors = isArray(selector) ? selector : [selector]
  const errors = []

  if (!req.body) return res.status(400).send('req.body must be valid JSON')

  selectors.forEach(item => {
    if (!req.body[item]) return res.status(400).send(`payload missing: ${item}`)

    const { error } = Joi.validate(req.body[item], schemas[item])

    if (error) errors.push(error)
  })

  if (errors.length) {
    const formattedErrors = errors.map(error => {
      const errorMessageArray = formatErrorMessages(error)
      return { error: { messages: errorMessageArray } }
    })

    if (logger) {
      logger('VALIDATION_ERROR', {
        _Data: formattedErrors,
      })
    }

    return res.status(400).send(formattedErrors)
  }

  next()
}
