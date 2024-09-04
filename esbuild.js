#!/usr/bin/env node

const { nodeExternalsPlugin } = require('esbuild-node-externals');

const options = {
  tsconfig: 'tsconfig.json',
  logLevel: "info",
  entryPoints: [
    "src/cli.ts"
  ],
  platform: 'node',
  minify: true,
  bundle: true,
  outfile: "dist/esbuild/cli.js",
  sourcemap: "external",
  plugins: [
    nodeExternalsPlugin({}),
  ],
};

console.debug('Final build config: ', { options });

require("esbuild")
  .build(options)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
