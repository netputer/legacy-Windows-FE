/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'doT',
        'Configuration',
        'ui/TemplateFactory',
        'guide/views/BindView',
        'guide/views/CloudBackupView',
        'guide/views/XibaibaiView'
    ], function (
        Backbone,
        $,
        doT,
        CONFIG,
        TemplateFactory,
        BindView,
        CloudBackupView,
        XibaibaiView
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

                this.regCardAsync(BindView.getInstance())
                    .then(function () {
                        return this.regCardAsync(CloudBackupView.getInstance());
                    }.bind(this))
                    .then(function () {
                        return this.regCardAsync(XibaibaiView.getInstance());
                    }.bind(this))
                    .then(this.run.bind(this));

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
                }
            },
            run : function () {
                this.showNextCard();
            }
        });

        $('body').append(new GuideView().render().$el);
    });
}(this));
