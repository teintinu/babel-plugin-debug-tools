"use strict";

var _bhaskara = require("./bhaskara");

var _debug = require("./debug");

test('x² + 8x - 9 = 0', () => {
  var _left, _right, _left2, _right2, _left3, _right3;

  _debug.BHASKARA.RESET();

  _left = typeof _bhaskara.quadraticEquation;
  _right = 'function';

  _debug.BHASKARA.ASSERT({
    filename: "/sampleProject/src/bhaskara.test.js",
    line: 6,
    column: 2
  }, ["typeof quadraticEquation === 'function'", _left === _right, {
    "typeof quadraticEquation": _left
  }]);

  const {
    x1,
    x2
  } = (0, _bhaskara.quadraticEquation)(1, 8, -9);
  _left2 = x1;
  _right2 = 1;
  _left3 = x2;
  _right3 = -9;

  _debug.BHASKARA.ASSERT({
    filename: "/sampleProject/src/bhaskara.test.js",
    line: 8,
    column: 2
  }, /delta: 100/, ["x1 === 1", _left2 === _right2, {
    "x1": _left2
  }], ["x2 === -9", _left3 === _right3, {
    "x2": _left3,
    "-9": _right3
  }]);

  expect(_debug.BHASKARA.HISTORY()).toEqual('a: 1 b: 8 c: -9 delta: 100\nx1: 1 x2: -9');
});