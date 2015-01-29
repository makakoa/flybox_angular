'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: ['Gruntfile.js', 'server.js', 'routes/**.js', 'models/**.js', 'test/**tests.js', 'app/**/*.js', 'lib/**.js']
    },

    jscs: {
      options: {
        config: '.jscsrc'
      },
      src: ['Gruntfile.js', 'server.js', 'routes/**.js', 'models/**.js', 'test/**tests.js', 'app/**/*.js', 'lib/**.js']
    },

    simplemocha: {
      src: ['test/api/user_tests.js', 'test/api/account_tests.js', 'test/api/box_tests.js', 'test/api/socket_tests.js']
    },

    clean: {
      dev: {
        src: ['build/']
      }
    },

    copy: {
      dev: {
        cwd: 'app/',
        expand: true,
        src: ['**/*.html', '**/*.css', 'img/**'],
        dest: 'build/'
      }
    },

    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'build/CSS/main.css': 'app/sass/main.sass',
          'build/CSS/login.css': 'app/sass/login.sass',
          'build/CSS/spa.css': 'app/sass/spa.sass',
          'build/CSS/box.css': 'app/sass/box.sass',
          'build/CSS/account.css': 'app/sass/account.sass',
          'build/CSS/compose.css': 'app/sass/compose.sass',
          'build/CSS/inbox.css': 'app/sass/inbox.sass',
          'build/CSS/textAngular.css': 'bower_components/textAngular/src/textAngular.css'
        }
      }
    },

    browserify: {
      dev: {
        src: ['app/js/**/*.js'],
        dest: 'build/client_bundle.js',
        options: {
          transform: ['debowerify']
        }
      },

      test: {
        src: ['test/client/**/*.js'],
        dest: 'test/angular_testbundle.js',
        options: {
          transform: ['debowerify']
        }
      }
    },

    express: {
      options: {
        output: 'listening'
      },
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },

    watch: {
      sass: {
        files: 'app/sass/*',
        tasks: 'sass'
      },
      express: {
        files: 'server.js',
        tasks: 'express:dev',
        options: {
          spawn: false
        }
      },
      js: {
        files: ['app/**/*.js', 'app/**/*.html'],
        tasks: 'build'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.config.js'
      },
      continuous: {
        configFile: 'karma.config.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    }
  });

  grunt.registerTask('default', ['test:all']);
  grunt.registerTask('test', ['jshint', 'jscs', 'simplemocha', 'build:test', 'karma']);
  grunt.registerTask('test:api', ['jshint', 'jscs', 'simplemocha']);
  grunt.registerTask('test:client', ['jshint', 'jscs', 'build:test', 'karma']);
  grunt.registerTask('build:test', ['clean:dev', 'copy:dev', 'sass', 'browserify:test']);
  grunt.registerTask('build', ['jshint', 'jscs', 'clean:dev', 'copy:dev', 'sass', 'browserify:dev']);
  grunt.registerTask('serve', ['build:dev', 'express:dev', 'watch']);
};
