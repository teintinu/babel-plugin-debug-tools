
import { DEBUG } from './DEBUG'
import * as t from '@babel/types';
import { PluginObj, types } from "@babel/core";
import { NodePath } from "@babel/traverse";
import generate from "@babel/generator";

// const plugin: (p)=>Visitor

export default (() => {

  interface PluginInfo {
    // file: BabelFile;
    // key: string;
    opts: {
      identifier?: string
      mode?: 'production' | 'development'
    }
    cwd: string;
    filename: string;
    // [key: string]: unknown;
  }

  const visitor: PluginObj<PluginInfo> = {
    name: 'babel-debug-tools',
    visitor: {
      VariableDeclaration(path, state) {
        const mode = state.opts.mode || process.env.NODE_ENV || 'development'
        DEBUG.TRACE({ VariableDeclaration: t.clone(path.node), mode })
        if (mode === 'production') {
          const decl = path.node.declarations
          const varid = decl && decl[0] && decl[0].id
          if (t.isIdentifier(varid) && varid.name === (state.opts.identifier || 'H5')) {
            DEBUG.TRACE('Removing import')
            path.remove();
          }
        }
      },
      ImportDeclaration(path, state) {
        const mode = state.opts.mode || process.env.NODE_ENV || 'development'
        DEBUG.TRACE({ ImportDeclaration: t.clone(path.node), mode })
        if (mode === 'production') {
          const specs = path.node.specifiers
          const s0: t.ImportSpecifier = (specs && specs[0] && t.isImportSpecifier(specs[0]) && specs[0]) as any
          if (s0 && t.isIdentifier(s0.imported) && s0.imported.name === (state.opts.identifier || 'H5')) {
            DEBUG.TRACE('Removing import')
            path.remove();
          }
        }
      },
      ExpressionStatement(path, state) {
        DEBUG.TRACE({ ExpressionStatement: t.clone(path.node) })
        const expr: NodePath<t.CallExpression> = path.get('expression') as any
        DEBUG.TRACE(expr.isCallExpression())
        if (!(expr && expr.isCallExpression())) return

        const callee: NodePath<t.MemberExpression> = expr.get("callee") as any;

        if (!callee.isMemberExpression()) return;

        const object = callee.get("object");

        const identifier = state.opts.identifier || 'H5'
        const isH5 = object.isIdentifier({ name: identifier })
        const mode = state.opts.mode || process.env.NODE_ENV || 'development'
        DEBUG.TRACE(identifier, mode, isH5)
        if (isH5) {
          DEBUG.assertString(identifier, mode)
          if (mode === 'production') {
            DEBUG.TRACE('Removing node')
            path.remove();
          } else {
            const property = callee.get("property");
            if (property.isIdentifier({ name: 'LOG' })) transpileLOGorTRACE('LOG')
            else if (property.isIdentifier({ name: 'ASSERT' })) transpileASSERT()
            else if (property.isIdentifier({ name: 'RESET' })) {
              DEBUG.TRACE('RESET', expr.node.arguments[0])
              transpileCloning()
            }
            else if (property.isIdentifier({ name: 'TRACE' })) transpileLOGorTRACE('TRACE')
            else if (property.isIdentifier({ name: 'INIT' })) {
              DEBUG.TRACE('INIT', expr.node.arguments[0])
              const arg0: t.FunctionExpression = expr.node.arguments[0] as any
              path.get('expression').replaceWith(t.callExpression(t.clone(arg0), []))
            }
            else {
              const method: t.Identifier = property.node as any
              let isCustom = false
              if (t.isIdentifier(method)) {
                if (/^[a-z]\w+$/.test(method.name)) {
                  isCustom = true
                  transpileCustom()
                }
              }
              if (!isCustom)
                throw path.buildCodeFrameError("Invalid command");
            }
          }
        }

        function transpileLOGorTRACE(kind: 'LOG' | 'TRACE') {
          DEBUG.TRACE({ LOG: expr.node.arguments[0] })
          const a0: t.Expression[] = kind === 'LOG' ? [calleeLoc()] : []
          const args = a0.concat(expr.node.arguments.reduce<t.Expression[]>((prev, curr) => {
            const cclone: t.Expression = t.clone(curr) as any
            if (t.isStringLiteral(cclone)) prev.push(cclone)
            else if (t.isObjectExpression(cclone)) {
              cclone.properties.forEach((p) => {
                if (t.isObjectProperty(p)) {
                  const cname = t.isIdentifier(p.key) ? t.stringLiteral(p.key.name) : t.clone(p.key)
                  prev.push(t.arrayExpression([cname, t.clone(p.value as any)]))
                }
              })
            }
            else {
              const cname = t.stringLiteral(generate(cclone).code)
              prev.push(t.arrayExpression([cname, cclone]))
            }
            return prev
          }, []))
          const nexpr = t.callExpression(t.clone(callee.node), args)
          DEBUG.TRACE({ 'GENERATED': nexpr })
          path.get('expression').replaceWith(nexpr)
        }

        function transpileASSERT() {
          interface Assertion {
            caption: t.Expression,
            expr: t.Expression,
            fields: Fields
          }
          interface Fields {
            [caption: string]: t.Identifier
          }
          const assertions: Assertion[] = []
          DEBUG.TRACE('ASSERT', expr.node)
          if (expr.node.arguments.length === 0) throw path.buildCodeFrameError("Assert without arguments");
          expr.node.arguments.forEach((curr) => {
            handlArg(curr as any)
          }, [])
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
            .concat(
              assertions
                .map((a) => t.arrayExpression([
                  a.caption,
                  a.expr,
                  t.objectExpression(
                    Object.keys(a.fields).map((fn) => t.objectProperty(
                      t.stringLiteral(fn), t.clone(a.fields[fn])
                    )))
                ]))))
          DEBUG.TRACE({ 'GENERATED': nexpr })
          path.get('expression').replaceWith(nexpr)
          function handlArg(argExpr: t.Expression) {
            DEBUG.TRACE(t.isRegExpLiteral(argExpr))
            if (t.isRegExpLiteral(argExpr)) {
              add(t.stringLiteral(argExpr.pattern), t.clone(argExpr), {})
            } else if (t.isObjectExpression(argExpr)) {
              argExpr.properties.forEach(p => {
                if (t.isSpreadElement(p))
                  throw path.buildCodeFrameError("Spread is not supported");
                if (t.isObjectMethod(p)) {
                  if (p.params.length)
                    throw path.buildCodeFrameError("Remove arguments of methods");
                  add(p.key, t.callExpression(
                    t.functionExpression(null, [], t.clone(p.body)), []
                  ), {})
                } else {
                  const eaditionalFields: Fields = {}
                  const { caption, val } = explainExpr(p.value as any, eaditionalFields, false)
                  add(t.stringLiteral(caption), val, eaditionalFields)
                }
              })
            } else {
              const eaditionalFields: Fields = {}
              const { caption, val } = explainExpr(argExpr, eaditionalFields, false)
              add(t.stringLiteral(caption), val, eaditionalFields)
            }
          }

          function add(caption: t.Expression, expr: t.Expression, fields: Fields) {
            const a: Assertion = { caption, expr: t.clone(expr), fields }
            assertions.push(a)
            return a
          }

          function explainExpr(bigExpr: t.Expression | t.PrivateName, fields: Fields, addf: boolean): {
            caption: string,
            val: t.Literal | t.Identifier,
          } {
            DEBUG.TRACE(bigExpr.type)
            if (t.isStringLiteral(bigExpr)) {
              return { caption: bigExpr.value, val: bigExpr }
            } else if (t.isNumericLiteral(bigExpr)) {
              return { caption: bigExpr.value.toString(), val: bigExpr }
            } else if (t.isBooleanLiteral(bigExpr)) {
              return { caption: bigExpr.value ? 'true' : 'false', val: bigExpr }
            } else if (t.isNullLiteral(bigExpr)) {
              return { caption: 'null', val: bigExpr }
            } else if (t.isIdentifier(bigExpr)) {
              if (addf) fields[bigExpr.name] = t.clone(bigExpr)
              return { caption: bigExpr.name, val: bigExpr }
            } else if (t.isCallExpression(bigExpr)) {
              bigExpr.arguments.forEach((a) => {
                explainExpr(a as any, fields, true)
              })
              const valId = path.scope.generateUidIdentifier('dbg')
              path.scope.push({ id: valId });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, t.clone(bigExpr))))
              return { caption: generate(bigExpr).code, val: valId }
            } else if (t.isBinaryExpression(bigExpr)) {
              const left = explainExpr(bigExpr.left, fields, true)
              const right = explainExpr(bigExpr.right, fields, true)

              const caption = generate(bigExpr).code
              const expr = t.binaryExpression(
                bigExpr.operator,
                t.clone(left.val),
                t.clone(right.val)
              )
              const valId = path.scope.generateUidIdentifier('dbg')
              path.scope.push({ id: valId });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, expr)))
              fields[caption] = t.clone(valId)
              return {
                caption,
                val: t.clone(valId),
              }
            } else if (t.isLogicalExpression(bigExpr)) {
              const left = explainExpr(bigExpr.left, fields, true)
              const right = explainExpr(bigExpr.right, fields, true)

              const caption = generate(bigExpr).code
              const expr = t.logicalExpression(
                bigExpr.operator,
                t.clone(left.val),
                t.clone(right.val)
              )
              const valId = path.scope.generateUidIdentifier('dbg')
              path.scope.push({ id: valId });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, expr)))
              fields[caption] = t.clone(valId)
              return {
                caption,
                val: t.clone(valId),
              }
            } else if (t.isConditionalExpression(bigExpr)) {
              const test = explainExpr(bigExpr.test, fields, true)
              const consequent = explainExpr(bigExpr.consequent, fields, true)
              const alternate = explainExpr(bigExpr.alternate, fields, true)

              const caption = generate(bigExpr).code
              const expr = t.conditionalExpression(
                t.clone(test.val),
                t.clone(consequent.val),
                t.clone(alternate.val)
              )
              const valId = path.scope.generateUidIdentifier('dbg')
              path.scope.push({ id: valId });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, expr)))
              fields[caption] = t.clone(valId)
              return {
                caption,
                val: t.clone(valId),
              }
            } else if (t.isUnaryExpression(bigExpr)) {
              const arg = explainExpr(bigExpr.argument, fields, true)
              const caption = generate(bigExpr).code
              const expr = t.unaryExpression(bigExpr.operator, t.clone(arg.val))
              const valId = path.scope.generateUidIdentifier('dbg')
              path.scope.push({ id: valId });
              path.insertBefore(t.expressionStatement(
                t.assignmentExpression('=', valId, expr)))
              fields[caption] = t.clone(valId)
              return {
                caption,
                val: t.clone(valId),
              }
              // const cnameArg = t.stringLiteral(generate(cclone.argument).code)
              // const isLiteralArg = t.isLiteral(cclone.argument)

              // cclone.argument = argId

              // if (!(isLiteralArg)) {
              //   aditionalFields.push(t.objectProperty(cnameArg, argId))
              // }
              // return { caption: cname, expr: cclone }
            }
            throw path.buildCodeFrameError("unsupported expression: " + bigExpr.type);
          }
        }

        function transpileCloning() {
          path.get('expression').replaceWith(t.clone(expr.node))
        }
        function transpileCustom() {
          DEBUG.TRACE('customMethod', expr.node)
          const codes = t.arrayExpression(expr.node.arguments.map(arg => t.stringLiteral(generate(t.clone(arg)).code)))
          const values = t.arrayExpression(expr.node.arguments.map(arg => t.clone(arg) as t.Expression))
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc(), codes, values])
          DEBUG.TRACE({ 'GENERATED': nexpr })
          path.get('expression').replaceWith(nexpr)
        }
        function calleeLoc(): t.Expression {
          const loc = callee.node.loc
          return t.objectExpression([
            t.objectProperty(t.identifier('filename'), state.filename ?
              t.stringLiteral(state.filename.replace(state.cwd, '')) : t.identifier('undefined')),
            t.objectProperty(t.identifier('line'), t.numericLiteral(loc?.start?.line || 0)),
            t.objectProperty(t.identifier('column'), t.numericLiteral(loc?.start?.column || 0)),
          ])
        }
      },
    },
  };
  return visitor
})
