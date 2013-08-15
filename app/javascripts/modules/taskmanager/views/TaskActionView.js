/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Internationalization',
        'Configuration',
        'IO',
        'Settings',
        'Environment',
        'Device',
        'Log',
        'ui/TemplateFactory',
        'ui/ToastBox',
        'utilities/StringUtil',
        'task/collections/TasksCollection',
        'task/views/DeleteConfirmWindowView',
        'music/collections/MusicsCollection'
    ], function (
        Backbone,
        _,
        doT,
        i18n,
        CONFIG,
        IO,
        Settings,
        Environment,
        Device,
        log,
        TemplateFactory,
        ToastBox,
        StringUtil,
        TasksCollection,
        DeleteConfirmWindowView,
        MusicsCollection
    ) {
        console.log('TaskActionView - File loaded.');

        var boxViewInsance;

        var TaskActionView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('taskManager', 'task-action')),
            className : 'action',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                return this;
            },
            clickButtonStart : function (evt) {
                evt.stopPropagation();
                this.model.startTaskAsync();
            },
            clickButtonPause : function (evt) {
                evt.stopPropagation();
                this.model.stopTaskAsync();

                log({
                    'event' : 'ui.click.task.pause.item',
                    'connected' : Device.get('isConnected'),
                    'type' : this.model.get('category'),
                    'title' : this.model.get('title'),
                    'url' : this.model.get('detail'),
                    'size' : this.model.get('size'),
                    'processing' : this.model.get('processing')
                });
            },
            clickButtonChangePath : function (evt) {
                evt.stopPropagation();
                IO.requestAsync(CONFIG.actions.SAVE_SCREENSHOT).done(function (resp) {
                    var collection = TasksCollection.getInstance();
                    var ids = _.pluck(_.filter(collection.getFailedTasks(), function (task) {
                        return task.get('message') === 'NO_SPACE';
                    }), 'id');
                    collection.startTasksAsync(ids);
                });
            },
            clickButtonRetry : function (evt) {
                evt.stopPropagation();
                this.model.startTaskAsync();
            },
            clickButtonForceRestart : function (evt) {
                evt.stopPropagation();
                this.model.restartAsync({
                    reinstall : 1
                });
            },
            clickButtonOpenOnDevice : function (evt) {
                evt.stopPropagation();
                this.model.openOnDeviceAsync();
            },
            clickButtonSetAsWallpaper : function (evt) {
                evt.stopPropagation();

                var content;
                this.model.setAsWallpaperAsync().done(function () {
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
                });
            },
            clickButtonSetAsRingtone : function (evt) {
                evt.stopPropagation();

                var content;
                this.model.setAsRingtoneAsync().done(function (resp) {

                    content = i18n.taskManager.SET_AS_RINGTONE_SUCCESS;

                    var musicsCollection = MusicsCollection.getInstance();
                    musicsCollection.settings.ringtone = resp.body.value;
                    musicsCollection.trigger('refresh', musicsCollection);

                }).fail(function () {
                    content = i18n.taskManager.SET_AS_RINGTONE_FAIL;
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
                });
            },
            clickButtonChangeLocation : function (evt) {
                evt.stopPropagation();
                IO.requestAsync(CONFIG.actions.SAVE_APP_SETTING);
            },
            clickButtonManageApp : function (evt) {
                evt.stopPropagation();
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'normal'
                });
            },
            clickButtonDelete : function (evt) {
                evt.stopPropagation();
                var alertPanel = new DeleteConfirmWindowView.getInstance({
                    $bodyContent : i18n.taskManager.CONFIRM_DELETE_BATCH
                });

                alertPanel.show();

                alertPanel.once('button_yes', function () {
                    this.model.deleteTaskAsync(alertPanel.deleteFile);
                }, this);
            },
            clickButtonManageSD : function (evt) {
                evt.stopPropagation();
                IO.requestAsync(CONFIG.actions.DEVICE_OPEN_SD_CARD);
            },
            clickButtonInstallToDevice : function (evt) {
                evt.stopPropagation();
                this.model.restartAsync({
                    location : CONFIG.enums.INSTALL_LOCATION_DEVICE
                });
            },
            clickButtonContinueInstall : function (evt) {
                evt.stopPropagation();
                this.model.restartAsync({
                    no_scan_virus : 1
                });
            },
            clickButtonHowToConnect : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : i18n.taskManager.HOW_TO_CONNECT_URL
                    }
                });
            },
            clickButtonDontAskAgainDevice : function () {
                Settings.set('task-manager-device-not-found', true, Environment.get('deviceId'));

                TasksCollection.getInstance().trigger('update');
            },
            clickButtonConnect : function (evt) {
                evt.stopPropagation();
                IO.requestAsync(CONFIG.actions.CONNET_PHONE);
            },
            clickButtonPushToPhone : function(evt) {
                evt.stopPropagation();
                this.model.forceRestartAsync();
            },
            events : {
                'click .button-start' : 'clickButtonStart',
                'click .button-pause' : 'clickButtonPause',
                'click .button-retry' : 'clickButtonRetry',
                'click .button-force-restart' : 'clickButtonForceRestart',
                'click .button-open-on-device' : 'clickButtonOpenOnDevice',
                'click .button-set-as-wallpaper' : 'clickButtonSetAsWallpaper',
                'click .button-change-location' : 'clickButtonChangeLocation',
                'click .button-manage-app' : 'clickButtonManageApp',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-manage-sd' : 'clickButtonManageSD',
                'click .button-install-to-device' : 'clickButtonInstallToDevice',
                'click .button-continue-install' : 'clickButtonContinueInstall',
                'click .button-how-to-connect' : 'clickButtonHowToConnect',
                'click .button-dont-ask-again-device' : 'clickButtonDontAskAgainDevice',
                'click .button-connect' : 'clickButtonConnect',
                'click .button-change-path' : 'clickButtonChangePath',
                'click .button-set-as-ringtong' : 'clickButtonSetAsRingtone',
                'click .button-push-phone' : 'clickButtonPushToPhone'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new TaskActionView(args);
            }
        });

        return factory;
    });
}(this));
