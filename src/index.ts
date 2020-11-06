
import './initDebugger'
import * as t from '@babel/types';
import { PluginObj, types } from "@babel/core";
import { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import { DEBUG } from "../lib/index";

// const plugin: (p)=>Visitor

module.exports['x'] = 1

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
        if (!(expr && expr.isCallExpression())) return

        const callee: NodePath<t.MemberExpression> = expr.get("callee") as any;

        if (!callee.isMemberExpression()) return;

        const object = callee.get("object");

        const dbgidentifier = state.opts.identifier || 'H5'
        const isH5 = object.isIdentifier({ name: dbgidentifier })
          && !object.scope.getBinding(dbgidentifier)
          && object.scope.hasGlobal(dbgidentifier)
        if (isH5) {
          const mode = process.env.NODE_ENV || state.opts.mode || 'development'
          if (/^production$/gi.test(mode)) {
            DEBUG.TRACE('REMOVING', t.clone(path.node))
            path.remove();
          } else {
            const property = callee.get("property");
            if (property.isIdentifier({ name: 'LOG' })) transpileLOG()
            else if (property.isIdentifier({ name: 'ASSERT' })) transpileASSERT()
            else if (property.isIdentifier({ name: 'RESET' })) {
              DEBUG.TRACE('RESET', expr.node.arguments[0])
              transpileOthers()
            }
            else if (property.isIdentifier({ name: 'TRACE' })) {
              DEBUG.TRACE('TRACE', expr.node.arguments[0])
              transpileOthers()
            }
            else if (property.isIdentifier({ name: 'CHECK' })) {
              DEBUG.TRACE('CHECK', expr.node.arguments[0])
              transpileOthers()
            }
            else if (property.isIdentifier({ name: 'INIT' })) {
              DEBUG.TRACE('INIT', expr.node.arguments[0])
              const arg0: t.FunctionExpression = expr.node.arguments[0] as any
              path.get('expression').replaceWith(t.callExpression(t.clone(arg0), []))
            }
            else throw path.buildCodeFrameError("Invalid command");
          }
        }

        function transpileLOG() {
          DEBUG.TRACE('LOG', expr.node.arguments[0])
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
            .concat(expr.node.arguments.reduce<t.Expression[]>((prev, curr) => {
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
          DEBUG.TRACE('ASSERT', expr.node.arguments[0])
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
            .concat(expr.node.arguments
              .reduce<t.Expression[]>((prev, curr) => {
                const cclone: t.Expression = t.clone(curr) as any
                const cname = t.stringLiteral(generate(cclone).code)
                prev.push(t.arrayExpression([cname, cclone]))
                return prev
              }, [])))
          path.get('expression').replaceWith(
            t.logicalExpression('&&', t.identifier(dbgidentifier), nexpr)
          )
        }
        function transpileOthers() {
          path.get('expression').replaceWith(
            t.logicalExpression('&&', t.identifier(dbgidentifier), t.clone(expr.node))
          )
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
