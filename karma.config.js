'use strict';

module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: ['test/angular_testbundle.js'],

    exclude: ['**/*.swp'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: true
  });
};
