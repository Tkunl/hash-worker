const path = require('path')

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      fs: false,
      path: false,
      'fs/promises': false,
      worker_threads: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    fs: 'commonjs fs',
    path: 'commonjs path',
    'fs/promises': 'commonjs fs/promises',
    worker_threads: 'commonjs worker_threads',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8890,
    historyApiFallback: true,
  },
}
