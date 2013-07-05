/*global console, define*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'IO',
        'Device',
        'Internationalization',
        'Configuration',
        'WindowController',
        'ui/Panel',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'message/collections/ConversationsCollection'
    ], function (
        Backbone,
        doT,
        $,
        _,
        IO,
        Device,
        i18n,
        Config,
        WindowController,
        Panel,
        AlertWindow,
        TemplateFactory,
        UIHelper,
        ConversationsCollection
    ) {

        console.log('ExportProgressView - file loader');

        var alert = window.alert;
        var conversationsCollection = ConversationsCollection.getInstance();
        var ExportProgressBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'export-progress')),
            className : 'w-message-export-progress-body',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            setProgress : function (current, total) {
                var contant = current + ' / ' + total;
                this.$('.progress-num').text(contant);

                if (current === total) {
                    this.$('.progress-desc').text(i18n.message.EXPORT_SMS_FINISH);
                    this.$('progress').removeClass('running');
                }

                this.$('progress').attr({
                    max : total,
                    value : current
                });
            }
        });

        //TODO: 添加查看导出文件按钮
        var exportProgressView;
        var ExportProgressView = Panel.extend({

            initialize : function () {
                ExportProgressView.__super__.initialize.call(this, arguments);

                var export_dir = '';
                Object.defineProperties(this, {
                    export_dir : {
                        get : function () {
                            return export_dir;
                        },
                        set : function (value) {
                            export_dir = value;
                        }
                    }
                });

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    var bodyView = new ExportProgressBodyView();

                    this.$bodyContent = bodyView.render().$el;
                    this.setProgress = bodyView.setProgress;

                    var $checkFileBtn = $('<button>').html(i18n.misc.OPEN_EXPORT_FILE).addClass('button-checkFile').hide();
                    this.$('.w-ui-window-footer-monitor').append($checkFileBtn);

                    this.once('remove', function () {
                        bodyView.remove();
                        $checkFileBtn.remove();
                        delete this.setProgress;
                    });
                    this.center();
                });

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.FINISH).addClass('button-finish primary').hide(),
                    eventName : 'button-finish'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button-cancel'
                }];
            },
            render : function () {
                _.extend(this.events, ExportProgressView.__super__.events);
                this.delegateEvents();
                ExportProgressView.__super__.render.apply(this, arguments);
            },
            exportConversations : function (type, ids) {

                var sessionId = _.uniqueId('Export_sms');
                this.lastSessionId = sessionId;

                var handler = IO.Backend.Device.onmessage({'data.channel' : sessionId }, function (msg) {
                    this.setProgress(msg.current, msg.total);
                    if (msg.current === msg.total) {
                        IO.Backend.Device.offmessage(handler);
                        conversationsCollection.syncAsync();
                        this.$('.button-finish').show();
                        this.$('.button-cancel').hide();
                        this.$('.button-checkFile').show();
                    }
                }.bind(this));

                var callback = function (resp) {

                    WindowController.releaseWindowAsync();
                    if (resp.state_code === 200) {
                        this.export_dir = resp.body.value;
                    } else {
                        this.trigger('_EXPORT_SMS_CANCEL', resp);
                        this.remove();
                        switch (resp.state_code) {
                        case 402:
                            IO.Backend.Device.offmessage(handler);
                            break;
                        case 500:
                            alert(i18n.misc.CONNECTION_LOSE);
                            break;
                        default:
                            alert(i18n.message.EXPORT_FAILED);
                        }
                    }
                }.bind(this);

                WindowController.blockWindowAsync();
                if (type === 2) {
                    conversationsCollection.exportConversationAsync(_.pluck(conversationsCollection.models, 'id'), sessionId).always(callback);
                } else {
                    conversationsCollection.exportConversationAsync(ids, sessionId).always(callback);
                }
            },
            clickFinishBtn : function () {
                this.remove();
            },
            clickCancelBtn : function () {
                this.remove();
                IO.requestAsync({
                    url : Config.actions.SMS_CANCEL,
                    data : {
                        session : this.lastSessionId
                    }
                }).done(function (resp) {
                    alert(i18n.common.CANCEL_EXPORT_TEXT);
                    conversationsCollection.syncAsync();
                }).always(function () {
                    WindowController.releaseWindowAsync();
                });
            },
            clickCheckFileBtn : function () {
                IO.requestAsync({
                    url : Config.actions.SHOW_FILE,
                    data : {
                        file_path : this.export_dir
                    }
                });
                this.remove();
            },
            events : {
                'click .button-finish' : 'clickFinishBtn',
                'click .button-cancel'  : 'clickCancelBtn',
                'click .button-checkFile' : 'clickCheckFileBtn'
            },
            initState : function () {
                this.$('.button-finish').hide();
                this.$('.button-cancel').show();
                this.$('.button-checkFile').hide();
            }
        });

        var factory = {
            getInstance : function () {
                if (!exportProgressView) {
                    exportProgressView = new ExportProgressView({
                        title : i18n.message.EXPORT_MESSAGE,
                        width : 400,
                        disableX : true
                    });
                }
                return exportProgressView;
            }
        };
        return factory;
    });
}(this));
