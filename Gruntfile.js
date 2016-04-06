module.exports = function (grunt) {

  grunt.initConfig({
      concat :{
        js : {
          src : ['js/app.js','js/app.*.js'],
          dest : 'dist/js/application.js'
        }
      },
      uglify : {
        options: {
            compress: true,
            mangle: true,
            sourceMap: true
        },
        application: {
            src: 'dist/js/application.js',
            dest: 'dist/js/application.min.js'
        },
        lang: {
            src: 'lang/is_IS.js',
            dest: 'dist/js/is_IS.min.js'
        }
      },
      copy: {
        main: {
          files: [
            // Angularjs
            {expand: true, flatten:true, src: ['bower_components/angular/angular.min.*'], dest: 'lib/js/', filter: 'isFile'},

            {expand: true, flatten:true, src: ['bower_components/angular-route/angular-route.min.*'], dest: 'lib/js/', filter: 'isFile'},
            // ui-bootstrap
            {expand: true, flatten:true, src: [
              'bower_components/angular-bootstrap/ui-bootstrap.min.js',
              'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'],
              dest: 'lib/js/', filter: 'isFile'},

            // ui-bootstrap-templates
            {expand: true, flatten:true, src: [], dest: 'lib/js/', filter: 'isFile'},

            //boostrap css
            {expand: true, flatten:true, src: [
              'bower_components/bootstrap/dist/css/bootstrap.min.css',
              'bower_components/bootstrap/dist/css/bootstrap.css.map'
              ], dest: 'lib/css/', filter: 'isFile'},

            //boostrap js
            {expand: true, flatten:true, src: [
              'bower_components/bootstrap/dist/js/bootstrap.min.js',
              'bower_components/bootstrap/dist/js/bootstrap.js.map'
            ], dest: 'lib/js/', filter: 'isFile'},

            //font-awesome fonts
            {expand: true, flatten:true, src: [
              'bower_components/font-awesome/fonts/*',
            ], dest: 'lib/fonts/', filter: 'isFile'},

            // font-awesome css
            {expand: true, flatten:true, src: [
              'bower_components/font-awesome/css/font-awesome.min.css',
              'bower_components/font-awesome/css/font-awesome.css.map'
              ], dest: 'lib/css/', filter: 'isFile'},

            // jquery
            {expand: true, flatten:true, src: [
              'bower_components/jquery/dist/jquery.min.*'
            ], dest: 'lib/js/', filter: 'isFile'},

            // Twitter Typeahead
            {expand: true, flatten:true, src: [
              'bower_components/typeahead.js/dist/typeahead.bundle.min.js'
            ], dest: 'lib/js/', filter: 'isFile'},

            // Angular Typeahead
            {expand: true, flatten:true, src: [
              'bower_components/angular-typeahead/angular-typeahead.min.js'
            ], dest: 'lib/js/', filter: 'isFile'},

            // Angular Leaflet
            {expand: true, flatten:true, src: [
              'bower_components/angular-leaflet-directive/dist/*.min.js'
            ], dest: 'lib/js/', filter: 'isFile'},

            // Leaflet
            {expand: true, flatten:true, src: [
              'bower_components/leaflet/dist/leaflet.js'
            ], dest: 'lib/js/', filter: 'isFile'},

            // Leaflet
            {expand: true, flatten:true, src: [
              'bower_components/leaflet/dist/*.css'
            ], dest: 'lib/css/', filter: 'isFile'},


            // Leaflet
            {expand: true, flatten:true, src: [
              'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js'
            ], dest: 'lib/js/', filter: 'isFile'},

            // Angular Hotkeys
            {expand: true, flatten:true, src: [
              'bower_components/angular-hotkeys/build/hotkeys.min.js'
            ], dest: 'lib/js/', filter: 'isFile'},

            // UI Select
            {expand: true, flatten:true, src: [
              'bower_components/ui-select/dist/*.min.js'
            ], dest: 'lib/js/', filter: 'isFile'},

            // UI Select
            {expand: true, flatten:true, src: [
              'bower_components/ui-select/dist/*.min.css'
            ], dest: 'lib/css/', filter: 'isFile'},

            // Angular Santitize
            {expand: true, flatten:true, src: [
              'bower_components/angular-sanitize/angular-sanitize.min.js'
            ], dest: 'lib/js/', filter: 'isFile'},


            // animate.css
            {expand: true, flatten:true, src: ['bower_components/animate.css/animate.min.css'], dest: 'lib/css/', filter: 'isFile'}


            // Angular Webstorage
            //{expand: true, flatten:true, src: ['bower_components/angular-webstorage/angular-webstorage.min.js'], dest: 'lib/js/', filter: 'isFile'}
          ],
        },
      },
      watch : {
        js : {
          files : ['lang/*.js','js/app.*', 'css/*.*'],
          tasks : ['concat', 'uglify', 'cssmin']
        }
      },
      auto_install: {
        subdir: {
          options : {
            npm : false
          }
        }
      },
      cssmin: {
        target: {
          files: [{
            expand: true,
            cwd: 'css',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css',
            ext: '.min.css'
          }]
        }
      }
    //  clean: ["bower_components"],
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  //grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-auto-install');

  //grunt.loadNpmTasks('grunt-rpm');

  grunt.registerTask('default', ['concat', 'uglify', 'copy', 'cssmin']);

  //grunt.registerTask('build', ['concat', 'uglify', 'auto_install','copy', 'clean']);
  // grunt.registerTask('pack', ['concat', 'uglify', 'auto_install','copy', 'rpm']);
};
