const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin') // Чистит выходную директории от старых файлов (dist)
const HTMLWebpackPlugin = require('html-webpack-plugin') // Подключает к html файлу файлы скриптов
const CopyPlugin = require('copy-webpack-plugin') // Предназначен для копирования файлов из папки с исходниками в dist
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // Предназначен для отделения css от js
/*
  __dirname - системная переменная для указания абсолютного пути к текущей директории (excel-projects)
  path.resolve() - метод для конкатенации путей
 */

const isProd = process.env.NODE_ENV === 'production' // проверяем в каком режиме находимся
const isDev = !isProd
const filename = ext => isDev ? `bundle.${ext}`: `bundle.[hash].${ext}`
const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }
  ]
  if (isDev) {
    loaders.push('eslint-loader')
  }
}

module.exports = {
  context: path.resolve(__dirname, 'src'), // Отвечает за то, где находятся все исходные файлы проекта
  mode: 'development', // Режим разработки. По умолчанию режим development, но указываем явно
  entry: ['@babel/polyfill', './index.js'], // Точки входа в приложение. Если их несколько, то entry: {}, когда одна точка, то строка
  output: { // Объект файлов сборки на выходе.
    filename: filename('js'), // Имя файла, в который будут собираться все скрипты
    path: path.resolve(__dirname, 'dist') // Путь к директории где будет хранится сборка проекта
  },
  devtool: isDev ? 'source-map': false,
  resolve: {
    extensions: ['.js'], // подгрузка расширений
    alias: { // сокращения для путей. Например: было ../../../../src/core, стало @core
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core')
    }
  },
  devServer: {
    port: 3000,
    hot: isDev
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: 'index.html',
      minify: {
        removeComments: isProd,
        collapseWhitespace: isProd
      }
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: filename('css')
    })
  ],
  module: {
    rules: [ // Записываем все лоадеры
      {
        test: /\.s[ac]ss$/i, // Тестируем расширения
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      }
    ]
  }
}