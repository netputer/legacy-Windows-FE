/*global define*/
(function (window, document) {
    'use strict';

    define([
        'backbone',
        'doT',
        'underscore',
        'Configuration',
        'IO',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/MenuButton',
        'app/collections/AppsCollection',
        'Log'
    ], function (
        Backbone,
        doT,
        _,
        CONFIG,
        IO,
        i18n,
        TemplateFactory,
        MenuButton,
        AppsCollection,
        log
    ) {
        console.log('UpdateNotificationView - File loaded.');

        var setting;

        var UpdateListItemView = Backbone.View.extend({
            tagName : 'li',
            className : 'hbox',
            template : doT.template(TemplateFactory.get('app', 'update-notification-list-item')),
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            },
            clickButtonUpdate : function (evt) {
                this.$('.button-update').html(i18n.app.UPDATING).prop({
                    disabled : true
                });

                IO.requestAsync({
                    url : CONFIG.actions.OPEN_WANDUJIA,
                    data : {
                        package_names : this.model.get('base_info').package_name,
                        redirect_page : 3
                    }
                });

                this.closeNotification();
            },
            closeNotification : function () {
                IO.requestAsync(CONFIG.actions.APP_CLOSE_UPDAYE_NOTIFI);
            },
            events : {
                'click .button-update' : 'clickButtonUpdate'
            }
        });

        var UpdateNotificationView = Backbone.View.extend({
            className : 'vbox app-update-notif',
            template : doT.template(TemplateFactory.get('app', 'update-notification')),
            initialize : function () {
                var UpdateAppsCollection = AppsCollection.getClass().extend({
                    url : CONFIG.actions.APP_SNAP_SHOT
                });
                this.collection = new UpdateAppsCollection();
                this.collection.trigger('update');
                this.collection.on('refresh', this.renderList, this);
            },
            render : function () {
                this.$el.html(this.template({}));

                this.buildConfigButton();

                IO.requestAsync({
                    url : CONFIG.actions.APP_UPDATE_NOTIFI_FREQUENCE,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            setting = resp.body.value;
                        }
                    }.bind(this)
                });

                this.renderList(this.collection);

                return this;
            },
            buildConfigButton : function () {
                var configButton = new MenuButton({
                    label : i18n.app.CONFIG,
                    items : [{
                        type : 'radio',
                        name : 'frequence',
                        label : i18n.app.UPDATE_NOTIFI_FREQUENCE_DAYLY,
                        value : '1'
                    }, {
                        type : 'radio',
                        name : 'frequence',
                        label : i18n.app.UPDATE_NOTIFI_FREQUENCE_WEEKLY,
                        value : '2'
                    }, {
                        type : 'radio',
                        name : 'frequence',
                        label : i18n.app.UPDATE_NOTIFI_FREQUENCE_NEVER,
                        value : '0'
                    }]
                });

                configButton.on('select', function (data) {
                    IO.requestAsync({
                        url : CONFIG.actions.APP_UPDATE_NOTIFI_FREQUENCE,
                        data : {
                            frequence : data.value
                        },
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                setting = data.value;
                                console.log('UpdateNotificationView - Set update notifiaction frequence success.');
                            } else {
                                console.warn('UpdateNotificationView - Set update notifiaction frequence faild. Error info: ' + resp.state_line);
                            }
                        }
                    });
                });

                this.$('.manage-ctn').prepend(configButton.render().$el);

                configButton.menu.on('show', function () {
                    configButton.menu.$('input[type="radio"][value="' + (setting || 1) + '"]').prop({
                        checked : true
                    });
                });
            },
            renderList : function (collection) {
                var $listCtn = this.$('.list-ctn').hide().empty();
                var fragment = document.createDocumentFragment();
                collection.each(function (app) {
                    var itemView = new UpdateListItemView({
                        model : app
                    });
                    fragment.appendChild(itemView.render().$el[0]);
                });
                $listCtn.append(fragment).show();
            },
            closeNotification : function () {
                IO.requestAsync(CONFIG.actions.APP_CLOSE_UPDAYE_NOTIFI);
            },
            clickButtonManageApp : function (evt) {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_WANDUJIA,
                    data : {
                        redirect_page : 3
                    }
                });

                log({
                    'event' : 'ui.click.app_button_update_notification'
                });

                this.closeNotification();
            },
            clickButtonUpdateAll : function (evt) {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_WANDUJIA,
                    data : {
                        package_names : this.collection.map(function (app) {
                            return app.get('base_info').package_name;
                        }).join(','),
                        redirect_page : 3
                    }
                });

                log({
                    'event' : 'ui.click.app_button_update_all_notification'
                });

                this.closeNotification();
            },
            events : {
                'click .button-manage-app' : 'clickButtonManageApp',
                'click .button-update-all' : 'clickButtonUpdateAll'
            }
        });

        var factory = _.extend(function () {}, {
            getInstance : function (args) {
                return new UpdateNotificationView(args);
            }
        });

        return factory;
    });
}(this, this.document));
