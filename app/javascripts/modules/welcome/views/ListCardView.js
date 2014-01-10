/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'Log',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        log,
        TemplateFactory,
        FeedCardView,
        BrowserModuleView
    ) {
        var classMap = {
            10 : 'app',
            11 : 'game',
            12 : 'video'
        };

        var ListCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'list-card')),
            className : FeedCardView.getClass().prototype.className + ' list',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.$el.addClass(classMap[this.model.get('type')]);

                log({
                    'event' : 'ui.show.welcome_card',
                    'type' : this.model.get('type')
                });
                return this;
            },
            clickButtonNavigate : function (evt) {
                var $target = $(evt.currentTarget);
                BrowserModuleView.navigateToThirdParty(this.model.get('extId'), '', $target.data('url'));

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'navigate',
                    'content' : $target.data('name')
                });
            },
            events : {
                'click .button-navigate' : 'clickButtonNavigate'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ListCardView(args);
            }
        });

        return factory;
    });
}(this));
