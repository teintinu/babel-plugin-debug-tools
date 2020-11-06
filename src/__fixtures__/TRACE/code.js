import H5 from './DEBUGGER'

function sum(a, b) {
  H5.TRACE("sum", a, b)
  return a + b
}

function main() {
  H5.TRACE()
  const c = sum(1, 2)
  H5.CHECK(/sum a=1 b=2/)
  console.log(c)
}
