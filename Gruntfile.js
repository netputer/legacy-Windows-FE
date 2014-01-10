'use strict';

var LIVERELOAD_PORT = 35729;
var path = require('path');
var fs = require('fs');
var project_flag = 'WDJ';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var paths = {
        app : 'app',
        dist : 'dist',
        tmp : 'tmp',
        config : 'app/javascripts/projectConfig'
    };

    grunt.initConfig({
        path : paths,
        clean : {
            dist : ['<%= path.tmp %>/', '<%= path.dist %>/'],
            server : ['<%= path.tmp %>/']
        },
        watch : {
            src : {
                files : [
                    '<%= path.app %>/javascripts/**/*.js',
                    '<%= path.app %>/stylesheets/**/*.{scss,sass,png}',
                    '<%= path.app %>/images/**/*.{png,gif}',
                    '<%= path.app %>/javascripts/**/*.tpl',
                    '<%= path.app %>/**/*.html'
                ]
            },
            stylesheets : {
                files : [
                    '<%= path.tmp %>/stylesheets/compass/{,*/}*/{,*/}*.{scss,sass,png}'
                ],
                tasks : ['compass:server']
            },
            options : {
                spawn : true
            }
        },
        replace : {
            WDJ : {
                src : ['<%= path.tmp %>/index.html'],
                overwrite : true,
                replacements : [{
                    from : '/*@@PROJECT_CONFIG@@*/',
                    to : function (matchedWord) {
                        return grunt.file.read(paths.config + '/WDJ.json');
                    }
                }]
            },
            SUNING : {
                src : ['<%= path.tmp %>/index.html'],
                overwrite : true,
                replacements : [{
                    from : '/*@@PROJECT_CONFIG@@*/',
                    to : function (matchedWord) {
                        return grunt.file.read(paths.config + '/SUNING.json');
                    }
                }]
            },
            TIANYIN : {
                src : ['<%= path.tmp %>/index.html'],
                overwrite : true,
                replacements : [{
                    from : '/*@@PROJECT_CONFIG@@*/',
                    to : function (matchedWord) {
                        return grunt.file.read(paths.config + '/TIANYIN.json');
                    }
                }]
            }
        },
        compass : {
            options : {
                sassDir : '<%= path.tmp %>/stylesheets/compass/sass',
                cssDir : '<%= path.tmp %>/stylesheets',
                imagesDir : '<%= path.tmp %>/stylesheets/compass/images',
                generatedImagesDir : '<%= path.tmp %>/images',
                relativeAssets : true
            },
            dist : {
                options : {
                    outputStyle : 'compressed'
                }
            },
            server : {
                options : {
                    debugInfo : true
                }
            }
        },
        copy : {
            tmp : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= path.app %>',
                    dest : '<%= path.tmp %>',
                    src : [
                        'images/**/*.{png,gif}',
                        'javascripts/**/*.js',
                        'javascripts/**/*.tpl',
                        '**/*.html',
                        'stylesheets/**/*.{sass,scss,png,ttf}',
                        'bower_components/wookmark-jquery/jquery.wookmark.js',
                        'bower_components/requirejs-doT/doT.js',
                        'bower_components/requirejs-text/text.js',
                        'bower_components/requirejs/require.js',
                        'bower_components/jquery/jquery.js',
                        'bower_components/doT/doT.js',
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
                        'bower_components/doT/doT.js',
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/requirejs-i18n/i18n.js',
                        'bower_components/qrcode.js/qrcode.js'
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

    var project_flag = 'WDJ';
    grunt.registerTask('server', function (project) {

        if (typeof project !== 'undefined') {
            project_flag = project;
        }

        var taskList = [
            'clean:server',
            'copy:tmp',
            'replace:' + project_flag,
            'createScssConfig',
            'compass:server',
            'watch'
        ];

        grunt.task.run(taskList);
    });

    grunt.registerTask('build', function (project) {

        if (typeof project !== 'undefined') {
            project_flag = project;
        }

        var taskList = [
            'clean:dist',
            'copy:tmp',
            'replace:' + project_flag,
            'createScssConfig',
            'compass:dist',
            'requirejs',
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

    grunt.registerTask('createScssConfig', function () {

        var fd;
        var filePath = paths.tmp + '/stylesheets/compass/sass/_projectflag.scss';

        fd = fs.openSync(filePath, 'w');

        var content = '';
        switch (project_flag) {
        case 'WDJ':
            content = '$PROJECT_FLAG : PROJECT_WDJ';
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

    });

    grunt.registerTask('test', function () {
        // grunt.option('force', true);
        grunt.task.run('jshint:all');
        grunt.task.run('build');
    });

    grunt.event.on('watch', function(action, filePath, target) {

        if (target === 'src') {

            var targetPath = filePath.replace(paths.app, paths.tmp);
            if (grunt.file.isDir(filePath)) {
                return;
            }

            switch (action) {
            case 'added':
            case 'changed':
                var baseName = path.basename(filePath);
                grunt.file.copy(filePath, targetPath);

                if (baseName === 'index.html') {
                    var exec = require('child_process').exec;
                    exec('grunt replace:' + project_flag, function (error, stdout, stderr) {
                        stdout && console.log('stdout: ' + stdout);
                        stderr && console.log('stderr: ' + stderr);
                        if (error !== null) {
                          console.log('exec error: ' + error);
                        }
                    });
                    return;
                }

                break;
            case 'deleted':
                grunt.file.delete(targetPath);
                break;
            }
        }
    });
};
