/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'WindowController',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'ui/AlertWindow',
        'IOBackendDevice',
        'Internationalization',
        'Configuration',
        'contact/models/ExportContextModel',
        'contact/collections/ContactsCollection',
        'contact/views/ExportSelectNumberView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        WindowController,
        Panel,
        TemplateFactory,
        UIHelper,
        AlertWindow,
        IO,
        i18n,
        CONFIG,
        ExportContextModel,
        ContactsCollection,
        ExportSelectNumberView
    ) {
        console.log('ExportProgressView - File loaded. ');

        var alert = window.alert;

        var ExportProgressBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'export-progress')),
            className : 'w-contact-export-body',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var bodyView;
        var sessionId;
        var progressHandler;
        var contactsCollection;

        var ExportProgressView = Panel.extend({
            finished : false,
            initialize : function () {
                ExportProgressView.__super__.initialize.apply(this, arguments);

                contactsCollection = ContactsCollection.getInstance();

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new ExportProgressBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button_cancel'
                }, {
                    $button : $('<button>').html(i18n.ui.FINISH).addClass('button-finish primary'),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {
                _.extend(this.events, ExportProgressView.__super__.events);
                this.delegateEvents();
                ExportProgressView.__super__.render.apply(this, arguments);

                var $buttonShowFile = $('<button>').html(i18n.misc.OPEN_EXPORT_FILE).addClass('button-show-file');
                this.$('.w-ui-window-footer-monitor').append($buttonShowFile);
                this.initState();

                return this;
            },
            initState : function () {
                this.finished = false;
                this.$('.button-show-file, .button-finish').hide();
                this.$('.button-cancel').show();
                this.$('.progress-desc').text(i18n.misc.EXPORTING);
            },
            exportContacts : function () {

                sessionId = _.uniqueId('contact.export_');
                var contactIDList = this.getContactsIDList();
                var fileType = ExportContextModel.get('fileType');

                contactsCollection.exportAsync(contactIDList, fileType, sessionId).done(function (resp) {
                    ExportContextModel.set({
                        exportFilePath : resp.body.value
                    });
                    this.setProgressAsFinished();
                }.bind(this)).fail(function (resp) {
                    this.trigger('_LAST_VIEW');
                    switch (resp.state_code) {
                    case 402:
                        // user cancelled
                        break;
                    case 500:
                        alert(i18n.misc.CONNECTION_LOSE);
                        break;
                    default:
                        alert(i18n.contact.EXPORT_CONTACT_FAILED);
                        break;
                    }
                }.bind(this)).always(function () {
                    WindowController.releaseWindowAsync();
                });
                WindowController.blockWindowAsync();

                progressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : sessionId
                }, function (msg) {
                    this.setProgress(msg.current, msg.total);
                    if (msg.current === msg.total) {
                        IO.Backend.Device.offmessage(progressHandler);
                    }
                }, this);
            },
            getContactsIDList : function () {
                switch (ExportContextModel.get('dataType')) {
                case 1:
                    return ExportContextModel.get('selectedIdList');
                case 2:
                    return [];
                case 3:
                    return ExportContextModel.get('hasPhoneIdList');
                case 4:
                    var contacts = ExportContextModel.get('selectGroup') !== 'all' ?
                            contactsCollection.getContactsByGroupIdAndAccountName(ExportContextModel.get('selectGroup'), ExportContextModel.get('selectAccount')) :
                            contactsCollection.getContactsByAccountName(ExportContextModel.get('selectAccount'));
                    return _.pluck(contacts, 'id');
                }
            },
            setProgress : function (current, total) {
                if (this.finished) {
                    current = total;
                }

                var content = current + ' / ' + total;
                this.$('.progress-num').text(content);
                if (current < total) {
                    this.$('.progress-desc').text(i18n.contact.EXPORT_PROGRESS_DESC2);
                }

                this.$('progress').attr({
                    max : total,
                    value : current
                });
            },
            setProgressAsFinished : function () {
                this.finished = true;
                this.$('.progress-desc').text(i18n.contact.EXPORT_SUCCESS_DESC2);
                this.$('progress').removeClass('running');
                this.$('.button-cancel').hide();
                this.$('.button-show-file, .button-finish').show();
            },
            clickButtonShowFile : function () {
                IO.requestAsync({
                    url : CONFIG.actions.SHOW_FILE,
                    data : {
                        file_path : ExportContextModel.get('exportFilePath')
                    }
                });
            },
            clickButtonCancel : function () {
                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_CANCEL,
                    data : {
                        session : sessionId
                    },
                    success : function () {

                        WindowController.releaseWindowAsync();
                        alert(i18n.message.EXPORT_SMS_CANCEL);
                        this.trigger('_CANCEL');
                        IO.Backend.Device.offmessage(progressHandler);
                    }.bind(this)
                });
            },
            events : {
                'click .button-show-file' : 'clickButtonShowFile',
                'click .button-cancel' : 'clickButtonCancel'
            }
        });

        var exportProgressView;

        var factory = _.extend({
            getInstance : function () {
                if (!exportProgressView) {
                    exportProgressView = new ExportProgressView({
                        title : i18n.contact.WINDOW_EXPORT_TITLE,
                        disableX : true,
                        height : 260,
                        width : 400
                    });
                }
                return exportProgressView;
            }
        });

        return factory;
    });
}(this));
