// Karma configuration
// Generated on Mon Feb 15 2021 17:46:40 GMT+0000 (Greenwich Mean Time)

const path = require('path');

process.env.CHROME_BIN = require('puppeteer').executablePath();
const coverage = process.argv.indexOf('--no-coverage') < 0;

const reporters = ['progress', 'kjhtml'];

// webpack rules
const rules = [{ test: /\.ts$|.tsx$/, use: [{ loader: 'ts-loader', options: { configFile: 'tsconfig.json' } }] }];

/**
 * If --no-coverage is passed then we do not add any coverage reports or coverage instrumentation
 * This means that the tests are much easier to debug as coverage instrumentation alters the code
 */
if (coverage) {
    reporters.push('coverage-istanbul');

    rules.push({
        test: /\.ts$|.tsx$/,
        use: [
            {
                loader: 'istanbul-instrumenter-loader',
                options: { esModules: true },
            },
        ],
        enforce: 'post',
        include: path.resolve('src'),
        exclude: /\.spec.ts$/,
    });
}

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        client: {
            // needed to allow kjhtml output to appear in browser
            clearContext: false,
        },

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'source-map-support'],

        // list of files / patterns to load in the browser
        files: [path.join('src', 'test.ts')],

        // list of files / patterns to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '**/*.ts': ['webpack', 'sourcemap'],
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters,

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        coverageIstanbulReporter: {
            reports: ['html', 'text-summary', 'cobertura'],
            dir: path.join(__dirname, 'coverage'),
            fixWebpackSourcePaths: true,
        },

        webpack: {
            mode: 'development',
            module: {
                rules,
            },
            devtool: 'inline-source-map',
            resolve: {
                extensions: ['.ts', '.js', '.tsx'],
            },
        },
    });
};
