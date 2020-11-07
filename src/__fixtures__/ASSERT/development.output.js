"use strict";

var _DEBUGGER = require("./DEBUGGER");

function sum(a, b) {
  var _left, _right, _left2, _right2, _left3, _right3, _left4, _right4;

  _left = typeof a;
  _right = 'number';
  _left2 = a;
  _right2 = 0;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 4,
    column: 2
  }, ["typeof a === 'number'", _left === _right, {
    "typeof a": _left
  }], ["a > 0", _left2 > _right2, {
    "a": _left2
  }]);

  _left3 = typeof b;
  _right3 = 'number';
  _left4 = 0;
  _right4 = b;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 5,
    column: 2
  }, ["typeof b === 'number'", _left3 === _right3, {
    "typeof b": _left3
  }], ["0 < b", _left4 < _right4, {
    "b": _right4
  }]);

  _arg = a - b;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 6,
    column: 2
  }, ["!(a - b)", !_arg, {
    "a - b": _arg
  }]);

  _DEBUGGER.H5.assertString({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 7,
    column: 2
  }, ["typeof a"], [typeof a]);

  return a + b;
}