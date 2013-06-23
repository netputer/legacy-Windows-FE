/*global define*/
(function (window, undefined) {
    'use strict';

    define([
        'backbone',
        'jquery',
        'underscore',
        'Configuration',
        'Account',
        'Device',
        'IOBackendDevice',
        'Internationalization',
        'doraemon/models/ExtensionModel'
    ], function (
        Backbone,
        $,
        _,
        CONFIG,
        Account,
        Device,
        IO,
        i18n,
        ExtensionModel
    ) {
        console.log('ExtensionsCollection - File loaded.');

        var unstarNormalsAsync = function (normals) {
            var deferred = $.Deferred();

            if (normals.length !== 0) {
                IO.requestAsync({
                    url : CONFIG.actions.PLUGIN_REMOVE,
                    data : {
                        id : normals.join(','),
                        dev_mode : 0
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ExtensionsCollection - Remove success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('ExtensionsCollection - Remove failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });
            } else {
                deferred.resolve();
            }

            return deferred.promise();
        };

        var unstarDevsAsync = function (devs) {
            var deferred = $.Deferred();

            if (devs.length === 0) {
                deferred.resolve();
            } else {
                IO.requestAsync({
                    url : CONFIG.actions.PLUGIN_REMOVE,
                    data : {
                        id : devs.join(','),
                        dev_mode : 1
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            console.error('ExtensionsCollection - Remove failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });
            }

            return deferred.promise();
        };

        var ExtensionsCollection = Backbone.Collection.extend({
            url : CONFIG.actions.PLUGIN_LIST,
            model : ExtensionModel,
            parse : function (resp) {
                var extensions = [];
                try {
                    extensions = JSON.parse(resp.body.value).sidebar;
                    _.each(extensions, function (extension, i) {
                        extension.order = i;
                    });
                } catch (e) {}
                return extensions;
            },
            comparator : function (extension) {
                return extension.get('order');
            },
            initialize : function () {
                var loading = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });

                this.on('update', function () {
                    if (!loading) {
                        loading = true;

                        this.fetch({
                            success : function (collection) {
                                console.log('ExtensionsCollection - Collection fetched.', collection);
                                loading = false;
                                collection.trigger('refresh', collection);
                            }
                        });
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SIDEBAR_UPDATED
                }, function (data) {
                    var currentSelected = this.find(function (extension) {
                        return extension.get('selected');
                    });

                    _.each(data.sidebar, function (extension, i) {
                        extension.order = i;
                    });

                    this.set(data.sidebar);

                    if (currentSelected) {
                        var target = this.get(currentSelected.id);
                        if (target !== undefined) {
                            target.set({
                                selected : true
                            });
                        }
                    }

                    this.trigger('refresh', this);
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SIDEBAR_STAR
                }, function (data) {
                    if (!Account.get('isLogin')) {
                        Account.loginAsync(i18n.misc.LOGIN_TO_STAR, 'star-item-in-gallery');
                    } else {
                        if (!this.get(data.id)) {
                            var extension = new ExtensionModel(data);
                            extension.starAsync().done(function (resp) {
                                this.add(extension);
                                this.trigger('star', extension);
                            }.bind(this));
                        }
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SIDEBAR_ITEM_UPDATED
                }, function (data) {
                    var extension = this.get(data.id);
                    if (extension !== undefined) {
                        extension.set(data);
                    }
                    this.trigger('itemUpdate');
                }, this);

                this.on('add', function (extension) {
                    extension.on('change:cateid', extension.setCategory, extension);

                    extension.once('remove', function () {
                        this.off();
                    }, extension);
                });
            },
            getNormalPlugins : function () {
                return this.filter(function (extension) {
                    return !extension.get('dev_mode');
                });
            },
            reloadAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PLUGIN_RELOAD,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            console.error('ExtensionsCollection - Reload failed.');
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            unstarredAsync : function (ids) {
                var deferred = $.Deferred();

                var devs = [];
                var normals = [];

                _.each(ids, function (id) {
                    var extension = this.get(id);
                    if (extension) {
                        if (extension.get('dev_mode')) {
                            devs.push(id);
                        } else {
                            normals.push(id);
                        }
                    }
                }, this);

                $.when(unstarDevsAsync.call(this, devs), unstarNormalsAsync.call(this, normals))
                    .done(function () {
                        this.remove(ids);
                        deferred.resolve();
                    }.bind(this))
                    .fail(deferred.reject);

                return deferred.promise();
            },
            deselectAll : function () {
                var selectedPlugin = this.find(function (extension) {
                    return extension.get('selected');
                });
                if (selectedPlugin) {
                    selectedPlugin.set({
                        selected : false,
                        highlight : false
                    });
                }
            },
            getAll : function () {
                return this.models;
            }
        });

        var extensionsCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!extensionsCollection) {
                    extensionsCollection = new ExtensionsCollection();
                    extensionsCollection.trigger('update');
                }
                return extensionsCollection;
            }
        });

        return factory;
    });
}(this));
