import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";

const packageJson = require("./package.json");

export default [
  {
    input: "src/EscapingTokenizer.mjs",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        resolveOnly: (module) => module != 'marked'
      }),
      commonjs(),
      terser(),
    ],
  }
]