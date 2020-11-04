function sum(a, b) {
  (function () {
    LOG("sum", {
      "typeof a === 'number'": [typeof a, '===', 'number'].join(''),
      "a > 0'": [a, '>', 0].join(''),
    })
  })();
  return a + b
}