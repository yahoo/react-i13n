// jscs:disable maximumLineLength

const fs = require('fs');
const path = require('path');

module.exports = function (grunt) {
  // autoload installed tasks
  [
    'grunt-atomizer',
    'grunt-contrib-clean',
    'grunt-contrib-connect',
    'grunt-contrib-watch',
    'grunt-webpack'
  ].forEach((packageName) => {
    let moduleTasks = path.resolve(__dirname, '..', 'node_modules', packageName, 'tasks');

    if (!fs.existsSync(moduleTasks)) {
      moduleTasks = path.resolve(process.cwd(), 'node_modules', packageName, 'tasks');
    }

    if (fs.existsSync(moduleTasks)) {
      grunt.loadTasks(moduleTasks);
    } else {
      grunt.log.error(`${moduleTasks} could not be found.`);
    }
  });

  // configurable paths
  const { env } = process;
  const projectConfig = {
    src: 'src',
    functional: 'tests/functional',
    spec: 'tests/spec',
    test_results_dir: grunt.option('test_results_dir') || 'artifacts'
  };

  grunt.initConfig({
    project: projectConfig,
    clean: {
      functional: {
        files: [
          {
            dot: true,
            src: [
              '<%= project.functional %>/main.js',
              '<%= project.functional %>/css/atomic.css',
              '<%= project.functional %>/console.js',
              '<%= project.functional %>/*-functional.js'
            ]
          }
        ]
      }
    },
    // atomizer
    atomizer: {
      // used by functional tests
      functional: {
        files: [
          {
            src: ['<%= project.src %>/*.jsx', 'tests/**/*.jsx'],
            dest: 'tests/functional/css/atomic.css'
          }
        ]
      }
    },
    // webpack
    // create js rollup with webpack module loader for functional tests
    webpack: {
      functional: {
        mode: 'development',
        entry: {
          main: './<%= project.functional %>/bootstrap.js'
        },
        output: {
          path: path.resolve(process.cwd(), projectConfig.functional)
        },
        module: {
          rules: [
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.jsx$/, loader: 'jsx-loader' },
            { test: /\.json$/, loader: 'json-loader' }
          ]
        }
      }
    },
    // connect
    // setup server for functional tests
    connect: {
      functional: {
        options: {
          port: 9999,
          base: ['<%= project.functional %>', '.']
        }
      },
      functionalOpen: {
        options: {
          port: 9999,
          base: ['<%= project.functional %>', '.'],
          open: {
            target: 'http://127.0.0.1:9999/tests/functional/page.html'
          }
        }
      }
    },
    watch: {
      functional: {
        files: ['<%= project.src%>/*.jsx', '<%= project.functional%>/*.jsx', '<%= project.functional%>/*.html'],
        tasks: ['functional-debug']
      }
    },
    'saucelabs-mocha': {
      all: {
        options: {
          // this is apply for open source project https://saucelabs.com/open-source
          username: 'roderick.hsiao',
          key: () => 'a7c8994f-a04b-4d04-808f-1090f5148079',

          testname: 'react-i13n func test',
          urls: ['http://127.0.0.1:9999/tests/functional/page.html'],

          build: process.env.TRAVIS_BUILD_NUMBER,
          sauceConfig: {
            'record-video': true,
            'capture-html': false,
            'record-screenshots': false
          },
          throttled: 3,
          browsers: [
            //             {
            //               browserName: 'edge',
            //               platform: 'Windows 10',
            //               version: '16.16299'
            //             },
            //             {
            //               browserName: 'internet explorer',
            //               platform: 'Windows 10',
            //               version: '11.285'
            //             },
            {
              browserName: 'chrome',
              platform: 'Windows 10',
              version: '73'
            },
            {
              browserName: 'firefox',
              platform: 'Windows 7',
              version: '66'
            }
            //             {
            //               browserName: 'safari',
            //               platform: 'macOS 10.14',
            //               version: '12.0'
            //             }
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-saucelabs');

  // register custom tasks

  // functional
  // 2. run atomizer functional
  // 3. copy files to tests/functional/
  // 4. use webpack to create a js bundle to tests/functional/
  // 5. get local ip address and available port then store in grunt config
  // 6. set up local server to run functional tests
  // 7. run protractor
  grunt.registerTask('functional', [
    'atomizer:functional',
    'webpack:functional',
    'connect:functional',
    'saucelabs-mocha',
    'clean:functional'
  ]);

  // similar to functional, but don't run protractor, just open the test page
  grunt.registerTask('functional-debug', [
    'atomizer:functional',
    'webpack:functional',
    'connect:functionalOpen',
    'watch:functional'
  ]);
};
