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
        'backuprestore/BackupController',
        'backuprestore/RestoreController'
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
        BackupController,
        RestoreController
    ) {

        var alert = window.alert;

        var destination = Settings.get('screenShot-destination') !== undefined ? Settings.get('screenShot-destination') : CONFIG.enums.SCREEN_SHOT_DESTINATION_FILE;
        var wrapWithShell = Settings.get('screenShot-wrapWithShell') !== undefined ? Settings.get('screenShot-wrapWithShell') : 1;

        var settingMenu;

        var ToolbarView = Backbone.View.extend({
            className : 'w-welcome-toolbar',
            template : doT.template(TemplateFactory.get('welcome', 'toolbar')),
            initialize : function () {
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

                this.listenTo(Device, 'change', this.setButtonState);
            },
            setButtonState : function () {
                this.$('.button-open-sd, .button-backup, .button-restore').prop('disabled', !Device.get('isConnected'));

                if (!Device.get('isConnected')) {
                    this.$('.button-screen-shot').prop('disabled', !Device.get('isFastADB'));
                    settingMenu.$el.prop('disabled', !Device.get('isFastADB'));
                } else {
                    if (Device.get('isUSB')) {
                        this.$('.button-screen-shot').prop('disabled', false);
                        settingMenu.$el.prop('disabled', false);
                    } else {
                        if (Device.get('isWifi')) {
                            Device.canScreenshotAsync().done(function (resp) {
                                this.$('.button-screen-shot').prop('disabled', !resp.body.value);
                                settingMenu.$el.prop('disabled', !resp.body.value);
                            }.bind(this));
                        } else {
                            this.$('.button-screen-shot').prop('disabled', true);
                            settingMenu.$el.prop('disabled', true);
                        }
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$('.screen-shot-setting').append(settingMenu.render().$el.addClass('min trans toggle'));

                this.setButtonState();
                return this;
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
            clickButtonOpenSD : function () {
                // Disable the button for 2 seconds
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
                // Disable backup restore with wifi in i18n version
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                BackupController.start();

                log({
                    'event' : 'ui.click.welcome_button_backup',
                    'isUSB' : Device.get('isUSB')
                });
            },
            clickButtonRestore : function () {
                // Disable backup restore with wifi in i18n version
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                RestoreController.start();

                log({
                    'event' : 'ui.click.welcome_button_restore',
                    'isUSB' : Device.get('isUSB')
                });
            },
            clickButtonScreenShot : function () {
                // this.options.deviceView.loading = true;
                // this.options.deviceView.fade = true;
                this.screenShotAsync().always(function () {
                    // this.options.deviceView.loading = false;
                }.bind(this));

                log({
                    'event' : 'ui.click.welcome.screen.shot',
                    'destination' : destination,
                    'wrapWithShell' : wrapWithShell
                });
            },
            events : {
                'click .button-screen-shot' : 'clickButtonScreenShot',
                'click .button-open-sd' : 'clickButtonOpenSD',
                'click .button-backup' : 'clickButtonBackup',
                'click .button-restore' : 'clickButtonRestore'
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
