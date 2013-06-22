/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'ui/TemplateFactory'
    ], function (
        Backbone,
        doT,
        TemplateFacory
    ) {
        console.log('Button - File loaded.');

        var Button = Backbone.View.extend({
            tagName : 'button',
            className : 'w-ui-button',
            template : doT.template(TemplateFacory.get('ui', 'button')),
            initialize : function () {

                var label = '';
                Object.defineProperties(this, {
                    label : {
                        set : function (value) {
                            label = value;
                            this.$('.label').html(label).attr({
                                title : label
                            });
                        },
                        get : function () {
                            return label;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({}));

                this.label = this.label;

                return this;
            },
            clickButton : function (evt) {
                this.trigger('clickButton', evt);
            },
            events : {
                'click' : 'clickButton'
            }
        });

        return Button;
    });
}(this));