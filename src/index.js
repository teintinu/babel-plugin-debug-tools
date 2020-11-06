
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
          const loc = callee.node.loc
          const nexpr = t.callExpression(t.clone(callee.node), [
            //t.stringLiteral(locstr)
            t.objectExpression([
              t.objectProperty(t.identifier('filename'), loc.filename ? t.stringLiteral(loc.filename) : t.identifier('undefined')),
              t.objectProperty(t.identifier('line'), t.numericLiteral(loc.start.line)),
              t.objectProperty(t.identifier('column'), t.numericLiteral(loc.start.column)),
            ])
          ].concat(expr.node.arguments.reduce((prev, curr) => {
            const n2 = t.clone(curr)
            if (!t.isStringLiteral(n2)) {
              const n1 = t.stringLiteral(generate(n2).code + '=')
              prev.push(t.binaryExpression('+', n1, n2))
            }
            else prev.push(n2)
            return prev
          }, [])))
          path.get('expression').replaceWith(t.logicalExpression('&&', t.identifier(dbgidentifier), nexpr))
        }
        function transpileASSERT() {
          const loc = callee.node.loc
          const nexpr = t.callExpression(t.clone(callee.node), [
            //t.stringLiteral(locstr)
            t.objectExpression([
              t.objectProperty(t.identifier('filename'), loc.filename ? t.stringLiteral(loc.filename) : t.identifier('undefined')),
              t.objectProperty(t.identifier('line'), t.numericLiteral(loc.start.line)),
              t.objectProperty(t.identifier('column'), t.numericLiteral(loc.start.column)),
            ])
          ].concat(expr.node.arguments
            .reduce((prev, curr) => {
              const n2 = t.clone(curr)
              if (t.isStringLiteral(n2)) prev.push(n2)
              else {
                const str = generate(n2).code
                const n1 = t.stringLiteral(str)
                if (t.isBinaryExpression(n2))
                  prev.push(t.objectExpression([
                    t.objectProperty(n1, n2),
                  ]))
                else
                  prev.push(n1)
              }
              return prev
            }, [])))
          path.get('expression').replaceWith(
            t.logicalExpression('&&', t.identifier(dbgidentifier), nexpr)
          )
        }
      },
    },
  };
}
