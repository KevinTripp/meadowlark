module.exports = function(grunt){
  //load plugins
  [
      'grunt-cafe-mocha'
    , 'grunt-contrib-jshint'
    , 'grunt-exec'
    ,
  ].forEach(function(task){
    grunt.loadNpmTasks(task);
  });
  //configure plugins
  grunt.initConfig({
    cafemocha:{
      all:{
        src:'qa/tests-*.js',options{ui:'tdd'},
      }
    },
    jshint:{
      app:['meadowlark.js', 'public/js/**/*.js','lib/**/*.js']
      , qa:['gruntfile.js', 'public/qa/**/*.js']
    }
  });
  grunt.registerTask('defualt',['cafemocha', 'jshint']);
};
