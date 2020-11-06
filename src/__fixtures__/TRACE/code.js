function sum(a, b) {
  H5.TRACE("sum", a, b)
  return a + b
}

function main() {
  H5.TRACE()
  const c = sum(1, 2)
  H5.CHECK(/sum a=1 b=2/)
  console.log(c)
}

H5.INIT(() => {
  let traceLog;
  const H5 = {
    LOG(loc, ...args) {
      console.log(formatLoc(loc), ...args);
    },
    ASSERT(loc, ...args) {
      args.forEach((arg) => {
        if (!args[arg]) throw new Error(formatLoc(loc), arg);
      });
    },
    TRACE(...args) {
      if (args.length)
        traceLog.push(args.join(' '));
      else
        traceLog = [];
    },
    CHECK(regExp) {
      return traceLog.some(l => regExp.test(l))
    }
  }
  if (typeof window !== 'undefined') window.H5 = H5;
  if (typeof global !== 'undefined') global.H5 = H5;
  function formatLoc(loc) {
    return (loc.filename || '') + ':' + loc.line + ':' + loc.column + ' ';
  }
});