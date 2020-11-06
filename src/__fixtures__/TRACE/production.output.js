"use strict";

// Dont use RESET, TRACE or HISTORY in production mode
function sum(a, b) {
  return a + b;
}

function main() {
  const c = sum(1, 2);
  console.log(c);
  console.log(H5.HISTORY());
}