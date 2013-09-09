/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        BackupRestoreService,
        BackupContextModel,
        RestoreContextModel
    ) {
        console.log('ErrorRetryView - File loaded. ');

        var ErrorRetryBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'error-retry')),
            className : 'w-backup-error-retry',
            initialize : function () {
                ErrorRetryBodyView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    content : {
                        set : function (value) {
                            this.$('.content').html(value);
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var ErrorRetryView = Panel.extend({
            initialize : function () {
                ErrorRetryView.__super__.initialize.apply(this, arguments);

                var content = '';
                Object.defineProperties(this, {
                    content : {
                        set : function (value) {
                            content = value;
                            if (this.bodyView) {
                                this.bodyView.content = value;
                            }
                        },
                        get : function () {
                            return content;
                        }
                    }
                });

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    this.bodyView = new ErrorRetryBodyView();
                    this.$bodyContent = this.bodyView.render().$el;
                    this.bodyView.content = this.content;

                    this.center();
                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    });

                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('button-retry')
                }, {
                    $button : $('<button>').html(i18n.ui.IGNORE).addClass('button-ignore primary')
                }];

            },
            render : function () {
                _.extend(this.events, ErrorRetryView.__super__.events);
                this.delegateEvents();
                ErrorRetryView.__super__.render.apply(this, arguments);

                return this;
            },
            clickBtnRetry : function () {
                this.remove();
                this.trigger('__RETRY');
            },
            clickBtnIgnore : function () {
                this.remove();
                this.trigger('__IGNORE');
            },
            events : {
                'click .button-retry' : 'clickBtnRetry',
                'click .button-ignore' : 'clickBtnIgnore'
            }
        });

        var factory = _.extend({
            getBackupInstance : function () {
                return new ErrorRetryView({
                    title : i18n.new_backuprestore.BACKUP_TITLE,
                    disableX : true,
                    width : BackupRestoreService.CONSTS.ViewWidthTip
                });
            },
            getRestoreInstance : function () {
                return new ErrorRetryView({
                    title : i18n.new_backuprestore.RESTORE_TITLE,
                    disableX : true,
                    width : BackupRestoreService.CONSTS.ViewWidthTip
                });
            }
        });

        return factory;
    });
}(this));
