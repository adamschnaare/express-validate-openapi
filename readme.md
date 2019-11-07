# Express Validate OpenAPI

[Express](https://expressjs.com/) middleware to utilize an [OpenAPI 3.0 spec](https://swagger.io/docs/specification/about/) to validate JSON payloads

Uses [Enjoi](https://github.com/tlivings/enjoi) and [Joi](https://github.com/hapijs/joi) to validate models and generate error messaging.

# Installation

```
npm i adamschnaare/express-validate-openapi
```

# Usage

Import the middleware

```js
import { validate } from 'express-validate-openapi'
import bodyParser from 'body-parser' // or similar
```

Implement the middleware on endpoints, giving it necessary options. [See express documentation](https://expressjs.com/en/guide/using-middleware.html)

```js
const specPath = path.join(__dirname, '../mocks/openapi.json')
const selector = 'someSelector'
const logger = (error, data) => console.log(error, data) // optional

const app = express()
app.use(bodyParser.json()) // body must be JSON

// use on desired endpoints
app.post('/', validate({ specPath, selector, logger }), function(req, res) {
  res.send({
    someSelector: {
      prop1: 'something',
      prop2: 'something else',
    },
  })
})
```

The `body` of the post request must be valid JSON.

## Multiple selectors

If you have multiple properties in your payload object, include those keys in an array in your `selector`

```js
const selector = ['someSelector', 'anotherSelector']

app.post('/', validate({ specPath, selector, logger }), function(req, res) {
  res.send({
    someSelector: {
      prop1: 'something',
      prop2: 'something else',
    },
    anotherSelector: 'some string or data',
  })
})
```

# Options

## specPath - `string`

Absolute path to a OpenAPI formatted json file

Example:

```js
// using path module
path.join(__dirname, '../mocks/openapi.json')
```

## selector - `string` or `[string, string]`

Schema key(s) to use to validate the payload against. Payload must include these `key:schema` pairs

## logger - `function(error,data)`

Callback function that receives two arguments:

1. Error message string (`VALIDATION_ERROR`)
2. Object with `{_Data: errorMessages}` for logging purposes

# Known Issues

## Self-referencing `$refs`

Schemas that include `$refs` that refer to themselves will throw errors.

```json
// openapi.json > components > schemas
...
"schemaABC": {
  "type": "object",
  "properties": {
    "someProp": {
      "type": "string"
    },
    "anotherProp": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/schemaABC"
      }
    }
  }
}
...
```

One way to fix this is to manually modify `anotherProp`'s item, defining a standard Joi type instead, such as `object`:

```json
"anotherProp": {
  "type": "array",
  "items": {
    "type": "object"
  }
}
```
