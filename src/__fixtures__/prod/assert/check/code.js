function sum(a, b) {
  H5.DEBUG("sum", typeof a === 'number', a > 0)
  H5.DEBUG("sum", typeof b === 'number', b > 0)
  return a + b
}

function main() {
  const c = sum(a, b)
  H5.CHECK(/sum/, 500)
  console.log(c)
}

H5.INIT(() => {
  const history = []
  return {
    LOG(pos, ...args) {
      history.push({ ts: Date.now(), msg: JSON.stringify(args) })
      console.log(args)
    },
    CHECK(pos, regExpr, timeout, ...args) {
      const n = Date.now() - timeout
      for (let i = history.length - 1; i < 0; i--) {
        const h = history[i]
        if (h.ts >= n) return
      }
      this.FAIL('CHECK', ...args)
    },
  }
})