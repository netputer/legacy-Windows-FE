/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'doT',
        'Configuration',
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
            regCardAsync : function (viewInstance) {
                var deferred = $.Deferred();

                viewInstance.checkAsync().done(function () {
                    this.cardQueue.push(viewInstance);
                    this.$('.step-counter-ctn').append($('<li>').addClass('step-pointer'));
                }.bind(this)).always(deferred.resolve);

                return deferred.promise();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.regCardAsync(StarterView.getInstance({
                    type : 0
                }))
                    // .then(function () {
                    //     return this.regCardAsync(CloudBackupView.getInstance());
                    // }.bind(this))
                    .then(function () {
                        return this.regCardAsync(StarterView.getInstance({
                            type : 1
                        }));
                    }.bind(this))
                    // .then(function () {
                    //     return this.regCardAsync(BindView.getInstance());
                    // }.bind(this))
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
                        .append(currentCard.render().$el).one('webkitAnimationEnd', function () {
                            $(this).css({
                                '-webkit-transform' : 'translate3d(0, 0, 0)',
                                'opacity' : 1
                            }).removeClass('w-anima-fade-slide-in-right');
                        });

                    var $pointers = this.$('.step-counter-ctn .step-pointer').removeClass('current');
                    $pointers.eq($pointers.length - this.cardQueue.length - 1).addClass('current');

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
