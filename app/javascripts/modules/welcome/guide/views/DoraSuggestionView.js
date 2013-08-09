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
        'Settings',
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
        Settings,
        CardView
    ) {
        var DoraSuggestionView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-suggestion',
            template : doT.template(TemplateFactory.get('guide', 'suggestion')),
            items : [{
                extensionId : 18,
                name : 'app'
            }, {
                extensionId : 223,
                name : 'game'
            }, {
                extensionId : 258,
                name : 'video'
            }, {
                extensionId : 255,
                name : 'music'
            }, {
                extensionId : 256,
                name : 'picture'
            }],
            initialize : function () {
                this.on('next', function () {
                    Settings.set('user_guide_shown_suggestion', true, true);
                });
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                if (Settings.get('user_guide_shown_suggestion')) {
                    setTimeout(deferred.reject);
                    log({
                        'event' : 'debug.guide_suggestion_show'
                    });
                } else {
                    setTimeout(deferred.resolve);
                }

                return deferred.promise();
            },
            render : function () {
                _.extend(this.events, DoraSuggestionView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({
                    action : this.options.action,
                    items : this.items
                }));

                return this;
            },
            clickButtonSkip : function () {
                DoraSuggestionView.__super__.clickButtonSkip.call(this);

                log({
                    'event' : 'ui.click.guide_dora_skip'
                });
            },
            clickButtonOpen : function (evt) {
                var $target = $(evt.currentTarget);

                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : CONFIG.events.SIDEBAR_PREVIEW,
                        value : JSON.stringify({
                            id : $target.data('id'),
                            name : '',
                            targetURL : ''
                        })
                    }
                });

                $target.remove();

                if (this.$('.item').length === 0) {
                    this.trigger('next');
                }

                log({
                    'event' : 'ui.click.guide_dora_open'
                });
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
