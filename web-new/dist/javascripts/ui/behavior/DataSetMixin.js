/*global console, define*/
(function (window, undefined) {
    define(['underscore'], function (_) {
        console.log('DataSetMixin - File loaded.');

        var DataSetMixin = {};

        DataSetMixin.switchSet = function (name, getter) {
            var targetSet = _.find(this.dataSet, function (set) {
                return set.name === name;
            });

            if (targetSet === undefined) {
                var set = {
                    name : name,
                    getter : getter
                };

                this.dataSet.push(set);
                this.currentSet = set;
            } else {
                if (this.currentSet.name === name) {
                    if (getter) {
                        this.currentSet.getter = getter;
                    }
                } else {
                    this.lastSelect = undefined;
                    this.currentSet = targetSet;

                    if (getter) {
                        this.currentSet.getter = getter;
                    }
                }
            }

            this.trigger('switchSet', this.currentSet);
        };

        DataSetMixin.clearSet = function () {
            this.dataSet.length = 0;
            delete this.currentSet.name;
            delete this.currentSet.getter;
        };

        return {
            mixin : function (that) {
                _.extend(that, DataSetMixin);
                var dataSet = [];
                var currentSet = {
                    name : '',
                    getter : function () {}
                };

                Object.defineProperties(that, {
                    dataSet : {
                        set : function (value) {
                            if (value instanceof Array) {
                                var i;
                                var length = value.length;
                                for (i = 0, length = value.length; i < length; i++) {
                                    dataSet.push(value[i]);
                                    if (value[i].name === 'default') {
                                        currentSet = value[i];
                                    }
                                }
                            } else {
                                console.error('SmartList - DataSet type error.');
                            }
                        },
                        get : function () {
                            return dataSet;
                        }
                    },
                    currentSet : {
                        set : function (value) {
                            if (value.hasOwnProperty('name') && value.hasOwnProperty('getter')) {
                                currentSet = value;
                                that.trigger('switchSet', currentSet);
                            } else {
                                console.error('SmartList - CurrentSet type error.');
                            }
                        },
                        get : function () {
                            return currentSet;
                        }
                    },
                    currentModels : {
                        get : function () {
                            return currentSet.getter.call(this.listenToCollection || this.options.listenToCollection);
                        }
                    }
                });
            }
        };
    });
}(this));
