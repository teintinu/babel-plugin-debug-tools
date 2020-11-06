
let traceLog: string[] = [];

const DEBUG: H5 = {
  LOG(loc, ...args) {
    console.log.apply(console, formatArgs(args, loc));
  },
  ASSERT(loc, ...args) {
    args.forEach((arg) => {
      if (!args[1]) throw new Error('ASSERT FAIL: ' + arg[0] + ' at ' + formatLoc(loc));
    });
  },
  RESET(...args) {
    traceLog = [];
  },
  TRACE: ((...args: any[]) => {
    if (args.length)
      traceLog.push(JSON.stringify(formatArgs(args)));
    else
      return traceLog;
  }) as any,
  CHECK(regExp) {
    return traceLog.some(l => regExp.test(l))
  }
};
(global as any).DEBUG = DEBUG;
function formatLoc(loc: H5Loc) {
  return (loc.filename || '') + ':' + loc.line + ':' + loc.column + ' ';
}
function formatArgs(args: any[], loc?: H5Loc) {
  const flatArgs = []
  args.forEach((arg) => {
    if (Array.isArray(args) && args.length == 2) {
      flatArgs.push(arg[0])
      flatArgs.push(arg[1])
    }
    else flatArgs.push(arg)
  })
  if (loc)
    flatArgs.push(formatLoc(loc))
  return flatArgs
}

export default DEBUG

export interface H5 {
  LOG(loc: H5Loc, ...args: any[]): void
  ASSERT(loc: H5Loc, ...args: any[]): void
  RESET(): void
  TRACE(): string[]
  TRACE(...args: any[]): void
  CHECK(regExpr: RegExp, ...args: any[]): void
}

declare interface H5Loc {
  filename: string
  line: number
  column: number
}
