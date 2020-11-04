function sum(a, b) {
  (function () {
    if (!(typeof a === 'number'))
      LOG("sum", "typeof a === 'number'", typeof a, '===', 'number')
    if (!(a > 0))
      LOG("sum", 'a > 0', a, '>', 0)
  })();
  (function () {
    if (!(typeof b === 'number'))
      LOG("sum", "typeof b === 'number'", typeof b, '===', 'number')
    if (!(b > 0))
      LOG("sum", 'b > 0', b, '>', 0)
  })();
  return a + b
}