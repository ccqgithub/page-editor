var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var PlaceAssetsPlugin = require('html-webpack-place-assets-plugin');
var utils = require('./utils');
var entryConfigs = require('../../config/fe/entry.conf');
var defines = require('../../config/fe/define.conf');
var publicConf = require('../../config/fe/public.conf');
var isProduction = process.env.NODE_ENV === 'production';

// context path
var contextPath = path.resolve(__dirname, '../../fe');

// extract css
var extractCss = isProduction ?
  new ExtractTextPlugin('css/[name].[chunkhash].css') :
  new ExtractTextPlugin('css/[name].css')

// styleLoaders
var styleLoaders = utils.getStyleLoaders({
  extract: isProduction,
  extractPlugin: extractCss
})

// babelLoaderOptions
var babelLoaderOptions = {
  loader: 'babel-loader',
  options: {
    'presets': [
      'react',
      ['env', {
        'targets': {
          'browsers': ['> 1%', 'ie >= 8']
        },
        useBuiltIns: true
      }],
      'stage-3',
    ],
    'plugins': [
      // 'add-module-exports'
    ].concat(
      // react hot loader
      isProduction ? [] : 'react-hot-loader/babel'
    )
  }
}

// hot reload entry
var hotReloadEntry = [
  'webpack-hot-middleware/client?reload=false',
  // 'react-hot-loader/patch',
];

// entrys
var entrys = {
  //
}

entryConfigs.pages.forEach(item => {
  entrys[item.name] = isProduction ?
    item.js :
    hotReloadEntry.concat(item.js);
});

// commonPlugins
var commonPlugins = [
  //
];

entryConfigs.commons.forEach(item => {
  commonPlugins.push(
    new webpack.optimize.CommonsChunkPlugin(item)
  );
});

// htmlPlugins
var htmlPlugins = [
  new PlaceAssetsPlugin({
    headReplaceExp: /<!-- html-webpack-plugin-css -->/,
    bodyReplaceExp: /<!-- html-webpack-plugin-script -->/,
    tagsJoin: '\n  ',
  })
]

entryConfigs.pages.forEach(item => {
  var chunks = ['manifest']
    .concat(
      isProduction ? [] : hotReloadEntry
    )
    .concat(item.commonChunks)
    .concat(item.name);

  htmlPlugins.push(
    new HtmlWebpackPlugin({
      template: item.template,
      filename: item.filename,
      chunks: chunks,
      chunksSortMode: 'dependency', //'dependency',
      inject: false
    })
  )
})

module.exports = {
  context: contextPath,

  entry: entrys,

  cache: false,

  output: {
    path: publicConf.distPath,
    filename: 'js/[name].[hash].js',
    publicPath: publicConf.publicPath,
  },

  resolve: {
    modules: [
      'node_modules',
      path.resolve(contextPath, '../node_modules')
    ],
    extensions: ['.js', '.jsx', '.vue', '.json'],
    alias: {
      //
    }
  },

  module: {
    rules: [
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            attrs: ['img:src'],
            minimize: true,
            removeComments: false,
            collapseWhitespace: false,
            removeAttributeQuotes: false,
            interpolate: 'require',
          }
        }]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: Object.assign({}, styleLoaders, {
            js: [
              babelLoaderOptions
            ]
          })
        }
      },
      {
        test: /\.less$/,
        use: styleLoaders.less
      },
      {
        test: /\.css$/,
        use: styleLoaders.css
      },
      {
        test: /\.scss$/,
        use: styleLoaders.scss
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(contextPath, './src'),
          path.resolve(contextPath, './test')
        ],
        use: [
          babelLoaderOptions
        ]
      },
      {
        test: /\.jsx$/,
        include: [
          path.resolve(contextPath, './src'),
          path.resolve(contextPath, './test')
        ],
        use: [
          babelLoaderOptions
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'imgs/[path][name].[hash].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[path][name].[hash].[ext]'
        }
      }
    ]
  },

  plugins: [
    // new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin(defines),
    extractCss,
  ]
  // named module, the module's id is not number, but hash or path , so the vendor can long cache
  .concat(
    isProduction ?
    new webpack.HashedModuleIdsPlugin({
      hashDigestLength: 4
    }) :
    new webpack.NamedModulesPlugin()
  )
  .concat(htmlPlugins)
  .concat(commonPlugins)
  .concat([
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(contextPath, './root'),
        to: path.resolve(publicConf.distPath),
        ignore: ['.*']
      }
    ])
  ])
  .concat(
    isProduction ?
    [] :
    [
      new webpack.HotModuleReplacementPlugin(),
    ]
  )
  .concat(
    publicConf.compress ?
    [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: !!publicConf.sourceMap
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      })
    ] :
    []
  )
}
