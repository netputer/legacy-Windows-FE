'use strict';

var LIVERELOAD_PORT = 35729;
var path = require('path');
var fs = require('fs');
var util = require('util');

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
            i18n : {
                files : [
                    '<%= path.app %>/javascripts/nls/**/*.json',
                ]
            },
            src : {
                files : [
                    '<%= path.app %>/javascripts/**/*.js',
                    '<%= path.app %>/images/**/*.{png,gif}',
                    '<%= path.app %>/stylesheets/**/*.{scss,sass,png}',
                    '!<%= path.app %>/javascripts/**/nls/**',
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
            },
            projectConfig : {
                files : ['<%= path.config %>/*.json']
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
                        '!**/nls/**',
                        'javascripts/**/*.tpl',
                        '**/*.html',
                        '!bower_components/**/*.html',
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
                        'i18n/**/stylesheets/{,*/}*.{css,ttf}',
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
            debug : {
                options : {
                    optimize : 'none'
                }
            },
            source : {
                options : {
                    optimize : 'uglify',
                    uglify : {
                        toplevel : true,
                        ascii_only : false,
                        beautify : false
                    }
                }
            },
            options : {
                almond : true,
                appDir : '<%= path.tmp %>',
                dir :　'<%= path.dist %>',
                baseUrl : './javascripts',
                mainConfigFile : '<%= path.tmp %>/javascripts/RequireConfig.js',
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

    var projectFlag;
    var nlsFlag;

    var copyFolderRecursive = function(path, dist, isDelete) {
        isDelete = isDelete ? true : false;

        if (!fs.existsSync(path)) {
            return;
        }

        if (fs.statSync(path).isDirectory()) {
            fs.readdirSync(path).forEach(function (file) {
                var curPath = path + '/' +  file;
                var distPath = dist + '/' + file;
                if(fs.statSync(curPath).isDirectory()) {
                    copyFolderRecursive(curPath, distPath, isDelete);
                } else {
                    grunt.file.copy(curPath, distPath);
                    isDelete && fs.unlinkSync(curPath);
                }
            });
            isDelete && fs.rmdirSync(path);
        } else {
            grunt.file.copy(path, dist);
            isDelete && fs.unlinkSync(path);
        }
    };

    var runSubTask = function (command) {
        var exec = require('child_process').exec;

        exec(command, function (error, stdout, stderr) {
            if (stdout) {
                console.log('stdout: ' + stdout);
            }

            if (stderr) {
                console.log('stderr: ' + stderr);
            }

            if (error) {
                console.log('exec error: ' + error);
            }
        });
    };

    var createNls = function (sourcePath, targetPath) {
        var nlsJson = grunt.file.read(sourcePath);
        var nlsContent = 'define({"'+ nlsFlag  +'" : ' + nlsJson + '});';
        grunt.file.write(targetPath, nlsContent);
    };

    grunt.registerTask('processI18n', function (nls) {

        var i18nPath = paths.tmp + '/i18n';
        fs.mkdirSync(i18nPath);

        var i18nNlsPath = i18nPath + '/' + nls;
        fs.mkdirSync(i18nNlsPath);

        i18nNlsPath += '/nls';
        fs.mkdirSync(i18nNlsPath);
        fs.mkdirSync(i18nNlsPath + '/' + nls);

        var content;
        fs.readdirSync(paths.app + '/javascripts/nls/' + nls).forEach(function (file){
            if (file.substr(0, 1) === '.') {
                return;
            } else {
                createNls(paths.app + '/javascripts/nls/' + nls + '/' + file, i18nNlsPath + '/' + file.replace('json', 'js'));
            }
        });

        var fd;
        if (nls !== 'zh-cn') {
            var mainScss = paths.tmp + '/stylesheets/compass/sass/main.scss';
            fd = fs.openSync(mainScss, 'a');

            fs.writeSync(fd, '@import "_locale-' + nls + '.scss"');
            fs.closeSync(fd);
        }
    });

    grunt.registerTask('switchI18nPath', function () {
        var i18nPath = paths.tmp + '/javascripts/Internationalization.js';
        var content = grunt.file.read(i18nPath, {
            encoding : 'utf-8'
        });

        content = content.replace(/nls/g, '../i18n/\' + navigator.language.toLowerCase() + \'/nls');
        grunt.file.write(i18nPath, content);
    });

    grunt.registerTask('copyCss', function (nls) {
        // var stylePath = paths.tmp + '/i18n/' + nls + '/stylesheets';
        var stylePath = paths.dist + '/i18n/' + nls + '/stylesheets';
        fs.mkdirSync(stylePath);
        fs.readdirSync(paths.tmp + '/stylesheets/').forEach(function (file){
            if (file.substr(0, 1) === '.' || file === 'compass') {
                return;
            } else {
                copyFolderRecursive(paths.tmp + '/stylesheets/' + file, stylePath + '/' + file);
            }
        });
    });

    grunt.registerTask('copyImage', function (nls) {
        // var imagesPath = paths.tmp + '/i18n/' + nls + '/images';
        var imagesPath = paths.dist + '/i18n/' + nls + '/images';
        copyFolderRecursive(paths.tmp + '/images', imagesPath);
    });

    grunt.registerTask('createScssConfig', function (project) {

        var filePath = paths.tmp + '/stylesheets/compass/sass/_projectflag.scss';
        var content = '';
        switch (project) {
        case 'WDJ':
            content = '$PROJECT_FLAG : PROJECT_WD';
            break;
        case 'SUNING':
            content = '$PROJECT_FLAG : PROJECT_SUNING';
            break;
        case 'TIANYIN':
            content = '$PROJECT_FLAG : PROJECT_TIANYIN';
            break;
        }

        grunt.file.write(filePath, content);
    });

    grunt.registerTask('test', function () {
        // grunt.option('force', true);
        grunt.task.run('jshint:all');
        runSubTask('./build.sh wdj source zh-cn');
    });

    grunt.registerTask('server', function (project, nls) {

        projectFlag = project = project ? project.toUpperCase() : 'WDJ';
        nlsFlag = nls = nls ? nls.toLowerCase() : 'zh-cn';

        console.log('project : ', project);
        console.log('nls : ', nls);

        var taskList = [
            'clean:server',
            'jshint:all',
            'copy:tmp',
            'processI18n:' + nls,
            'switchI18nPath',
            'replace:' + project,
            'createScssConfig:' + project,
            'compass:server',
            'copyCss:' + nls,
            'copyImage:' + nls,
            'watch'
        ];

        grunt.task.run(taskList);
    });

    grunt.event.on('watch', function (action, filePath, target) {
        var targetPath;

        switch (target) {
        case 'projectConfig':
            grunt.file.copy(paths.app + '/index.html', paths.tmp + '/index.html');
            runSubTask('grunt replace:' + projectFlag);
            runSubTask('grunt replaceCss:' + paths.tmp + '/index.html');
            break;
        case 'i18n' :
            if (grunt.file.isDir(filePath)) {
                return;
            }

            targetPath = paths.tmp + '/i18n/' + nlsFlag + '/nls/' + path.basename(filePath).replace('json', 'js');
            switch (action) {
            case 'added':
            case 'changed':
                createNls(filePath, targetPath);
                console.log('create - ' + targetPath);
                break;
            }

            break;
        case 'src':
            if (grunt.file.isDir(filePath)) {
                return;
            }

            targetPath = filePath.replace(paths.app, paths.tmp);

            switch (action) {
            case 'added':
            case 'changed':
                var baseName = path.basename(filePath);
                var extName = path.extname(filePath);

                grunt.file.copy(filePath, targetPath);
                console.log('copy - ' + filePath + ' to ' + targetPath);

                if (extName === '.html') {
                    if (baseName === 'index.html') {
                        runSubTask('grunt replace:' + projectFlag);
                    }
                    runSubTask('grunt replaceCss:' + targetPath);
                }

                break;

            case 'deleted':
                grunt.file.delete(targetPath);
                break;
            }

            break;
        }
    });

    grunt.registerTask('switchI18nRunTimePath', function (nls, requireTask) {
        var i18nPath = paths.dist + '/javascripts/Internationalization.js';
        var content = grunt.file.read(i18nPath, {
            encoding : 'utf-8'
        });

        var re = new RegExp(nls, 'g');

        var replacement = '" + navigator.language.toLowerCase() + "';
        if (requireTask === 'debug') {
            replacement = '\' + navigator.language.toLowerCase() + \'';
        }
        content = content.replace(re, replacement);
        grunt.file.write(i18nPath, content);


        var SnapPeaPath = paths.dist + '/javascripts/SnapPea.js';
        content = grunt.file.read(SnapPeaPath, {
            encoding : 'utf-8'
        });

        re = new RegExp('i18n!../i18n/' + nls, 'g');
        replacement = 'i18n!../i18n/" + navigator.language.toLowerCase() + "';
        if (requireTask === 'debug') {
            replacement = 'i18n!../i18n/\' + navigator.language.toLowerCase() + \'';
        }
        content = content.replace(re, replacement);
        grunt.file.write(SnapPeaPath, content);
    });

    grunt.registerTask('replaceCss', function (file) {

        var fileList;
        if (typeof file !== 'undefined') {
            fileList = [file];
        } else {
            var src = [
                paths.tmp + '/index.html',
                paths.tmp + '/javascripts/**/*.html'
            ];
            fileList = grunt.file.expand(src);
        }

        var script = '<script type="text/javascript">';
        script += 'var link = document.createElement("link");';
        script += 'link.href = "%s";';
        script += 'link.type = "text/css";';
        script += 'link.rel = "stylesheet";';
        script += 'document.getElementsByTagName("head")[0].appendChild(link);';
        script += '</script>';

        fileList.forEach(function (file) {
            var content = grunt.file.read(file, {
                encoding : 'utf-8'
            });

            var result = content.match(/<[^>]+(?:href)=\s*["']?([^"]+\.(?:css))/);
            var link = result[0] + '" />';
            var href = result[1];

            content = content.replace(link, util.format(script, href.replace('stylesheets', 'i18n/" + navigator.language.toLowerCase() + "/stylesheets' )));
            grunt.file.write(file, content);
        });
    });

    grunt.registerTask('build', function (project, requireTask, nls) {

        var removeI18n = true;
        if (nls) {
            removeI18n = false;
        }

        project = project ? project.toUpperCase() : 'WDJ';
        nls = nls ? nls.toLowerCase() : 'zh-cn';
        nlsFlag = nls = nls ? nls.toLowerCase() : 'zh-cn';
        requireTask = requireTask ? requireTask.toLowerCase() : 'source';

        console.log('project : ', project);
        console.log('nls : ', nls);
        console.log('task : ', requireTask);

        var taskList = [
            'jshint:all',
            'clean:dist',
            'copy:tmp',
            'processI18n:' + nls,
            'switchI18nPath:' + nls,
            'replaceCss',
            'replace:' + project,
            'createScssConfig:' + project,
            'compass',
            'requirejs:' + requireTask,
            'switchI18nRunTimePath:' + nls + ':' + requireTask,
            'useminPrepare',
            'copy:dist',
            'htmlmin',
            'concat',
            'uglify',
            'usemin',
            'copyCss:' + nls,
            'copyImage:' + nls
        ];

        grunt.task.run(taskList);

        if (removeI18n) {
            runSubTask('rm -rf ' + paths.dist + '/i18n');
        }
    });
};
