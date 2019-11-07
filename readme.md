# Express Validate OpenAPI

[Express](https://expressjs.com/) middleware to validate payloads against an [OpenAPI 3.0 spec](https://swagger.io/docs/specification/about/)

Uses [Enjoi](https://github.com/tlivings/enjoi) and [Joi](https://github.com/hapijs/joi) to validate models and generate error messaging.

# Installation

```
npm i express-validate-openapi
```

# Usage

# Example

Middleware setup
```js
import express from 'express'
import path from 'path'
import { validate } from 'express-validate-openapi'
import bodyParser from 'body-parser'

const specPath = path.join(__dirname, '../mocks/openapi.json')
const selector = 'schema_05'
const logger = (error, data) => console.log(error, data) // optional

const app = express()
app.use(bodyParser.json()) // body must be JSON

// use on desired endpoints
app.post('/', validate({ specPath, selector, logger }), function(req, res) {
  res.send()
})
```

Example valid request body for above example
```js
schema_05: {
  unit: 'pixel',
  width: 640,
  height: 480,
},
```

The `body` of the post request must be valid JSON.

## Multiple selectors

If you have multiple properties in your payload object, include those keys in an array in your `selector`

```js
const selector = ['someSelector', 'anotherSelector']

app.post('/', validate({ specPath, selector, logger }), function(req, res) {
  res.send()
})

// request body...
{
  someSelector: {
    prop1: 'something',
    prop2: 'something else',
  },
  anotherSelector: 'some string or data',
}
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
