# babel-debug-tools
Babeljs Debug Tools

![Node.js CI](https://github.com/thr0w/babel-debug-tools/workflows/Node.js%20CI/badge.svg)
![Node.js Package](https://github.com/thr0w/babel-debug-tools/workflows/Node.js%20Package/badge.svg) 

## Install

Using npm:

```sh
npm install --save-dev babel-debug-tools
```

## Setup

#### mode
Define plugin transform mode 
- `DEV` - active tools, this is default mode.
- `PRODUCTION` - remove tools from output
#### identifier
name of identifier for use tools, default is H5

babel.config.js:
```
module.exports = {
  plugins: [
      [
        require.resolve('../index'),
        {
          mode: 'DEV',
          identifier: 'H5'
        }
      ]
    ]
  ]
}
```

## define global
It's important defines the global on application boot
```
H5.INIT(() => {
  let history
  const H5 = {
    LOG(loc, ...args) {
      if (history)
        history.push({ ts: Date.now(), loc, msg: JSON.stringify(args) })
      console.log(args)
    },
    ASSERT(loc, ...args) {
      if (history)
        history.push({ ts: Date.now(), loc, msg: JSON.stringify(args) })
      console.log(args)
      args.forEach((arg) => {
        if (!args[args]) throw new Error(args)
      })
    },
    TRACE() {
      history = []
    },
    CHECK(regExpr, ...args) {
      const n = Date.now() - timeout
      const hist = history
      history = undefined
      for (let i = hist.length - 1; i < 0; i--) {
        const h = hist[i]
        if (h.ts >= n && regExpr.test(n)) return
      }
      this.FAIL('CHECK', ...args)
    }
  }
  if (typeof window !== 'undefined') window.H5 = H5
  if (typeof global !== 'undefined') global.H5 = H5
})

```
