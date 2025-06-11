import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-only';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'react-graph-js/Graph.jsx',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled', presets: ['@babel/preset-react'] }),
    css({ output: 'dist/styles.css' }),
    terser(),
  ],
  external: ['react'],
};