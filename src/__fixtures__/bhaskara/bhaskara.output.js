"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quadraticEquation = quadraticEquation;

var _debug = require("./debug");

function quadraticEquation(a, b, c) {
  _debug.BHASKARA.ASSERT({
    filename: "/sampleProject/src/bhaskara.js",
    line: 4,
    column: 2
  }, ["a !== 0", a !== 0, {
    "a": a
  }]);

  const delta = b * b - 4 * a * c; // b² – 4ac

  _debug.BHASKARA.TRACE(["a", a], ["b", b], ["c", c], ["delta", delta]);

  if (delta < 0) return null;
  const x1 = (-b + Math.sqrt(delta)) / (2 * a);
  const x2 = (-b - Math.sqrt(delta)) / (2 * a);

  _debug.BHASKARA.TRACE(["x1", x1], ["x2", x2]);

  return {
    x1,
    x2
  };
}