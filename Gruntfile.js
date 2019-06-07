module.exports = function (grunt) {

  grunt.initConfig({
    jshint: {
      build: [
        'js/*.js'
      ],
      options: {jshintrc: '.jshintrc', ignores:[]}
    },
    watch: {
      scripts: {
        files: ['*.html','js/*.js','css/*.css','lib/**/*.js','lib/**/*.css'],
        tasks: ['jshint'],
        options: {
          debounceDelay: 250,
          livereload: true
        },
      },
    },
    clean: ["dist"],
    copy: {
        main: {
            files: [
                {expand: true, src: "index.html", dest: "dist/"},
                {expand: true, src: "map.html", dest: "dist/"},
                {expand: true, src: "js/*", dest: "dist/"},
                {expand: true, src: "css/*", dest: "dist/"},
                {expand: true, src: "resources/**", dest: "dist/"}
            ]
        }
    },
    curl: {
        "dist/resources/data/artists.csv": "https://arcgis.github.io/storymaps-heritage-fellows-data/artists.csv",
        "dist/resources/data/works.csv": "https://arcgis.github.io/storymaps-heritage-fellows-data/works.csv"    
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-curl');
  grunt.registerTask('default', ['jshint','watch']);
  grunt.registerTask('build', ['clean','copy','curl']);
  
};