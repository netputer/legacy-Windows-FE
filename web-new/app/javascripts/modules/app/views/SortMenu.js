/*global define*/
(function (window) {
    'use strict';

    define([
        'backbone',
        'underscore',
        'ui/MenuButton',
        'Environment',
        'Configuration',
        'Internationalization'
    ], function (
        Backbone,
        _,
        MenuButton,
        Environment,
        CONFIG,
        i18n
    ) {
        console.log('SortMenu - File loaded. ');

        var SortMenu = MenuButton.extend({
            initialize : function () {
                SortMenu.__super__.initialize.apply(this, arguments);
                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return _.find(this.items, function (item) {
                                return item.value === this.menu.$('input[type="radio"]:checked').val();
                            }, this);
                        }
                    }
                });

                var buttons = [{
                    label : i18n.app.COL_NAME_LABEL,
                    type : 'radio',
                    name : 'app-list-sort',
                    value : 'base_info.name',
                    checked : true
                }, {
                    label : i18n.app.COL_SIZE_LABEL,
                    type : 'radio',
                    name : 'app-list-sort',
                    value : 'base_info.apk_size',
                    checked : false
                }, {
                    label : i18n.app.COL_INSTALL_POSITION,
                    type : 'radio',
                    name : 'app-list-sort',
                    value : 'base_info.installed_location',
                    checked : false
                }, {
                    label : i18n.app.COL_INSTALL_TIME,
                    type : 'radio',
                    name : 'app-list-sort',
                    value : 'base_info.last_update_time',
                    checked : false
                }];

                if (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                        Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) {
                    buttons.push({
                        label : i18n.app.BUTTON_UPGRADE_LABEL,
                        type : 'radio',
                        name : 'app-list-sort',
                        value : 'update',
                        checked : false
                    });
                }

                this.items = buttons;
                this.label = i18n.ui.SORT;

                this.listenTo(Backbone, 'switchModule', function (data) {
                    if (data.module === 'app') {
                        this.$el.prop({
                            disabled : data.tab === 'web'
                        });
                    }
                });
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new SortMenu();
            }
        });

        return factory;
    });
}(this));
