/*global define, Backbone, $, _*/
(function (window) {
    define([
        'IOBackendDevice',
        'underscore',
        'Configuration',
        'Internationalization'
    ], function (
        IO,
        _,
        CONFIG,
        i18n
    ) {
        console.log('ExtensionModel - File loaded.');

        var reorder = function (order) {
            var currentOrder = _.pluck(this.collection.getNormalPlugins(), 'id');
            var currentIndex = currentOrder.indexOf(this.id);

            var temp = currentOrder[currentIndex + order] || (order > 0 ? currentOrder[currentOrder.length - 1] : currentOrder[0]);
            var tempIndex = currentOrder.indexOf(temp);

            var newOrder = [];
            var prev = [];
            var next = [];
            var tail = [];
            if (order > 0) {
                prev = currentOrder.slice(0, currentIndex);
                if (currentOrder.indexOf(temp) !== currentOrder.length) {
                    next = currentOrder.slice(currentIndex + 1, tempIndex + 1);
                    tail = currentOrder.slice(tempIndex + 1, currentOrder.length);
                } else {
                    next = currentOrder.slice(currentIndex + 1, currentOrder.length);
                }

                newOrder = newOrder.concat(prev).concat(next).concat([this.id]).concat(tail);
            } else {
                if (currentOrder.indexOf(temp) !== 0) {
                    prev = currentOrder.slice(0, tempIndex);
                    next = currentOrder.slice(tempIndex, currentIndex);
                } else {
                    next = currentOrder.slice(0, currentIndex);
                }

                tail = currentOrder.slice(currentIndex + 1, currentOrder.length);

                newOrder = newOrder.concat(prev).concat([this.id]).concat(next).concat(tail);
            }

            return newOrder;
        };

        //whiteList for stupid CDN CACHE
        var whiteList = ['18', '223', '235', '258', '255', '256', '254', '376'];

        var ExtensionModel = Backbone.Model.extend({
            defaults : {
                selected : false,
                highlight : false,
                preview : false,
                developer : '',
                category : '',
                fav : '',
                star : 0,
                inWhiteList : false,
                displayToolbar : true
            },
            initialize : function () {
                this.on('change:selected', function (model, selected) {
                    if (selected) {
                        this.collection.trigger('itemSelected', model);
                    }
                }, this);

                if (this.get('dev_mode')) {
                    this.set({
                        cateid : 'dev',
                        catetitle : i18n.doraemon.LOCAL_PLUGIN
                    });
                }

                this.set('inWhiteList', _.contains(whiteList, this.id));
            },
            zipAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.ZIP_PACKAGE,
                    data : {
                        src_path : this.get('path'),
                        dst_path : this.get('path') + '.wdx'
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ExtensionModel - Zip extension success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('ExtensionModel - Zip extension faild. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            downloadAsync : function () {
                var deferred = $.Deferred();

                var callback = function (resp) {
                    if (resp.state_code === 200) {
                        console.log('ExtensionModel - Load extension with id = "' + this.get('id') + '" success. ');

                        this.set(JSON.parse(resp.body.value));

                        deferred.resolve(resp);
                    } else if (resp.state_code !== 202) {
                        console.error('ExtensionModel - Load extension with id = "' + this.get('id') + '" failed. Error info: ' + resp.state_line);

                        deferred.reject(resp);
                    }
                }.bind(this);
                if (this.id !== 305) {
                    IO.requestAsync({
                        url : this.get('preview') ? CONFIG.actions.PLUGIN_PREVIEW : CONFIG.actions.PLUGIN_LOAD,
                        data : {
                            id : this.get('id'),
                            name : this.get('name'),
                            dev_mode : Number(this.get('dev_mode') === true)
                        },
                        success : callback
                    });
                } else {
                    IO.requestAsync({
                        url : CONFIG.actions.PLUGIN_LOAD_LOCAL,
                        data : {
                            id : this.get('id'),
                            name : this.get('name')
                        },
                        success : callback
                    });
                }

                return deferred.promise();
            },
            setOrderAsync : function (order) {
                var deferred = $.Deferred();

                var newOrder = reorder.call(this, order);

                IO.requestAsync({
                    url : CONFIG.actions.PLUGIN_UPDATE,
                    data : {
                        list : newOrder.join(',')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ExtensionModel - Update success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('ExtensionModel - Update failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            unstarredAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PLUGIN_REMOVE,
                    data : {
                        id : this.id,
                        dev_mode : Number(this.get('dev_mode') === true)
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ExtensionModel - Remove success.');
                            if (this.collection) {
                                this.collection.remove(this);
                            }
                            deferred.resolve(resp);
                        } else {
                            console.error('ExtensionModel - Remove failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            starAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PLUGIN_ADD,
                    data : {
                        id : this.id,
                        name : this.get('name'),
                        dev_mode : Number(this.get('dev_mode') === 1),
                        star : this.get('star')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ExtensionModel - Add success.');
                            this.set(JSON.parse(resp.body.value)).unset('extensionPreview', {
                                silent : true
                            });

                            deferred.resolve(resp);
                        } else {
                            console.error('ExtensionModel - Add failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            }
        });

        return ExtensionModel;
    });
}(this));
