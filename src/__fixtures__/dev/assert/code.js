function sum(a, b) {
  H5.ASSERT("sum", typeof a === 'number', a > 0)
  H5.ASSERT("sum", typeof b === 'number', b > 0)
  return a + b
}