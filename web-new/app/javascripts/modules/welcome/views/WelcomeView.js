/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Device',
        'FunctionSwitch',
        'IOBackendDevice',
        'Configuration',
        'Settings',
        'welcome/views/DeviceView',
        'welcome/views/CapacityView',
        'welcome/views/FileToolsView',
        'welcome/views/BillboardView',
        'welcome/views/GuideView'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        Device,
        FunctionSwitch,
        IO,
        CONFIG,
        Settings,
        DeviceView,
        CapacityView,
        FileToolsView,
        BillboardView,
        GuideView
    ) {
        console.log('WelcomeView - File loaded.');

        var billboardView;
        var guideView;

        var WelcomeView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'welcome')),
            className : 'w-welcome-ctn vbox',
            render : function () {
                this.$el.html(this.template({}));

                this.$('.content').append(DeviceView.getInstance().render().$el);

                billboardView = BillboardView.getInstance();
                guideView = GuideView.getInstance();
                this.$('.content').append(billboardView.render().$el);

                if (FunctionSwitch.ENABLE_USER_GUIDE && !Settings.get('user_guide_shown')) {
                    var handler = IO.Backend.Device.onmessage({
                        'data.channel' : CONFIG.events.CUSTOM_WELCOME_USER_GUIDE_READY
                    }, function () {
                        this.switchToGuide();
                        IO.Backend.Device.offmessage(handler);
                    }, this);

                    var handler2 = IO.Backend.Device.onmessage({
                        'data.channel' : CONFIG.events.CUSTOM_WELCOME_USER_GUIDE_FINISH
                    }, function () {
                        this.switchToBillboard();
                        IO.Backend.Device.offmessage(handler2);
                    }, this);

                    this.$('.content').append(guideView.render().$el.hide());
                }
                this.$('footer').append(CapacityView.getInstance().render().$el)
                                  .append(FileToolsView.getInstance().render().$el);
                return this;
            },
            switchToGuide : function () {
                billboardView.$el.addClass('w-anima-fade-slide-out-right')
                    .one('webkitAnimationEnd', function () {
                        billboardView.$el.hide().css({
                            '-webkit-transform' : 'translate3d(100%, 0, 0)'
                        }).removeClass('w-anima-fade-slide-out-right');

                        guideView.$el.show().addClass('w-anima-fade-slide-in-right').one('webkitAnimationEnd', function () {
                            guideView.$el.css({
                                '-webkit-transform' : 'translate3d(0, 0, 0)'
                            }).removeClass('w-anima-fade-slide-in-right');
                        });
                    }.bind(this));
            },
            switchToBillboard : function () {
                guideView.$el.addClass('w-anima-fade-slide-out-right')
                    .one('webkitAnimationEnd', function () {
                        guideView.$el.hide();
                        guideView.remove();
                        guideView = undefined;

                        billboardView.$el.show().addClass('w-anima-fade-slide-in-right').one('webkitAnimationEnd', function () {
                            billboardView.$el.css({
                                '-webkit-transform' : 'translate3d(0, 0, 0)'
                            }).removeClass('w-anima-fade-slide-in-right');
                        });
                    }.bind(this));
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
