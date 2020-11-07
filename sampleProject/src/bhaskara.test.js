import { quadraticEquation } from './bhaskara'
import { BHASKARA } from './debug'

test('x² + 8x - 9 = 0', () => {
  BHASKARA.RESET()
  BHASKARA.ASSERT(typeof quadraticEquation === 'function')
  const { x1, x2 } = quadraticEquation(1, 8, -9)
  BHASKARA.ASSERT(/delta: 100/, x1 === 1, x2 === -9)
  expect(BHASKARA.HISTORY()).toEqual('a: 1 b: 8 c: -9 delta: 100\nx1: 1 x2: -9')
});
