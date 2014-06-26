/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'Log',
        'Device',
        'Internationalization',
        'Configuration',
        'ui/PopupTip',
        'ui/PopupPanel',
        'ui/TemplateFactory',
        'ui/Panel',
        'utilities/FormatString',
        'IOBackendDevice',
        'task/TaskService',
        'app/collections/AppsCollection',
        'app/wash/views/FeedbackCardView'
    ], function (
        Backbone,
        _,
        $,
        doT,
        log,
        Device,
        i18n,
        CONFIG,
        PopupTip,
        PopupPanel,
        TemplateFactory,
        Panel,
        formatString,
        IO,
        TaskService,
        AppsCollection,
        FeedbackCardView
    ) {
        console.log('ResultItemView - File loaded. ');

        var alert = window.alert;

        var appsCollection;

        var refreshHandler = function (appsCollection) {
            var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);
            if (originalApp !== undefined) {
                this.$('.icon img').attr({
                    src : originalApp.get('base_info').icon
                });
            }
        };

        var connectedHandler = function (Device, isConnected) {
            this.$('.button-uninstall').prop({
                disabled : !isConnected
            });
        };

        var InfoPanelView = PopupPanel.extend({
            initialize : function () {
                InfoPanelView.__super__.initialize.apply(this, arguments);
                this.$content = doT.template(TemplateFactory.get('wash', 'result-info'))(this.model.toJSON());
            }
        });

        var ResultItemView = Backbone.View.extend({
            className : 'result-item vbox',
            tagName : 'li',
            template : doT.template(TemplateFactory.get('wash', 'result-item')),
            popups : [],
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();
                if (this.model.get('function').type === 'AD' && !this.model.get('candidateApks')) {
                    this.$el.addClass('uninstall');
                    this.listenTo(Device, 'change:isConnected', connectedHandler);
                }

                this.listenTo(appsCollection, 'refresh', refreshHandler);
                this.listenToOnce(this.model, 'remove', this.remove);
            },
            render : function () {
                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);

                this.$el.html(this.template({
                    origin : originalApp.toJSON(),
                    result :  this.model.toJSON()
                }));

                _.each(this.$('[data-title]'), function (item) {
                    this.popups.push(new PopupTip({
                        $host : $(item)
                    }));
                }, this);

                if (this.$('.info').length > 0) {
                    this.popups.push(new InfoPanelView({
                        $host : this.$('.info'),
                        model : this.model
                    }));
                }

                this.$('.front').before(FeedbackCardView.getInstance({
                    model : this.model
                }).render().$el);

                return this;
            },
            clickButtonReplace : function () {
                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);
                var downloadInfo = this.model.get('candidateApks')[0].apk;

                var model = new Backbone.Model({
                    downloadUrl : downloadInfo.downloadUrl,
                    title : downloadInfo.title,
                    iconPath : originalApp.get('base_info').icon,
                    source : 'app-wash',
                    force : true,
                    packageName : downloadInfo.packageName
                });

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                originalApp.set({
                    isUpdating : true
                });

                this.model.collection.remove(this.model);

                var updatePackageName = downloadInfo.packageName;
                var piratePackageName = this.model.get('sourceApk').packageName;

                if (updatePackageName !== piratePackageName) {
                    var installHanderl = IO.Backend.Device.onmessage({
                        'data.channel' : CONFIG.events.APP_INSTALLED
                    }, function (data) {
                        if (data.package_name === updatePackageName) {
                            var id = piratePackageName;
                            var oldApp = appsCollection.get(id);

                            if (oldApp !== undefined) {
                                oldApp.uninstallAsync().done(function () {
                                    oldApp = appsCollection.get(id);
                                    if (oldApp !== undefined) {
                                        appsCollection.remove(oldApp, {
                                            silent : true
                                        });
                                        appsCollection.trigger('refresh', appsCollection);
                                    }
                                });
                            }

                            IO.Backend.Device.offmessage(installHanderl);
                        }
                    }, this);
                }

                log({
                    'event' : 'ui.click.wash.button.item.replace',
                    'type' : this.model.get('function').type,
                    'packageName' : this.model.get('sourceApk').packageName,
                    'signature' : originalApp.get('signatures'),
                    'md5' : originalApp.get('fileMd5')
                });
            },
            clickButtonUninstall : function () {
                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);

                originalApp.uninstallAsync('xibaibai').done(function (resp) {
                    if ((Device.get('isWifi') || Device.get('isInternet')) && !originalApp.isSystem) {
                        alert(i18n.app.ALERT_TIP_UNINSTALL_WIFI_CONFIRM);
                    }
                    var failed = resp.body.failed;
                    if (failed && failed.length > 0) {
                        if (failed[0].item === this.originalApp.id) {
                            alert(originalApp.isSystem ? i18n.app.UNINSTALL_FAILED + i18n.app.UNINSTALL_FAILED_SYSTEM_APP : i18n.app.UNINSTALL_FAILED);
                        }
                    }
                }.bind(this)).fail(function () {
                    alert(originalApp.isSystem ? i18n.app.UNINSTALL_FAILED + i18n.app.UNINSTALL_FAILED_SYSTEM_APP : i18n.app.UNINSTALL_FAILED);
                }.bind(this));

                this.$('.button-uninstall').prop({
                    disabled : true
                });

                this.model.collection.remove(this.model);

                log({
                    'event' : 'ui.click.wash.button.item.uninstall',
                    'packageName' : this.model.get('sourceApk').packageName,
                    'signature' : originalApp.get('signatures'),
                    'md5' : originalApp.get('fileMd5')
                });
            },
            remove : function () {
                this.$el.fadeOut('slow', function () {
                    _.each(this.popups, function (popup) {
                        popup.remove();
                    });
                    delete this.popups;
                    Backbone.View.prototype.remove.call(this);
                }.bind(this));
            },
            clickButtonIgnore : function () {
                this.$el.addClass('flip');
                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);
                log({
                    'event' : 'ui.click.wash.button.ignore',
                    'packageName' : this.model.get('sourceApk').packageName,
                    'signature' : originalApp.get('signatures'),
                    'md5' : originalApp.get('fileMd5')
                });
            },
            clickButtonCancel : function () {
                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);
                log({
                    'event' : 'ui.click.wash.button.cancel',
                    'from' : this.$el.hasClass('replace') ? 'confirm' : 'ignore',
                    'packageName' : this.model.get('sourceApk').packageName,
                    'signature' : originalApp.get('signatures'),
                    'md5' : originalApp.get('fileMd5')
                });

                this.$el.removeClass('flip replace');
            },
            clickButtonConfirm : function () {
                this.$el.addClass('flip replace');
                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);
                log({
                    'event' : 'ui.click.wash_button_confirm',
                    'packageName' : this.model.get('sourceApk').packageName,
                    'signature' : originalApp.get('signatures'),
                    'md5' : originalApp.get('fileMd5')
                });
            },
            clickBUttonCloseAds : function () {
                var i = new window.AndroidIntent('android.settings.APPLICATION_DETAILS_SETTINGS',
                            '',
                            'package:' + this.model.get('sourceApk').packageName,
                            '',
                            '',
                            ''
                        );
                i.startActivity();

                var panel = new Panel({
                    title : i18n.app.WASH_RESULT_TITLE,
                    height : 550,
                    width : 715,
                    $bodyContent : $(doT.template(TemplateFactory.get('wash', 'close-notification'))({
                        title : formatString(i18n.app.WASH_CLOSE_NOTIFI_TITLE, appsCollection.get(this.model.get('sourceApk').packageName).get('base_info').name)
                    })),
                    buttonSet : 'yes'
                });

                panel.show();

                panel.once('remove', function () {
                    this.$('.content').html(i18n.app.WASH_ALREADY_CLOSE);
                    this.$('.button-close-ads').html(i18n.app.CLOSED).removeClass('button-close-ads').addClass('button-ignore-app');
                    this.$('.button-ignore').html(i18n.app.NO).removeClass('button-ignore').addClass('button-reset');
                }, this);

                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);
                log({
                    'event' : 'ui.click.wash_button_close_popup',
                    'packageName' : this.model.get('sourceApk').packageName,
                    'signature' : originalApp.get('signatures'),
                    'md5' : originalApp.get('fileMd5')
                });
            },
            clickButtonIgnoreApp : function () {
                IO.requestAsync({
                    url : CONFIG.actions.APP_IGNORE_WASH,
                    data : {
                        package_name : this.model.get('sourceApk').packageName
                    }
                });

                this.model.collection.remove(this.model);

                var originalApp = appsCollection.get(this.model.get('sourceApk').packageName);
                log({
                    'event' : 'ui.click.wash_button_ignore_app',
                    'packageName' : this.model.get('sourceApk').packageName,
                    'signature' : originalApp.get('signatures'),
                    'md5' : originalApp.get('fileMd5')
                });
            },
            events : {
                'click .button-replace' : 'clickButtonReplace',
                'click .button-uninstall' : 'clickButtonUninstall',
                'click .button-ignore' : 'clickButtonIgnore',
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-confirm' : 'clickButtonConfirm',
                'click .button-close-ads' : 'clickBUttonCloseAds',
                'click .button-reset' : 'render',
                'click .button-ignore-app' : 'clickButtonIgnoreApp'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ResultItemView(args);
            }
        });

        return factory;
    });
}(this));
