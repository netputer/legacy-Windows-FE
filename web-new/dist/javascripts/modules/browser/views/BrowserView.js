/*global define*/
(function (window, undefined) {
    'use strict';

    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'IOBackendDevice',
        'Internationalization',
        'FunctionSwitch',
        'utilities/FlashDetector',
        'ui/TemplateFactory',
        'Log',
        'browser/views/BrowserToolbarView',
        'browser/views/InfoPanelView',
        'browser/views/AppDependencyView',
        'doraemon/collections/ExtensionsCollection',
        'main/MainRouter'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        IO,
        i18n,
        FunctionSwitch,
        FlashDetector,
        TemplateFactory,
        log,
        BrowserToolbarView,
        InfoPanelView,
        AppDependencyView,
        ExtensionsCollection,
        MainRouter
    ) {
        console.log('BrowserView - File loaded. ');

        var setTimeout = window.setTimeout;

        var extensionsCollection;

        var startTime;

        var readystatechangeHandler = function (evt) {
            var state = evt.originalEvent.srcElement.readyState;
            var iframe = this.$('iframe')[0];
            switch (state) {
            case 'complete':
                if (this.model.get('extension')) {
                    this.progress = 100;
                } else {
                    this.progress = 80;
                }

                MainRouter.navigate('browser/' + this.model.id + '/' + encodeURIComponent(iframe.contentWindow.location.href));

                if (iframe.src === 'http://apps.wandoujia.com/') {
                    var endTime = new Date().getTime();

                    log({
                        'event' : 'debug.browser.wandoujia.loading.time',
                        'time' : endTime - startTime
                    });
                }
                break;
            case 'interactive':
                this.progress += 20;
                break;
            case 'loading':
                this.progress += 20;
                break;
            case 'start':
                this.progress = 20;

                if (iframe.src === 'http://apps.wandoujia.com/') {
                    startTime = new Date().getTime();
                }
                break;
            }
        };

        var loadExtension = function ($iframe) {
            var errorPageHandler = function (evt) {
                if (evt.originalEvent.srcElement.readyState === 'complete') {
                    var $button = $($iframe[0].contentDocument).find('.button-retry');

                    $button.one('click', function () {
                        loadExtension.call(this, $iframe);
                    }.bind(this));

                    $iframe.off('readystatechange', errorPageHandler);
                }
            }.bind(this);

            this.model.downloadAsync().done(function () {
                if (!$iframe.attr('src')) {
                    $iframe.attr({
                        src : this.model.get('web_url') || this.model.get('extension').app.launch.web_url,
                        extension : this.model.id
                    });
                }
            }.bind(this)).fail(function () {
                $iframe.attr({
                    src : CONFIG.enums.EXTENTION_ERROR_PAGE_URL,
                    extension : this.model.id
                });
            }.bind(this)).always(function () {
                this.progress += 20;
            }.bind(this));
        };

        var removeBrowser = function (extension) {
            if (extension.id === this.model.id &&
                    this.id !== CONFIG.enums.IFRAME_PREFIX + 'misc') {
                if (window.SnapPea.CurrentModule !== 'browser') {
                    this.remove();
                } else {
                    Backbone.once('switchModule', this.remove, this);
                }
            }
        };

        var changeHandler = function (model) {
            if (!this.$('iframe').attr('src')) {
                this.$('iframe').attr({
                    src : model.get('web_url') || model.get('extension').app.launch.web_url,
                    extension : model.id
                });
            }
        };

        var BrowserView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'browser')),
            className : 'w-browser vbox',
            initialize : function () {
                var id;
                var progress = 0;
                var flashErrorHandler;
                Object.defineProperties(this, {
                    id : {
                        set : function (value) {
                            id = value;
                        },
                        get : function () {
                            return id;
                        }
                    },
                    progress : {
                        set : function (value) {
                            progress = parseInt(value, 10);

                            if (progress === 100) {
                                _.debounce(function () {
                                    this.$('.progress').fadeOut('fast', function () {
                                        progress = 0;
                                    });
                                }.bind(this), 800)();
                            } else {
                                this.$('.progress').show();
                            }

                            this.$('.progress .value').css('width', progress + '%');
                        },
                        get : function () {
                            return progress;
                        }
                    },
                    flashErrorHandler :  {
                        get : function () {
                            return flashErrorHandler;
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

                extensionsCollection = extensionsCollection || ExtensionsCollection.getInstance();

                this.listenTo(extensionsCollection, 'remove', removeBrowser);

                this.listenTo(this.model, 'change', changeHandler);

                flashErrorHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.FLASH_ERROR
                }, function (data) {
                    if (this.model.id === data.extension_id) {
                        this.$('.flash-notifier').slideDown('fast');
                    }
                }, this);
            },
            remove : function () {
                if (this.infoPanelView) {
                    this.infoPanelView.remove();
                    this.infoPanelView = undefined;
                }
                if (this.browserToolbarView) {
                    this.browserToolbarView.remove();
                    this.browserToolbarView = undefined;
                }
                if (this.appDependencyView) {
                    this.appDependencyView.remove();
                    this.appDependencyView = undefined;
                }
                IO.Backend.Device.offmessage(this.flashErrorHandler);
                BrowserView.__super__.remove.apply(this);
            },
            renderContent : function () {
                this.$('.w-ui-toolbar, .w-browser-info-panel').remove();

                var $iframe = this.$('iframe');
                $iframe.on('readystatechange', readystatechangeHandler.bind(this));
                if (FunctionSwitch.ENABLE_DORAEMON) {
                    if (this.model.get('extensionPreview')) {
                        this.infoPanelView = InfoPanelView.getInstance({
                            model : this.model
                        });

                        this.$el.prepend(this.infoPanelView.render().$el);
                    } else if (extensionsCollection.get(this.model.id)) {
                        this.appDependencyView = AppDependencyView.getInstance({
                            model : this.model
                        });
                        this.$el.prepend(this.appDependencyView.render().$el);
                    }
                }

                this.browserToolbarView = BrowserToolbarView.getInstance({
                    model : this.model,
                    $iframe : $iframe
                });

                this.$el.prepend(this.browserToolbarView.render().$el);
                if (this.autoGotoURL) {
                    this.gotoURL();
                }

                var url = this.model.get('targetURL') || this.model.get('web_url');
                if (!url || !this.model.get('extension')) {
                    setTimeout(function () {
                        loadExtension.call(this, $iframe);
                    }.bind(this), 0);
                }

                if (this.model.get('extension')) {
                    this.progress += 20;
                }
            },
            gotoURL : function () {
                var url = this.model.get('targetURL') || this.model.get('web_url');
                var $iframe = this.$('iframe');
                if (url) {
                    $iframe.attr({
                        src : url,
                        extension : this.model.id
                    });
                    this.model.unset('targetURL');
                }
            },
            renderFlashNotifier : function () {
                if (FlashDetector.getVersion()) {
                    this.$('.flash-notifier').remove();
                } else {
                    this.$('.flash-notifier').hide();
                }
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.$el.attr({
                    id : this.id
                });

                this.renderContent();

                this.renderFlashNotifier();

                return this;
            },
            clickButtonInstallFlash : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : CONFIG.enums.FLASH_DOWNLOAD_URL
                    }
                });
                this.$('.flash-notifier').slideUp('fast');
            },
            clickButtonCloseFlashNotifier : function () {
                this.$('.flash-notifier').slideUp('fast');
            },
            events : {
                'click .button-install-flash' : 'clickButtonInstallFlash',
                'click .button-close-flash-notifier' : 'clickButtonCloseFlashNotifier'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BrowserView(args);
            }
        });

        return factory;
    });
}(this));
