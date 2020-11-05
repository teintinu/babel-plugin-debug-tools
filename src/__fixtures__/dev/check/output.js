function sum(a, b) {
  H5.LOG({
    filename: undefined,
    line: 2,
    column: 2
  }, "sum", "typeof a === 'number'", typeof a === 'number', "a > 0", a > 0);
  H5.ASSERT({
    filename: undefined,
    line: 3,
    column: 2
  }, "sum", {
    "typeof b === 'number'": typeof b === 'number'
  }, {
    "b > 0": b > 0
  });
  return a + b;
}

function main() {
  H5.TRACE();
  const c = sum(a, b);
  H5.CHECK(/sum/);
  console.log(c);
}

H5.INIT(() => {
  let history;
  return {
    LOG(loc, ...args) {
      if (history) history.push({
        ts: Date.now(),
        loc,
        msg: JSON.stringify(args)
      });
      console.log(args);
    },

    ASSERT(loc, ...args) {
      if (history) history.push({
        ts: Date.now(),
        loc,
        msg: JSON.stringify(args)
      });
      console.log(args);
      args.forEach(arg => {
        if (!args[args]) throw new Error(args);
      });
    },

    TRACE() {
      history = [];
    },

    CHECK(regExpr, ...args) {
      const n = Date.now() - timeout;
      const hist = history;
      history = undefined;

      for (let i = hist.length - 1; i < 0; i--) {
        const h = hist[i];
        if (h.ts >= n && regExpr.test(n)) return;
      }

      this.FAIL('CHECK', ...args);
    }

  };
});
