'use strict';

var LIVERELOAD_PORT = 35729;

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var paths = {
        app : 'app',
        dist : 'dist'
    };

    grunt.initConfig({
        path : paths,
        watch : {
            compass : {
                files : [
                    '<%= path.app %>/stylesheets/compass/{,*/}*/{,*/}*.{scss,sass,png}'
                ],
                tasks : ['compass']
            },
            livereload: {
                files: [
                    '<%= path.app %>{,*/}*/*.html',
                    '<%= path.app %>/stylesheets/*.css',
                    '<%= path.app %>/javascripts/{,*/}*/{,*/}*.js',
                    '<%= path.app %>/images/{,*/}*/{,*/}*.{png,jpg,jpeg,gif,webp}'
                ],
                options : {
                    livereload : LIVERELOAD_PORT
                },
                tasks : ['livereload']
            }
        },
        requirejs : {
            source : {
                options : {
                    almond : true,
                    appDir : '<%= path.app %>/javascripts',
                    dir :　'<%= path.dist %>/javascripts',
                    optimize : 'uglify',
                    baseUrl : './',
                    mainConfigFile : '<%= path.app %>/javascripts/RequireConfig.js',
                    uglify : {
                        toplevel : true,
                        ascii_only : false,
                        beautify : false
                    },
                    preserveLicenseComments : true,
                    useStrict : false,
                    wrap : true,
                    modules : [{
                        name : 'RequireConfig',
                        include : ['jquery', 'underscore', 'backbone', 'doT', 'text', 'i18n']
                    }, {
                        name : 'SnapPea',
                        include : ['SnapPea'],
                        exclude : ['RequireConfig']
                    }, {
                        name : 'photo/PhotoModule',
                        include : ['photo/PhotoModule'],
                        exclude : ['RequireConfig']
                    }, {
                        name : 'welcome/guide/views/GuideView',
                        include : ['welcome/guide/views/GuideView'],
                        exclude : ['RequireConfig']
                    }]
                }
            }

        },
        compass : {
            options : {
                sassDir : '<%= path.app %>/stylesheets/compass/sass',
                cssDir : '<%= path.app %>/stylesheets',
                imagesDir : '<%= path.app %>/stylesheets/compass/images',
                generatedImagesDir : '<%= path.app %>/images',
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
            dist : ['.tmp', '<%= path.dist %>/*'],
            server : '.tmp'
        },
        useminPrepare : {
            html : ['<%= path.app %>/index.html', '<%= path.app %>/javascripts/modules/photo/photo.html'],
            options : {
                dest : '<%= path.dist %>'
            }
        },
        usemin : {
            html : ['<%= path.dist %>/{,*/}*.html'],
            options : {
                dirs : ['<%= path.dist %>']
            }
        },
        imagemin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= path.app %>/images',
                    src : '{,*/}*.{png,jpg,jpeg}',
                    dest : '<%= path.dist %>/images'
                }]
            }
        },
        htmlmin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= path.app %>',
                    src : ['*.html', 'javascripts/{,*/}*/*.html'],
                    dest : '<%= path.dist %>'
                }]
            }
        },
        copy : {
            dist : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= path.app %>',
                    dest : '<%= path.dist %>',
                    src : [
                        'images/{,*/}*.{webp,gif,png,jpg,jpeg}',
                        'stylesheets/{,*/}*.{css,ttf}',
                        'bower_components/requirejs-text/text.js',
                        'bower_components/jquery/jquery.js',
                        'bower_components/dot/doT.js',
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/requirejs-i18n/i18n.js',
                        'bower_components/qrcode.js/qrcode.js'
                    ]
                }]
            }
        },
        qunit: {
            files : ['test/index.html']
        },
        jshint : {
            all : ['app/javascripts/**/*.js'],
            options : {
                ignores : [
                    'app/javascripts/modules/contact/collections/ContactsCollection.js',
                    'app/javascripts/modules/music/views/MusicModuleView.js',
                    'app/javascripts/modules/photo/views/PhotoModuleView.js',
                    'app/javascripts/modules/video/views/VideoModuleView.js',
                    'app/javascripts/utilities/FilterFunction.js'
                ]
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
        'requirejs:source',
        'useminPrepare',
        'imagemin',
        'copy',
        'htmlmin',
        'concat',
        'uglify',
        'usemin'
    ]);

    grunt.registerTask('test', function () {
        // grunt.option('force', true);
        grunt.task.run('jshint:all');
        grunt.task.run('build');
    });
};
