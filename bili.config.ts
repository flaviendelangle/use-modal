import { Config } from 'bili'

const config: Config = {
  plugins: {
    typescript2: {
      useTsconfigDeclarationDir: true,
    },
  },

  input: 'src/index.ts',
  output: {
    format: ['cjs', 'esm', 'cjs-min'],
  },
}

export default config
