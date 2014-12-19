module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    //CONCAT
    concat: {
      options: {separator : ';' },
      dist: {
        src: [
          'public/bower_components/jquery/dist/jquery.js',
          "public/bower_components/angular/angular.js",
          "public/bower_components/angular-foundation/mm-foundation-tpls.js",
          "public/js/you_play.js",
          "public/js/main.js"
        ],
        dest: 'dist/app.js'
      },
      styles: {
          src: ['public/bower_components/foundation/css/normalize.css', 'public/bower_components/foundation/css/foundation.css'],
          dest: 'dist/app.css'
      }
    },
    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/app.min.js': ['dist/app.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'dist/index.html': ['public/index.html']
        }
      }
    }

  });
  
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.loadNpmTasks('grunt-processhtml');
  
  grunt.registerTask('dist', ['processhtml', 'concat', 'uglify']);
    
}
