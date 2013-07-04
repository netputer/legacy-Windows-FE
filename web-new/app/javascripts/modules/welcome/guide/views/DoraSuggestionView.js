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
        var DoraSuggestionView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-suggestion',
            template : doT.template(TemplateFactory.get('guide', 'suggestion')),
            items : [{
                banner : '../../../../images/guide/banner1.png',
                extensionId : 0
            }, {
                banner : '../../../../images/guide/banner2.png',
                extensionId : 0
            }, {
                banner : '../../../../images/guide/banner3.png',
                extensionId : 0
            }, {
                banner : '../../../../images/guide/banner4.png',
                extensionId : 0
            }, {
                banner : '../../../../images/guide/banner5.png',
                extensionId : 0
            }],
            render : function () {
                _.extend(this.events, DoraSuggestionView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({
                    action : this.options.action,
                    items : this.items
                }));

                return this;
            },
            clickButtonOpen : function (evt) {
                var $target = $(evt.currentTarget);

                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : 'sidebar.preview',
                        value : JSON.stringify({
                            id : $target.data('id'),
                            name : '',
                            targetURL : ''
                        })
                    }
                });

                $target.remove();
            },
            events : {
                'click .button-open' : 'clickButtonOpen'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new DoraSuggestionView({
                    action : i18n.welcome.GUIDE_SUGGESTION_READ_ALL
                });
            }
        });

        return factory;
    });
}(this));
