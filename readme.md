# Express Validate OpenAPI

[Express](https://expressjs.com/) middleware to validate payloads against an [OpenAPI 3.0 spec](https://swagger.io/docs/specification/about/)

Uses [Enjoi](https://github.com/tlivings/enjoi) and [Joi](https://github.com/hapijs/joi) to validate models and generate error messaging.

# Installation

```
npm i express-validate-openapi
```

# Example

Middleware setup

```js
import express from 'express'
import path from 'path'
import { readFileSync } from 'fs'
import bodyParser from 'body-parser'
import { OpenApiValidator } from 'express-validate-openapi'

// Get Parsed JSON doc
const specPath = path.join(__dirname, '../mocks/openapi.json')
const doc = JSON.parse(readFileSync(specPath, 'utf-8'))
// optional
const logger = (error, data) => console.log(error, data)
// create instance
const validator = new OpenApiValidator({ doc, logger })

const app = express()
app.use(bodyParser.json()) // body must be JSON
```

## Single Schema

To validate a single schema in the request body:

```js
app.post('/', validator.validate('schema_05'), function(req, res) {
  res.send()
})

// valid request body...
{
  "schema_05": {
    "unit": "pixel",
    "width": 640,
    "height": 480,
  }
}
```

The `body` of the post request must be valid JSON.

## Multiple schemas

If you have multiple properties in your payload object, include those keys in an array in your `keys`

```js
const keys = ['someSchemaKey', 'anotherKey']

app.post('/', validator.validate(keys), function(req, res) {
  res.send()
})

// valid request body...
{
  "someSchemaKey": {
    "prop1": "something",
    "prop2": "something else",
  },
  "anotherKey": "some string or data"
}
```

# Options

## doc - `object`

Parsed JSON object

```js
// example using path and fs modules to retrieve doc
const specPath = path.join(__dirname, '../mocks/openapi.json')
const doc = JSON.parse(readFileSync(specPath, 'utf-8'))
```

## logger - `function(error,data)`

Callback function that receives two arguments:

1. Error message string (`VALIDATION_ERROR`)
2. Object with `{_Data: errorMessages}` for logging purposes

# Methods

## validate(key,keyInBody)

Express middleware to validate

**key** - `string` or `[string, string]` Schema key(s) to use to validate the payload against. Payload must include these `key:schema` pairs

**keyInBody (optional)** - `string` Key to use in the request body payload. The payload will be transformed to use the `key` parameter's value instead. **Note:** only supported when `key` is a single string value

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
