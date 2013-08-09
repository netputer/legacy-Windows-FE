/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Log',
        'ui/TemplateFactory',
        'ui/WindowState'
    ], function (
        _,
        Backbone,
        doT,
        $,
        log,
        TemplateFactory,
        WindowState
    ) {
        console.log('BrowserMenuView - File loaded.');

        var BrowserMenuView = Backbone.View.extend({
            tagName : 'ul',
            className : 'w-browser-menu hbox',
            template : doT.template(TemplateFactory.get('doraemon', 'browser-menu')),
            initialize : function () {
                this.options.$iframe.on('readystatechange', function (evt) {
                    if (evt.originalEvent.srcElement.readyState === 'loading') {
                        this.selectTargetItem();
                    }
                }.bind(this));
                this.listenTo(this.model, 'change:extension', this.render);
                this.listenTo(WindowState, 'resize', this.relocatePointer);
            },
            remove : function () {
                this.options.$iframe.remove();
                BrowserMenuView.__super__.remove.call(this);
            },
            selectTargetItem : function () {
                var contentDocument = this.options.$iframe[0].contentDocument;
                if (contentDocument) {
                    var $targetItem = this.$('li.root-item[data="' + contentDocument.location.href + '"]');
                    if ($targetItem.length > 0) {
                        this.$('.root-item.selected').removeClass('selected');
                        $targetItem.addClass('selected');
                    }
                }
                this.relocatePointer();
            },
            relocatePointer : function () {
                var $targetTab =  this.$('.root-item.selected');
                if ($targetTab.length > 0) {
                    var $pointer = this.$el.parent().find('.w-browser-menu-pointer').show();

                    var oldTransition = $pointer.css('-webkit-transition');

                    $pointer.css({
                        '-webkit-transition' : 'none'
                    });

                    $pointer.css({
                        left : $targetTab[0].offsetLeft,
                        width : $targetTab[0].offsetWidth
                    });

                    setTimeout(function () {
                        $pointer.css({
                            '-webkit-transition' : oldTransition
                        });
                    }, 0);
                }
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.selectTargetItem();

                return this;
            },
            clickRootItem : function (evt) {
                var $target = $(evt.currentTarget);

                if (!$target.hasClass('selected')) {
                    this.$('.root-item.selected').removeClass('selected');

                    $target.addClass('selected');
                }
                var data = $target.attr('data');
                this.relocatePointer();

                this.trigger('select', data);

                log({
                    'event' : 'ui.click.dora.browser.menu',
                    'extensionId' : this.model.id,
                    'url' : data
                });
            },
            events : {
                'click .root-item' : 'clickRootItem'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BrowserMenuView(args);
            }
        });

        return factory;
    });
}(this));
