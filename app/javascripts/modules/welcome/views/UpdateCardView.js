/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Internationalization',
        'Settings',
        'Configuration',
        'Device',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'ui/AlertWindow',
        'welcome/views/FeedCardView',
        'task/TaskService',
        'main/collections/PIMCollection',
        'app/collections/AppsCollection'
    ], function (
        Backbone,
        _,
        doT,
        i18n,
        Settings,
        CONFIG,
        Device,
        TemplateFactory,
        StringUtil,
        AlertWindow,
        FeedCardView,
        TaskService,
        PIMCollection,
        AppsCollection
    ) {
        var appsCollection;
        var confirm = window.confirm;

        var UpdateCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'update-card')),
            className : FeedCardView.getClass().prototype.className + ' vbox update',
            initialize : function () {

                UpdateCardView.__super__.initialize.apply(this, arguments);

                appsCollection = AppsCollection.getInstance();
                this.listenTo(appsCollection, 'refresh', function () {
                    this.render();
                    this.options.parentView.initLayout();
                });
            },
            render : function () {
                var apps = appsCollection.getUpdatableApps();
                var items = apps.concat();

                var show = true;
                if (apps.length === 0) {
                    show = false;
                }

                this.toggle(show);

                if (show) {

                    if (apps.length >= 4 ) {
                        items = items.splice(0, 4);
                    } else {
                        items = items.splice(0, 1);
                    }

                    this.$el.html(this.template({
                        action : i18n.welcome.CARD_UPDATE_ACTION,
                        length : apps.length,
                        items : _.map(items, function (app) {
                            return app.toJSON();
                        })
                    }));

                    this.$el.toggleClass('max', apps.length >= 4);

                }

                return this;
            },
            clickButtonAction : function (evt) {
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'update'
                });

                this.log({
                    action : 'update'
                }, evt);
            },
            toggle : function (show) {
                this.$el.toggleClass('hide', !show);
                this.options.parentView.initLayout();
            },
            clickButtonIgnore : function (evt) {
                this.log({
                    action : 'ignore'
                }, evt);

                this.toggle(false);
            },
            clickButtonUpdate : function (evt) {

                evt.stopPropagation();

                var $target = $(evt.currentTarget);
                var id = $target.data('id');
                var model = appsCollection.get(id);
 
                var updateModel = model.updateInfo.clone().set({
                    source : 'update-button-list'
                }, {
                    silent : true
                });

                var updateApp = function () {
                    TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, updateModel);

                    model.set({
                        isUpdating : true
                    }).unignoreUpdateAsync();

                    $target.html(i18n.app.UPDATING).prop('disabled', true);
                };

                if (!model.isLegalToUpdate) {
                    var baseInfo = model.get('base_info');

                    var alertText;
                    if (model.isSystem && !Device.isRoot) {
                        alertText = StringUtil.format(i18n.app.ALERT_TIP_UPDATE_ILLEGAL_SYSTEM_UNROOT, baseInfo.name);
                    } else if (!!model.get('upgrade_info').notRecommendReason) {
                        alertText = StringUtil.format(i18n.app.ALERT_TIP_UPDATE_NOT_RECOMMENDED, model.get('upgrade_info').notRecommendReason.description);
                    } else {
                        alertText = StringUtil.format(i18n.app.ALERT_TIP_UPDATE_ILLEGAL, baseInfo.name);
                    }

                    confirm(alertText, function () {
                        updateModel.set({
                            force : true
                        }, {
                            silent : true
                        });
                        updateApp();

                    }, this);
                } else {
                    updateApp();
                }

                this.log({
                    action : 'update'
                }, evt);
            },
            events : {
                'click .button-action, .apps-list' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore',
                'click .button-update' : 'clickButtonUpdate'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new UpdateCardView(args);
            }
        });

        return factory;
    });
}(this));
