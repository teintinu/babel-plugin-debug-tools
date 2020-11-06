module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ],
  plugins: [
    ['babel-plugin-debug-tools', { identifier: 'BHASKARA', mode: 'develepment' }]
  ]
};