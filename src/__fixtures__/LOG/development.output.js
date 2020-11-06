"use strict";

function sum(a, b) {
  H5 && H5.LOG({
    filename: undefined,
    line: 2,
    column: 2
  }, "sum", "typeof a === 'number'=" + (typeof a === 'number'), "a > 0=" + (a > 0));
  H5 && H5.LOG({
    filename: undefined,
    line: 3,
    column: 2
  }, "sum", "typeof b === 'number'=" + (typeof b === 'number'), "b > 0=" + (b > 0));
  return a + b;
}