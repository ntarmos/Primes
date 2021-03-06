'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Remove built directory
    clean: {
      build: ['build/']
    },

    // Build the site using grunt-includes
    includes: {
      build: {
        cwd: 'site',
        src: [ '**/*.html', '**/*.php' ],
        dest: 'build/',
        options: {
          flatten: false,
          includePath: [ 'include', 'site/js', 'site/css' ]
        }
      }
    },

    copy: {
      main: {
         files: [
            {expand: true, cwd: 'site', src: ['**/*.{jpg,gif,png,pdf,ico,xml,css,js,json,otf,eot,svg,ttf,woff,woff2}'], dest: 'build/'}
         ]
      }
    },

   sitemap: {
      dist: {
         siteRoot: 'build',
         pattern: ['build/**/*.{html,pdf,png,jpg,gif}', '!build/**/google*.html'],
         extension: {
            required: false
         }
      }
   },

   htmlmin: {
      dist: {
         options: {
            removeComments: true,
            collapseWhitespace: true,
            keepClosingSlash: true
         },
         files: [{
            expand: true,
            cwd: 'build',
            src: '*.html',
            dest: 'build'
         }]
      }
   },

   'json-minify': {
      build: {
         files: 'build/**/*.json'
      }
   },

   rsync: {
      options: {
         args: ['--delete', '-lOcvz'],
         exclude: ['shared'],
         recursive: true,
         ssh: true
      },
      primes: {
         options: {
            src: './build/',
            dest: '/var/www/html',
            host: '130.209.251.163'
         }
      },
      ideas: {
         options: {
            src: './build/',
            dest: '/var/www/PRIMES',
            host: '130.209.251.166'
         }
      },
      test: {
         options: {
            src: './build/',
            dest: '/var/www/html/test',
            host: '130.209.251.163'
         }
      }
   },

   exec: {
      mailgunPhp: {
         cwd: './build/',
         command: 'bash ../tools/vendor-setup.sh'
      }
   },

   'string-replace': {
      mailgunAuth: {
         files: [{
            expand: true,
            cwd: './site/',
            src: '**/mailgun-init.php',
            dest: './build/'
         }],
         options: {
            replacements: [{
               pattern: 'XXXMAILGUNSECRETSXXX',
               replacement: grunt.file.read('./secrets')
            }]
         }
      }
   }

  });

  // Load plugins used by this task gruntfile
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-sitemap');
  grunt.loadNpmTasks('grunt-json-minify');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-string-replace');

  // Task definitions
  grunt.registerTask('build', ['clean', 'includes', 'copy', 'sitemap', 'mailgun']);
  grunt.registerTask('jsonmin', ['json-minify']);
  grunt.registerTask('deploy', ['build', 'htmlmin', 'jsonmin', 'rsync:primes']);
  grunt.registerTask('testing', ['build', 'htmlmin', 'jsonmin', 'rsync:test']);
  grunt.registerTask('mailgun', ['exec:mailgunPhp', 'string-replace:mailgunAuth']);
  grunt.registerTask('default', ['build']);
};
