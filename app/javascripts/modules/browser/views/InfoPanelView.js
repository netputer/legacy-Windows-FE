/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Log',
        'Account',
        'Configuration',
        'Internationalization',
        'doraemon/collections/ExtensionsCollection'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        StringUtil,
        log,
        Account,
        CONFIG,
        i18n,
        ExtensionsCollection
    ) {
        console.log('InfoPanelView - File loaded. ');

        var extensionsCollection;

        var addHandler = function (extension) {
            if (extension.id === this.model.id) {
                this.$el.slideUp('fast', this.remove.bind(this));
            }
        };

        var InfoPanelView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'info-panel')),
            className : 'w-browser-info-panel hbox',
            initialize : function () {
                extensionsCollection = extensionsCollection || ExtensionsCollection.getInstance();
                this.listenToOnce(extensionsCollection, 'add', addHandler);
                this.listenTo(this.model, 'change:extension', this.render);
            },
            render : function () {
                if (this.model.get('extension')) {
                    this.$el.html(this.template(this.model.toJSON())).css({
                        display : '-webkit-box'
                    });
                    this.$el.slideDown('fast');
                } else {
                    this.$el.hide();
                }
                return this;
            },
            clickButtonStar : function () {
                if (!Account.get('isLogin')) {
                    Account.openRegDialog(i18n.misc.LOGIN_TO_STAR, 'star-button-on-info-panel');
                } else {
                    this.model.starAsync().done(function () {
                        extensionsCollection.add(this.model).trigger('star', this.model);

                        this.$el.slideUp('fast', this.remove.bind(this));
                    }.bind(this));
                }

                log({
                    'event' : 'ui.click.dora.star.button.info.panel',
                    'id' : this.model.id
                });
            },
            clickButtonClose : function () {
                this.$el.slideUp('fast', this.remove.bind(this));

                log({
                    'event' : 'ui.click.dora.close.button.info.panel',
                    'id' : this.model.id
                });
            },
            events : {
                'click .button-star' : 'clickButtonStar',
                'click .button-close' : 'clickButtonClose'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new InfoPanelView(args);
            }
        });

        return factory;
    });
}(this));
