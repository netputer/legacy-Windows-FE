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

        console.log('LocalRestoreAdvanceView - File loaded');

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'local-restore-advance')),
            className : "w-backuprestore-local-restore-advance hbox",
            initialize : function () {
                BodyView.__super__.initialize.apply(this, arguments);
                var selectAppData = false;
                Object.defineProperties(this, {
                    selectAppData : {
                        set : function (value) {
                            selectAppData = value;
                        },
                        get : function () {
                            return selectAppData;
                        }
                    }
                });
            },
            render : function () {

                this.$el.html(this.template({}));
                return this;
            },
            initState : function () {
                this.$('input[type=checkbox]').prop('disabled', true);

                var dataIDList = RestoreContextModel.get('dataIDList');
                _.each(RestoreContextModel.get('originDataIDList'), function (item) {

                    this.$('input[type=checkbox][value=' + item +  ']').prop({
                        'checked' :  _.contains(dataIDList, item),
                        'disabled' : false
                    });

                    if (item === CONFIG.enums.BR_TYPE_APP_DATA) {
                        BackupRestoreService.getSupportAppDataAsync().done(function (resp) {
                            this.$('input[type=checkbox][value=10]').prop('disabled', !resp.body.value);
                            this.selectAppData = resp.body.value;
                        }.bind(this));
                    }
                }, this);

                var checked = this.$('input[type=checkbox]:checked');
                this.trigger('__ENABLE_CONFIRM', checked.length > 0);
            },
            clickAppData : function (evt) {
                var checked = evt.target.checked;
                this.selectAppData = checked;

                if (checked) {
                    this.$('input[type=checkbox][name=app]').prop('checked', checked);
                }
            },
            clickApp : function (evt) {
                var checked = evt.target.checked;
                this.$('input[type=checkbox][name=appdata]').prop('checked', checked && this.selectAppData);
            },
            clickRestoreContent : function () {
                var checked = this.$('input[type=checkbox]:checked');
                this.trigger('__ENABLE_CONFIRM', checked.length > 0);
            },
            events: {
                'click input[type=checkbox]' : 'clickRestoreContent',
                'click input[type=checkbox][name=app]' : 'clickApp',
                'click input[type=checkbox][name=appdata]' : 'clickAppData'
            }
        });

        var LocalRestoreAdvanceView = Panel.extend({
            initialize : function () {
                LocalRestoreAdvanceView.__super__.initialize.apply(this, arguments);

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

                    this.listenTo(this.bodyView, '__ENABLE_CONFIRM', function (enable) {
                        this.$('.button_yes').prop('disabled', !enable);
                    });

                    this.bodyView.initState();
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    }, this);
                });
            },
            clickButtonYes : function () {
                var list = [];
                _.each(this.$('input[type=checkbox]:checked'), function (input) {
                    list.push(parseInt(input.value, 10));
                });
                RestoreContextModel.set('dataIDList', list);
            },
            events: {
                'click .button_yes' : 'clickButtonYes'
            }
        });

        var localRestoreAdvanceView;
        var factory = _.extend({
            getInstance : function () {
                if (!localRestoreAdvanceView) {
                    localRestoreAdvanceView = new LocalRestoreAdvanceView({
                        title : i18n.new_backuprestore.RESTORE_ADVANCE_TITLE,
                        disableX: true,
                        width : '440px',
                        height : '130px'

                    });
                }

                return localRestoreAdvanceView;
            }
        });

        return factory;
    });
}(this));
