
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
          DEBUG.TRACE('ASSERT', expr.node)
          DEBUG.ASSERT(expr.node.arguments.length > 0)
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
            .concat(expr.node.arguments
              .reduce<t.Expression[]>((prev, curr) => {
                DEBUG.TRACE(t.isRegExpLiteral(curr))
                if (t.isRegExpLiteral(curr)) {
                  prev.push(t.clone(curr))
                } else {
                  const cclone: t.Expression = t.clone(curr) as any
                  const cname = t.stringLiteral(generate(cclone).code)
                  DEBUG.TRACE(t.isBinaryExpression(cclone), t.isUnaryExpression(cclone))
                  if (t.isBinaryExpression(cclone)) {
                    const leftId = path.scope.generateUidIdentifier('left')
                    const cnameleft = t.stringLiteral(generate(cclone.left).code)
                    const cnameright = t.stringLiteral(generate(cclone.right).code)
                    const isLiteralleft = t.isLiteral(cclone.left)
                    const isLiteralright = t.isLiteral(cclone.right)

                    path.scope.push({ id: leftId });
                    const rightId = path.scope.generateUidIdentifier('right')
                    path.scope.push({ id: rightId });
                    path.insertBefore(t.expressionStatement(t.assignmentExpression('=', leftId, t.clone(cclone.left) as any)))
                    path.insertBefore(t.expressionStatement(t.assignmentExpression('=', rightId, t.clone(cclone.right) as any)))

                    cclone.left = leftId
                    cclone.right = rightId
                    const aexpr = t.arrayExpression([cname, cclone])
                    prev.push(aexpr)

                    const binExpr = t.objectExpression([]);
                    const left: t.Expression = t.clone(cclone.left) as any
                    if (!(isLiteralleft)) binExpr.properties.push(t.objectProperty(cnameleft, left))
                    const right: t.Expression = t.clone(cclone.right) as any
                    if (!(isLiteralright)) binExpr.properties.push(t.objectProperty(cnameright, right))
                    aexpr.elements.push(binExpr)
                  }
                  else if (t.isUnaryExpression(cclone)) {

                    const argId = path.scope.generateUidIdentifier('arg')
                    const cnameArg = t.stringLiteral(generate(cclone.argument).code)
                    const isLiteralArg = t.isLiteral(cclone.argument)
                    path.insertBefore(t.expressionStatement(t.assignmentExpression('=', argId, t.clone(cclone.argument) as any)))

                    cclone.argument = argId
                    const aexpr = t.arrayExpression([cname, cclone])
                    prev.push(aexpr)

                    if (!(isLiteralArg)) {
                      aexpr.elements.push(t.objectExpression([
                        t.objectProperty(cnameArg, argId)
                      ]))
                    }
                  }
                  else throw path.buildCodeFrameError("unsupported expression");
                }
                return prev
              }, [])))
          DEBUG.TRACE({ 'GENERATED': nexpr })
          path.get('expression').replaceWith(nexpr)
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
