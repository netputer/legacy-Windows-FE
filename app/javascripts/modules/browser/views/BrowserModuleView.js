/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'IOBackendDevice',
        'Configuration',
        'Environment',
        'Internationalization',
        'browser/views/BrowserView',
        'doraemon/collections/ExtensionsCollection',
        'doraemon/models/ExtensionModel',
        'WindowController'
    ], function (
        _,
        Backbone,
        IO,
        CONFIG,
        Environment,
        i18n,
        BrowserView,
        ExtensionsCollection,
        ExtensionModel,
        WindowController
    ) {
        console.log('BrowserModuleView - File loaded.');

        var IFRAME_PREFIX = CONFIG.enums.IFRAME_PREFIX;

        var publicBrowser;

        var BrowserModuleView = Backbone.View.extend({
            className : 'w-browser-module-main module-main',
            initialize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });

                Backbone.on('switchModule', function (data) {
                    if (data.module === 'browser' && !data.silent) {
                        this.navigateToThirdParty(data.tab, ExtensionsCollection.getInstance().get(data.tab).get('name'), undefined, true);
                    }
                }, this);
            },
            render : function () {
                this.rendered = true;
                return this;
            },
            goto : function (extensionModel, gotoURL) {
                if (gotoURL === undefined) {
                    gotoURL = true;
                }

                this.$('.w-browser').addClass('w-module-hide');

                var $browser = this.$('#' + IFRAME_PREFIX + extensionModel.id);
                if ($browser.length > 0) {
                    $browser.removeClass('w-module-hide');
                } else {
                    $browser = BrowserView.getInstance({
                        id : IFRAME_PREFIX + extensionModel.id,
                        model : extensionModel,
                        autoGotoURL : gotoURL
                    }).render().$el;
                    this.$el.prepend($browser);
                }
            },
            navigate : function (extensionModel, url) {
                this.goto(extensionModel, false);

                this.$('#' + IFRAME_PREFIX + extensionModel.id).find('iframe').attr({
                    src : url
                });
            },
            navigateToThirdParty : function (extentionId, extentionName, url, isPreview) {
                var extension = ExtensionsCollection.getInstance().get(extentionId);

                if (extension !== undefined) {
                    extension.set({
                        selected : true
                    });

                    if (url) {
                        this.navigate(extension, url);
                    } else {
                        this.goto(extension);
                    }
                } else {
                    var selectedExtension = ExtensionsCollection.getInstance().filter(function (extension) {
                        return extension.get('selected');
                    })[0];
                    if (selectedExtension !== undefined) {
                        selectedExtension.set({
                            selected : false
                        });
                    }

                    var extensionModel = new ExtensionModel({
                        id : extentionId,
                        name : extentionName || '',
                        preview : true,
                        targetURL : url,
                        extensionPreview : isPreview
                    });

                    this.$('.w-browser').addClass('w-module-hide');

                    if (!publicBrowser) {
                        publicBrowser = BrowserView.getInstance({
                            id : IFRAME_PREFIX + 'misc',
                            model : extensionModel
                        });
                        this.$el.prepend(publicBrowser.render().$el);
                    } else {
                        publicBrowser.model = extensionModel;
                        publicBrowser.render();
                    }

                    publicBrowser.$el.removeClass('w-module-hide');

                    Backbone.trigger('switchModule', {
                        module : 'browser',
                        tab : 'misc'
                    });
                }
            },
            navigateTo : function (url, isDebug) {
                if (isDebug) {
                    this.navigateToThirdParty(CONFIG.enums.TEMP_EXTENTION_ID, 'Debug Mode', url);
                } else {
                    var item;
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) {
                        item = ExtensionsCollection.getInstance().get(18);
                        if (item) {
                            item.set({
                                selected : true
                            });
                            this.navigate(item, url);
                        } else {
                            this.navigateToThirdParty(18, i18n.browser.APP_SEARCH, url);
                        }
                    } else {
                        item = ExtensionsCollection.getInstance().get(138);
                        if (item) {
                            item.set({
                                selected : true
                            });
                            this.navigate(item, url);
                        } else {
                            this.navigateToThirdParty(138, 'Google Play', url);
                        }
                    }
                }
            }
        });

        var browserModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!browserModuleView) {
                    browserModuleView = new BrowserModuleView();
                }
                return browserModuleView;
            },
            navigate : function (url, isDebug) {
                this.getInstance().navigateTo(url, isDebug);
            },
            navigateToThirdParty : function (id, name, url) {
                this.getInstance().navigateToThirdParty(id, name, url, true);

                Backbone.trigger('switchModule', {
                    module : 'browser',
                    tab : id,
                    silent : true,
                    ignore : true
                });
            }
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.SIDEBAR_PREVIEW
        }, function (data) {
            factory.navigateToThirdParty(data.id || data, data.name, data.targetURL);
        });

        return factory;
    });
}(this));
