/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'doT',
        'Settings',
        'Environment',
        'ui/UIHelper',
        'ui/TemplateFactory'
    ], function (
        _,
        doT,
        Settings,
        Environment,
        UIHelper,
        TemplateFactory
    ) {
        console.log('DisposableMixin - File loaded');

        var tipTemplate = doT.template(TemplateFactory.get('ui', 'disposable-tip'));

        var PREFIX = 'disposable-item-';

        var DisposableMixin = {};

        DisposableMixin.init = function () {
            this.$('.w-ui-window-footer-monitor').append(tipTemplate({}));
            if (this.disposableChecked) {
                this.$('.w-ui-window-footer-monitor .check-disposable').prop({
                    checked : true
                });
            }
        };

        DisposableMixin.saveSetting = function () {
            var value = this.$('.w-ui-window-footer-monitor .check-disposable').prop('checked');
            Settings.set(this.disposableName, value, Environment.get('deviceId'));
        };

        DisposableMixin.getSetting = function () {
            return Settings.get(this.disposableName);
        };

        return {
            mixin : function (that) {
                _.extend(that, DisposableMixin);

                var disposableName;

                Object.defineProperties(that, {
                    disposableName : {
                        set : function (value) {
                            disposableName = PREFIX + value.toString();
                        },
                        get : function () {
                            return disposableName;
                        }
                    },
                    disposableChecked : {
                        value : (function () {
                            var value;
                            if (that.options.hasOwnProperty('disposableChecked')) {
                                value = that.options.disposableChecked;
                            } else {
                                value = false;
                            }
                            return value;
                        }())
                    }
                });

                var options = that.options;
                if (options.hasOwnProperty('disposableName')) {
                    that.disposableName = options.disposableName;
                }

                var isBlocked = Settings.get(that.disposableName, Environment.get('deviceId')) === true ? true : false;
                if (isBlocked) {
                    that.show = function () {
                        that.trigger(UIHelper.EventsMapping.BUTTON_YES);
                    };
                } else if (disposableName !== undefined) {
                    that.on(UIHelper.EventsMapping.RENDERED, DisposableMixin.init, that);
                    that.on(UIHelper.EventsMapping.BUTTON_YES, DisposableMixin.saveSetting, that);
                }
            }
        };
    });
}(this));
