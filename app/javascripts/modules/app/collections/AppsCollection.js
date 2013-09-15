/*global define*/
(function (window) {
    'use strict';

    define([
        'backbone',
        'jquery',
        'underscore',
        'IOBackendDevice',
        'Device',
        'Configuration',
        'FunctionSwitch',
        'app/models/AppModel',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        $,
        _,
        IO,
        Device,
        CONFIG,
        FunctionSwitch,
        AppModel,
        PIMCollection
    ) {
        console.log('AppsCollection - File loaded. ');

        var updateHandler = _.debounce(function () {
            if (this.collection !== undefined) {
                this.collection.trigger('refresh', this.collection);
            }
        }, 10);

        var AppsCollection = Backbone.Collection.extend({
            model : AppModel,
            url : CONFIG.actions.APP_SHOW,
            data : {
                upgrade_info : 1
            },
            parse : function (resp) {
                if (resp.state_code === 202 && Device.get('isConnected')) {
                    console.log('AppsCollection - App is syncing. ');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                this.loadingUpdateInfo = (resp.state_code === 251 || resp.state_code === 202);

                _.each(resp.body.app, function (app) {
                    app.id = app.base_info.package_name;
                });

                return resp.body.app;
            },
            syncAsync : function () {
                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.APP_SYNC,
                    success : function (resp) {
                        if (resp.state_code === 200 || resp.state_code === 251) {
                            console.log('AppsCollection - App sync success. ');

                            deferred.resolve(resp);
                        } else {
                            console.error('AppsCollection - App sync failed. Error info: ' + resp.state_line);

                            this.syncing = false;
                            this.trigger('syncEnd');
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            initialize : function () {
                var loading = false;
                var loadingUpdateInfo = false;
                var syncing = false;
                var keyword = "";
                Object.defineProperties(this, {
                    keyword : {
                        set : function (value) {
                            keyword = value;
                        },
                        get : function () {
                            return keyword;
                        }
                    },
                    loading : {
                        set : function (value) {
                            loading = value;
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    loadingUpdateInfo : {
                        set : function (value) {
                            loadingUpdateInfo = value;
                        },
                        get : function () {
                            return loadingUpdateInfo;
                        }
                    },
                    syncing : {
                        set : function (value) {
                            syncing = value;
                        },
                        get : function () {
                            return syncing;
                        }
                    }
                });

                this.on('update', function () {
                    if (!loading) {
                        loading = true;
                        this.fetch({
                            success : function (collection) {
                                console.log('AppsCollection - Collection fetched. ');
                                loading = false;

                                collection.trigger('refresh', collection);
                            }
                        });
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.APP_LIST_UPDATED
                }, function (data) {
                    if (syncing) {
                        syncing = false;
                        this.trigger('syncEnd');
                    }

                    if (!!data) {
                        this.trigger('update');
                    } else {
                        loading = false;
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.APP_INSTALLED
                }, function (data) {
                    var target = this.get(data.package_name);
                    if (target !== undefined && target.isUpdatable && Number(target.updateInfo.get('versionCode')) === Number(data.version_code)) {
                        target.set({
                            upgrade_info : {},
                            update : 2
                        });
                    }
                }, this);

                this.listenTo(FunctionSwitch, 'change', function () {
                    this.trigger('refresh', this);
                });

                this.on('add', function (app) {
                    app.on('change:update', updateHandler, app).once('remove', function () {
                        this.off();
                    }, app);
                });
            },
            getUpdatableApps : function () {
                return FunctionSwitch.ENABLE_APP_UPGRADE ? this.filter(function (app) {
                    return app.isUpdatable;
                }) : [];
            },
            getUpdatableAppsWithoutIllegal : function () {
                var update = this.getUpdatableApps();

                return update.filter(function (app) {
                    return app.isLegalToUpdate;
                });
            },
            getUpdatableAppsWithCategory : function () {
                var update = this.getUpdatableApps();

                var group = _.groupBy(update, function (app) {
                    switch (app.get('upgrade_info').recommendedType) {
                    case 'STRONG_RECOMMEND':
                        app.set('recommendedType', 'recommended');
                        return 'recommended';
                    case 'WARNNING':
                        app.set('recommendedType', 'warning');
                        return 'warning';
                    case 'NOT_RECOMMEND':
                        app.set('recommendedType', 'notRecommended');
                        return 'notRecommended';
                    }
                });

                var result = [];

                _.each(group, function (element, index) {
                    if (group[index] && group[index].length > 0) {
                        var categoryModel = new AppModel({
                            id : index,
                            updateCategory : index
                        });

                        result = result.concat(categoryModel, group[index]);
                    }
                });

                return result;
            },
            getUpdatableAppsByType : function (type) {
                return _.filter(this.getUpdatableApps(), function (app) {
                    return app.get('recommendedType') === type;
                });
            },
            getSuggestMoveApps : function () {
                return this.filter(function (app) {
                    return app.isSuggestMove;
                });
            },
            getNormalApps : function () {
                return this.filter(function (app) {
                    return !app.isSystem;
                });
            },
            getSystemApps : function () {
                return this.filter(function (app) {
                    return app.isSystem;
                });
            },
            getIgnoredApps : function () {
                return this.where({
                    is_blocked : true
                });
            },
            getByKeyword : function () {
                var reg = new RegExp(this.keyword, 'i');
                return this.filter(function (model) {
                    return reg.test(model.get('base_info').name);
                });
            },
            uninstallAppsAsync : function (ids, session) {
                var deferred = $.Deferred();

                var packageNames = _.intersection(ids, this.pluck('id'));

                if (packageNames.length === 1) {
                    this.get(packageNames[0]).set('running', true);
                }

                IO.requestAsync({
                    url : CONFIG.actions.APP_BATCH_UNINSTALL,
                    data : {
                        package_name : packageNames.join(','),
                        session : session
                    },
                    success : function (resp) {
                        if (packageNames.length === 1) {
                            var target = this.get(packageNames[0]);
                            if (target !== undefined) {
                                target.set('running', false);
                            }
                        }

                        if (resp.state_code === 200) {
                            console.log('AppsCollection - Application uninstall success. ');

                            if (ids.length === 1 && resp.body.success && resp.body.success.length === 1) {
                                this.remove(ids[0]);
                            } else {
                                this.remove(resp.body.success, {
                                    silent : true
                                });
                            }

                            this.trigger('refresh', this);

                            deferred.resolve(resp);
                        } else if (resp.state_code === 402) {
                            console.log('AppsCollection - Application uninstall canceled. ');

                            this.trigger('update');

                            deferred.reject(resp);
                        } else {
                            console.error('AppsCollection - Application uninstall failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            moveAppsAsync : function (ids, session, location) {
                var deferred = $.Deferred();

                var packageNames = _.compact(_.map(ids, function (id) {
                    var app = this.get(id);
                    if (app !== undefined) {
                        return app.get('base_info').package_name;
                    }
                }, this));

                IO.requestAsync({
                    url : CONFIG.actions.APP_MOVE,
                    data : {
                        package_name : packageNames.join(','),
                        session : session || '',
                        location : location
                    },
                    success : function (resp) {
                        if (packageNames.length === 1) {
                            var target = this.get(packageNames[1]);
                            if (target !== undefined) {
                                target.set('running', false);
                            }
                        }

                        if (resp.state_code === 200) {
                            console.log('AppsCollection - Move apps success. ');

                            this.trigger('update');

                            deferred.resolve(resp);
                        } else if (resp.state_code === 402) {
                            console.log('AppsCollection - Move apps canceled. ');

                            this.trigger('update');

                            deferred.reject(resp);
                        } else {
                            console.error('AppsCollection - Move apps failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            ableMoveToDevice : function (ids) {
                var result = [];
                _.each(ids, function (id) {
                    var app = this.get(id);
                    if (app !== undefined && app.isMovableToDevice) {
                        result.push(id);
                    }
                }, this);
                return result;
            },
            ableMoveToSD : function (ids) {
                var result = [];
                _.each(ids, function (id) {
                    var app = this.get(id);
                    if (app !== undefined && app.isMovable) {
                        result.push(id);
                    }
                }, this);
                return result;
            },
            ableToUpdate : function (ids) {
                var result = [];
                _.each(ids, function (id) {
                    var app = this.get(id);
                    if (app !== undefined && app.isUpdatable) {
                        result.push(id);
                    }
                }, this);
                return result;
            },
            ableToUpdateIncludeIgnored : function (ids) {
                var result = [];
                _.each(ids, function (id) {
                    var app = this.get(id);
                    if (app !== undefined && app.get('is_blocked')) {
                        result.push(id);
                    }
                }, this);
                return result;
            },
            isSystemApp : function (ids) {
                var result = [];
                _.each(ids, function (id) {
                    var app = this.get(id);
                    if (app !== undefined && app.isSystem) {
                        result.push(id);
                    }
                }, this);
                return result;
            },
            isInstalled : function (packageName) {
                return this.find(function (app) {
                    return app.get('base_info').package_name === packageName;
                }) !== undefined;
            },
            getAppsTags : function () {
                var tags = [];

                var count = {};

                this.each(function (app) {
                    if (app.get('web_info') && app.get('web_info').tags) {
                        tags = tags.concat(_.map(app.get('web_info').tags, function (tag) {
                            if (count[tag.tag]) {
                                count[tag.tag]++;
                            } else {
                                count[tag.tag] = 1;
                            }

                            return tag.tag;
                        }));
                    }
                });

                tags = _.uniq(tags);

                return tags.sort(function (a, b) {
                    return count[b] - count[a];
                });
            },
            getCategories : function () {
                var cates = [];

                this.each(function (app) {
                    if (app.get('web_info') && app.get('web_info').categories) {
                        _.each(app.get('web_info').categories, function (cate) {
                            var target = _.find(cates, function (c) {
                                return c.name === cate.name;
                            });

                            if (!target) {
                                cates.push({
                                    name : cate.name,
                                    alias : cate.alias
                                });
                            }
                        });
                    }
                });

                return cates;
            }
        });

        var appsCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!appsCollection) {
                    appsCollection = new AppsCollection();

                    var pimCollection = PIMCollection.getInstance();
                    appsCollection.on('refresh', function (appsCollection) {
                        pimCollection.get(12).set({
                            count : appsCollection.getNormalApps().length
                        });

                        pimCollection.get(13).set({
                            count : appsCollection.getSystemApps().length
                        });

                        var updatableCount = appsCollection.getUpdatableApps().length;

                        pimCollection.get(3).set({
                            count :  updatableCount
                        });

                        pimCollection.get(14).set({
                            count : updatableCount
                        });
                    });

                    appsCollection.trigger('update');
                }
                return appsCollection;
            },
            getClass : function () {
                return AppsCollection;
            }
        });

        return factory;
    });
}(this));

