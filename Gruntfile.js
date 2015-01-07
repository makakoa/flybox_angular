'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-mongo-drop');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: ['Gruntfile.js', 'server.js', 'app/**/*.js']
    },

    jscs: {
      options: {
        config: '.jscsrc'
      },
      src: ['Gruntfile.js', 'server.js', 'app/**/*.js']
    },

    mongo_drop: {
      test: {
        uri: 'mongodb://localhost/flybox_test'
      }
    },

    simplemocha: {
      src: ['test/api/user_tests.js', 'test/api/box_tests.js']
    }

  });

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'jscs', 'mongo_drop', 'simplemocha']);

};
