import { H5 } from './DEBUGGER'

function someFunction(a, b, c) {
  H5.ASSERT(a !== 0) // simple assertion
  H5.ASSERT(typeof a === 'number', a !== 0) // multiple assertions on line
  H5.ASSERT(!(a - b)) // complex expressions
  H5.ASSERT({ 'cant be equals': !(a - b) }) // named assertion
  H5.ASSERT({
    '"a" must be diferent of "b"'() {
      return !(a - b)
    }
  }) // named assetion with code
  H5.ASSERT({
    '"a" cant be zero': a !== 0,
    '"a" must be string': typeof a === 'string',
    '"a" must be diferent of "b"': !(a - b),
    isNotZero() {
      return a !== 0
    },
    ['isNotZero' + a]() {
      return a !== 0
    }
  }) // multiple named assertions
  H5.ASSERT(isNotZero(a)) // 
  H5.ASSERT(
    a !== 0 && (b * b - 4 * a * c >= 0) ?
      (-b + Math.sqrt(b * b - 4 * a * c)) / (4 * a * c)
      : null
  )
  H5.assertString(typeof a) // customMethod, see definition in DEBUGGER.js
  return a + b
}