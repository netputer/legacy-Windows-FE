/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Device',
        'IO',
        'Configuration',
        'ui/TemplateFactory'
    ], function (
        _,
        Backbone,
        doT,
        $,
        Device,
        IO,
        CONFIG,
        TemplateFactory
    ) {
        console.log('FeedbackCardView - File loaded. ');

        var text = [];

        var FeedbackCardView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('wash', 'feedback-card')),
            className : 'back feedback vbox',
            initialize : function () {
                var loading = false;
                Object.defineProperties(this, {
                    loading : {
                        get : function () {
                            return loading;
                        },
                        set : function (value) {
                            loading = Boolean(value);
                        }
                    }
                });
            },
            getTextAsync : function () {
                var deferred = $.Deferred();

                if (text.length > 0) {
                    deferred.resolve(text);
                } else {
                    $.ajax(CONFIG.actions.APP_WASH_GET_TEXT).done(function (resp) {
                        text = resp;
                        deferred.resolve(resp);
                    }.bind(this));
                }

                return deferred.promise();
            },
            render : function () {
                this.loading = true;
                this.getTextAsync().done(function (resp) {
                    this.$el.html(this.template(_.extend(this.model.toJSON(), {
                        text : resp
                    })));

                    this.$('.button-send').prop('disabled', true);
                }.bind(this));

                return this;
            },
            clickLastRadio : function () {
                this.$('.button-send').prop('disabled', false);
                this.$('.input-reason').prop({
                    disabled : false
                }).focus();
            },
            clickNoneLastRadio : function () {
                this.$('.button-send').prop('disabled', false);
                this.$('.input-reason').prop({
                    disabled : true
                });
            },
            clickButtonSend : function () {
                var reason = this.$('input[type="radio"]:checked').val().trim();

                if (reason) {
                    this.model.collection.remove(this.model);

                    var type = this.model.get('suggestion').action === 'UNINSTALL' || this.model.get('suggestion').action === 'REPLACE';

                    $.ajax({
                        type : 'POST',
                        url : CONFIG.actions.APP_WASH_FEEDBACK,
                        data : {
                            udid : Device.get('udid') || '',
                            from : 'windows',
                            'package' : this.model.get('sourceApk').packageName,
                            md5 : this.model.get('sourceApk').md5,
                            type : type ? this.model.get('suggestion').action : 'ignore',
                            reason : reason
                        }
                    });

                    IO.requestAsync({
                        url : CONFIG.actions.APP_IGNORE_WASH,
                        data : {
                            package_name : this.model.get('sourceApk').packageName
                        }
                    });
                } else {
                    this.$('.input-reason').focus();
                }
            },
            keyupInputReason : function (evt) {
                this.$('input[type="radio"]:last').val(evt.originalEvent.srcElement.value);
            },
            events : {
                'click input[type="radio"]:last' : 'clickLastRadio',
                'click input[type="radio"]:not(:last)' : 'clickNoneLastRadio',
                'click .button-send' : 'clickButtonSend',
                'keyup .input-reason' : 'keyupInputReason'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new FeedbackCardView(args);
            }
        });

        return factory;
    });
}(this));
