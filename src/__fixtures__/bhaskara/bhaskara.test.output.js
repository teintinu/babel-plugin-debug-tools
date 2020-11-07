"use strict";

var _bhaskara = require("./bhaskara");

var _debug = require("./debug");

test('x² + 8x - 9 = 0', () => {
  _debug.BHASKARA.RESET();

  _debug.BHASKARA.ASSERT({
    filename: "/sampleProject/src/bhaskara.test.js",
    line: 6,
    column: 2
  }, ["typeof quadraticEquation === 'function'", typeof _bhaskara.quadraticEquation === 'function', {
    "typeof quadraticEquation": typeof quadraticEquation
  }]);

  const {
    x1,
    x2
  } = (0, _bhaskara.quadraticEquation)(1, 8, -9);

  _debug.BHASKARA.ASSERT({
    filename: "/sampleProject/src/bhaskara.test.js",
    line: 8,
    column: 2
  }, /delta: 100/, ["x1 === 1", x1 === 1, {
    "x1": x1
  }], ["x2 === -9", x2 === -9, {
    "x2": x2,
    "-9": -9
  }]);

  expect(_debug.BHASKARA.HISTORY()).toEqual('a: 1 b: 8 c: -9 delta: 100\nx1: 1 x2: -9');
});