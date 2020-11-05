function sum(a, b) {
  ASSERT("sum", typeof a === 'number', a > 0)
  ASSERT("sum", typeof b === 'number', b > 0)
  return a + b
}