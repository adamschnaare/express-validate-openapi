"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatErrorMessages = void 0;

var _fs = require("fs");

const formatErrorMessages = error => {
  if (!error.details) return null;
  return error.details.map(item => {
    var paths = item.path.join('/');
    return `${paths}: ${item.message}`;
  });
};

exports.formatErrorMessages = formatErrorMessages;