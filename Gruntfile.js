'use strict';

var LIVERELOAD_PORT = 35729;
var path = require('path');
var fs = require('fs');

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var paths = {
        app : 'app',
        dist : 'dist',
        debug : 'debug',
        tmp : '.tmp'
    };

    grunt.initConfig({
        path : paths,
        clean : {
            dist : ['<%= path.tmp %>/*', '<%= path.dist %>/*'],
            server : ['<%= path.tmp %>/*', '<%= path.debug %>/*']
        },
        watch : {
            tpl : {
                files : [
                    '<%= path.app %>/javascripts/**/*.tpl',
                    '<%= path.app %>/**/*.html',
                ],
                tasks : ['targethtml:server']
            },
            src : {
                files : [
                    '<%= path.app %>/javascripts/**/*.js',
                    '<%= path.app %>/stylesheets/**/*.{scss,sass,png}',
                    '<%= path.app %>/images/**/*.{png,gif}'
                ]
            },
            stylesheets : {
                files : [
                    '<%= path.debug %>/stylesheets/compass/{,*/}*/{,*/}*.{scss,sass,png}'
                ],
                tasks : ['compass:server']
            }
        },
        replace : {
            serverWDJ : {
                src : ['<%= path.debug %>/index.html'],
                overwrite : true,
                replacements : [{
                    from : '//@@PROJECT_FLAG',
                    to : 'localStorage.setItem(\'PROJECT_FLAG\', \'WDJ\');'
                }]
            },
            serverSUNING : {
                src : ['<%= path.debug %>/index.html'],
                overwrite : true,
                replacements : [{
                    from : '//@@PROJECT_FLAG',
                    to : 'localStorage.setItem(\'PROJECT_FLAG\', \'SUNING\');'
                }]
            },
            serverTIANYIN : {
                src : ['<%= path.debug %>/index.html'],
                overwrite : true,
                replacements : [{
                    from : '//@@PROJECT_FLAG',
                    to : 'localStorage.setItem(\'PROJECT_FLAG\', \'TIANYIN\');'
                }]
            }
        },
        compass : {
            options : {
                sassDir : '<%= path.debug %>/stylesheets/compass/sass',
                cssDir : '<%= path.debug %>/stylesheets',
                imagesDir : '<%= path.debug %>/stylesheets/compass/images',
                generatedImagesDir : '<%= path.debug %>/images',
                relativeAssets : true
            },
            dist : {
                options : {
                    outputStyle : 'compressed',
                    sassDir : '<%= path.tmp %>/stylesheets/compass/sass',
                    cssDir : '<%= path.tmp %>/stylesheets',
                    imagesDir : '<%= path.tmp %>/stylesheets/compass/images',
                    generatedImagesDir : '<%= path.tmp %>/images',
                }
            },
            server : {
                options : {
                    debugInfo : true
                }
            }
        },
        copy : {
            server : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= path.app %>',
                    dest : '<%= path.debug %>',
                    src : [
                        'images/**/*.{png,gif}',
                        'javascripts/**/*.js',
                        'stylesheets/**/*.{sass,scss,png,ttf}',
                        'bower_components/wookmark-jquery/jquery.wookmark.js',
                        'bower_components/requirejs-doT/doT.js',
                        'bower_components/requirejs-text/text.js',
                        'bower_components/requirejs/require.js',
                        'bower_components/jquery/jquery.js',
                        'bower_components/dot/doT.js',
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/requirejs-i18n/i18n.js',
                        'bower_components/qrcode.js/qrcode.js'
                    ]
                }]
            },
            tmp : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= path.app %>',
                    dest : '<%= path.tmp %>',
                    src : [
                        'images/**/*.{png,gif}',
                        'javascripts/**/*.js',
                        'stylesheets/**/*.{sass,scss,png,ttf}',
                        'bower_components/wookmark-jquery/jquery.wookmark.js',
                        'bower_components/requirejs-doT/doT.js',
                        'bower_components/requirejs-text/text.js',
                        'bower_components/requirejs/require.js',
                        'bower_components/jquery/jquery.js',
                        'bower_components/dot/doT.js',
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/requirejs-i18n/i18n.js',
                        'bower_components/qrcode.js/qrcode.js'
                    ]
                }]
            },
            dist : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= path.tmp %>',
                    dest : '<%= path.dist %>',
                    src : [
                        'images/{,*/}*.{webp,gif,png,jpg,jpeg}',
                        'stylesheets/{,*/}*.{css,ttf}',
                        'bower_components/wookmark-jquery/jquery.wookmark.js',
                        'bower_components/requirejs-doT/doT.js',
                        'bower_components/requirejs-text/text.js',
                        'bower_components/requirejs/require.js',
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
        targethtml : {
            server : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= path.app %>',
                    dest : '<%= path.debug %>',
                    src : [
                        'javascripts/**/*.tpl',
                        '*.html'
                    ]
                }]
            },
            build : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= path.app %>',
                    dest : '<%= path.tmp %>',
                    src : [
                        'javascripts/**/*.tpl',
                        '*.html'
                    ]
                }]
            }
        },
        requirejs : {
            options : {
                almond : true,
                appDir : '<%= path.tmp %>/javascripts',
                dir :　'<%= path.dist %>/javascripts',
                optimize : 'uglify',
                baseUrl : './',
                mainConfigFile : '<%= path.tmp %>/javascripts/RequireConfig.js',
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
            WDJ : {},
            SUNING : {
                options : {
                    pragmas : {
                            SUNING_INCLUDE : true
                    }
                }
            },
            TIANYIN : {
                options : {
                    pragmas : {
                            TIANYIN_INCLUDE : true
                    }
                }
            }
        },
        useminPrepare : {
            html : ['<%= path.tmp %>/index.html', '<%= path.tmp %>/javascripts/modules/photo/photo.html'],
            options : {
                dest : '<%= path.dist %>'
            }
        },
        usemin : {
            html : ['<%= path.dist %>/**/*.html'],
            options : {
                dirs : ['<%= path.dist %>']
            }
        },
        imagemin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= path.tmp %>/images',
                    src : '**/*.{png,jpg,jpeg}',
                    dest : '<%= path.dist %>/images'
                }]
            }
        },
        htmlmin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= path.tmp %>',
                    src : ['*.html', 'javascripts/**/*.html'],
                    dest : '<%= path.dist %>'
                }]
            }
        }
    });

    grunt.registerTask('server', function (project) {
        project = project || 'WDJ';
        project = project.toUpperCase();

        var taskList = [
            'clean:server',
            'copy:server',
            'targethtml:server',
            'createScssConfig:' + project,
            'compass:build',
            'requirejs:source'
        ];

        grunt.task.run(taskList);
    });

    grunt.registerTask('build', function (project) {
        project = project || 'WDJ';
        project = project.toUpperCase();

        var taskList = [
            'clean:dist',
            'copy:tmp',
            'targethtml:build',
            'replace:server' + project,
            'createScssConfig:' + project + ':true',
            'compass:dist',
            'requirejs:project',
            'useminPrepare',
            'imagemin',
            'copy:dist',
            'htmlmin',
            'concat',
            'uglify',
            'usemin'
        ];

        grunt.task.run(taskList);
    });

    grunt.registerTask('createScssConfig', function (project, isBuild) {

        var fd;
        var dir = paths.debug;

        if (isBuild) {
            dir = paths.tmp;
        }
        var filePath = dir + '/stylesheets/compass/sass/_projectflag.scss';

        try {

            fd = fs.openSync(filePath, 'w');

            var content = '';
            switch (project) {
            case 'WDJ':
                content = '$PROJECT_FLAG : PROJECT_SUNING';
                break;
            case 'SUNING':
                content = '$PROJECT_FLAG : PROJECT_SUNING';
                break;
            case 'TIANYIN':
                content = '$PROJECT_FLAG : PROJECT_TIANYIN';
                break;
            }

            fs.writeSync(fd, content);
            fs.closeSync(fd);

        } catch (exception) {
            throw exception;
        }
    });

    grunt.event.on('watch', function(action, filePath, target) {

        if (target === 'src') {

            var targetPath = filePath.replace(paths.app, paths.debug);
            if (grunt.file.isDir(filePath)) {
                return;
            }

            switch (action) {
            case 'added':
            case 'changed':
                var extname = path.extname(filePath);
                if (extname === '.tpl' || extname === '.html') {
                    return;
                }

                grunt.file.copy(filePath, targetPath);
                break;
            case 'deleted':
                grunt.file.delete(targetPath);
                break;
            }
        }
    });
};