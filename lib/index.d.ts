declare module
export interface INITH5 {
  LOG(loc: H5Loc, ...args: any[]): void
  ASSERT(loc: H5Loc, ...args: any[]): void
  RESET(): void
  TRACE(): string[]
  TRACE(...args: any[]): void
  CHECK(regExpr: RegExp, ...args: any[]): void
}

declare const H5: IH5
