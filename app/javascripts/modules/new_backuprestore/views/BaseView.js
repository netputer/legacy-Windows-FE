/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'IO',
        'ui/TemplateFactory'
    ], function (
        $,
        Backbone,
        _,
        doT,
        IO,
        TemplateFactory
    ) {

        console.log('BaseView - File loaded.');

        var BaseView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'base')),
            className : "w-backuprestore-base vbox",
            initialize : function () {
                BaseView.__super__.initialize.apply(this, arguments);

                var isProgressing = false;
                var isUserCancelled = false;
                var sessionId;
                Object.defineProperties(this, {
                    bigTitle : {
                        set : function (value) {
                            this.$('.big-title').text(value);
                        },
                        get : function () {
                            return this.$('.big-title');
                        }
                    },
                    stateTitle : {
                        set : function (value) {
                            this.$('.state-title').text(value);
                        },
                        get : function () {
                            return this.$('.state-title');
                        }
                    },
                    isProgressing : {
                        set : function (value) {
                            isProgressing = value;
                        },
                        get : function () {
                            return isProgressing;
                        }
                    },
                    isUserCancelled : {
                        set : function (value) {
                            isUserCancelled = value;
                        },
                        get : function () {
                            return isUserCancelled;
                        }
                    },
                    sessionId : {
                        set : function (value) {
                            sessionId = value;
                        },
                        get : function () {
                            return sessionId;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            initAttrsState : function () {
                this.userCancelled = false;
                this.isProgressing = false;
                this.progressHandler = undefined;
                this.sessionId = '';
            }
        });

        return BaseView;
    });
}(this));