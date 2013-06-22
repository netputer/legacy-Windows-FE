/*global console, define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'Internationalization'
    ], function (
        Backbone,
        _,
        $,
        doT,
        Panel,
        UIHelper,
        TemplateFactory,
        i18n
    ) {
        console.log('CustomInfoWindowView - File loaded. ');

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'custom-info')),
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            getLabel : function () {
                return this.$('.input-label').val();
            }
        });

        var bodyView;
        var CustomInfoWindowView = Panel.extend({
            initialize : function () {
                CustomInfoWindowView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BodyView();
                    this.$bodyContent = bodyView.render().$el;
                }, this);
            },
            getLabel : function () {
                return bodyView.getLabel();
            }
        });

        var customInfoWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!customInfoWindowView) {
                    customInfoWindowView = new CustomInfoWindowView({
                        title : i18n.contact.CUSTOME_CONTACT_INFO,
                        draggable : true,
                        buttonSet :　'yes_no'
                    });
                }
                return customInfoWindowView;
            }
        });

        return factory;
    });
}(this));