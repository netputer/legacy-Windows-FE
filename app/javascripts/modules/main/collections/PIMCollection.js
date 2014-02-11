/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Internationalization',
        'ProjectConfig',
        'FunctionSwitch',
        'Environment'
    ], function (
        _,
        Backbone,
        i18n,
        ProjectConfig,
        FunctionSwitch,
        Environment
    ) {
        console.log('PIMCollection - File loaded.');

        var menus = [{
            count : -1,
            hide : ProjectConfig.get('HIDE_NAV_WELCOME_TO_WDJ'),
            icon : 'welcome',
            id : 0,
            label : ProjectConfig.get('CUSTOM_NAV_WELCOME_TEXT') || i18n.misc.NAV_WELCOME_TO_WDJ,
            module : 'welcome',
            order : 0,
            root : true,
            tab : 'all'
        }, {
            count : -1,
            hide : ProjectConfig.get('HIDE_NAV_CONTACT'),
            icon : 'contact',
            id : 1,
            label : i18n.misc.NAV_CONTACT,
            module : 'contact',
            order : 20,
            root : true,
            tab : 'all'
        }, {
            count : 0,
            hide : ProjectConfig.get('HIDE_NAV_SMS'),
            icon : 'sms',
            id : 2,
            label : i18n.misc.NAV_SMS,
            module : 'message',
            order : 30,
            root : true,
            tab : 'all'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_APP'),
            icon : 'app',
            id : 3,
            label : i18n.misc.NAV_APP,
            module : 'app',
            order : 10,
            root : true,
            tab : 'normal'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_MUSIC'),
            icon : 'music',
            id : 4,
            label : i18n.misc.NAV_MUSIC,
            module : 'music',
            order : 40,
            root : true,
            tab : 'music'
        }, {
            count : -1,
            hide : ProjectConfig.get('HIDE_NAV_PIC'),
            icon : 'photo',
            id : 5,
            label : i18n.misc.NAV_PIC,
            module : 'photo',
            order : 50,
            root : true,
            tab : 'phone'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_VIDEO'),
            icon : 'video',
            id : 6,
            label : i18n.misc.NAV_VIDEO,
            module : 'video',
            order : 60,
            root : true,
            tab : 'video'
        }, {
            count : -1,
            hide : ProjectConfig.get('HIDE_NAV_BACKUP_RESTORE'),
            icon : 'backup',
            id : 20,
            label : i18n.misc.NAV_BACKUP_RESTORE,
            module : 'backup-restore',
            order : 60,
            root : true,
            syncing : false,
            tab : 'backup-restore'
        }, {
            count : -1,
            hide : ProjectConfig.get('HIDE_NAV_WASH') || !FunctionSwitch.ENABLE_APP_WASH,
            icon : 'wash',
            id : 19,
            label : i18n.app.APP_WASH,
            module : 'app-wash',
            order : 90,
            root : true,
            tab : 'app-wash'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_CONTACT_ALL'),
            id : 7,
            label : i18n.misc.NAV_CONTACT_ALL,
            module : 'contact',
            order : 100,
            parent : 1,
            root : false,
            tab : 'all'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_CONTACT_HAS_PHONE'),
            id : 8,
            label : i18n.misc.NAV_CONTACT_HAS_PHONE,
            module : 'contact',
            order : 110,
            parent : 1,
            root : false,
            tab : 'hasnumber'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_CONTACT_STARRED'),
            id : 9,
            label : i18n.misc.NAV_CONTACT_STARRED,
            module : 'contact',
            order : 120,
            parent : 1,
            root : false,
            tab : 'starred'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_SMS_ALL'),
            id : 10,
            label : i18n.misc.NAV_SMS_ALL,
            module : 'message',
            order : 130,
            parent : 2,
            root : false,
            tab : 'all'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_SMS_UNREAD'),
            id : 11,
            label : i18n.misc.NAV_SMS_UNREAD,
            module : 'message',
            order : 140,
            parent : 2,
            root : false,
            tab : 'unread'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_APP_INSTALLED'),
            id : 12,
            label : i18n.misc.NAV_APP_INSTALLED,
            module : 'app',
            order : 150,
            parent : 3,
            root : false,
            tab : 'normal'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_APP_SYS'),
            id : 13,
            label : i18n.misc.NAV_APP_SYS,
            module : 'app',
            order : 160,
            parent : 3,
            root : false,
            tab : 'sys'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_APP_UPDATABLE') || !FunctionSwitch.ENABLE_APP_UPGRADE,
            id : 14,
            label : i18n.misc.NAV_APP_UPDATABLE,
            module : 'app',
            order : 170,
            parent : 3,
            root : false,
            tab : 'update'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_PIC_PHONE_LIB'),
            id : 16,
            label : i18n.misc.NAV_PIC_PHONE_LIB,
            module : 'photo',
            order : 180,
            parent : 5,
            root : false,
            tab : 'phone'
        }, {
            hide : ProjectConfig.get('HIDE_NAV_PIC_GALLERY'),
            id : 17,
            label : i18n.misc.NAV_PIC_GALLERY,
            module : 'photo',
            order : 190,
            parent : 5,
            root : false,
            tab : 'lib'
        }, {
            count : -1,
            hide : ProjectConfig.get('HIDE_NAV_OPTIMIZE'),
            icon : 'nav-optimize',
            id : 18,
            label : i18n.misc.NAV_OPTIMIZE,
            module : 'optimize',
            order : 80,
            root : true,
            tab : 'optimize'
        }];

        var MenuModel = Backbone.Model.extend({
            defaults : {
                selected : false,
                highlight : false,
                count : 0,
                hide : false
            },
            initialize : function () {
                this.on('change:selected', function (model, selected) {
                    if (selected) {
                        this.collection.trigger('itemSelected', model);
                    }
                }, this);
            }
        });

        var PIMCollection = Backbone.Collection.extend({
            model : MenuModel,
            initialize : function () {
                if (Environment.get('deviceId') !== 'Default') {
                    this.listenToOnce(Environment, 'change:deviceId', function () {
                        this.get(0).set('selected', true);
                    });
                }

                Backbone.on('switchModule', function (data) {
                    var rootTarget = this.find(function (model) {
                        return model.get('root') && model.get('module') === data.module;
                    });
                    if (rootTarget !== undefined) {
                        rootTarget.set('selected', true);

                        var target = this.find(function (model) {
                            return model.get('module') === data.module && model.get('tab') === data.tab;
                        });

                        if (target !== undefined) {
                            target.set('selected', true);
                        }
                    }

                }, this);
            },
            getRootItems : function () {
                return this.filter(function (item) {
                    return item.get('root');
                });
            },
            getChildren : function (parentId) {
                return this.filter(function (item) {
                    return item.get('parent') === parentId;
                });
            },
            deselectAll : function () {
                var items = this.filter(function (item) {
                    return item.get('highlight') || item.get('selected');
                });

                _.each(items, function (item) {
                    item.set({
                        selected : false,
                        highlight : false
                    });
                });
            }
        });

        var pimCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!pimCollection) {
                    pimCollection = new PIMCollection(_.sortBy(menus, 'order'));
                }

                return pimCollection;
            }
        });

        window.PIMCollection = factory;

        return factory;
    });
}(this));
