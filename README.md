# babel-debug-tools
Babeljs Debug Tools helps you insert debug code and easely remove it when deploy to production

![Node.js CI](https://github.com/thr0w/babel-debug-tools/workflows/Node.js%20CI/badge.svg)

### LOG
Similar to console.log but logs also identifiers and source code position
```javascript
// app.js
function sum(a,b) {
  H5.LOG(a,b);
  → console.log('a='+ a, 'b='+ b, ' at app.js:2:3');
  return a+b;
}
```
### ASSERT
Similar to assert but logs also identifier and source code position
```javascript
// app.js
function sum(a,b) {
  H5.ASSERT(a>0,b>0)
  → if (!(a>0)) throw new Error('assert a>0 at app.js:2:3');
  → if (!(b>0)) throw new Error('assert b>0 at app.js:2:3');
  return a+b
}
```
### TRACE and CHECK
Useful for test local variables on test units. It's not for production mode.
```javascript
// lib.js
function quadraticEquation(a,b,c) {
  const delta = b*b - 4*a*c; ← b² – 4ac
  H5.TRACE(a, b, c, delta)
  → tracelog.push('a=' +a + ' b=' + b +' c=' + c + ' delta=' + delta);
  if (delta<0) return null
  const x1 = (-b + sqrt(delta)) / (2*a)
  const x2 = (-b - sqrt(delta)) / (2*a)
  return {x1, x2}
}
// test.js
it(()=>{
  H5.TRACE() 
  → tracelog = [] // traceLog is a global
  const result = quadraticEquation(1, 8, -9) // x² + 8x - 9 = 0
  const deltaWasTraced = H5.CHECK(/delta=100/} 
  → const deltaWasTraced = traceLog.some(l=>/delta=100/.test(l)))
  except(deltaWasTraced).toBe(true)
  ...
})
```
## Install

Using npm:
```sh
npm install --save-dev babel-debug-tools
```

## Setup

babel.config.js:
```javascript
module.exports = {
  plugins: [
      [
        require.resolve('babel-plugin-debug-tools'),
        {
          mode: 'DEV',
          identifier: 'H5'
        }
      ]
    ]
  ]
}
```

##### mode
Define plugin transform mode 
- `development` or `test` - activate tools, this is default mode.
- `production` - remove debug tools from output
##### identifier
name of identifier for use tools, default is H5

### define global
It's important defines the global on application boot
```javascript
H5.INIT(() => {
  let traceLog;
  const H5 = {
    LOG(loc, ...args) {
      console.log.apply(console, formatArgs(loc, args));
    },
    ASSERT(loc, ...args) {
      args.forEach((arg) => {
        if (!args[1]) throw new Error('ASSERT FAIL: ' + arg[0] + ' at ' + formatLoc(loc));
      });
    },
    TRACE(...args) {
      if (args.length)
        traceLog.push(args.join(' '));
      else
        traceLog = [];
    },
    CHECK(regExp) {
      return traceLog.some(l => regExp.test(l))
    }
  }
  if (typeof window !== 'undefined') window.H5 = H5;
  if (typeof global !== 'undefined') global.H5 = H5;
  function formatLoc(loc) {
    return (loc.filename || '') + ':' + loc.line + ':' + loc.column + ' ';
  }
  function formatArgs(loc, args) {
    const flatArgs = []
    args.forEach((arg) => {
      if (Array.isArray(args) && args.length == 2) {
        flatArgs.push(arg[0])
        flatArgs.push(arg[1])
      }
      else flatArgs.push(arg)
    })
    flatArgs.push(formatLoc(loc))
    return flatArgs
  }
});
```
