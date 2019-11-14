"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function () {
    return _parser.parse;
  }
});
Object.defineProperty(exports, "formatErrorMessages", {
  enumerable: true,
  get: function () {
    return _util.formatErrorMessages;
  }
});
exports.OpenApiValidator = exports.respond = void 0;

var _joi = _interopRequireDefault(require("@hapi/joi"));

var _parser = require("./lib/parser");

var _util = require("./lib/util");

var _util2 = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const respond = ({
  errors,
  logger
}) => {
  const formattedErrors = errors.map(error => {
    const errorMessageArray = (0, _util.formatErrorMessages)(error);
    return {
      error: {
        messages: errorMessageArray
      }
    };
  });

  if (logger) {
    logger('VALIDATION_ERROR', {
      _Data: formattedErrors
    });
  }

  return formattedErrors;
};

exports.respond = respond;

class OpenApiValidator {
  constructor({
    doc,
    logger
  }) {
    this.doc = doc;
    this.logger = logger;
  }

  validate(key) {
    return (req, res, next) => {
      const schemas = (0, _parser.parse)(this.doc);
      const selectors = (0, _util2.isArray)(key) ? key : [key];
      const errors = [];
      if (!req.body) return res.status(400).send('req.body must be valid JSON');
      selectors.forEach(item => {
        if (!req.body[item]) return res.status(400).send(`payload missing: ${item}`);

        const {
          error
        } = _joi.default.validate(req.body[item], schemas[item]);

        if (error) errors.push(error);
      });

      if (errors.length) {
        const formattedErrors = respond({
          errors,
          logger: this.logger
        });
        return res.status(400).send(formattedErrors);
      }

      next();
    };
  }

} // TODO Figure out how to leverage the 'RequestBodies' portion of the OpenAPI spec


exports.OpenApiValidator = OpenApiValidator;