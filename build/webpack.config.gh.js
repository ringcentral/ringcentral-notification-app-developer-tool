/**
 * webpack config for github pages build
 */

require('dotenv').config()
const { identity } = require('lodash')
const { resolve } = require('path')
const { LoaderOptionsPlugin } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const extractTextPlugin1 = new MiniCssExtractPlugin({
  filename: 'css/[name].styles.bundle.css'
})
const {
  pugIndex
} = require('./pug')
const stylusSettingPlugin = new LoaderOptionsPlugin({
  test: /\.styl$/,
  stylus: {
    preferPathResolver: 'webpack'
  },
  'resolve url': false
})
const config = {
  mode: 'production',
  entry: {
    app: resolve(__dirname, '../src/client/app.js'),
    index: resolve(__dirname, '../src/server/views/index.pug')
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.json']
  },
  output: {
    path: resolve(__dirname, '../docs'),
    filename: 'js/[name].bundle.js',
    publicPath: '/',
    chunkFilename: 'js/[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              // publicPath: '../'
            }
          },
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
              // modifyVars: theme
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|svg|mp3)$/,
        use: ['url-loader?limit=100000&name=images/[name].[ext]']
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /index\.pug$/,
        use: [
          'file-loader?name=index.html',
          'concat-loader',
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              attributes: false
            }
          },
          pugIndex
        ]
      }
    ]
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin()
    ]
  },
  plugins: [
    extractTextPlugin1,
    stylusSettingPlugin
  ].filter(identity)
}

module.exports = config
