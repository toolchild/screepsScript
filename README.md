
just put the contents of src/ into your scripts folder for screeps

Screeps does not allow a folder structure, you will have to copy all files in folder to the folder of your branch

e.g. for Windows: ``C:\Users\YOUR_USERNAME\AppData\Local\Screeps\scripts\screeps.com\default``

---

or add these to your gruntfile if you use grunt and start with ``grunt c``

    grunt.initConfig({

      copy: {
          main: {

            files: [
              // includes files within path
              // {expand: true, src: ['src/*'], dest: 'dist/', filter: 'isFile'},

              // includes files within path and its sub-directories
              // {expand: true, src: ['src/**',  '!**/auto-complete/**'], dest: 'dist/'},

              // makes all src relative to cwd
              // {expand: true, cwd: '/', src: ['src/**' , '!**/auto-complete/**' ], dest: 'dist/'},

              // flattens results to a single level
              {expand: true, flatten: true, src: ['src/*' , 'src/role/*'], dest: 'dist/', filter: 'isFile'},
            ],
          },
        },

    }); // The end of grunt.initConfig


    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('c', ['clean','copy']);
