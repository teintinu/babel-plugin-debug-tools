"use strict";

var _DEBUGGER = require("./DEBUGGER");

function sum(a, b) {
  _DEBUGGER.H5.LOG({
    filename: "/src/__fixtures__/LOG/code.js",
    line: 4,
    column: 2
  }, "sum", ["typeof a === 'number'", typeof a === 'number'], ["a > 0", a > 0]);

  _DEBUGGER.H5.LOG({
    filename: "/src/__fixtures__/LOG/code.js",
    line: 5,
    column: 2
  }, "sum", ["typeof b === 'number'", typeof b === 'number'], ["b > 0", b > 0]);

  return a + b;
}