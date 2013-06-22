'use strict';

var LIVERELOAD_PORT = 35729;

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app : 'app',
        dist : 'dist'
    };

    grunt.initConfig({
        yeoman : yeomanConfig,
        watch : {
            compass : {
                files : ['<%= yeoman.app %>/stylesheets/compass/{,*/}*.{scss,sass,png}'],
                tasks : ['compass']
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/*.html',
                    '<%= yeoman.app %>/stylesheets/{,*/}*.css',
                    '<%= yeoman.app %>/javascripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}'
                ],
                options : {
                    livereload : LIVERELOAD_PORT
                },
                tasks : ['livereload']
            }
        },
        requirejs : {
            dist : {
                options : {
                    optimize : 'uglify',
                    uglify : {
                        toplevel : true,
                        ascii_only : false,
                        beautify : false
                    },
                    preserveLicenseComments : true,
                    useStrict : false,
                    wrap : true
                }
            }
        },
        compass : {
            options : {
                sassDir : '<%= yeoman.app %>/stylesheets/compass/sass',
                cssDir : '<%= yeoman.app %>/stylesheets',
                imagesDir : '<%= yeoman.app %>/stylesheets/compass/images',
                generatedImagesDir : '<%= yeoman.app %>/images',
                relativeAssets : true
            },
            dist : {
                options : {
                    outputStyle: 'compressed'
                }
            },
            server : {
                options : {
                    debugInfo: true
                }
            }
        },
        clean : {
            dist : ['.tmp', '<%= yeoman.dist %>/*'],
            server : '.tmp'
        },
        useminPrepare : {
            html : '<%= yeoman.app %>/index.html',
            options : {
                dest : '<%= yeoman.dist %>'
            }
        },
        usemin : {
            html : ['<%= yeoman.dist %>/{,*/}*.html'],
            options : {
                dirs : ['<%= yeoman.dist %>']
            }
        },
        imagemin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= yeoman.app %>/images',
                    src : '{,*/}*.{png,jpg,jpeg}',
                    dest : '<%= yeoman.dist %>/images'
                }]
            }
        },
        htmlmin : {
            dist : {
                options : {},
                files : [{
                    expand : true,
                    cwd : '<%= yeoman.app %>',
                    src : '*.html',
                    dest : '<%= yeoman.dist %>'
                }]
            }
        },
        copy : {
            dist : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= yeoman.app %>',
                    dest : '<%= yeoman.dist %>',
                    src : [
                        'images/{,*/}*.{webp,gif,png,jpg,jpeg}',
                        'stylesheets/{,*/}*.{css,ttf}',
                        'javascripts/{,*/}*/{,*/}*.{js,coffee}'
                    ]
                }]
            }
        },
        qunit: {
            all : {
                options: {
                    urls: ['http://localhost/~lixiaopeng/web-new/test/index.html']
                }
            }
        }
    });

    grunt.registerTask('server', [
        'clean:server',
        'compass:server',
        'watch',
        'livereload-start'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'compass:dist',
        'useminPrepare',
        'imagemin',
        'copy',
        'htmlmin',
        'concat',
        'uglify',
        'requirejs',
        'usemin'
    ]);

    grunt.registerTask('test', function(){
        grunt.option('force', true);
        grunt.task.run('qunit');
    });
};
