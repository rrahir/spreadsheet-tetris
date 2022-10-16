import { nodeResolve } from "@rollup/plugin-node-resolve";
// import git from "git-rev-sync";
// import { version } from "./package.json";

export default {
  input: "src/index.js",
  plugins: [nodeResolve()],
  output: {
    file: "dist/spreadsheet_tetris.js",
    format: "iife",
    name: "spreadsheet_tetris",
    extend: true,
    // globals: { "@odoo/owl": "owl" /*, "chart.js": "chart_js" */ },
    // outro: `exports.__info__.version = '${version}';\nexports.__info__.date = '${new Date().toISOString()}';\nexports.__info__.hash = '${git.short()}';`,
  },
};
