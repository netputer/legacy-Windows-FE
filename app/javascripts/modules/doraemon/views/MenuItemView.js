/*global define*/
(function (window) {
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
        'Device',
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
        Device,
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
            }
        };

        var MenuItemView = Backbone.View.extend({
            tagName : 'li',
            className : 'title hbox',
            template : doT.template(TemplateFactory.get('doraemon', 'menu-item')),
            initialize : function () {
                extensionsCollection = extensionsCollection || ExtensionsCollection.getInstance();

                this.listenTo(this.model, 'change:selected', changeSelectedHandler);

                this.listenTo(this.model, 'change:name change:cate', this.render);
                this.listenTo(extensionsCollection, 'remove', removeHandler);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                if (!this.model.get('inWhiteList')) {
                    var $icon = $(new window.Image());

                    var loadHandler = function () {
                        this.$('.icon img').attr('src', this.model.get('icon'));
                        $icon.remove();
                    }.bind(this);

                    var errorHandler = function () {
                        $icon.remove();
                    };

                    $icon.one('load', loadHandler)
                        .one('error', errorHandler)
                        .attr('src', this.model.get('icon'));
                }

                return this;
            },
            highlight : function () {
                var animaHandler = function () {
                    this.$el.removeClass('highlight-anima');
                }.bind(this);

                this.$el.one('webkitAnimationEnd', animaHandler)
                        .addClass('highlight-anima');
            },
            clickItem : function () {

                if (this.model.id !== undefined && !this.model.get('selected')) {

                    this.model.set({
                        selected : true
                    });

                }

                BrowserModuleView.navigateToThirdParty(this.model.id);

                if (FunctionSwitch.PRIVACY.RECORD_BROWSE_HISTORY) {
                    log({
                        'event' : 'ui.click.dora.nav',
                        'id' : this.model.id,
                        'isFastADB' : Device.get('isFastADB')
                    });
                }

                Backbone.trigger('cleanForwardStack');
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
