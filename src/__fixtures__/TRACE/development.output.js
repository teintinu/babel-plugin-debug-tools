"use strict";

function sum(a, b) {
  H5 && H5.TRACE("sum", a, b);
  return a + b;
}

function main() {
  H5 && H5.TRACE();
  const c = sum(1, 2);
  H5 && H5.CHECK(/sum a=1 b=2/);
  console.log(c);
}

(() => {
  let traceLog;
  const H5 = {
    LOG(loc, ...args) {
      console.log.apply(console, formatArgs(loc, args));
    },

    ASSERT(loc, ...args) {
      args.forEach(arg => {
        if (!args[1]) throw new Error('ASSERT FAIL: ' + arg[0] + ' at ' + formatLoc(loc));
      });
    },

    TRACE(...args) {
      if (args.length) traceLog.push(args.join(' '));else traceLog = [];
    },

    CHECK(regExp) {
      return traceLog.some(l => regExp.test(l));
    }

  };
  if (typeof window !== 'undefined') window.H5 = H5;
  if (typeof global !== 'undefined') global.H5 = H5;

  function formatLoc(loc) {
    return (loc.filename || '') + ':' + loc.line + ':' + loc.column + ' ';
  }

  function formatArgs(loc, args) {
    const flatArgs = [];
    args.forEach(arg => {
      if (Array.isArray(args) && args.length == 2) {
        flatArgs.push(arg[0]);
        flatArgs.push(arg[1]);
      } else flatArgs.push(arg);
    });
    flatArgs.push(formatLoc(loc));
    return flatArgs;
  }
})();