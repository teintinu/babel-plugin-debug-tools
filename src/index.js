
const generate = require("@babel/generator").default;

module.exports = function (plugin) {
  //api.assertVersion(7);
  const t = plugin.types
  return {
    name: 'babel-debug-tools',
    visitor: {
      ExpressionStatement(path, state) {
        const expr = path.get('expression')
        if (!(expr && expr.isCallExpression())) return
        const callee = expr.get("callee");

        if (!callee.isMemberExpression()) return;

        const object = callee.get("object");

        const dbgidentifier = state.opts.identifier || 'H5'
        const isH5 = object.isIdentifier({ name: dbgidentifier }) && !object.scope.getBinding(dbgidentifier) && object.scope.hasGlobal(dbgidentifier)
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
              path.get('expression').replaceWith(t.callExpression(t.clone(expr.node.arguments[0]), [])
              )
            }
            else throw path.buildCodeFrameError("Invalid command");
          }
        }
        function transpileLOG() {
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()]
            .concat(expr.node.arguments.reduce((prev, curr) => {
              const cclone = t.clone(curr)
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
                const cclone = t.clone(curr)
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
      },
    },
  };
}
