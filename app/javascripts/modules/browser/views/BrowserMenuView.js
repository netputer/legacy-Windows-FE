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
                    if (evt.originalEvent.srcElement.readyState === 'complete') {
                        this.selectTargetItem();
                    }
                }.bind(this));

                var lastWindowWidth;

                this.listenTo(this.model, 'change:extension', this.render);
                this.listenTo(WindowState, 'resize', function (state) {
                    if (lastWindowWidth !== state.width) {
                        this.relocatePointer();
                    }
                    lastWindowWidth = state.width;
                });
            },
            selectTargetItem : function () {
                var contentDocument = this.options.$iframe[0].contentDocument;
                var targetItem;

                if (contentDocument) {
                    targetItem = _.find(this.$items, function (item) {
                        var url = $(item).attr('data');
                        return contentDocument.location.href.indexOf(url) === 0;
                    });

                    if (targetItem) {
                        this.$('.root-item.selected').removeClass('selected');
                        targetItem = $(targetItem).addClass('selected');
                    }
                }

                this.relocatePointer(targetItem);
            },
            relocatePointer : function ($targetTab) {

                if (_.isUndefined($targetTab)) {
                    $targetTab =  this.$('.root-item.selected');
                }

                if ($targetTab.length > 0) {
                    var $pointer = this.$el.parent().find('.w-browser-menu-pointer').show();
                    $pointer.css({
                        left : $targetTab[0].offsetLeft,
                        width : $targetTab[0].offsetWidth
                    });
                }
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                setTimeout(function () {
                    this.$items = this.$('li.root-item');
                    this.selectTargetItem();
                }.bind(this), 0);
                return this;
            },
            clickRootItem : function (evt) {
                var $target = $(evt.currentTarget);

                if (!$target.hasClass('selected')) {
                    this.$('.root-item.selected').removeClass('selected');

                    $target.addClass('selected');
                }
                var data = $target.attr('data');
                this.relocatePointer($target);

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
