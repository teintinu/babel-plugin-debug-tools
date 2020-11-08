"use strict";

var _bhaskara = require("./bhaskara");

var _debug = require("./debug");

test('x² + 8x - 9 = 0', () => {
  var _dbg, _dbg2, _dbg3, _dbg4, _dbg5;

  _debug.BHASKARA.RESET();

  _dbg = typeof _bhaskara.quadraticEquation;
  _dbg2 = _dbg === 'function';

  _debug.BHASKARA.ASSERT({
    filename: "/sampleProject/src/bhaskara.test.js",
    line: 6,
    column: 2
  }, ["typeof quadraticEquation === 'function'", _dbg2, {
    "quadraticEquation": _bhaskara.quadraticEquation,
    "typeof quadraticEquation": _dbg,
    "typeof quadraticEquation === 'function'": _dbg2
  }]);

  const {
    x1,
    x2
  } = (0, _bhaskara.quadraticEquation)(1, 8, -9);
  _dbg3 = x1 === 1;
  _dbg4 = -9;
  _dbg5 = x2 === _dbg4;

  _debug.BHASKARA.ASSERT({
    filename: "/sampleProject/src/bhaskara.test.js",
    line: 8,
    column: 2
  }, ["delta: 100", /delta: 100/, {}], ["x1 === 1", _dbg3, {
    "x1": x1,
    "x1 === 1": _dbg3
  }], ["x2 === -9", _dbg5, {
    "x2": x2,
    "-9": _dbg4,
    "x2 === -9": _dbg5
  }]);

  expect(_debug.BHASKARA.HISTORY()).toEqual('a: 1 b: 8 c: -9 delta: 100\nx1: 1 x2: -9');
});