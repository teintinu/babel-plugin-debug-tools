
let traceLog = [];

export const BHASKARA = {
  LOG() {
    console.log(formatArgs(arguments, 1));
  },
  ASSERT() {
    console.log(arguments)
    const loc = arguments[0]
    for (let i = 1; i < arguments.length; i++) {
      const arg = arguments[i]
      if (Array.isArray(arg)) {
        if (!arg[1]) throw new Error(
          'ASSERT FAIL: ' + arg[0] + ' at ' + formatLoc(loc) +
          (arg[2] ? JSON.stringify(arg[2]) : '')
        );
      } else {
        if (!traceLog.some(l => arg.test(l)))
          throw new Error('NOT FOUND IN HISTORY: ' + arg.toString() + ' at ' + formatLoc(loc))
      }
    }
  },
  RESET() {
    traceLog = [];
  },
  HISTORY() {
    return traceLog.join('\n')
  },
  TRACE() {
    traceLog.push(formatArgs(arguments, 0));
  },
  CHECK(regExp) {
    return traceLog.some(l => regExp.test(l))
  }
};

function formatLoc(loc) {
  return (loc.filename || '') + ':' + loc.line + ':' + loc.column + ' ';
}
function formatArg(arg) {
  if (typeof arg === 'string') return arg
  return JSON.stringify(arg)
}
function formatArgs(args, sLoc) {
  const flatArgs = []
  for (let i = 0; i < args.length - sLoc; i++) {
    const arg = args[i]
    if (Array.isArray(arg) && arg.length == 2) {
      flatArgs.push(formatArg(arg[0]) + ': ' + formatArg(arg[1]))
    }
    else flatArgs.push(formatArg(arg))
  }
  if (sLoc)
    flatArgs.push(formatArg(formatLoc(args[args.length - 1])))
  return flatArgs.join(' ')
}
