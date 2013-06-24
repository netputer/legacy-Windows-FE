/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Log',
        'IOBackendDevice',
        'Configuration',
        'ui/TemplateFactory',
        'FunctionSwitch',
        'doraemon/collections/ExtensionsCollection',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        log,
        IO,
        CONFIG,
        TemplateFactory,
        FunctionSwitch,
        ExtensionsCollection,
        BrowserModuleView
    ) {
        console.log('MenuItemView - File loaded.');

        var extensionsCollection;

        var removeHandler = function (extension) {
            if (extension.id === this.model.id) {
                this.remove();
            }
        };

        var onLoadHandler = function () {
            var $this = $(this);
            $this.css('background', 'none');
        };

        var onErrorHandler = function () {
            this.src = CONFIG.enums.DORAENON_DEFAULT;
        };

        var changeSelectedHandler = function (model, selected) {
            this.$el.toggleClass('selected highlight', selected);

            if (selected) {
                console.log('MenuItemView - "' + model.get('name') + '" was selected.');

                var currentSelect = extensionsCollection.find(function (item) {
                    return item.id !== model.id && item.get('selected');
                });

                if (currentSelect !== undefined) {
                    currentSelect.set({
                        selected : false,
                        highlight : false
                    });
                }

                Backbone.trigger('switchModule', {
                    module : 'browser',
                    tab : model.id
                });
            }
        };

        var MenuItemView = Backbone.View.extend({
            tagName : 'li',
            className : 'root',
            template : doT.template(TemplateFactory.get('doraemon', 'menu-item')),
            initialize : function () {

                var img;
                Object.defineProperties(this, {
                    img : {
                        set : function (value) {
                            img = value;
                        },
                        get : function () {
                            return img;
                        }
                    }
                });

                extensionsCollection = extensionsCollection || ExtensionsCollection.getInstance();

                this.listenTo(this.model, 'change:selected', changeSelectedHandler);
                this.listenTo(this.model, 'change:name change:cate', this.render);
                this.listenTo(extensionsCollection, 'remove', removeHandler);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                
                this.img = this.$el.find('img');
                this.img.on('load', onLoadHandler);
                this.img.on('error', onErrorHandler);

                return this;
            },
            highlight : function () {
                var animaHandler = function () {
                    this.$el.removeClass('highlight-anima');
                }.bind(this);

                this.$el.one('webkitAnimationEnd', animaHandler)
                        .addClass('highlight-anima');
            },
            remove : function () {
                MenuItemView.__super__.remove.call(this, arguments);
                this.img.off('load');
            },
            clickItem : function () {
                if (this.model.id !== undefined &&
                        !this.model.get('selected')) {
                    this.model.set({
                        selected : true
                    });
                    BrowserModuleView.getInstance().goto(this.model);
                    this.model.downloadAsync();

                    if (FunctionSwitch.PRIVACY.RECORD_BROWSE_HISTORY) {
                        log({
                            'event' : 'ui.click.dora.nav',
                            'id' : this.model.id
                        });
                    }
                } else if (this.model.get('selected')) {
                    Backbone.trigger('switchModule', {
                        module : 'browser',
                        tab : this.model.id
                    });
                }
            },
            events : {
                'click' : 'clickItem'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MenuItemView(args);
            }
        });

        return factory;
    });
}(this));
