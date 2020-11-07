import { H5 } from './DEBUGGER'

function sum(a, b) {
  H5.ASSERT(typeof a === 'number', a > 0)
  H5.ASSERT(typeof b === 'number', 0 < b)
  H5.ASSERT(!(a - b))
  H5.ASSERT({ 'cant be equals': !(a - b) }) // named assertion
  H5.ASSERT({
    'cant be equals'() {
      return !(a - b)
    }
  }) // named assetion with code
  H5.assertString(typeof a) // customMethod, see definition in DEBUGGER.js
  return a + b
}