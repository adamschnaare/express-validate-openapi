import express from 'express'
import request from 'supertest'
import { readFileSync } from 'fs'
import path from 'path'
import { validate, OpenApiValidator } from './index.js'
import bodyParser from 'body-parser'

const specPath = path.join(__dirname, '../mocks/openapi.json')
const doc = JSON.parse(readFileSync(specPath, 'utf-8'))

let app
let validator
let logger

describe('index', () => {
  beforeEach(() => {
    app = express()
    logger = jest.fn()
    validator = new OpenApiValidator({ doc, logger })
  })

  test('should return 400 with a non-JSON body request', async () => {
    app.post('/', validator.validate('string'), function(req, res) {
      res.send()
    })
    const resp = await request(app).post('/')

    expect(resp.statusCode).toBe(400)
    expect(resp.text).toBe('req.body must be valid JSON')
  })

  describe('JSON body', () => {
    const timestamp = new Date().toJSON()
    beforeEach(() => {
      app.use(bodyParser.json())
    })

    describe('single selector', () => {
      beforeEach(() => {
        const key = 'schema_04'
        app.post('/', validator.validate(key), function(req, res) {
          res.send()
        })
      })

      test('should successfully validate a valid payload', async () => {
        const validPayload = {
          schema_04: { status: 'created', timestamp },
        }
        const resp = await request(app)
          .post('/')
          .send(validPayload)

        expect(resp.statusCode).toBe(200)
      })

      test('should return an error for an invalid payload', async () => {
        const inValidPayload = {
          order_status: { status: 'created', timestamp: 'somestring' },
        }
        const resp = await request(app)
          .post('/')
          .send(inValidPayload)

        expect(resp.statusCode).toBe(400)
      })
    })

    describe('multiple selectors', () => {
      beforeEach(() => {
        const keys = ['schema_04', 'schema_05']
        app.post('/', validator.validate(keys), function(req, res) {
          res.send()
        })
      })

      test('should return valid response for multiple selectors', async () => {
        const resp = await request(app)
          .post('/')
          .send({
            schema_04: { status: 'created', timestamp },
            schema_05: { unit: 'pixel', width: 640, height: 480 },
          })

        expect(resp.statusCode).toBe(200)
      })

      test('should return 400 for multiple selectors and invalid payloads', async () => {
        const resp = await request(app)
          .post('/')
          .send({
            schema_04: { status: 'created', timestamp: 'somestring' },
            schema_05: { unit: 'pixel', width: 640, height: 480 },
          })

        expect(resp.statusCode).toBe(400)
      })

      test('should return 400 for multiple selectors and missing payloads', async () => {
        const resp = await request(app)
          .post('/')
          .send({
            schema_04: { status: 'created', timestamp },
          })

        expect(resp.statusCode).toBe(400)
        expect(resp.text).toBe('payload missing: schema_05')
      })
    })

    describe('logger', () => {
      test('should call logger function if provided and has error', async () => {
        const key = 'schema_04'
        app.post('/', validator.validate(key), function(req, res) {
          res.send()
        })
        const resp = await request(app)
          .post('/')
          .send({
            schema_04: { status: 'created', timestamp: 'somestring' },
          })

        expect(resp.statusCode).toBe(400)
        expect(logger).toHaveBeenCalled()
      })
      test('should return formatted errors if no logger is given', async () => {
        const adjustedValidator = new OpenApiValidator({ doc })
        const key = 'schema_04'
        app.post('/', adjustedValidator.validate(key), function(req, res) {
          res.send()
        })

        const resp = await request(app)
          .post('/')
          .send({
            schema_04: { status: 'created', timestamp: 'somestring' },
          })
        const messages = JSON.parse(resp.text)[0].error.messages

        expect(resp.statusCode).toBe(400)
        expect(messages.length).toBe(1)
        expect(messages[0].includes('timestamp')).toBe(true)
        // expect(resp).toHaveBeenCalled()
      })
    })
  })
})
