/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'IO',
        'FunctionSwitch',
        'ui/TemplateFactory',
        'tools/views/ManageSDCardView',
        'tools/views/FeatureCardView',
        'tools/views/FlashCardView',
        'Strategy'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        IO,
        FunctionSwitch,
        TemplateFactory,
        ManageSDCardView,
        FeatureCardView,
        FlashCardView,
        Strategy
    ) {
        console.log('ToolsModuleView - File loaded');

        var manageSDCardView;
        var featureCardView;

        var ToolsModuleView = Backbone.View.extend({
            className : 'w-tools-module-main module-main vbox',
            template : doT.template(TemplateFactory.get('tools', 'tools-main')),
            initialize : function () {

                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });
            },
            render : function () {

                var $cardCtn;
                this.$el.html(this.template({}));
                $cardCtn = this.$('.w-tools-ctn');

                setTimeout(function () {

                    if (!FunctionSwitch.ENABLE_FLASH_DEVICE) {
                        this.listenTo(Strategy, 'change:enableFlashDevice', function () {
                            if (FunctionSwitch.ENABLE_FLASH_DEVICE) {
                                flashCardView = FlashCardView.getInstance();
                                $cardCtn.prepend(flashCardView.render().$el);
                                IO.requestAsync(CONFIG.actions.TOOLBOX_INIT);
                            }
                        });
                    } else {
                        flashCardView = FlashCardView.getInstance();
                        $cardCtn.append(flashCardView.render().$el);
                        IO.requestAsync(CONFIG.actions.TOOLBOX_INIT);
                    }

                    manageSDCardView = ManageSDCardView.getInstance();
                    $cardCtn.append(manageSDCardView.render().$el);

                    featureCardView = FeatureCardView.getInstance();
                    $cardCtn.append(featureCardView.render().$el);

                }.bind(this), 0);

                this.rendered = true;
                return this;
            }
        });

        var toolsModuleView;
        var factory = _.extend({
            enablePreload : false,
            getInstance : function (tab) {
                if (!toolsModuleView) {
                    toolsModuleView = new ToolsModuleView();

                    if (tab !== undefined && tab !== 'normal') {
                        setTimeout(function () {
                            Backbone.trigger('switchModule', {
                                module : 'tools',
                                tab : tab
                            });
                        }, 0);
                    }
                }

                return toolsModuleView;
            }
        });

        return factory;
    });
}(this));
