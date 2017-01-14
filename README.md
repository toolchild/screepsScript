

You will have to create a Gruntfile.js to use grunt-screeps

**Gruntfile.js**


    module.exports = function(grunt) {

      grunt.loadNpmTasks('grunt-screeps');

      grunt.initConfig({
        screeps: {
          options: {
            email: 'YOUR EMAIL',
            password: 'YOUR PASSWORD',
            branch: 'default',
            ptr: false
          },
          dist: {
            src: ['dist/*.js']
          }
        }
      });
    }