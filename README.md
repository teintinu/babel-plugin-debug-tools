# babel-debug-tools
Babeljs Debug Tools helps you insert debug code and easely remove it when deploy to production

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
### TRACE 
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
  H5.RESET() 
  → tracelog = [] // traceLog is a global
  const result = quadraticEquation(1, 8, -9) // x² + 8x - 9 = 0
  const deltaWasTraced = H5.ASSERT(/delta=100/} 
  → const deltaWasTraced = traceLog.some(l=>/delta=100/.test(l)))
  except(deltaWasTraced).toBe(true)
  except(H5.HISTORY()).toBe('a=1 b=8 c=-9 delta=100')
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
          mode: 'development',
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
name of identifier for use with debug tools, default is `H5`

### debug module
You will need a debug module, like that but customized for your needs.

See sample project or DEBUG.ts 

```javascript

let traceLog=[];

export const H5 = {
  LOG(loc, ...args) {
    console.log.apply(console, formatArgs(args, loc));
  },
  ASSERT(loc, ...args) {
    const loc = arguments[0]
    for (let i = 1; i < arguments.length; i++) {
      const arg = arguments[i]
      if (Array.isArray(arg)) {
        if (!arg[1]) throw new Error(
          'ASSERT FAIL: ' + arg[0] + ' at ' + formatLoc(loc) +
          (arg[2] ? JSON.stringify(arg[2]) : '')
        );
      } else {
        if (!traceLog.some(l => arg.test(l)))
          throw new Error('NOT FOUND IN HISTORY: ' + arg.toString() + ' at ' + formatLoc(loc))
      }
    }
  },
  RESET() {
    traceLog = [];
  },
  TRACE(...args) {
    traceLog.push(formatArgs(args));
  },
  HISTORY() {
    return traceLog.join('\n')
  },  
}

function formatLoc(loc) {
  return (loc.filename || '') + ':' + loc.line + ':' + loc.column + ' ';
}
function formatArg(arg) {
  return JSON.stringify(arg)
}
function formatArgs(args, loc) {
  const flatArgs = []
  args.forEach((arg) => {
    if (Array.isArray(args) && args.length == 2) {
      flatArgs.push(arg[0]+': '+formatArg(arg[1]))
    }
    else flatArgs.push(formatArg(arg))
  })
  if (loc)
    flatArgs.push(formatLoc(loc))
  return flatArgs
}

```
