/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'doT',
        'Configuration',
        'Internationalization',
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'IO',
        'guide/views/BindView',
        'guide/views/CloudBackupView',
        'guide/views/XibaibaiView',
        'guide/views/StarterView',
        'guide/views/TipsView',
        'guide/views/DoraSuggestionView'
    ], function (
        Backbone,
        $,
        doT,
        CONFIG,
        i18n,
        StringUtil,
        TemplateFactory,
        IO,
        BindView,
        CloudBackupView,
        XibaibaiView,
        StarterView,
        TipsView,
        DoraSuggestionView
    ) {
        var GuideView = Backbone.View.extend({
            className : 'w-guide-ctn vbox',
            template : doT.template(TemplateFactory.get('guide', 'main')),
            cardQueue : [],
            totalCards: 0,
            regCardAsync : function (viewInstance) {
                var deferred = $.Deferred();

                viewInstance.checkAsync().done(function () {
                    this.cardQueue.push(viewInstance);
                }.bind(this)).always(deferred.resolve);

                return deferred.promise();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.regCardAsync(StarterView.getInstance({
                    type : 0
                }))
                    .then(function () {
                        return this.regCardAsync(StarterView.getInstance({
                            type : 1
                        }));
                    }.bind(this))
                    // .then(function () {
                    //     return this.regCardAsync(BindView.getInstance());
                    // }.bind(this))
                    .then(function () {
                        return this.regCardAsync(CloudBackupView.getInstance());
                    }.bind(this))
                    .then(function () {
                        return this.regCardAsync(XibaibaiView.getInstance());
                    }.bind(this))
                    .then(function () {
                        return this.regCardAsync(DoraSuggestionView.getInstance());
                    }.bind(this))
                    .then(function () {
                        return this.regCardAsync(TipsView.getInstance());
                    }.bind(this))
                    .then(function () {
                        this.totalCards = this.cardQueue.length;
                        return $.Deferred().resolve();
                    }.bind(this))
                    .then(function () {
                        IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_WELCOME_USER_GUIDE_READY);
                        this.run();
                    }.bind(this));

                return this;
            },
            showNextCard : function () {
                var currentCard = this.cardQueue.shift();
                if (currentCard) {
                    this.$('.content')
                        .addClass('w-anima-fade-slide-in-right')
                        .append(currentCard.render().$el)
                        .one('webkitAnimationEnd', function () {
                            $(this).css({
                                '-webkit-transform' : 'translate3d(0, 0, 0)',
                                'opacity' : 1
                            }).removeClass('w-anima-fade-slide-in-right');
                        });

                    currentCard.$('.text-counter').text(StringUtil.format(i18n.welcome.GUIDE_TEXT_COUNTER, this.totalCards - this.cardQueue.length, this.totalCards));

                    currentCard.once('next', function () {
                        this.$('.content')
                            .addClass('w-anima-fade-slide-out-right')
                            .one('webkitAnimationEnd', function () {
                                this.$('.content').css({
                                    '-webkit-transform' : 'translate3d(100%, 0, 0)',
                                    'opacity' : 0
                                }).removeClass('w-anima-fade-slide-out-right');

                                currentCard.remove();

                                setTimeout(this.showNextCard.bind(this));
                            }.bind(this));
                    }, this);
                } else {
                    IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_WELCOME_USER_GUIDE_FINISH);
                }
            },
            run : function () {
                if (this.cardQueue.length === 0) {
                    IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_WELCOME_USER_GUIDE_EMPTY);
                } else {
                    this.showNextCard();
                }
            }
        });

        $('body').append(new GuideView().render().$el);
    });
}(this));
