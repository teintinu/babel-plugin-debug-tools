"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var t = _interopRequireWildcard(require("@babel/types"));

var _generator = _interopRequireDefault(require("@babel/generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// const plugin: (p)=>Visitor
var _default = () => {
  const visitor = {
    name: 'babel-debug-tools',
    visitor: {
      VariableDeclaration(path, state) {
        const mode = state.opts.mode || process.env.NODE_ENV || 'development';

        if (mode === 'production') {
          const decl = path.node.declarations;
          const varid = decl && decl[0] && decl[0].id;

          if (t.isIdentifier(varid) && varid.name === (state.opts.identifier || 'H5')) {
            path.remove();
          }
        }
      },

      ImportDeclaration(path, state) {
        const mode = state.opts.mode || process.env.NODE_ENV || 'development';

        if (mode === 'production') {
          const specs = path.node.specifiers;
          const s0 = specs && specs[0] && t.isImportSpecifier(specs[0]) && specs[0];

          if (s0 && t.isIdentifier(s0.imported) && s0.imported.name === (state.opts.identifier || 'H5')) {
            path.remove();
          }
        }
      },

      ExpressionStatement(path, state) {
        const expr = path.get('expression');
        if (!(expr && expr.isCallExpression())) return;
        const callee = expr.get("callee");
        if (!callee.isMemberExpression()) return;
        const object = callee.get("object");
        const identifier = state.opts.identifier || 'H5';
        const isH5 = object.isIdentifier({
          name: identifier
        });
        const mode = state.opts.mode || process.env.NODE_ENV || 'development';

        if (isH5) {
          if (mode === 'production') {
            path.remove();
          } else {
            const property = callee.get("property");
            if (property.isIdentifier({
              name: 'LOG'
            })) transpileLOGorTRACE('LOG');else if (property.isIdentifier({
              name: 'ASSERT'
            })) transpileASSERT();else if (property.isIdentifier({
              name: 'RESET'
            })) {
              transpileCloning();
            } else if (property.isIdentifier({
              name: 'TRACE'
            })) transpileLOGorTRACE('TRACE');else if (property.isIdentifier({
              name: 'INIT'
            })) {
              const arg0 = expr.node.arguments[0];
              path.get('expression').replaceWith(t.callExpression(t.clone(arg0), []));
            } else {
              const method = property.node;
              let isCustom = false;

              if (t.isIdentifier(method)) {
                if (/^[a-z]\w+$/.test(method.name)) {
                  isCustom = true;
                  transpileCustom();
                }
              }

              if (!isCustom) throw path.buildCodeFrameError("Invalid command");
            }
          }
        }

        function transpileLOGorTRACE(kind) {
          const a0 = kind === 'LOG' ? [calleeLoc()] : [];
          const args = a0.concat(expr.node.arguments.reduce((prev, curr) => {
            const cclone = t.clone(curr);
            if (t.isStringLiteral(cclone)) prev.push(cclone);else if (t.isObjectExpression(cclone)) {
              cclone.properties.forEach(p => {
                if (t.isObjectProperty(p)) {
                  const cname = t.isIdentifier(p.key) ? t.stringLiteral(p.key.name) : t.clone(p.key);
                  prev.push(t.arrayExpression([cname, t.clone(p.value)]));
                }
              });
            } else {
              const cname = t.stringLiteral((0, _generator.default)(cclone).code);
              prev.push(t.arrayExpression([cname, cclone]));
            }
            return prev;
          }, []));
          const nexpr = t.callExpression(t.clone(callee.node), args);
          path.get('expression').replaceWith(nexpr);
        }

        function transpileASSERT() {
          const assertions = [];
          if (expr.node.arguments.length === 0) throw path.buildCodeFrameError("Assert without arguments");
          expr.node.arguments.forEach(curr => {
            handlArg(curr);
          }, []);
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()].concat(assertions.map(a => t.arrayExpression([a.caption, a.expr, t.objectExpression(Object.keys(a.fields).map(fn => t.objectProperty(t.stringLiteral(fn), t.clone(a.fields[fn]))))]))));
          path.get('expression').replaceWith(nexpr);

          function handlArg(argExpr) {
            if (t.isRegExpLiteral(argExpr)) {
              add(t.stringLiteral(argExpr.pattern), t.clone(argExpr), {});
            } else if (t.isObjectExpression(argExpr)) {
              argExpr.properties.forEach(p => {
                if (t.isSpreadElement(p)) throw path.buildCodeFrameError("Spread is not supported");

                if (t.isObjectMethod(p)) {
                  if (p.params.length) throw path.buildCodeFrameError("Remove arguments of methods");
                  const caption = t.isIdentifier(p.key) ? t.stringLiteral(p.key.name) : p.key;
                  add(caption, t.callExpression(t.functionExpression(null, [], t.clone(p.body)), []), {});
                } else {
                  const eaditionalFields = {};
                  const {
                    caption,
                    val
                  } = explainExpr(p.value, eaditionalFields, false);
                  add(t.stringLiteral(caption), val, eaditionalFields);
                }
              });
            } else {
              const eaditionalFields = {};
              const {
                caption,
                val
              } = explainExpr(argExpr, eaditionalFields, false);
              add(t.stringLiteral(caption), val, eaditionalFields);
            }
          }

          function add(caption, expr, fields) {
            const a = {
              caption,
              expr: t.clone(expr),
              fields
            };
            assertions.push(a);
            return a;
          }

          function explainExpr(bigExpr, fields, addf) {
            if (t.isIdentifier(bigExpr)) {
              if (addf) fields[bigExpr.name] = t.clone(bigExpr);
              return {
                caption: bigExpr.name,
                val: bigExpr
              };
            } else if (t.isCallExpression(bigExpr)) {
              bigExpr.arguments.forEach(a => {
                explainExpr(a, fields, true);
              });
              const valId = path.scope.generateUidIdentifier('dbg');
              path.scope.push({
                id: valId
              });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, t.clone(bigExpr))));
              return {
                caption: (0, _generator.default)(bigExpr).code,
                val: valId
              };
            } else if (t.isBinaryExpression(bigExpr)) {
              const left = explainExpr(bigExpr.left, fields, true);
              const right = explainExpr(bigExpr.right, fields, true);
              const caption = (0, _generator.default)(bigExpr).code;
              const expr = t.binaryExpression(bigExpr.operator, t.clone(left.val), t.clone(right.val));
              const valId = path.scope.generateUidIdentifier('dbg');
              path.scope.push({
                id: valId
              });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, expr)));
              fields[caption] = t.clone(valId);
              return {
                caption,
                val: t.clone(valId)
              };
            } else if (t.isLogicalExpression(bigExpr)) {
              const left = explainExpr(bigExpr.left, fields, true);
              const right = explainExpr(bigExpr.right, fields, true);
              const caption = (0, _generator.default)(bigExpr).code;
              const expr = t.logicalExpression(bigExpr.operator, t.clone(left.val), t.clone(right.val));
              const valId = path.scope.generateUidIdentifier('dbg');
              path.scope.push({
                id: valId
              });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, expr)));
              fields[caption] = t.clone(valId);
              return {
                caption,
                val: t.clone(valId)
              };
            } else if (t.isConditionalExpression(bigExpr)) {
              const test = explainExpr(bigExpr.test, fields, true);
              const consequent = explainExpr(bigExpr.consequent, fields, true);
              const alternate = explainExpr(bigExpr.alternate, fields, true);
              const caption = (0, _generator.default)(bigExpr).code;
              const expr = t.conditionalExpression(t.clone(test.val), t.clone(consequent.val), t.clone(alternate.val));
              const valId = path.scope.generateUidIdentifier('dbg');
              path.scope.push({
                id: valId
              });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, expr)));
              fields[caption] = t.clone(valId);
              return {
                caption,
                val: t.clone(valId)
              };
            } else if (t.isUnaryExpression(bigExpr)) {
              const arg = explainExpr(bigExpr.argument, fields, true);
              const caption = (0, _generator.default)(bigExpr).code;
              const expr = t.unaryExpression(bigExpr.operator, t.clone(arg.val));
              const valId = path.scope.generateUidIdentifier('dbg');
              path.scope.push({
                id: valId
              });
              path.insertBefore(t.expressionStatement(t.assignmentExpression('=', valId, expr)));
              fields[caption] = t.clone(valId);
              return {
                caption,
                val: t.clone(valId)
              }; // const cnameArg = t.stringLiteral(generate(cclone.argument).code)
              // const isLiteralArg = t.isLiteral(cclone.argument)
              // cclone.argument = argId
              // if (!(isLiteralArg)) {
              //   aditionalFields.push(t.objectProperty(cnameArg, argId))
              // }
              // return { caption: cname, expr: cclone }
            } else if (t.isAssignmentExpression(bigExpr) || t.isUpdateExpression(bigExpr)) path.buildCodeFrameError("Don't change state when assert");

            return {
              caption: (0, _generator.default)(bigExpr).code,
              val: bigExpr
            };
          }
        }

        function transpileCloning() {
          path.get('expression').replaceWith(t.clone(expr.node));
        }

        function transpileCustom() {
          const codes = t.arrayExpression(expr.node.arguments.map(arg => t.stringLiteral((0, _generator.default)(t.clone(arg)).code)));
          const values = t.arrayExpression(expr.node.arguments.map(arg => t.clone(arg)));
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc(), codes, values]);
          path.get('expression').replaceWith(nexpr);
        }

        function calleeLoc() {
          var _loc$start, _loc$start2;

          const loc = callee.node.loc;
          return t.objectExpression([t.objectProperty(t.identifier('filename'), state.filename ? t.stringLiteral(state.filename.replace(state.cwd, '')) : t.identifier('undefined')), t.objectProperty(t.identifier('line'), t.numericLiteral((loc === null || loc === void 0 ? void 0 : (_loc$start = loc.start) === null || _loc$start === void 0 ? void 0 : _loc$start.line) || 0)), t.objectProperty(t.identifier('column'), t.numericLiteral((loc === null || loc === void 0 ? void 0 : (_loc$start2 = loc.start) === null || _loc$start2 === void 0 ? void 0 : _loc$start2.column) || 0))]);
        }
      }

    }
  };
  return visitor;
};

exports.default = _default;
