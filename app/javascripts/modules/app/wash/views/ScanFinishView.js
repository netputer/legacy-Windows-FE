/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Configuration',
        'Log',
        'app/wash/views/FeedbackWindowView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        StringUtil,
        CONFIG,
        log,
        FeedbackWindowView
    ) {
        console.log('ScanFinishView - File loaded.');

        var ScanFinishView = Backbone.View.extend({
            className : 'w-app-wash-finish',
            initialize : function () {
                var original = {
                    pirate : 0,
                    ads : 0
                };

                Object.defineProperties(this, {
                    original : {
                        set : function (value) {
                            original = value;
                        },
                        get : function () {
                            return original;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            switchToEmptyView : function () {
                this.template = doT.template(TemplateFactory.get('wash', 'result-empty'));
                this.render();
            },
            switchToFinishView : function (original) {
                this.original = original;
                this.template = doT.template(TemplateFactory.get('wash', 'result-replace-finish'));
                this.render();
            },
            clickButtonFeedback : function () {
                FeedbackWindowView.getInstance().show();

                log({
                    'event' : 'ui.click.wash.button_feedback_finish_view'
                });
            },
            events : {
                'click .button-feedback' : 'clickButtonFeedback'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ScanFinishView();
            }
        });

        return factory;
    });
}(this));
