import generate from "@babel/generator";

let traceLog: string[] = [];

export const DEBUG: H5 = {
  LOG() {
    console.log(formatArgs(arguments, 1));
  },
  ASSERT() {
    const loc = arguments[0]
    for (let i = 1; i < arguments.length; i++) {
      const arg = arguments[i]
      if (!arg[1]) throw new Error('ASSERT FAIL: ' + arg[0] + ' at ' + formatLoc(loc));
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
(global as any).DEBUG = DEBUG;
function formatLoc(loc: H5Loc) {
  return (loc.filename || '') + ':' + loc.line + ':' + loc.column + ' ';
}
function formatArg(arg: any): string {
  if (arg && arg.type) {
    try {
      return generate(arg, {}).code || ''
    } catch (err) {
      return 'err: ' + err.message
    }
  }
  if (typeof arg === 'string') return arg
  return JSON.stringify(arg)
}
function formatArgs(args: IArguments, sLoc: 0 | 1): string {
  const flatArgs: string[] = []
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

export interface H5 {
  LOG(loc: H5Loc, ...args: any[]): void
  ASSERT(loc: H5Loc, ...args: any[]): void
  RESET(): void
  HISTORY(): string
  TRACE(...args: any[]): void
  CHECK(regExpr: RegExp, ...args: any[]): void
}

declare interface H5Loc {
  filename: string
  line: number
  column: number
}
