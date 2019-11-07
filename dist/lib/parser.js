"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = exports.convert = exports.parseSchema = void 0;

var _enjoi = _interopRequireDefault(require("enjoi"));

var _util = require("util");

var _util2 = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parseSchema = ({
  schema
}) => {
  const baseSchema = {
    type: 'object'
  }; // if (schema.discriminator) delete schema.discriminator

  if (schema.$ref) {
    schema.$ref = schema.$ref.replace('#/components/schemas/', '');
    return schema;
  }

  if (schema.allOf) {
    const parsedSchemas = [];
    schema.allOf.forEach((item, index, arr) => {
      if (!item.description && !item.readOnly) {
        parsedSchemas.push(parseSchema({
          schema: item
        }));
      }
    });
    schema.allOf = [...parsedSchemas];
  }

  if (schema.oneOf) {
    schema.oneOf.forEach((item, index, arr) => {
      schema.oneOf[index] = parseSchema({
        schema: item
      });
    });
  }

  if (schema.items) {
    // Note: may be fragile, but fulfills requirement for current openapi spec
    schema.items = parseSchema({
      schema: schema.items
    });
  }

  if (schema.properties) {
    Object.keys(schema.properties).forEach(prop => {
      schema.properties[prop] = parseSchema({
        schema: schema.properties[prop]
      });
    });
  }

  return { ...baseSchema,
    ...schema
  };
};

exports.parseSchema = parseSchema;

const convert = parsedSchemas => {
  const enjoi = _enjoi.default.defaults({
    subSchemas: parsedSchemas
  });

  const joiSchemas = {};
  Object.keys(parsedSchemas).forEach(item => {
    try {
      joiSchemas[item] = enjoi.schema(parsedSchemas[item]);
    } catch (error) {
      console.error(error);
    }
  });
  return joiSchemas;
};

exports.convert = convert;

const parse = filePath => {
  const docSchemas = (0, _util2.getSchemas)(filePath);
  const parsedSchemas = {};
  Object.keys(docSchemas).forEach(name => {
    parsedSchemas[name] = parseSchema({
      schema: docSchemas[name]
    });
  });
  return convert(parsedSchemas);
};

exports.parse = parse;