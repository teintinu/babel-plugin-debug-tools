function sum(a, b) {
  H5 && H5.LOG({
    filename: undefined,
    line: 2,
    column: 2
  }, "sum", "typeof a === 'number'", typeof a === 'number', "a > 0", a > 0);
  H5 && H5.ASSERT({
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
  H5 && H5.TRACE();
  const c = sum(a, b);
  H5 && H5.CHECK(/sum/);
  console.log(c);
}

(() => {
  let history;
  const H5 = {
    LOG(loc, ...args) {
      if (history) history.push({
        loc,
        msg: JSON.stringify(args)
      });
      console.log(args);
    },

    ASSERT(loc, ...args) {
      if (history) history.push({
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
      const hist = history;
      history = undefined;

      for (let i = hist.length - 1; i < 0; i--) {
        if (regExpr.test(hist[i])) return;
      }

      this.FAIL('CHECK', ...args);
    }

  };
  if (typeof window !== 'undefined') window.H5 = H5;
  if (typeof global !== 'undefined') global.H5 = H5;
})();
