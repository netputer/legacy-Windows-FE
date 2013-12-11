/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Internationalization',
        'FunctionSwitch',
        'Environment'
    ], function (
        _,
        Backbone,
        i18n,
        FunctionSwitch,
        Environment
    ) {
        console.log('PIMCollection - File loaded.');

        var menus = [{
            label : i18n.misc.NAV_WELCOME_TO_WDJ,
            module : 'welcome',
            tab : 'all',
            id : 0,
            root : true,
            count : -1,
            order : 0,
            icon : 'welcome'
        }, {
            label : i18n.misc.NAV_CONTACT,
            module : 'contact',
            tab : 'all',
            id : 1,
            root : true,
            count : -1,
            order : 20,
            icon : 'contact'
        // }, {
        //     label : i18n.misc.NAV_SMS,
        //     module : 'message',
        //     tab : 'all',
        //     id : 2,
        //     root : true,
        //     count : 0,
        //     order : 30,
        //     icon : 'sms'
        }, {
            label : i18n.misc.NAV_APP,
            module : 'app',
            tab : 'normal',
            id : 3,
            root : true,
            order : 10,
            icon : 'app'
        }, {
            label : i18n.misc.NAV_MUSIC,
            id : 4,
            root : true,
            module : 'music',
            tab : 'music',
            order : 40,
            icon : 'music'
        }, {
            label : i18n.misc.NAV_PIC,
            id : 5,
            root : true,
            count : -1,
            order : 50,
            icon : 'photo',
            module : 'photo',
            tab : 'phone'
        }, {
            label : i18n.misc.NAV_VIDEO,
            id : 6,
            root : true,
            module : 'video',
            tab : 'video',
            order : 60,
            icon : 'video'
        }, {
            label : i18n.misc.NAV_BACKUP_RESTORE,
            id : 20,
            root : true,
            module : 'backup-restore',
            tab : 'backup-restore',
            order : 60,
            count : -1,
            syncing : false,
            icon : 'backup'
        // }, {
        //     label : i18n.app.APP_WASH,
        //     id : 19,
        //     count : -1,
        //     root : true,
        //     module : 'app-wash',
        //     tab : 'app-wash',
        //     order : 90,
        //     icon : 'wash',
        //     hide : !FunctionSwitch.ENABLE_APP_WASH
        }, {
            label : i18n.misc.NAV_CONTACT_ALL,
            id : 7,
            root : false,
            parent : 1,
            module : 'contact',
            tab : 'all',
            order : 100
        }, {
            label : i18n.misc.NAV_CONTACT_HAS_PHONE,
            id : 8,
            root : false,
            parent : 1,
            module : 'contact',
            tab : 'hasnumber',
            order : 110
        }, {
            label : i18n.misc.NAV_CONTACT_STARRED,
            id : 9,
            root : false,
            parent : 1,
            module : 'contact',
            tab : 'starred',
            order : 120
        }, {
            label : i18n.misc.NAV_SMS_ALL,
            id : 10,
            root : false,
            parent : 2,
            module : 'message',
            tab : 'all',
            order : 130
        }, {
            label : i18n.misc.NAV_SMS_UNREAD,
            id : 11,
            root : false,
            parent : 2,
            module : 'message',
            tab : 'unread',
            order : 140
        }, {
            label : i18n.misc.NAV_APP_INSTALLED,
            id : 12,
            root : false,
            parent : 3,
            module : 'app',
            tab : 'normal',
            order : 150
        }, {
            label : i18n.misc.NAV_APP_SYS,
            id : 13,
            root : false,
            parent : 3,
            module : 'app',
            tab : 'sys',
            order : 160
        }, {
            label : i18n.misc.NAV_APP_UPDATABLE,
            id : 14,
            root : false,
            parent : 3,
            module : 'app',
            tab : 'update',
            hide : !FunctionSwitch.ENABLE_APP_UPGRADE,
            order : 170
        }, {
            label : i18n.misc.NAV_PIC_PHONE_LIB,
            id : 16,
            root : false,
            parent : 5,
            module : 'photo',
            tab : 'phone',
            order : 180
        }, {
            label : i18n.misc.NAV_PIC_GALLERY,
            id : 17,
            root : false,
            parent : 5,
            module : 'photo',
            tab : 'lib',
            order : 190
        }, {
            label : i18n.misc.NAV_OPTIMIZE,
            id : 18,
            root : true,
            module : 'optimize',
            tab : 'optimize',
            count : -1,
            order : 80,
            icon : 'nav-optimize'
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
