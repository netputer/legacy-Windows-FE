/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Log',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'ui/Panel',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/RestoreContextModel'
    ], function (
        $,
        Backbone,
        _,
        doT,
        Device,
        log,
        CONFIG,
        i18n,
        TemplateFactory,
        UIHelper,
        Panel,
        BackupRestoreService,
        RestoreContextModel
    ) {

        console.log('RemoteRestoreAdvanceView - File loaded');

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'remote-restore-advance')),
            className : "w-backuprestore-local-restore-advance hbox",
            render : function () {

                this.$el.html(this.template({}));

                setTimeout(function () {
                    this.initState();
                }.bind(this), 0);

                return this;
            },
            initState : function () {

                $('input[type=checkbox]').prop('disabled', true);

                _.map(RestoreContextModel.get('dataIDList'), function (item) {
                    $('input[type=checkbox][value=' + item +  ']').prop({
                        'checked' : true,
                        'disabled' : false
                    });
                });
            }
        });

        var RemoteRestoreAdvanceView = Panel.extend({
            initialize : function () {
                RemoteRestoreAdvanceView.__super__.initialize.apply(this, arguments);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('primary button_yes'),
                    eventName: 'button_yes'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button_cancel'),
                    eventName : 'button_cancel'
                }];

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    this.bodyView = new BodyView();
                    this.$bodyContent = this.bodyView.render().$el;
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    }, this);
                });
            },
            clickButtonYes : function () {
                var list = [];
                _.map(this.$('input[type=checkbox]:checked'), function (input) {
                    list.push(parseInt(input.value, 10));
                });
                RestoreContextModel.set('dataIDList', list);
            },
            events: {
                'click .button_yes' : 'clickButtonYes'
            }
        });

        var remoteRestoreAdvanceView;
        var factory = _.extend({
            getInstance : function () {
                if (!remoteRestoreAdvanceView) {
                    remoteRestoreAdvanceView = new RemoteRestoreAdvanceView({
                        title : i18n.new_backuprestore.RESTORE_ADVANCE_TITLE,
                        disableX: true,
                        width : '430px',
                        height : '130px'

                    });
                }

                return remoteRestoreAdvanceView;
            }
        });

        return factory;
    });
}(this));
