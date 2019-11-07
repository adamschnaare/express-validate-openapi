import express from 'express'
import request from 'supertest'
import path from 'path'
import { validate } from './index.js'
import bodyParser from 'body-parser'

const specPath = path.join(__dirname, '../mocks/openapi.json')

let app

describe('index', () => {
  beforeEach(() => {
    app = express()
  })

  test('should return 400 with a non-JSON body request', async () => {
    app.post('/', validate({ specPath, selector: 'string' }), function(req, res) {
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
        const selector = 'schema_04'
        app.post('/', validate({ specPath, selector }), function(req, res) {
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
        const selector = ['schema_04', 'schema_05']
        app.post('/', validate({ specPath, selector }), function(req, res) {
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
        const selector = 'schema_04'
        const logger = jest.fn()
        app.post('/', validate({ specPath, selector, logger }), function(req, res) {
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
    })
  })
})
