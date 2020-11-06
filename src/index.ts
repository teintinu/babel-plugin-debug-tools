
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
      ExpressionStatement(path, state) {
        const expr: NodePath<t.CallExpression> = path.get('expression') as any
        if (expr && expr.isCallExpression()) {

          const callee: NodePath<t.MemberExpression> = expr.get("callee") as any;

          if (!callee.isMemberExpression()) return;

          const object = callee.get("object");

          const dbgidentifier = state.opts.identifier || 'H5'
          const isH5 = object.isIdentifier({ name: dbgidentifier })
            && !object.scope.getBinding(dbgidentifier)
            && object.scope.hasGlobal(dbgidentifier)
          if (isH5) {
            const mode = state.opts.mode || process.env.NODE_ENV || 'development'
            if (/^production$/gi.test(mode)) {
              path.remove();
            } else {
              const property = callee.get("property");
              if (property.isIdentifier({ name: 'LOG' })) transpileLOG()
              else if (property.isIdentifier({ name: 'ASSERT' })) transpileASSERT()
              else if (property.isIdentifier({ name: 'TRACE' }) || property.isIdentifier({ name: 'CHECK' })) {
                path.get('expression').replaceWith(
                  t.logicalExpression('&&', t.identifier(dbgidentifier), t.clone(expr.node))
                )
              }
              else if (property.isIdentifier({ name: 'INIT' })) {
                const arg0: t.FunctionExpression = expr.node.arguments[0] as any
                path.get('expression').replaceWith(t.callExpression(t.clone(arg0), []))
              }
              else throw path.buildCodeFrameError("Invalid command");
            }
          }
          function transpileLOG() {
            const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
              .concat(expr.node.arguments.reduce((prev, curr) => {
                const cclone: t.Expression = t.clone(curr) as any
                if (t.isStringLiteral(cclone)) prev.push(cclone)
                else {
                  const cname = t.stringLiteral(generate(cclone).code)
                  prev.push(t.arrayExpression([cname, cclone]))
                }
                return prev
              }, [])))
            path.get('expression').replaceWith(t.logicalExpression('&&', t.identifier(dbgidentifier), nexpr))
          }
          function transpileASSERT() {
            const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
              .concat(expr.node.arguments
                .reduce((prev, curr) => {
                  const cclone: t.Expression = t.clone(curr) as any
                  const cname = t.stringLiteral(generate(cclone).code)
                  prev.push(t.arrayExpression([cname, cclone]))
                  return prev
                }, [])))
            path.get('expression').replaceWith(
              t.logicalExpression('&&', t.identifier(dbgidentifier), nexpr)
            )
          }
          function calleeLoc() {
            const loc = callee.node.loc
            return t.objectExpression([
              t.objectProperty(t.identifier('filename'), state.filename ?
                t.stringLiteral(state.filename.replace(state.cwd, '')) : t.identifier('undefined')),
              t.objectProperty(t.identifier('line'), t.numericLiteral(loc.start.line)),
              t.objectProperty(t.identifier('column'), t.numericLiteral(loc.start.column)),
            ])
          }
        }
      },
    },
  };
  return visitor
})
