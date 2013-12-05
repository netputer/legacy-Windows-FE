/*global console, define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Internationalization',
        'IO',
        'Configuration',
        'WindowController',
        'message/models/ImportContextModel',
        'ui/Panel',
        'ui/AlertWindow',
        'message/collections/ConversationsCollection',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'utilities/StringUtil'
    ], function (
        Backbone,
        doT,
        $,
        _,
        i18n,
        IO,
        CONFIG,
        WindowController,
        ImportContextModel,
        Panel,
        AlertWindow,
        ConversationsCollection,
        TemplateFactory,
        UIHelper,
        StringUtil
    ) {

        console.log('Message ImportProgressView - File loaded');

        var alert = window.alert;
        var ImportProgressBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'import-progress')),
            className : 'w-message-import-progress-body',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            setDuplicate : function (duplicateNum) {
                var info = (duplicateNum === null) ? '' : StringUtil.format(i18n.message.DUPLICATE, duplicateNum);
                this.$('.duplicate').text(info);
            }
        });

        var importProgressView;
        var $bodyView;
        var conversationConllection = ConversationsCollection.getInstance();
        var ImportProgressView = Panel.extend({
            initialize : function () {
                ImportProgressView.__super__.initialize.apply(this, arguments);
                this.on(UIHelper.EventsMapping.SHOW, function () {
                    $bodyView = new ImportProgressBodyView();
                    this.$bodyContent = $bodyView.render().$el;
                    this.center();
                    this.once('remove', $bodyView.remove, $bodyView);
                }.bind(this));

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.FINISH).addClass('button-finish primary').hide(),
                    eventName : 'button-finish'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button-cancel'
                }];
            },
            setProgress : function (current, total) {
                var content = current + ' / ' + total;
                this.$('.progress-num').text(content);
                if (current === total) {
                    this.$('.progress-desc').text(i18n.message.IMPORT_SMS_FINISH);
                    this.$('.running').removeClass('running');
                }

                this.$('progress').attr({
                    max : total,
                    value : current
                });
            },
            importSms : function () {
                var file = ImportContextModel.get('files');
                var sessionId = _.uniqueId('Import_sms');
                this.lastSessionId = sessionId;

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : sessionId
                }, function (msg) {
                    if (msg.info === 'dup') {
                        var num = parseInt(msg.current, 10);
                        if (num > 0) {
                            $bodyView.setDuplicate(msg.current);
                        }
                    } else {
                        this.setProgress(msg.current, msg.total);
                        if (msg.current === msg.total) {
                            conversationConllection.syncAsync();
                            IO.Backend.Device.offmessage(handler);
                            this.$('.button-finish').show();
                            this.$('.button-cancel').hide();
                        }
                    }
                }.bind(this));

                var callback = function (resp) {
                    WindowController.releaseWindowAsync();
                    conversationConllection.syncAsync();
                    this.trigger('_IMPORT_SMS', resp);
                }.bind(this);

                WindowController.blockWindowAsync();
                conversationConllection.importConversationAsync(file, sessionId).always(callback);
            },
            refreshBtn : function () {
                this.$('.button-finish').hide();
                this.$('.button-cancel').show();
            },
            clickFinishBtn : function () {
                this.trigger('_IMPORT_SMS_FINISH');
                this.remove();
            },
            clickCancelBtn : function () {
                this.remove();
                IO.requestAsync({
                    url : CONFIG.actions.SMS_CANCEL,
                    data : {
                        session : this.lastSessionId
                    }
                }).done(function () {
                    alert(i18n.misc.CANCEL_IMPORT_TEXT);
                    conversationConllection.syncAsync();
                }).always(function () {
                    WindowController.releaseWindowAsync();
                });
            },
            events : {
                'click .button-finish' : 'clickFinishBtn',
                'click .button-cancel' : 'clickCancelBtn'
            }
        });

        var factory = {
            getInstance : function () {
                if (!importProgressView) {
                    importProgressView = new ImportProgressView({
                        title : i18n.message.WINDOW_IMPORT_TITLE,
                        disableX : true,
                        draggable : true,
                        width : 450
                    });
                }

                return importProgressView;
            }
        };

        return factory;
    });
}(this));
