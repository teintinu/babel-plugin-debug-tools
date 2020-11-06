import { BHASKARA } from './debug'

export function quadraticEquation(a, b, c) {
  BHASKARA.ASSERT(a !== 0)
  const delta = b * b - 4 * a * c; // b² – 4ac
  BHASKARA.TRACE(a, b, c, delta)
  if (delta < 0) return null
  const x1 = (-b + Math.sqrt(delta)) / (2 * a)
  const x2 = (-b - Math.sqrt(delta)) / (2 * a)
  BHASKARA.TRACE(x1, x2)
  return { x1, x2 }
}
