module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js',
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            src: ['src/**/*.js'],
            all: ['*/**.js', '!dist/**/*.min.js'],
            test: ['tests/**/*.js'],
        },
        watch: {
            jshint: {
                files: '<%= jshint.all %>',
                tasks: ['jshint:all']
            },
            test: {
                files: ['tests/**/*', 'src/**/*.js'],
                tasks: ['build', 'test'],
                options: {
                    debounceDelay: 3000,
                  }
            }
        },
        qunit: {
            all: ['tests/**/*.html'],
            options: {
                timeout: 10000
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('test', ['build', 'qunit']);
    grunt.registerTask('watch-test', ['watch:test']);
    grunt.registerTask('watch-jshint', ['watch:jshint']);
    grunt.registerTask('build', ['jshint:all', 'concat:dist', 'uglify:build']);
};