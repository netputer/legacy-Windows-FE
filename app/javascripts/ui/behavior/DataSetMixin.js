/*global define*/
(function (window) {
    define(['underscore'], function (_) {
        console.log('DataSetMixin - File loaded.');

        var DataSetMixin = {};

        DataSetMixin.switchSet = function (name, getter) {
            var targetSet = _.find(this.dataSet, function (set) {
                return set.name === name;
            });

            var oldSet = this.currentSet;

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

            var currentModels = this.currentModels;
            this.toggleEmptyTip(currentModels.length === 0);

            this.switchComparator();

            if (currentModels.length === 0) {
                this.clearList();
                this.init();
                return;
            }

            if (this.currentSet.name != oldSet.name) {
                this.clearList();
                this.init();
            } else {

                this.createItemView();
                this.minOffsetY = this.containerHeight - (currentModels.length * this.itemHeight);

                var scrollTop = this.$scrollContainer.scrollTop();
                var scrollHeight = currentModels.length * this.itemHeight;
                if (scrollTop > scrollHeight) {
                    scrollTop = scrollHeight - this.$container.height();
                }
                this.scrollHeight = scrollHeight;
                this.$scrollContainer.scrollTop(scrollTop).show();

                this.build(0, -scrollTop, false, true);
            }
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
                    getter : function () {
                        return [];
                    }
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
