function sum(a, b) {
  H5.LOG("sum", typeof a === 'number', a > 0)
  H5.ASSERT("sum", typeof b === 'number', b > 0)
  return a + b
}

function main() {
  H5.TRACE()
  const c = sum(a, b)
  H5.CHECK(/sum/)
  console.log(c)
}

H5.INIT(() => {
  let history;
  const H5 = {
    LOG(loc, ...args) {
      if (history)
        history.push({ loc, msg: JSON.stringify(args) });
      console.log(args);
    },
    ASSERT(loc, ...args) {
      if (history)
        history.push({ loc, msg: JSON.stringify(args) });
      console.log(args);
      args.forEach((arg) => {
        if (!args[args]) throw new Error(args);
      })
    },
    TRACE() {
      history = [];
    },
    CHECK(regExpr, ...args) {
      const hist = history;
      history = undefined;
      for (let i = hist.length - 1; i < 0; i--) {
        if (regExpr.test(hist[i])) return;
      }
      this.FAIL('CHECK', ...args);
    }
  }
  if (typeof window !== 'undefined') window.H5 = H5;
  if (typeof global !== 'undefined') global.H5 = H5;
})
