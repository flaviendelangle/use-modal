import { Config } from 'bili'

const config: Config = {
  plugins: {
    babel: false,
    typescript2: {
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
          declarationMap: false,
        },
      },
    },
  },

  input: 'src/index.ts',
  output: {
    format: ['cjs', 'esm'],
  },
}

export default config
