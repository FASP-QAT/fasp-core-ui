const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');
// var enUs = require( 'json-loader!../public/locales/en.json' );
// var en = require('./public/locales/en.json');
// const en = require('./public/locales/en.json');

module.exports = {
    // context: __dirname,
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
        port: 4202,
        historyApiFallback: true,
        compress: true, 
        disableHostCheck: true
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env',
                        '@babel/react', {
                            'plugins': ['@babel/plugin-proposal-class-properties']
                        }]
                }
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    presets: ['@babel/preset-env',
                        '@babel/react', {
                            'plugins': ['@babel/plugin-proposal-class-properties']
                        }]
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ]
            },
            {
                test: /\.(png|jpe?g)$/i,
                // loader: "file-loader?name=/public/assets/img/[name].[ext]"
                // loader: "file-loader"
                use: [{
                    loader: "file-loader",
                    options: {
                        name: '[name].[ext]'
                    }
                }]
            },
            {
                test: /\.(ico)$/i,
                exclude: /node_modules/,
                use: ['file-loader?name=[name].[ext]'] // ?name=[name].[ext] is only necessary to preserve the original file name
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.(html)$/,
                // exclude: /node_modules/,
                loader: 'html-loader'
                // use: [
                //     {
                //         loader: 'html-loader',
                //         options: {
                //             name: "[name].[ext]",
                //         },
                //     },
                // ]
            },
            {
                type: "javascript/auto",
                test: /\.json$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                        },
                    },
                ],
            }
            // {
            //     test: /\.json$/,
            //     // use: [{
            //     use: ['json-loader', 'file-loader', 'raw-loader']
            //     // loader: 'json-loader'
            //     //     options: { name: '[name].[ext]' },
            //     // }],
            // }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, 'src/assets/img/index.html'),
            filename: 'index.html'
        }),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, 'src/ShowGuidanceHtmlFile/ShowGuidanceEn.html'),
            filename: 'ShowGuidanceEn.html'
        }),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, 'src/ShowGuidanceHtmlFile/ShowGuidanceFr.html'),
            filename: 'ShowGuidanceFr.html'
        }),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, 'src/ShowGuidanceHtmlFile/ShowGuidanceSp.html'),
            filename: 'ShowGuidanceSp.html'
        }),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, 'src/ShowGuidanceHtmlFile/ShowGuidancePr.html'),
            filename: 'ShowGuidancePr.html'
        }),
        new WorkboxPlugin.GenerateSW({
            // swSrc: "src/src-sw.js",
            swDest: "faspsw.js",
            maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
            // swSrc: './src/sw.js',
        })
        // new WorkboxPlugin.GenerateSW({
        //     // Do not precache images
        //     // exclude: [/\.(?:png|jpg|jpeg|svg)$/],

        //     // Define runtime caching rules.
        //     runtimeCaching: [{
        //         // Match any request that ends with .png, .jpg, .jpeg or .svg.
        //         urlPattern: /\.(?:png|jpg|jpeg|svg|js|css|scss)$/,

        //         // Apply a cache-first strategy.
        //         handler: 'CacheFirst',

        //         options: {
        //             // Use a custom cache name.
        //             cacheName: 'fasp',

        //             // // Only cache 10 images.
        //             // expiration: {
        //             //     maxEntries: 10,
        //             // },
        //         },
        //     }],
        // })
    ]
};