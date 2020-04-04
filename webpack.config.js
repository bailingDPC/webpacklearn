/*
    四个核心概念：
        1. 入口(entry)
        2. 输出(output)
        3. loader
        4. 插件(plugins)
*/

let path = require('path');
let htmlWebpackPlugin = require("html-webpack-plugin");
let {CleanWebpackPlugin} = require('clean-webpack-plugin');
let webpack = require('webpack');

const ASSET_PATH = process.env.ASSET_PATH || "/";

const config = {
    //构建目标， 默认是 web
    // target: 'node',

    /*
        模式
    通过选择 development 或 production 之中的一个，来设置 mode 参数，
    你可以启用相应模式下的 webpack 内置的优化
    选项            描述
    development     会将 process.env.NODE_ENV 的值设为 development。
                    启用 NamedChunksPlugin
                        NamedModulesPlugin。

    production      会将 process.env.NODE_ENV 的值设为 production。
                    启用    FlagDependencyUsagePlugin,
                            FlagIncludedChunksPlugin,
                            ModuleConcatenationPlugin,
                            NoEmitOnErrorsPlugin,
                            OccurrenceOrderPlugin,
                            SideEffectsFlagPlugin,
                            UglifyJsPlugin.
    记住，只设置 NODE_ENV，则不会自动设置 mode。
    在配置中提供mode选项， ############  或者从 CLI参数传递

*/
    mode: "development",
    // development: cheap-module-eval-source-map
    // production: cheap-module-source-map
    devtool: process.env.NODE_env === "production"
        ? "cheap-module-source-map"
        : "cheap-module-eval-source-map",
    /**
     * @source  entry

    入口起点(entry point)指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始。
    进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。
    每个依赖项随即被处理，最后输出到称之为 bundles 的文件中，我们将在下一章节详细讨论这个过程。
    可以通过在 webpack 配置中配置 entry 属性，来指定一个入口起点（或多个入口起点）。默认值为 ./src。
    接下来我们看一个 entry 配置的最简单例子：

    单个入口(简写)语法
    entry: string | Array<string>
    当你向 entry 传入一个数组时会发生什么？向 entry 属性传入「文件路径(file path)数组」将创建“多个主入口(multi-main entry)”。在你想要多个依赖文件一起注入，
    并且将它们的依赖导向(graph)到一个“chunk”时，传入数组的方式就很有用。

    当你正在寻找为「只有一个入口起点的应用程序或工具（即 library）」快速设置 webpack 配置的时候，这会是个很不错的选择。
    然而，使用此语法在扩展配置时有失灵活性。

    对象写法
    entry: {[entryChunkName: string]: string| Array<string>}
    对象语法会比较繁琐。然而，这是应用程序中定义入口的最可扩展的方式。
    “可扩展的 webpack 配置”是指，可重用并且可以与其他配置组合使用。
    这是一种流行的技术，用于将关注点(concern)从环境(environment)、构建目标(build target)、运行时(runtime)中分离。
    然后使用专门的工具（如 webpack-merge）将它们合并。

     // entry: './src/js/index.js',
  * **/
    entry: {
        index: "./src/js/index.js",
        content: "./src/js/header.js",
    },

    /*
         常见场景: 分离应用程序(app) 和 第三方库( vendor )入口
         这是什么？从表面上看，这告诉我们 webpack 从 app.js 和 vendors.js 开始创建依赖图(dependency graph)。这些依赖图是彼此完全分离、互相独立的（每个 bundle 中都有一个 webpack 引导(bootstrap)）。
         这种方式比较常见于，只有一个入口起点（不包括 vendor）的单页应用程序(single page application)中。

         为什么？此设置允许你使用 CommonsChunkPlugin 从「应用程序 bundle」中提取 vendor 引用(vendor reference) 到 vendor bundle，
         并把引用 vendor 的部分替换为 __webpack_require__() 调用。如果应用程序 bundle 中没有 vendor 代码，那么你可以在 webpack 中实现被称为长效缓存的通用模式。
     */

    /*
        常见场景: 多页面应用程序
        这是什么？我们告诉 webpack 需要 3 个独立分离的依赖图（如上面的示例）。

        为什么？在多页应用中，（译注：每当页面跳转时）服务器将为你获取一个新的 HTML 文档。
        页面重新加载新文档，并且资源被重新下载。然而，这给了我们特殊的机会去做很多事：

        使用 CommonsChunkPlugin 为每个页面间的应用程序共享代码创建 bundle。
        由于入口起点增多，多页应用能够复用入口起点之间的大量代码/模块，从而可以极大地从这些技术中受益。

            根据经验：每个 HTML 文档只使用一个入口起点。
    */

    /**
     * @source : output  输出
     * **/
    /*
        配置output属性的最低要求是： 将它的值设置为一个对象，包括一下两点：
            1.filename 用于输出文件的文件名
            2.目标输出目录的path 的绝对路径
    */
    /*
        output: {
            filename: 'bundle.js',
            path: '/home/proj/public/assets'
        },//此配置将一个单独的bundle.js 文件输出到 /home/proj/public/assets 目录中
     */
    /*
        多个入口起点
        entry: {
            app: './src/app.js',
            search: './src/search.js'
        },
        output:{
            filename: '[name].js',
            path: __dirname + '/dist'
        }
    */
    /*
        output 属性告诉 webpack 在哪里输出它所创建的 bundles，以及如何命名这些文件，默认值为 ./dist。
        基本上，整个应用程序结构，都会被编译到你指定的输出路径的文件夹中。你可以通过在配置中指定一个 output 字段，来配置这些处理过程：

        在下面的示例中，我们通过 output.filename 和 output.path 属性，
        来告诉 webpack bundle 的名称，以及我们想要 bundle 生成(emit)到哪里。
        可能你想要了解在代码最上面导入的 path 模块是什么，它是一个 Node.js 核心模块，用于操作文件路径。
    */
    /*
        高级进阶
            output: {
                path: '/home/proj/cdn/assetss/[hash]',
                publicPath: 'http://cdn.example.com/assets/[hash]/'
            }
        在编译时不知道最终输出文件的 publicPath 的情况下，publicPath 可以留空，并且在入口起点文件运行时动态设置。
        如果你在编译时不知道 publicPath，你可以先忽略它，并且在入口起点设置 __webpack_public_path__。

            __webpack_public_path__ = myRuntimePublicPath
            剩余的应用程序入口
    */
    output: {
        // filename: "main.js",
        // publicPath: "./",
        path: path.resolve(__dirname, "dist")
    },


    /**
     * @source : loader
     * **/
    /*
        loader
        loader 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）。
        loader 可以将所有类型的文件转换为 webpack 能够处理的有效模块，然后你就可以利用 webpack 的打包能力，对它们进行处理。
        本质上，webpack loader 将所有类型的文件，转换为应用程序的依赖图（和最终的 bundle）可以直接引用的模块。

        在更高层面，在 webpack 的配置中 loader 有两个目标：
            1. test 属性，用于标识出应该被对应的 loader 进行转换的某个或某些文件。
            2. use 属性，表示进行转换时，应该使用哪个 loader。

        下面配置中，对一个单独的 module 对象定义了 rules 属性，里面包含两个必须属性：test 和 use。
        这告诉 webpack 编译器(compiler) 如下信息：
            “嘿，webpack 编译器，当你碰到「在 require()/import 语句中被解析为 '.txt' 的路径」时，
            在你对它打包之前，先使用 raw-loader 转换一下。”

        重要的是要记得，在 webpack 配置中定义 loader 时，要定义在 module.rules 中，而不是 rules。
        然而，在定义错误时 webpack 会给出严重的警告。为了使你受益于此，如果没有按照正确方式去做，webpack 会“给出严重的警告”
    */
    /*
        使用loader, 在应用程序中， 有三种使用loader的方式
            1.配置（推荐): 在webpack.config.js文件中指定 loader.
            2.内联: 在每个 import 语句中显示指定loader.
                可以在 import 语句或任何等效于 "import" 的方式中指定 loader。使用 ! 将资源中的 loader 分开。分开的每个部分都相对于当前目录解析。

                import Styles from 'style-loader!css-loader?modules!./styles.css';
                通过前置所有规则及使用 !，可以对应覆盖到配置中的任意 loader。

                选项可以传递查询参数，例如 ?key=value&foo=bar，或者一个 JSON 对象，例如 ?{"key":"value","foo":"bar"}。
                    尽可能使用 module.rules，因为这样可以减少源码中的代码量，并且可以在出错时，更快地调试和定位 loader 中的问题。
            3.CLI: 在sell命令中指定它们。
                webpack --module-bind jade-loader --module-bind 'css=style-loader!css-loader'
                这会对 .jade 文件使用 jade-loader，对 .css 文件使用 style-loader 和 css-loader。
    */
    /*
        loader 特性
            1. loader 支持链式传递。能够对资源使用流水线(pipeline)。一组链式的 loader 将按照相反的顺序执行。loader 链中的第一个 loader 返回值给下一个 loader。在最后一个 loader，返回 webpack 所预期的 JavaScript。
            2. loader 可以是同步的，也可以是异步的。
            3. loader 运行在 Node.js 中，并且能够执行任何可能的操作。
            4. loader 接收查询参数。用于对 loader 传递配置。
            5. loader 也能够使用 options 对象进行配置。
            6. 除了使用 package.json 常见的 main 属性，还可以将普通的 npm 模块导出为 loader，做法是在 package.json 里定义一个 loader 字段。
            7. 插件(plugin)可以为 loader 带来更多特性。
            8. loader 能够产生额外的任意文件。

        解析 loader
        loader 遵循标准的模块解析。多数情况下，loader 将从模块路径（通常将模块路径认为是 npm install, node_modules）解析。
        loader 模块需要导出为一个函数，并且使用 Node.js 兼容的 JavaScript 编写。通常使用 npm 进行管理，但是也可以将自定义 loader 作为应用程序中的文件。
        按照约定，loader 通常被命名为 xxx-loader（例如 json-loader）。
    */
    module: {
        rules: [
            {
                test: /\.(jpg|png|gif|jpeg)$/,
                use: {
                    // loader: "file-loader",
                    // options: {
                    //     outputPath: "./images",
                    //     name: "[name].[ext]"
                    // },
                    loader: "url-loader",
                    options: {
                        outputPath: "./images",
                        name: "[name].[ext]",
                        limit: 2048 //小于2048子节的就解析为base64格式， 大于就打包成文件
                    }
                }
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    'style-loader',
                    //得到css-loader解析的css的内容之后， 将其挂载到html的标签中间
                    // 'css-loader',       //分析几个css文件之间的关系， 最后合并为一段css
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2, //通过import 语法引入的文件， 也要走下面的两个loader
                        }
                    },
                    'sass-loader',      //loader 的执行顺序是从下到上的
                    'postcss-loader'    //最先执行一次 postcss-loader
                ]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        outputPath: "./font",
                        name: "[name].[ext]"
                    }
                }
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {    // 可将该部分内容单独写入.babelrc文件内，减少webpack.config.js文件的复杂度
                    presets: [
                        [
                            "@babel/preset-env",
                            {
                                // useBuiltIns: "usage",
                                targets: {
                                    chrome: "58",
                                    edge: "17",
                                    safari: "11.1",
                                    // ie: "6",
                                }
                            }
                        ]
                    ],
                    "plugins": [
                        "@babel/plugin-syntax-dynamic-import", //动态引入插件
                    ]
                },
                // options: {
                //     "plugins": [
                //         [
                //             "@babel/plugin-transform-runtime",
                //             {
                //                 "absoluteRuntime": false,
                //                 "corejs": 2,
                //                 "helpers": true,
                //                 "regenerator": true,
                //                 "useESModules": false,
                //             }
                //         ]
                //     ]
                // }
            }
        ]
    },
    /*
        plugins  插件
        loader 被用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。
        插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量。
        插件接口功能极其强大，可以用来处理各种各样的任务。
        想要使用一个插件，你只需要 require() 它，然后把它添加到 plugins 数组中。
        多数插件可以通过选项(option)自定义。你也可以在一个配置文件中因为不同目的而多次使用同一个插件，
        这时需要通过使用 new 操作符来创建它的一个实例。
    */
    plugins: [
        new htmlWebpackPlugin({
            template: "./src/html/index.html",
            filename: "index.html",
            chunks: ["index"],
        }),
        new htmlWebpackPlugin({
            template: "./src/html/ChineseNationalFlag.html",
            filename: "content.html",
            chunks: ["content"]
        }),
        new CleanWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.DefinePlugin({
            'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH)
        }),
    ],
    devServer: { //指自己临时搭建一个服务器
        contentBase: "./dist", //服务器的根目录位置
        // host: 'localhost',
        open: true, //运行指令后， 自动打开浏览器浏览器页面
        port: 8080, //定义监听的端口
        inline: true,
        hot: true, // 开启hot module replacement 功能
        hotOnly: true, //即便 HMR 不生效，浏览器也不会刷新
    },
    optimization: {
        usedExports: true,  // tree Shaking  //使用了的方法才打包
        splitChunks: { //webpack自助将代码分割  code splitting
            chunks: "all",
            // 针对不同的打包方式实现代码分割， 有all async initial(同步代码) 三种
            // 异步的直接分割即可,异步分割的CacheGroups的配置如上图
            // 但是如果是同步的话,就会往下继续读取CacheGroups的配置
            minSize: 30000,     //小于这个尺寸的文件, 就不再做文件分割了, 就直接合并的
            // maxSize: 300000, //可配可不配,如果配置了, 比如值为50000, 那么单个被独立出来的引用包如果大于50000就会再次被分割(但是如果这个库是无法拆分的,那么这个maxSize就是没啥用的了)

            minChunks: 1,   //当一个模块被引用了多少次才会被分割, 一般就是1
            maxAsyncRequests: 5,    //最大引用的模块数,webpack在该值设定的上限前会正确打包,后面的就不会再分割了
            maxInitialRequests: 3,  //最大入口文件引用的模块数
            automaticNameDelimiter: "~",//前缀和名字之间的连接符
            name: true, //一般就为true,专门用来标明下面的cacheGroups里面的基本配置是否生效
            cacheGroups: {
                //同步
                vendors: false,
                default: false,
                /*
                cacheGroups基本参数:
                    vendors和default就是两个不同的打包分组,vendors可以指定匹配规则
                    当某个打包的时候,两个规则都符合的时候, 就按priority的值来,谁大按谁的
                    reuseExistingChunk:如果一个模块之前已经被打包了,那么第二次打包的时候,就跳过

                同步导入采用如下配置
                vendors: {
                    test: /[\\/]node_modules[\\/]/, // 判断引入的库是否在 node_modules的目录下， 是的话就进行代码分割打包
                    priority: -10,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                }*/

            }
        }
    },
    /*
    * 配置如何解析模块
    * */
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    externals: {
        lodash: {
            commonjs:"lodash",
            commonjs2: "lodash",
            amd: "lodash",
            root: "_"
        }
    }
};
/*自动化多页面打包
let makePlugins = (config) => {
    let plugins = [
        new CleanWebpackPlugin()
    ];
    Object.keys(config.entry).forEach((key) => {
        plugins.push(
            new htmlWebpackPlugin({
                template: "./src/html/index.html",
                filename: `${key}.html`,
                chunks: [key]
            })
        );
    });
    return plugins;
};
config.plugins = makePlugins(config);
 */
module.exports = config;