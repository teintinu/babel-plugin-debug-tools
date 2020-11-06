import { H5 } from './DEBUGGER'

// Dont use RESET, TRACE or HISTORY in production mode

function sum(a, b) {
  H5.TRACE("sum", a, b)
  return a + b
}

function main() {
  H5.RESET()
  const c = sum(1, 2)
  H5.CHECK(/sum a=1 b=2/)
  console.log(c)
  console.log(H5.HISTORY())
}
