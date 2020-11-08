"use strict";

var path = _interopRequireWildcard(require("path"));

var babel = _interopRequireWildcard(require("@babel/core"));

var _jestFileSnapshot = require("jest-file-snapshot");

var _DEBUG = require("../DEBUG");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

expect.extend({
  toMatchFile: _jestFileSnapshot.toMatchFile
});
const configs = {
  production: {
    plugins: [[require.resolve('../index'), {
      mode: 'production'
    }]]
  },
  development: {
    plugins: [[require.resolve('../index'), {
      mode: 'development'
    }]]
  },
  self: {
    plugins: [[require.resolve('../index')]]
  },
  bhaskara: {
    plugins: [[require.resolve('../index'), {
      mode: 'development',
      identifier: 'BHASKARA'
    }]]
  }
};
describe('babel-debug-tools', () => {
  describe('LOG', () => {
    it('production', () => {
      _DEBUG.DEBUG.RESET();

      const {
        code,
        output
      } = transform('LOG', 'production');
      expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
      expect(code).toMatchFile(output);
    });
    it('development', () => {
      _DEBUG.DEBUG.RESET();

      const {
        code,
        output
      } = transform('LOG', 'development');
      expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
      expect(code).toMatchFile(output);
    });
  });
  describe('ASSERT', () => {
    it('production', () => {
      _DEBUG.DEBUG.RESET();

      const {
        code,
        output
      } = transform('ASSERT', 'production');
      expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
      expect(code).toMatchFile(output);
    });
    it('development', () => {
      _DEBUG.DEBUG.RESET();

      const {
        code,
        output
      } = transform('ASSERT', 'development');
      expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
      expect(code).toMatchFile(output);
    });
  });
  describe('TRACE', () => {
    it('production', () => {
      _DEBUG.DEBUG.RESET();

      const {
        code,
        output
      } = transform('TRACE', 'production');
      expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
      expect(code).toMatchFile(output);
    });
    it('development', () => {
      _DEBUG.DEBUG.RESET();

      const {
        code,
        output
      } = transform('TRACE', 'development');
      expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
      expect(code).toMatchFile(output);
    });
  });
  describe('sampleProject', () => {
    describe('BHASKARA transformation', () => {
      it('lib', () => {
        _DEBUG.DEBUG.RESET();

        const {
          code,
          output
        } = transformfile('bhaskara', path.join(__dirname, '../..', 'sampleProject/src/bhaskara.js'), path.join(__dirname, '../__fixtures__/bhaskara/bhaskara.output.js'));
        expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
        expect(code).toMatchFile(output);
      });
      it('test', () => {
        _DEBUG.DEBUG.RESET();

        const {
          code,
          output
        } = transformfile('bhaskara', path.join(__dirname, '../..', 'sampleProject/src/bhaskara.test.js'), path.join(__dirname, '../__fixtures__/bhaskara/bhaskara.test.output.js'));
        expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
        expect(code).toMatchFile(output);
      });
    });
    describe('self transformation', () => {
      it('lib', () => {
        _DEBUG.DEBUG.RESET();

        const {
          code,
          output
        } = transformfile('self', path.join(__dirname, '../index.ts'), path.join(__dirname, '../__fixtures__/self/development.index.output.js'), 'development');
        expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
        expect(code).toMatchFile(output);
      });
      it('test', () => {
        _DEBUG.DEBUG.RESET();

        const {
          code,
          output
        } = transformfile('self', path.join(__dirname, './index.test.ts'), path.join(__dirname, '../__fixtures__/self/development.index.test.output.js'), 'development');
        expect(_DEBUG.DEBUG.HISTORY()).toMatchFile(output + '.history');
        expect(code).toMatchFile(output);
      });
    });
  });
});

function transform(test, config) {
  return transformfile(config, path.join(__dirname, '..', '__fixtures__', test, 'code.js'), path.join(__dirname, '..', '__fixtures__', test, config + '.output.js'));
}

function transformfile(config, input, output, forceEnv) {
  const bkpend = process.env.NODE_ENV;
  if (forceEnv) process.env.NODE_ENV = forceEnv;

  try {
    const gen = babel.transformFileSync(input, configs[config]);
    return {
      code: gen?.code || '',
      output
    };
  } finally {
    if (forceEnv) process.env.NODE_ENV = bkpend;
  }
}