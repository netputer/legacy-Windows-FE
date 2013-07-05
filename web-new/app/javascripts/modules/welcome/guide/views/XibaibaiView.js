/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'doT',
        'Internationalization',
        'Log',
        'ui/TemplateFactory',
        'IO',
        'Configuration',
        'guide/views/CardView'
    ], function (
        $,
        _,
        doT,
        i18n,
        log,
        TemplateFactory,
        IO,
        CONFIG,
        CardView
    ) {
        var XibaibaiView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-xibaibai',
            template : doT.template(TemplateFactory.get('guide', 'xibaibai')),
            checkAsync : function () {
                var deferred = $.Deferred();

                setTimeout(function () {
                    deferred.resolve();
                });

                return deferred.promise();
            },
            clickButtonSkip : function () {
                XibaibaiView.__super__.clickButtonSkip.call(this);

                log({
                    'event' : 'ui.click.guide_xibaibai_skip'
                });
            },
            clickButtonAction : function () {
                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : CONFIG.events.WEB_NAVIGATE,
                        value : JSON.stringify({
                            type : CONFIG.enums.NAVIGATE_TYPE_APP_WASH
                        })
                    }
                });

                this.trigger('next');

                log({
                    'event' : 'ui.click.guide_xibaibai_action'
                });
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new XibaibaiView({
                    action : i18n.welcome.GUIDE_XIBAIBAI_START
                });
            }
        });

        return factory;
    });
}(this));
