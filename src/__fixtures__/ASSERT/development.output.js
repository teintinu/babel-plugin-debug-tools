"use strict";

var _DEBUGGER = require("./DEBUGGER");

function sum(a, b) {
  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 4,
    column: 2
  }, ["typeof a === 'number'", typeof a === 'number', {
    "typeof a": typeof a
  }], ["a > 0", a > 0, {
    "a": a
  }]);

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 5,
    column: 2
  }, ["typeof b === 'number'", typeof b === 'number', {
    "typeof b": typeof b
  }], ["0 < b", 0 < b, {
    "b": b
  }]);

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 6,
    column: 2
  }, ["!(a - b)", !(a - b), {
    "a - b": a - b
  }]);

  return a + b;
}