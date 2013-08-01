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
                files : ['<%= yeoman.app %>/stylesheets/compass/{,*/}*/{,*/}*.{scss,sass,png}'],
                tasks : ['compass']
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/*.html',
                    '<%= yeoman.app %>/stylesheets/{,*/}*/{,*/}*.css',
                    '<%= yeoman.app %>/javascripts/{,*/}*/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*/{,*/}*.{png,jpg,jpeg,gif,webp}'
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
            },
            source : {
                options : {
                    appDir : '<%= yeoman.app %>/javascripts',
                    dir :　'<%= yeoman.dist %>/javascripts',
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
            html : ['<%= yeoman.app %>/index.html', '<%= yeoman.app %>/javascripts/modules/photo/photo.html'],
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
                files : [{
                    expand : true,
                    cwd : '<%= yeoman.app %>',
                    src : ['*.html', 'javascripts/{,*/}*/*.html'],
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
                        'javascripts/{,*/}*/{,*/}*.{js,coffee}',
                        'bower_components/requirejs-text/text.js',
                        'bower_components/jquery/jquery.js',
                        'bower_components/dot/doT.js',
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/requirejs-i18n/i18n.js'
                    ]
                }]
            }
        },
        qunit: {
            files : ['test/index.html']
        },
        jslint : {
            sources : {
                src : [
                    'app/javascripts/**/*.js'
                ],
                exclude: [
                    'app/javascripts/utilities/MD5.js',
                    'app/javascripts/ui/Panel.js',
                    'app/javascripts/usb-debug-new/usb-debug-new.js',
                    'app/javascripts/modules/contact/collections/ContactsCollection.js',
                    'app/javascripts/modules/message/views/MessageSenderView.js',
                    'app/javascripts/ui/Button.js'
                ],
                directives : {
                    sloppy : true,
                    vars : true,
                    nomen : true,
                    devel : true,
                    browser : true,
                    indent : 4,
                    unparam: true,
                    plusplus : true,
                    todo : true,
                    bitwise :  true,
                    stupid : true,
                    evil : true,
                    regexp : true,
                    ass : true,
                    predef: [ // array of pre-defined globals
                      'define', 'require'
                    ]
                },
                options : {
                    // junit : 'out/junit.xml', // write the output to a JUnit XML
                    // log : 'lint.log',
                    // jslintXml : 'out/jslint_xml.xml',
                    errorsOnly : true // only display errors
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
        'requirejs:source',
        'useminPrepare',
        'imagemin',
        'copy',
        'htmlmin',
        'concat',
        'uglify',
        'requirejs:dist',
        'usemin'
    ]);

    grunt.registerTask('test', function () {
        // grunt.option('force', true);
        grunt.task.run('jslint');
        grunt.task.run('build');
    });
};
