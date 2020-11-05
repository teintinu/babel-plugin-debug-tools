/* eslint-disable jest/consistent-test-it */

const path = require('path');
const toMatchFile = require('jest-file-snapshot').toMatchFile;
const { create } = require('babel-test');

console.log(toMatchFile)
expect.extend({ toMatchFile });

const configDEV = {
  plugins: [
    [
      require.resolve('../index'),
      {
        mode: 'DEV',
        identifier: 'H5'
      }
    ]
  ],
};
const configProd = {
  plugins: [
    [
      require.resolve('../index'),
      {
        mode: 'PRODUCTION',
        identifier: 'H5'
      }
    ]
  ],
};

describe('babel-debug-tools', () => {

  create(configDEV).test('check-plugin', async ({ transform }) => {
    const { code } = await transform('const foo = 42;', { filename: 'foo.js' });
    expect(code).toBe('const foo = 42;');
  })
  create(configProd).fixtures('Production mode', path.join(__dirname, '..', '__fixtures__/prod'));
  create(configDEV).fixtures('Dev mode', path.join(__dirname, '..', '__fixtures__/dev'));

});

