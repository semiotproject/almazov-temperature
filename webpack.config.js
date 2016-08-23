var path = require('path');
var webpack = require('webpack');
var argv = require('yargs').argv;

var CompressionPlugin = require("compression-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var WebpackErrorNotificationPlugin = require('webpack-error-notification');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var BUILD_CONFIG = {
    entryPoints: {
        main: [
            // you may add any entry point in this place
            'main'
        ]
    },
    devServerPort: 8181,
    distDir: 'dist', // default dir
    srcDir: 'src',
    production: process.env.NODE_ENV === "production",
    app: argv.app
};

if (!BUILD_CONFIG.entryPoints[BUILD_CONFIG.app]) {
    throw new Error(`not found application ${BUILD_CONFIG.app}; do nothing`);
}

var DEFAULT_HOSTNAME = 'localhost';

var targetHost = argv.host || DEFAULT_HOSTNAME;

if (targetHost === DEFAULT_HOSTNAME && !BUILD_CONFIG.production) {
    console.log('*****');
    console.log('*****');
    console.log(`If you want to launch webpack dev server not on localhost, run you command with postfix '-- --host MY_HOST'`);
    console.log('*****');
    console.log('*****');
}
console.log(`Buiding app ${BUILD_CONFIG.app} in ${BUILD_CONFIG.production ? 'production' : 'development'} mode to ${BUILD_CONFIG.distDir}; target host is ${targetHost}`);


var WEBPACK_CONFIG = {

    // where are sources located
    context: path.join(__dirname, BUILD_CONFIG.srcDir),

    // JS entries to bundle; see below
    entry: {},

    // how to process source maps (for production - separate file, does not load when devtool panel is closed)
    devtool: BUILD_CONFIG.production ? "source-map" : "cheap-module-eval-source-map",

    // turn on watch mode
    watch: !BUILD_CONFIG.production,

    // dist configution
    output: {

        // include or not module information in result bundles
        pathinfo: !BUILD_CONFIG.production,

        // bundle file name pattern
        filename: '[name]/index.js',

        // destination directory
        path: path.join(__dirname, BUILD_CONFIG.distDir),

        // makes sense when assets are located in subpath (e. g. `/assest/`)
        publicPath: BUILD_CONFIG.production ? '/' : 'http://' + targetHost + ':' + BUILD_CONFIG.devServerPort + '/'
    },

    // how to handle different `require()` file types
    module: {
        preLoaders: [
            /*{
                test: /\.js$/, loader: 'eslint-loader', exclude: [/node_modules/, /lib/, /dry/]
            }*/
        ],
        loaders: [
            {
                // compile jade
                test: /\.jade$/, loaders: ['jade']
            },
            {
                // inline css to js
                test: /\.css$/, loaders: ['style', 'css', 'autoprefixer?browsers=last 2 version']
            },
            {
                // compile less and inline result to js
                test: /\.less$/, loaders: ['style', 'css', 'autoprefixer?browsers=last 2 version', 'less']
            },
            {
                // compile with babel
                test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: { presets: ['react', 'es2015'] }
            },
            {
                // if file is less than `limit`, it is inlined with dataURL(base64);
                // else it is copying to dist directory with unique filename and is loading from JS on demand
                test: /\.(ttf|eot|svg|woff|png|jpg|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000"
            }
        ]
    },

    // set how `require('module')` should interpret 'module'
    resolve: {
        extensions: ['', '.js'],
        alias: {
            dry: path.join(__dirname, BUILD_CONFIG.srcDir, 'dry'),
            common: path.join(__dirname, BUILD_CONFIG.srcDir, 'common')
        }
    },

    // list of webpack plugins
    plugins: [

        // here goes plugins both for dev and production
        new WebpackErrorNotificationPlugin(),

        // using to build-time variable declaration
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': `"${BUILD_CONFIG.production ? "production" : "development"}"`
        })
    ].concat(

        // for each entry point also bundle it's index.jade
        BUILD_CONFIG.entryPoints[BUILD_CONFIG.app].map((e) => {
            return new HtmlWebpackPlugin({
                filename: './' + path.join(e, 'index.html'),
                template: './' + path.join(e, 'index.html'),
                inject: false
            });
        })

    ).concat(

        BUILD_CONFIG.production ?
            [
                // here goes plugins only for production
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    },
                    output: {
                        comments: false,
                        semicolons: true
                    }
                }),
                new webpack.optimize.OccurrenceOrderPlugin(true)
            ] :
            [
                // here goes plugins only for development
                // nothing yet
            ]
    ),

    // webpack dev server configuration
    devServer: {

        // base files to serve path
        contentBase: path.join(__dirname, BUILD_CONFIG.distDir),

        // http port
        port: BUILD_CONFIG.devServerPort,

        // proxy params
        proxy: {
            // '/ws': {
            //     target: `ws://${targetHost}/`,
            //     ws: true
            // },
            // '/api/v1': {
            //     target: `http://${targetHost}/`
            // }
        }
    }
};

// this is used to allow nested path to bundles (e. g. file is `index.js`, but path is `/apkbg/admin/index.js`)
BUILD_CONFIG.entryPoints[BUILD_CONFIG.app].map((e) => {
    WEBPACK_CONFIG.entry[e] = [
        './' + path.join(e, 'index.js')
    ];
});

module.exports = WEBPACK_CONFIG;
