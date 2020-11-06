
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
          if (mode === 'production') {
            DEBUG.TRACE('Removing node')
            path.remove();
          } else {
            const property = callee.get("property");
            if (property.isIdentifier({ name: 'LOG' })) transpileLOGorTRACE('LOG')
            else if (property.isIdentifier({ name: 'ASSERT' })) transpileASSERT()
            else if (property.isIdentifier({ name: 'RESET' })) {
              DEBUG.TRACE('RESET', expr.node.arguments[0])
              transpileOthers()
            }
            else if (property.isIdentifier({ name: 'TRACE' })) transpileLOGorTRACE('TRACE')
            else if (property.isIdentifier({ name: 'INIT' })) {
              DEBUG.TRACE('INIT', expr.node.arguments[0])
              const arg0: t.FunctionExpression = expr.node.arguments[0] as any
              path.get('expression').replaceWith(t.callExpression(t.clone(arg0), []))
            }
            else throw path.buildCodeFrameError("Invalid command");
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
          path.get('expression').replaceWith(nexpr)
        }

        function transpileASSERT() {
          DEBUG.TRACE('ASSERT', expr.node.arguments[0])
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
            .concat(expr.node.arguments
              .reduce<t.Expression[]>((prev, curr) => {
                if (t.isRegExpLiteral(curr)) {
                  prev.push(curr)
                } else {
                  const cclone: t.Expression = t.clone(curr) as any
                  const cname = t.stringLiteral(generate(cclone).code)
                  const aexpr = t.arrayExpression([cname, cclone])
                  prev.push(aexpr)
                  if (t.isBinaryExpression(cclone)) {
                    const binExpr = t.objectExpression([]);
                    const left: t.Expression = t.clone(cclone.left) as any
                    const cnameleft = t.stringLiteral(generate(left).code)
                    if (!(t.isLiteral(left))) binExpr.properties.push(t.objectProperty(cnameleft, left))
                    const right: t.Expression = t.clone(cclone.right) as any
                    const cnameright = t.stringLiteral(generate(right).code)
                    if (!(t.isLiteral(right))) binExpr.properties.push(t.objectProperty(cnameright, right))
                    aexpr.elements.push(binExpr)
                  }
                  else if (t.isUnaryExpression(cclone)) {
                    const arg: t.Expression = t.clone(cclone.argument) as any
                    if (!(t.isLiteral(arg))) {
                      const cnamearg = t.stringLiteral(generate(arg).code)
                      aexpr.elements.push(t.objectExpression([
                        t.objectProperty(cnamearg, arg)
                      ]))
                    }
                  }
                  else throw path.buildCodeFrameError("unsupported expression");
                }
                return prev
              }, [])))
          path.get('expression').replaceWith(nexpr)
        }
        function transpileOthers() {
          path.get('expression').replaceWith(t.clone(expr.node))
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
