/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        TemplateFactory,
        FeedCardView,
        BrowserModuleView
    ) {
        var classMap = {
            10 : 'game',
            11 : 'app',
            12 : 'video'
        };

        var ListCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'list-card')),
            className : FeedCardView.getClass().prototype.className + ' list',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.$el.addClass(classMap[this.model.get('type')]);
                return this;
            },
            clickButtonNavigate : function (evt) {
                BrowserModuleView.navigateToThirdParty(this.model.get('extId'), '', $(evt.currentTarget).data('url'));
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
