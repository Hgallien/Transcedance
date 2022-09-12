const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: "./src/main.ts",

  // bundle files from node_modules
  externals: [nodeExternals(
    {allowlist: ['pong', 'backFrontCommon']}
  )],
  externalsPresets: {
    node: true,
  },

  mode: 'development',

  output: {
    path: path.resolve(__dirname, "build/"),
    filename: "./main.js",
  },

  resolve: {
    extensions: [".ts", ".js"],
    mainFields: ['module', 'main', 'browser'],
  },

  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
    }],
  }
};
