/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/behavior/LimitInWindowMixin',
        'ui/behavior/BlurToHideMixin',
        'ui/behavior/AutoCloseMixin',
        'ui/WindowState'
    ], function (
        Backbone,
        doT,
        $,
        UIHelper,
        TemplateFactory,
        LimitInWindowMixin,
        BlurToHideMixin,
        AutoCloseMixin,
        WindowState
    ) {
        console.log('TipPanel - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

        var TipPanel = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('ui', 'tip')),
            initialize : function () {
                LimitInWindowMixin.mixin(this);
                BlurToHideMixin.mixin(this);
                AutoCloseMixin.mixin(this);

                var rendered = false;
                var $content;
                var popIn = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    $content : {
                        set : function (value) {
                            $content = value;
                        },
                        get : function () {
                            return $content;
                        }
                    },
                    popIn : {
                        set : function (value) {
                            popIn = value;
                        },
                        get : function () {
                            return popIn;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            beforeRender : function () {
                return;
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$el.append(this.$content);
                this.$el.css({
                    top : 0,
                    left : 0
                });

                $('body').append(this.$el);

                this.rendered = true;

                this.trigger(EventsMapping.RENDERED);
                return this;
            },
            show : function () {
                if (!this.rendered) {
                    this.render();
                }

                if (this.$el.hasClass('w-layout-hide')) {
                    this.listenTo(WindowState, 'resize', this.hide);

                    this.locate();

                    this.$el.toggleClass('w-anima-pop-in', this.popIn);

                    if (this.popIn) {
                        this.$el.one('webkitAnimationEnd', function () {
                            this.$el.removeClass('w-layout-hide');
                        }.bind(this));
                    } else {
                        this.$el.removeClass('w-layout-hide');
                    }

                    this.$el.one('webkitTransitionEnd', function () {
                        this.trigger(EventsMapping.SHOW);
                    }.bind(this));
                }
            },
            hide : function () {
                if (!this.$el.hasClass('w-layout-hide')) {
                    this.$el.addClass('w-layout-hide');

                    var transitionEndHandler = function () {
                        this.rendered = false;
                        TipPanel.__super__.remove.call(this);
                        this.trigger(EventsMapping.REMOVE);
                    }.bind(this);
                    this.$el.one('webkitTransitionEnd', transitionEndHandler);
                }
            },
            remove : function () {
                this.hide();
            },
            zero : function () {
                // Just an empty function to avoid stupid JSLint error
                return;
            }
        });

        return TipPanel;
    });
}(this));
