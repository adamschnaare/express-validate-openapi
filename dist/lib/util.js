"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatErrorMessages = exports.getSchemas = void 0;

var _fs = require("fs");

const getSchemas = filePath => {
  const doc = JSON.parse((0, _fs.readFileSync)(filePath, 'utf8'));
  return doc.components.schemas;
};

exports.getSchemas = getSchemas;

const formatErrorMessages = error => {
  if (!error.details) return null;
  return error.details.map(item => {
    var paths = item.path.join('/');
    return `${paths}: ${item.message}`;
  });
};

exports.formatErrorMessages = formatErrorMessages;