/*global define*/
(function (window) {
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
        'doraemon/collections/ExtensionsCollection'
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
        ExtensionsCollection
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

                if (iframe.src === 'http://apps.wandoujia.com/') {
                    var endTime = new Date().getTime();

                    log({
                        'event' : 'debug.browser.wandoujia.loading.time',
                        'time' : endTime - startTime
                    });
                }

                if (iframe.src === 'http://www.youtube.com/') {
                    
                    var contents = $("#"+iframe.id).contents();
                    if (contents.find("#page-container").length === 1  && contents.find('#wdj-youtube-box').length === 0) {
                        var youtube = '<div id="wdj-youtube-box"><span id="wdj-youtube-info">' + i18n.browser.YOUTUBE_INFO_NO + '</span><a href="javascript:void(0);" class="disabled" id="wdj-youtube-download"> ' + i18n.browser.YOUTUBE_DOWNLOAD + ' </a></div>';
                        contents.find("body").append(youtube);
                    }
                    
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

        var loadExtension = function () {
            var errorPageHandler = function (evt) {
                if (evt.originalEvent.srcElement.readyState === 'complete') {
                    var $button = $(this.$iframe[0].contentDocument).find('.button-retry');

                    $button.one('click', function () {
                        loadExtension.call(this);
                    }.bind(this));

                    this.$iframe.off('readystatechange', errorPageHandler);
                }
            }.bind(this);

            this.model.downloadAsync().fail(function () {
                this.$iframe.attr({
                    src : CONFIG.enums.EXTENTION_ERROR_PAGE_URL,
                    extension : this.model.id
                });
                this.$iframe.on('readystatechange', errorPageHandler);
            }.bind(this)).always(function () {
                this.progress += 20;
                this.$('.browser-ctn').prepend(this.$iframe);
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
            var src = this.$iframe.attr('src');
            if (!src) {
                this.$iframe.attr({
                    src : model.get('targetURL') || model.get('web_url') || (model.get('extension') && model.get('extension').app ? model.get('extension').app.launch.web_url : ''),
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
                var $iframe;
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
                    },
                    additionalClass : {
                        set : function (value) {
                            this.className += ' ' + value;
                            if (this.$el) {
                                this.$el.addClass(value);
                            }
                        }
                    },
                    $iframe : {
                        set : function (value) {
                            $iframe = value;
                        },
                        get : function () {
                            return $iframe;
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

                this.$iframe = this.$('iframe');
                this.$iframe.on('readystatechange', readystatechangeHandler.bind(this));
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
                    $iframe : this.$iframe
                });
                this.$el.prepend(this.browserToolbarView.render().$el);

                var url = this.model.get('targetURL') || this.model.get('web_url');
                if (this.autoGotoURL && url) {
                    this.$iframe.attr({
                        src : url,
                        extension : this.model.id
                    });
                    this.model.unset('targetURL');
                } else {
                    this.$iframe.detach();
                }

                if (!this.model.get('extension')) {
                    setTimeout(function () {
                        loadExtension.call(this);
                    }.bind(this), 0);
                }

                if (this.model.get('extension')) {
                    this.progress += 20;
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
