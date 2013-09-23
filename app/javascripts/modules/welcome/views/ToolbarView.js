/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Settings',
        'IO',
        'Configuration',
        'Log',
        'Device',
        'Internationalization',
        'FunctionSwitch',
        'ui/MenuButton',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/PopupPanel',
        'ui/Panel',
        'ui/ToastBox',
        'utilities/StringUtil',
        'backuprestore/BackupController',
        'backuprestore/RestoreController',
        'welcome/views/DeviceView',
        'welcome/WelcomeService',
        'task/TaskService',
        'task/models/TaskModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Settings,
        IO,
        CONFIG,
        log,
        Device,
        i18n,
        FunctionSwitch,
        MenuButton,
        TemplateFactory,
        AlertWindow,
        PopupPanel,
        Panel,
        ToastBox,
        StringUtil,
        BackupController,
        RestoreController,
        DeviceView,
        WelcomeService,
        TaskService,
        TaskModel
    ) {

        var alert = window.alert;

        var destination = Settings.get('screenShot-destination') !== undefined ? Settings.get('screenShot-destination') : CONFIG.enums.SCREEN_SHOT_DESTINATION_FILE;
        var wrapWithShell = Settings.get('screenShot-wrapWithShell') !== undefined ? Settings.get('screenShot-wrapWithShell') : 1;

        var settingMenu;
        var deviceView;

        var ToolbarView = Backbone.View.extend({
            className : 'w-welcome-toolbar hbox',
            template : doT.template(TemplateFactory.get('welcome', 'toolbar')),
            initialize : function () {
                deviceView = DeviceView.getInstance();
                settingMenu = new MenuButton({
                    items : [{
                        label : i18n.welcome.SCREEN_SHOT_SAVE_TO_FILE,
                        type : 'radio',
                        name : 'screenshotDes',
                        value : 'file',
                        checked : destination === CONFIG.enums.SCREEN_SHOT_DESTINATION_FILE
                    }, {
                        label : i18n.welcome.SCREEN_SHOT_SAVE_TO_CLIPBOARD,
                        type : 'radio',
                        name : 'screenshotDes',
                        value : 'clipbord',
                        checked : destination !== CONFIG.enums.SCREEN_SHOT_DESTINATION_FILE
                    }, {
                        type : 'hr'
                    }, {
                        label : i18n.welcome.SCEEN_SHOT_WITHOUT_WRAP,
                        type : 'radio',
                        name : 'screenshotType',
                        value : false,
                        checked : wrapWithShell !== 1
                    }, {
                        label : i18n.welcome.SCREEN_SHOT_WITH_WRAP,
                        type : 'radio',
                        name : 'screenshotType',
                        value : true,
                        checked : wrapWithShell === 1
                    }, {
                        type : 'hr'
                    }, {
                        label : i18n.welcome.SAVE_PATH_FOR_SCREENSHOT,
                        type : 'normal',
                        name : 'savePath',
                        value : 'savePath'
                    }]
                });

                settingMenu.on('select', function (data) {
                    switch (data.name) {
                    case 'screenshotDes':
                        if (data.value === 'file') {
                            destination = CONFIG.enums.SCREEN_SHOT_DESTINATION_FILE;
                        } else {
                            destination = CONFIG.enums.SCREEN_SHOT_DESTINATION_CLIPBOARD;
                        }
                        Settings.set('screenShot-destination', destination, true);
                        break;
                    case 'screenshotType':
                        if (data.value === 'true') {
                            wrapWithShell = 1;
                        } else {
                            wrapWithShell = 0;
                        }
                        Settings.set('screenShot-wrapWithShell', wrapWithShell, true);
                        break;
                    case 'savePath':
                        IO.requestAsync(CONFIG.actions.SAVE_SCREENSHOT);

                        log({
                            'event' : 'ui.click.welcome.save_screenshot_dir'
                        });
                        break;
                    }
                }, this);

                this.listenTo(Device, 'change:screenshot', function (Device, screenshot) {
                    this.$el.toggleClass('left', screenshot.rotation === 1 || screenshot.rotation === 3);
                });

                this.listenTo(Device, 'change:isConnected change:canScreenshot', this.setButtonState);

                deviceView.on('capture', this.clickButtonScreenShot, this);

                var wallpaperUrl;

                Object.defineProperties(this, {
                    wallpaperUrl : {
                        set : function (value) {
                            if (!!value) {
                                wallpaperUrl = value;
                                this.$('.button-set-wallpaper').show();
                            }
                        },
                        get : function () {
                            return wallpaperUrl;
                        }
                    }
                });
            },
            setButtonState : function () {
                this.$('.button-open-sd, .button-backup, .button-restore, .button-set-wallpaper')
                    .prop('disabled', !Device.get('isConnected'))
                    .attr('title', Device.get('isConnected') ? '' : i18n.welcome.CONNECT_UR_PHONE);

                this.$('.button-screen-shot').prop('disabled', !Device.get('canScreenshot'));
                settingMenu.$el.prop('disabled', !Device.get('canScreenshot'));
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$('.screen-shot-setting').append(settingMenu.render().$el.addClass('min transparent toggle'));

                this.setButtonState();
                this.renderBackupButtonPopup();

                return this;
            },
            renderBackupButtonPopup : function () {
                WelcomeService.getAutoBackupDateAsync().done(function (resp) {
                    var date = StringUtil.formatDate('yyyy-MM-dd', parseInt(resp.body.value, 10));
                    var $tip = $(doT.template(TemplateFactory.get('welcome', 'autobackup-tip'))({
                        date : date
                    }));
                    var popupPanel = new PopupPanel({
                        $host : this.$('.button-backup'),
                        $content : $tip,
                        alignToHost : false
                    });
                    popupPanel.$el
                        .removeClass('w-ui-popup-panel')
                        .addClass('w-ui-popup-tip')
                        .on('click', '.button-open', function () {
                            WelcomeService.openAutobackupFileAsync();
                            log({
                                'event' : 'ui.click.welcome.open_backup_folder'
                            });
                        });
                }.bind(this));
            },
            showScreenShotTip : function (value, success) {
                var $tip = deviceView.$('.tip');

                $tip.find('.icon').toggleClass('success', success).toggleClass('fail', !success);
                $tip.find('.des').html(value);

                $tip.fadeIn('fast');

                setTimeout(function () {
                    $tip.fadeOut('fast');
                    deviceView.fade = false;
                }.bind(this), 3000);
            },
            screenShotCallback : function (resp) {
                if (resp.state_code === 200) {
                    if (destination === CONFIG.enums.SCREEN_SHOT_DESTINATION_CLIPBOARD) {
                        this.showScreenShotTip(i18n.welcome.SCREEN_SHOT_CLIPBOARD_SUCCESS, true);
                    } else {
                        this.showScreenShotTip(i18n.welcome.SAVE_SCREEN_SHOT_SUCCESS, true);

                        if (!resp.body.auto_save_screenshot_dir) {
                            var path = resp.body.screenshot_save_pos;
                            this.showSavePathAlert(path);
                        }
                    }
                } else if (resp.state_code === 402) {
                    this.showScreenShotTip(i18n.welcome.SCREEN_SHOT_CANCELD, false);
                } else {
                    this.showScreenShotTip(i18n.welcome.SCREEN_SHOT_FAILD, false);
                }
            },
            screenShotAsync : function () {
                var deferred = $.Deferred();

                Device.getScreenshotAsync().done(function () {
                    Device.screenShotAsync(destination, wrapWithShell).done(function (resp) {
                        deferred.resolve(resp);
                    }).fail(function (resp) {
                        deferred.reject(resp);
                    }).always(function (resp) {
                        this.screenShotCallback(resp);
                    }.bind(this));
                }.bind(this)).fail(function (resp) {
                    deferred.reject(resp);
                });

                return deferred.promise();
            },
            showSavePathAlert : function (path) {
                if (Settings.get('save_screen_shot_path') !== true) {
                    var panel = new Panel({
                        buttonSet : 'yes_no',
                        $bodyContent : i18n.welcome.SAVE_PATH_FOR_SCREENSHOT_TIP,
                        width : 360,
                        title : i18n.ui.TIP
                    });

                    panel.once('button_yes', function () {
                        IO.requestAsync({
                            url : CONFIG.actions.SET_LAST_USED_DIR,
                            data : {
                                dir : path.slice(0, path.lastIndexOf('\\') + 1)
                            }
                        });
                        Settings.set('save_screen_shot_path', true, true);
                    }).once('button_no', function () {
                        Settings.set('save_screen_shot_path', true, true);
                    });

                    panel.show();
                }
            },
            clickButtonOpenSD : function () {
                var $btn = this.$('.button-open-sd').prop('disabled', true);
                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                Device.manageSDCardAsync();

                log({
                    'event' : 'ui.click.welcome_button_manage_sd'
                });
            },
            clickButtonBackup : function () {
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                BackupController.start();

                //Backbone.trigger('switchModule', {
                //    module : 'backup-restore'
                //});

                log({
                    'event' : 'ui.click.welcome_button_backup',
                    'isUSB' : Device.get('isUSB')
                });
            },
            clickButtonRestore : function () {
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                RestoreController.start();

                //Backbone.trigger('switchModule', {
                //    module : 'backup-restore'
                //});

                log({
                    'event' : 'ui.click.welcome_button_restore',
                    'isUSB' : Device.get('isUSB')
                });
            },
            clickButtonScreenShot : function () {
                deviceView.loading = true;
                deviceView.fade = true;
                this.screenShotAsync().always(function () {
                    deviceView.loading = false;
                });

                log({
                    'event' : 'ui.click.welcome.screen.shot',
                    'destination' : destination,
                    'wrapWithShell' : wrapWithShell
                });
            },
            setAsWallpaperAsync : function (id) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_SET_WALLPAPER,
                    data : {
                        photo_id : id
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            clickButtonSetWallpaper : function () {
                var model = new TaskModel();

                var path = this.wallpaperUrl.split('/');
                var fileName = path[path.length - 1];

                model.set({
                    downloadUrl : this.wallpaperUrl,
                    iconPath : CONFIG.enums.TASK_DEFAULT_ICON_PATH_PHOTO,
                    modelType : CONFIG.enums.MODEL_TYPE_PHOTO,
                    title : fileName,
                    set_wallpaper : true
                });

                TaskService.downloadAsync(model).done(function (resp) {
                    var jobId = resp.body.value;

                    var handler = IO.Backend.Device.onmessage({
                        'data.channel' : CONFIG.events.PHOTO_DOWNLOAD_WITH_IDS
                    }, function (msg) {
                        var content,
                            boxViewInsance;

                        if (msg[0] === Number(jobId)) {
                            IO.Backend.Device.offmessage(handler);

                            this.setAsWallpaperAsync(msg[1]).done(function () {
                                content = i18n.taskManager.SET_AS_WALLPAPER_SUCCESS;
                            }).fail(function () {
                                content = i18n.taskManager.SET_AS_WALLPAPER_FAIL;
                            }).always(function () {
                                if (boxViewInsance) {
                                    boxViewInsance.remove();
                                }

                                boxViewInsance = new ToastBox({
                                    $content : content
                                });

                                boxViewInsance.once('remove', function () {
                                    boxViewInsance  = undefined;
                                });

                                boxViewInsance.show();

                                setTimeout(deviceView.showScreenshotAsync, 1000);

                                log({
                                    'event' : 'ui.click.welcome_button_set_as_wallpaper'
                                });
                            }.bind(this));
                        }
                    }.bind(this));
                }.bind(this));
            },
            clickButtonTop : function () {
                this.trigger('top');

                log({
                    'event' : 'ui.click.welcome_button_top'
                });
            },
            events : {
                'click .button-screen-shot' : 'clickButtonScreenShot',
                'click .button-open-sd' : 'clickButtonOpenSD',
                'click .button-backup' : 'clickButtonBackup',
                'click .button-restore' : 'clickButtonRestore',
                'click .button-set-wallpaper' : 'clickButtonSetWallpaper',
                'click .button-top' : 'clickButtonTop'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ToolbarView();
            }
        });

        return factory;
    });
}(this));
