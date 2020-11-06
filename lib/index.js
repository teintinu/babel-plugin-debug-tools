"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var t = _interopRequireWildcard(require("@babel/types"));

var _generator = _interopRequireDefault(require("@babel/generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
              transpileOthers();
            } else if (property.isIdentifier({
              name: 'TRACE'
            })) transpileLOGorTRACE('TRACE');else if (property.isIdentifier({
              name: 'INIT'
            })) {
              const arg0 = expr.node.arguments[0];
              path.get('expression').replaceWith(t.callExpression(t.clone(arg0), []));
            } else throw path.buildCodeFrameError("Invalid command");
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
          const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()].concat(expr.node.arguments.reduce((prev, curr) => {
            if (t.isRegExpLiteral(curr)) {
              prev.push(t.clone(curr));
            } else {
              const cclone = t.clone(curr);
              const cname = t.stringLiteral((0, _generator.default)(cclone).code);
              const aexpr = t.arrayExpression([cname, cclone]);
              prev.push(aexpr);

              if (t.isBinaryExpression(cclone)) {
                const binExpr = t.objectExpression([]);
                const left = t.clone(cclone.left);
                const cnameleft = t.stringLiteral((0, _generator.default)(left).code);
                if (!t.isLiteral(left)) binExpr.properties.push(t.objectProperty(cnameleft, left));
                const right = t.clone(cclone.right);
                const cnameright = t.stringLiteral((0, _generator.default)(right).code);
                if (!t.isLiteral(right)) binExpr.properties.push(t.objectProperty(cnameright, right));
                aexpr.elements.push(binExpr);
              } else if (t.isUnaryExpression(cclone)) {
                const arg = t.clone(cclone.argument);

                if (!t.isLiteral(arg)) {
                  const cnamearg = t.stringLiteral((0, _generator.default)(arg).code);
                  aexpr.elements.push(t.objectExpression([t.objectProperty(cnamearg, arg)]));
                }
              } else throw path.buildCodeFrameError("unsupported expression");
            }

            return prev;
          }, [])));
          path.get('expression').replaceWith(nexpr);
        }

        function transpileOthers() {
          path.get('expression').replaceWith(t.clone(expr.node));
        }

        function calleeLoc() {
          const loc = callee.node.loc;
          return t.objectExpression([t.objectProperty(t.identifier('filename'), state.filename ? t.stringLiteral(state.filename.replace(state.cwd, '')) : t.identifier('undefined')), t.objectProperty(t.identifier('line'), t.numericLiteral(loc?.start?.line || 0)), t.objectProperty(t.identifier('column'), t.numericLiteral(loc?.start?.column || 0))]);
        }
      }

    }
  };
  return visitor;
};

exports.default = _default;
