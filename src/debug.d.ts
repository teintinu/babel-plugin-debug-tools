declare interface H5Loc {
  filename: string
  line: number
  column: number
}
export interface IH5 {
  INIT(fn: () => void): void
  LOG(...args: any[]): void
  CALL<T>(expression: T, msg?: string): T
  ASSERT(...args: any[]): void
  RESET(): void
  TRACE(): string[]
  TRACE(...args: any[]): void
  CHECK(regExpr: RegExp, ...args: any[]): void
}

export interface INITH5 {
  LOG(loc: H5Loc, ...args: any[]): void
  ASSERT(loc: H5Loc, ...args: any[]): void
  RESET(): void
  TRACE(): string[]
  TRACE(...args: any[]): void
  CHECK(regExpr: RegExp, ...args: any[]): void
}

declare global {
  const H5DEBUG: IH5
}
