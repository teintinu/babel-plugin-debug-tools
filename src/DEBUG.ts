import generate from "@babel/generator";
import { isArrayTypeNode } from "typescript";

let traceLog: string[] = [];

export const DEBUG: H5 = {
  LOG() {
    console.log(formatArgs(arguments, 1));
  },
  ASSERT() {
    const loc: H5Loc = arguments[0]
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
  }
} as any

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

export interface H5Use {
  LOG(loc: H5Loc, ...args: any[]): void
  ASSERT(loc: H5Loc, ...args: any[]): void
  RESET(): void
  HISTORY(): string
  TRACE(...args: any[]): void
}

export interface H5 {
  LOG(...args: any[]): void
  ASSERT(...args: any[]): void
  RESET(): void
  HISTORY(): string
  TRACE(...args: any[]): void
}

declare interface H5Loc {
  filename: string
  line: number
  column: number
}
