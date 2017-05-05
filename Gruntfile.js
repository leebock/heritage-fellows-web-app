'use strict';
var packagejson = require('./package.json');

module.exports = function (grunt) {
 
  // Configuration

  grunt.initConfig({
    pkg: packagejson,
    jshint: {
      build: [
        'js/*.js'
      ],
      options: {jshintrc: '.jshintrc', ignores:[]}
    },
    watch: {
      scripts: {
        files: ['index.html','js/*.js','css/*.css','lib/**/*.js','lib/**/*.css'],
        tasks: ['jshint'],
        options: {
          debounceDelay: 250,
          livereload: true
        },
      },
    }        
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');  
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint','watch']);
  
};