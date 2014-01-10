/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'IO',
        'Account',
        'Internationalization',
        'Configuration',
        'Log',
        'IframeMessageWorker',
        'ui/TemplateFactory',
        'sync/SyncService',
        'backuprestore/BackupRestoreService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        IO,
        Account,
        i18n,
        CONFIG,
        log,
        IframeMessageWorker,
        TemplateFactory,
        SyncService,
        BackupRestoreService
    ) {
        console.log('PhotoSyncSwitchView - File loaded. ');

        var PhotoSyncSwitchView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('photo', 'photo-sync-switch')),
            className : 'w-photo-sync-switch selector-wrap hbox',
            initialize : function () {
                this.listenTo(Account, 'change:isLogin', this.refreshState);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SYNC_CLOUD_SETTING_CHANGE
                }, this.refreshState, this);
            },
            refreshState : function () {
                if (!Account.get('isLogin')) {
                    this.$('.w-ui-switch-button').removeClass('on');
                } else {
                    SyncService.getIsPhotoSyncOnAsync().done(function (resp) {
                        if (resp.body.value) {
                            this.tryToUpload();
                        }
                        this.$('.w-ui-switch-button').toggleClass('on', resp.body.value);
                    }.bind(this));
                }
            },
            render : function () {
                this.$el.html(this.template({}));
                this.refreshState();
                return this;
            },
            switchState : _.debounce(function (state) {
                if (!Account.get('isLogin')) {
                    this.$('.w-ui-switch-button').removeClass('on');
                    this.$('.tip').html(i18n.photo.CLOUD_PHOTO);
                } else {
                    var $tip;
                    switch (state) {
                    case 'on':
                        this.$('.w-ui-switch-button').addClass('on');
                        break;
                    case 'off':
                        this.$('.w-ui-switch-button').removeClass('on');
                        break;
                    case 'uploading':
                        this.$('.w-ui-switch-button').addClass('on');
                        $tip = this.$('.tip').html(i18n.photo.UPLOADING_PHOTOS);
                        setTimeout(function () {
                            $tip.fadeOut(function () {
                                $(this).html(i18n.misc.NAV_PIC_CLOUD).show();
                            });
                        }, 3000);
                        break;
                    case 'done':
                        this.$('.w-ui-switch-button').addClass('on');
                        $tip = this.$('.tip').html(i18n.photo.PHOTO_BACKUP_AUTO);
                        setTimeout(function () {
                            $tip.fadeOut(function () {
                                $(this).html(i18n.misc.NAV_PIC_CLOUD).show();
                            });
                        }, 3000);
                        break;
                    }
                }
            }, 500),
            clickButtonSync : function (evt) {
                if ($(evt.currentTarget).hasClass('on')) {
                    IframeMessageWorker.confirm(i18n.photo.TIP_CLOSE_PHOTO_SYNC, this.closePhotoSyncService, this);
                } else {
                    this.showPhotoSyncAlertView(this.tryLogin);
                }

                log({
                    'event' : 'ui.click.photo_toolbar_button_sync',
                    'login' : Account.get('isLogin'),
                    'action' : $(evt.target).hasClass('on') ? 'off' : 'on'
                });
            },
            closePhotoSyncService : function () {
                BackupRestoreService.stopRemoteSyncAsync();
                SyncService.setPhotoSyncSwitchAsync(false).done(function () {
                    this.switchState('off');
                }.bind(this));

                log({
                    'event' : 'debug.sync.closePhotoSync'
                });
            },
            showPhotoSyncAlertView : function (callback) {
                var listenerId = _.uniqueId('photo_sync_alert_');
                IframeMessageWorker.trigger(CONFIG.events.CUSTOM_IFRAME_PHOTO_SYNC_ALERT, {
                    listenerId : listenerId
                });

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : listenerId
                }, function (data) {
                    if (data.action === 'yes') {
                        callback.call(this);
                    }
                    IO.Backend.Device.offmessage(handler);
                }, this);
            },
            tryLogin : function () {
                if (Account.get('isLogin')) {
                    SyncService.setPhotoSyncSwitchAsync(true).done(function () {
                        this.switchState('on');
                        this.tryToUpload();
                    }.bind(this));
                    return;
                }

                Account.regAsync('', 'cloud-photo-switch');

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                }, function (message) {
                    if (message.auth) {
                        SyncService.setPhotoSyncSwitchAsync(true).done(function () {
                            this.switchState('on');
                            this.tryToUpload();
                        }.bind(this));
                        IO.Backend.Device.offmessage(handler);
                    }
                }, this);
            },
            tryToUpload : function () {
                this.switchState('uploading');
                this.listenSyncPhoto();
                SyncService.uploadPhotoAsync();
            },
            listenSyncPhoto : function () {
                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SYNC_PHOTO_COMPLETE
                }, function () {
                    SyncService.getIsPhotoSyncOnAsync().done(function (resp) {
                        if (resp.body.value) {
                            this.switchState('done');
                        }
                    }.bind(this));

                    IO.Backend.Device.offmessage(handler);
                }, this);
            },
            events : {
                'click .button-sync' : 'clickButtonSync'
            }
        });

        var photoSyncSwitchView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!photoSyncSwitchView) {
                    photoSyncSwitchView = new PhotoSyncSwitchView(args);
                }
                return photoSyncSwitchView;
            }
        });

        return factory;
    });
}(this));
