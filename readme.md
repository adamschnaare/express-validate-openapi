# Express Validate OpenAPI

> Express middleware and functions to validate payloads against an OpenAPI spec using Joi validation models

# Installation

```
npm i adamschnaare/express-validate-openapi
```

# Usage

Import the middleware

```
import {validate} from 'express-validate-openapi'
```

Implement the middleware on endpoints, giving it necessary options

```
const specPath = path.join(__dirname, '../mocks/openapi.json')
const selector = 'selector'

const app = express()
app.get('/', validate({ specPath, selector }), function(req, res) {
  ...
  res.send()
})

```

The `body` of the post request must be valid JSON.

# Options

1. `specPath` - string, absolute path to a OpenAPI formatted json file
2. `selector` - string or array of strings, schema key(s) to use to validate the payload against. NOTE: payload must include these key:schema pairs
3. `logger` - callback function that receives an object with `{_Data: errorMessages}` for logging purposes

# TODO

- TODO: Make mocked data much less like MODO stuff, so I can share it, then force update git to remove history of that stuff

# Gotchas

- At present I need to manipulate the `openapi.json` spec file to ensure that there are no recursively referencing `$ref`s in the schemas. For example: `payment_response > additional_payments_responses`. At present, I'm just redefining the array to require any object as a type: `"type": "object"`
