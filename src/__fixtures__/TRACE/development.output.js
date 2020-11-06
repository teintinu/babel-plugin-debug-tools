"use strict";

var _DEBUGGER = require("./DEBUGGER");

// Dont use RESET, TRACE or HISTORY in production mode
function sum(a, b) {
  _DEBUGGER.H5.TRACE("sum", ["a", a], ["b", b]);

  return a + b;
}

function main() {
  _DEBUGGER.H5.RESET();

  const c = sum(1, 2);

  _DEBUGGER.H5.CHECK(/sum a=1 b=2/);

  console.log(c);
  console.log(_DEBUGGER.H5.HISTORY());
}