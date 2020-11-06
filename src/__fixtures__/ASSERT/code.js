import { H5 } from './DEBUGGER'

function sum(a, b) {
  H5.ASSERT(typeof a === 'number', a > 0)
  H5.ASSERT(typeof b === 'number', b > 0)
  return a + b
}