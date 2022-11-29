import { nodeResolve } from "@rollup/plugin-node-resolve";
import minify from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  plugins: [nodeResolve(), minify({ iife: { dest: "dist/spreadsheet_tetris.min.js" } })],
  output: {
    file: "dist/spreadsheet_tetris.js",
    format: "iife",
    name: "spreadsheet_tetris",
    extend: true,
  },
};
