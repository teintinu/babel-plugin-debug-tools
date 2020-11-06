import { quadraticEquation } from './bhaskara'
import { BHASKARA } from './debug'

test.skip('x² + 8x - 9 = 0', () => {
  BHASKARA.RESET()
  const { x1, x2 } = quadraticEquation(1, 8, -9)
  BHASKARA.ASSERT(/delta=100/, x1 === 1, x2 === 2)
  expect(BHASKARA.HISTORY()).toEqual('x')
});
