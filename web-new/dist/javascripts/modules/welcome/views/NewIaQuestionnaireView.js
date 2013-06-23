/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'Configuration',
        'IO',
        'Internationalization',
        'Log',
        'Settings'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        CONFIG,
        IO,
        i18n,
        log,
        Settings
    ) {
        console.log('NewIaQuestionnaireView - File loaded. ');

        var NewIaQuestionnaireView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('misc', 'new_ia')),
            className : 'w-misc-new-ia hbox',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            remove : function () {
                this.$el.slideUp('fast', function () {
                    NewIaQuestionnaireView.__super__.remove.call(this, arguments);
                }.bind(this));
                Settings.set('new_ia_questionnaire_chosed', true);
            },
            clickButtonLike : function () {
                this.remove();
                log({
                    'event' : 'ui.click.new_ia_questionnaire',
                    'action': 'like',
                    'color' : 'black'
                });
            },
            clickButtonUnlike : function () {
                this.remove();
                log({
                    'event' : 'ui.click.new_ia_questionnaire',
                    'action': 'unlike',
                    'color' : 'black'
                });
            },
            clickButtonWhatever : function () {
                this.remove();
                log({
                    'event' : 'ui.click.new_ia_questionnaire',
                    'action': 'whatever',
                    'color' : 'black'
                });
            },
            clickButtonClose : function () {
                this.remove();
                log({
                    'event' : 'ui.click.new_ia_questionnaire',
                    'action': 'close',
                    'color' : 'black'
                });
            },
            events : {
                'click .button-like' : 'clickButtonLike',
                'click .button-unlike' : 'clickButtonUnlike',
                'click .button-whatever' : 'clickButtonWhatever',
                'click .button-close' : 'clickButtonClose'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new NewIaQuestionnaireView();
            }
        });

        return factory;
    });
}(this));
