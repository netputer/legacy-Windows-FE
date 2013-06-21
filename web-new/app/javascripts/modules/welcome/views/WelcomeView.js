/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Device',
        'welcome/views/DeviceView',
        'welcome/views/CapacityView',
        'welcome/views/FileToolsView',
        'welcome/views/BillboardView'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        Device,
        DeviceView,
        CapacityView,
        FileToolsView,
        BillboardView
    ) {
        console.log('WelcomeView - File loaded.');

        var WelcomeView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'welcome')),
            className : 'w-welcome-ctn vbox',
            render : function () {
                this.$el.html(this.template({}));

                this.$('.content').append(DeviceView.getInstance().render().$el)
                                    .append(BillboardView.getInstance().render().$el);
                this.$('footer').append(CapacityView.getInstance().render().$el)
                                  .append(FileToolsView.getInstance().render().$el);
                return this;
            },
            remove : function () {

            }
        });

        var welcomeView;

        var factory = _.extend({
            getInstance : function () {
                if (!welcomeView) {
                    welcomeView = new WelcomeView();
                }
                return welcomeView;
            }
        });

        return factory;
    });
}(this));
