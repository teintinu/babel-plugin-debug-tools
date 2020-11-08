"use strict";

var _DEBUGGER = require("./DEBUGGER");

function someFunction(a, b, c) {
  var _dbg, _dbg2, _dbg3, _dbg4, _dbg5, _dbg6, _dbg7, _dbg8, _dbg9, _dbg10, _dbg11, _dbg12, _dbg13, _dbg14, _dbg15, _dbg16, _dbg17, _dbg18, _dbg19, _dbg20, _dbg21, _dbg22, _dbg23, _dbg24, _dbg25, _dbg26, _dbg27, _dbg28, _dbg29, _dbg30, _dbg31, _dbg32;

  _dbg = a !== 0;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 4,
    column: 2
  }, ["a !== 0", _dbg, {
    "a": a,
    "a !== 0": _dbg
  }]); // simple assertion


  _dbg2 = typeof a;
  _dbg3 = _dbg2 === 'number';
  _dbg4 = a !== 0;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 5,
    column: 2
  }, ["typeof a === 'number'", _dbg3, {
    "a": a,
    "typeof a": _dbg2,
    "typeof a === 'number'": _dbg3
  }], ["a !== 0", _dbg4, {
    "a": a,
    "a !== 0": _dbg4
  }]); // multiple assertions on line


  _dbg5 = a - b;
  _dbg6 = !_dbg5;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 6,
    column: 2
  }, ["!(a - b)", _dbg6, {
    "a": a,
    "b": b,
    "a - b": _dbg5,
    "!(a - b)": _dbg6
  }]); // complex expressions


  _dbg7 = a - b;
  _dbg8 = !_dbg7;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 7,
    column: 2
  }, ["!(a - b)", _dbg8, {
    "a": a,
    "b": b,
    "a - b": _dbg7,
    "!(a - b)": _dbg8
  }]); // named assertion


  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 8,
    column: 2
  }, ['"a" must be diferent of "b"', function () {
    return !(a - b);
  }(), {}]); // named assetion with code


  _dbg9 = a !== 0;
  _dbg10 = typeof a;
  _dbg11 = _dbg10 === 'string';
  _dbg12 = a - b;
  _dbg13 = !_dbg12;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 13,
    column: 2
  }, ["a !== 0", _dbg9, {
    "a": a,
    "a !== 0": _dbg9
  }], ["typeof a === 'string'", _dbg11, {
    "a": a,
    "typeof a": _dbg10,
    "typeof a === 'string'": _dbg11
  }], ["!(a - b)", _dbg13, {
    "a": a,
    "b": b,
    "a - b": _dbg12,
    "!(a - b)": _dbg13
  }], ["isNotZero", function () {
    return a !== 0;
  }(), {}], ['isNotZero' + a, function () {
    return a !== 0;
  }(), {}]); // multiple named assertions


  _dbg14 = isNotZero(a);

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 24,
    column: 2
  }, ["isNotZero(a)", _dbg14, {
    "a": a
  }]); // 


  _dbg15 = a !== 0;
  _dbg16 = b * b;
  _dbg17 = 4 * a;
  _dbg18 = _dbg17 * c;
  _dbg19 = _dbg16 - _dbg18;
  _dbg20 = _dbg19 >= 0;
  _dbg21 = _dbg15 && _dbg20;
  _dbg22 = -b;
  _dbg23 = b * b;
  _dbg24 = 4 * a;
  _dbg25 = _dbg24 * c;
  _dbg26 = _dbg23 - _dbg25;
  _dbg27 = Math.sqrt(b * b - 4 * a * c);
  _dbg28 = _dbg22 + _dbg27;
  _dbg29 = 4 * a;
  _dbg30 = _dbg29 * c;
  _dbg31 = _dbg28 / _dbg30;
  _dbg32 = _dbg21 ? _dbg31 : null;

  _DEBUGGER.H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 25,
    column: 2
  }, ["a !== 0 && b * b - 4 * a * c >= 0 ? (-b + Math.sqrt(b * b - 4 * a * c)) / (4 * a * c) : null", _dbg32, {
    "a": a,
    "a !== 0": _dbg15,
    "b": b,
    "b * b": _dbg23,
    "4 * a": _dbg29,
    "c": c,
    "4 * a * c": _dbg30,
    "b * b - 4 * a * c": _dbg26,
    "b * b - 4 * a * c >= 0": _dbg20,
    "a !== 0 && b * b - 4 * a * c >= 0": _dbg21,
    "-b": _dbg22,
    "-b + Math.sqrt(b * b - 4 * a * c)": _dbg28,
    "(-b + Math.sqrt(b * b - 4 * a * c)) / (4 * a * c)": _dbg31,
    "a !== 0 && b * b - 4 * a * c >= 0 ? (-b + Math.sqrt(b * b - 4 * a * c)) / (4 * a * c) : null": _dbg32
  }]);

  _DEBUGGER.H5.assertString({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 30,
    column: 2
  }, ["typeof a"], [typeof a]); // customMethod, see definition in DEBUGGER.js


  return a + b;
}