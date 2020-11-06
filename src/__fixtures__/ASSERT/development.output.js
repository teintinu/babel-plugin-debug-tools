"use strict";

function sum(a, b) {
  H5 && H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 2,
    column: 2
  }, ["typeof a === 'number'", typeof a === 'number'], ["a > 0", a > 0]);
  H5 && H5.ASSERT({
    filename: "/src/__fixtures__/ASSERT/code.js",
    line: 3,
    column: 2
  }, ["typeof b === 'number'", typeof b === 'number'], ["b > 0", b > 0]);
  return a + b;
}