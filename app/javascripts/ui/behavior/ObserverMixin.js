/*global define*/
(function (window) {
    define(['underscore'], function (_) {
        console.log('ObserverMixin - File loaded.');

        var ObserverMixin = {};

        ObserverMixin.toggleObserver = function (toggle) {
            this.disableObserver = toggle !== undefined ? !toggle : !this.disableObserver;
            this.$observer.prop({
                disabled : this.disableObserver
            });
        };

        return {
            mixin : function (that) {
                _.extend(that, ObserverMixin);
                var $observer;
                var disableObserver = false;
                Object.defineProperties(that, {
                    $observer : {
                        set : function (value) {
                            $observer = value;

                            $observer.prop({
                                disabled : that.currentModels.length === 0
                            });

                            that.listenTo(that, 'select:change switchSet', function () {
                                if (disableObserver) {
                                    $observer.prop({
                                        checked : false,
                                        disabled : true
                                    });
                                } else {
                                    var modelsCount = _.filter(this.currentModels, function (model) {
                                        return model.id !== undefined;
                                    }).length;

                                    $observer.prop({
                                        checked : modelsCount === this.selected.length,
                                        disabled : modelsCount === 0
                                    });
                                }
                            });

                            $observer.on('click', function (evt) {
                                that[evt.target.checked ? 'selectAll' : 'deselectAll']();
                            });
                        },
                        get : function () {
                            return $observer;
                        }
                    },
                    disableObserver : {
                        set : function (value) {
                            disableObserver = value;
                        },
                        get : function () {
                            return disableObserver;
                        }
                    }
                });
            }
        };
    });
}(this));
