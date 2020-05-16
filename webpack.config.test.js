const path = require('path');
const nodeExternals = require('webpack-node-externals');
const tsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const isCoverage = process.env.NODE_ENV === 'unit_test';

module.exports = {
  devtool: "inline-cheap-module-source-map",
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.ts',
      '.tsx'
    ],
    plugins: [new tsconfigPathsPlugin()]
  },
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  module: {
    rules: [].concat(
      isCoverage ? {
        test: /\.ts(x?)$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          {
            loader: 'istanbul-instrumenter-loader'
          }
        ],
      } : [],
      {
        test: /\.ts(x?)$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      }
    ),
  }
};
