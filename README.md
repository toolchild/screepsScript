
#Usage

just put the contents of dist/ into your scripts folder for screeps
e.g. for Windows: ``C:\Users\YOUR_USERNAME\AppData\Local\Screeps\scripts\screeps.com\default``

---

or add these to your gruntfile if you use grunt and start with ``grunt c`` and then take the contents of dist/

    grunt.initConfig({

      copy: {
          main: {

            files: [
              // flattens results to a single level
              {expand: true, flatten: true, src: ['src/*' , 'src/role/*', 'src/third-party/**', 'src/utils/**'], dest: 'dist/', filter: 'isFile'},            ],
          },
        },

    }); // The end of grunt.initConfig


    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('c', ['clean','copy']);
