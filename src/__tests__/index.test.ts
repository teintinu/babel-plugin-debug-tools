
import * as path from 'path';
import * as babel from "@babel/core";
import { toMatchFile } from 'jest-file-snapshot';
import { DEBUG } from '../DEBUG'

expect.extend({ toMatchFile });

const configs = {
  production: {
    plugins: [
      [
        require.resolve('../index'),
        {
          mode: 'production'
        }
      ]
    ],
  },
  development: {
    plugins: [
      [
        require.resolve('../index'),
        {
          mode: 'development'
        }
      ]
    ],
  },
  self: {
    plugins: [
      [
        require.resolve('../index')
      ]
    ],
  },
  bhaskara: {
    plugins: [
      [
        require.resolve('../index'),
        {
          mode: 'development',
          identifier: 'BHASKARA'
        }
      ]
    ],
  },
};

describe('babel-debug-tools', () => {

  describe('LOG', () => {
    it('production', () => {
      DEBUG.RESET()
      const { code, output } = transform('LOG', 'production')
      expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
      expect(code).toMatchFile(output)
    })
    it('development', () => {
      DEBUG.RESET()
      const { code, output } = transform('LOG', 'development')
      expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
      expect(code).toMatchFile(output)
    })
  })

  describe('ASSERT', () => {
    it('production', () => {
      DEBUG.RESET()
      const { code, output } = transform('ASSERT', 'production')
      expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
      expect(code).toMatchFile(output)
    })
    it.only('development', () => {
      DEBUG.RESET()
      const { code, output } = transform('ASSERT', 'development')
      expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
      expect(code).toMatchFile(output)
    })
  })

  describe('TRACE', () => {
    it('production', () => {
      DEBUG.RESET()
      const { code, output } = transform('TRACE', 'production')
      expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
      expect(code).toMatchFile(output)
    })
    it('development', () => {
      DEBUG.RESET()
      const { code, output } = transform('TRACE', 'development')
      expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
      expect(code).toMatchFile(output)
    })
  })

  describe('sampleProject', () => {
    describe('BHASKARA transformation', () => {
      it('lib', () => {
        DEBUG.RESET()
        const { code, output } = transformfile(
          'bhaskara',
          path.join(__dirname, '../..', 'sampleProject/src/bhaskara.js'),
          path.join(__dirname, '../__fixtures__/bhaskara/bhaskara.output.js')
        )
        expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
        expect(code).toMatchFile(output)
      })
      it('test', () => {
        DEBUG.RESET()
        const { code, output } = transformfile(
          'bhaskara',
          path.join(__dirname, '../..', 'sampleProject/src/bhaskara.test.js'),
          path.join(__dirname, '../__fixtures__/bhaskara/bhaskara.test.output.js')
        )
        expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
        expect(code).toMatchFile(output)
      })
    })
    describe('self transformation', () => {
      it('lib', () => {
        DEBUG.RESET()
        const { code, output } = transformfile(
          'self',
          path.join(__dirname, '../index.ts'),
          path.join(__dirname, '../__fixtures__/self/development.index.output.js'),
          'development'
        )
        expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
        expect(code).toMatchFile(output)
      })
      it('test', () => {
        DEBUG.RESET()
        const { code, output } = transformfile(
          'self',
          path.join(__dirname, './index.test.ts'),
          path.join(__dirname, '../__fixtures__/self/development.index.test.output.js'),
          'development'
        )
        expect(DEBUG.HISTORY()).toMatchFile(output + '.history')
        expect(code).toMatchFile(output)
      })

    });

  });
});

function transform(test: 'LOG' | 'ASSERT' | 'TRACE', config: keyof typeof configs) {
  return transformfile(
    config,
    path.join(__dirname, '..', '__fixtures__', test, 'code.js'),
    path.join(__dirname, '..', '__fixtures__', test, config + '.output.js')
  )
}

function transformfile(config: keyof typeof configs, input: string, output: string, forceEnv?: string) {
  const bkpend = process.env.NODE_ENV
  if (forceEnv) process.env.NODE_ENV = forceEnv
  try {
    const gen = babel.transformFileSync(input, configs[config]);
    return { code: gen?.code || '', output }
  } finally {
    if (forceEnv) process.env.NODE_ENV = bkpend
  }
}
