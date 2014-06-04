/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'IO',
        'Configuration',
        'Environment',
        'Internationalization',
        'browser/views/BrowserView',
        'doraemon/collections/ExtensionsCollection',
        'doraemon/models/ExtensionModel'
    ], function (
        _,
        Backbone,
        IO,
        CONFIG,
        Environment,
        i18n,
        BrowserView,
        ExtensionsCollection,
        ExtensionModel
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
            },
            render : function () {
                this.rendered = true;
                return this;
            },
            navigate : function (extensionModel, url) {

                this.$('.w-browser').addClass('w-module-hide');
                var $browser = this.$('#' + IFRAME_PREFIX + extensionModel.id);
                var isWdj = (!url ||  url.substr(0, 13) === 'wdj-extension');

                if (isWdj) {
                    extensionModel.set('targetURL', url);
                }

                if ($browser.length > 0) {
                    $browser.removeClass('w-module-hide');
                    $browser.find('iframe').attr({
                        src : url
                    });
                } else {

                    $browser = BrowserView.getInstance({
                        id : IFRAME_PREFIX + extensionModel.id,
                        model : extensionModel,
                        autoGotoURL : !isWdj
                    }).render().$el;

                    this.$el.prepend($browser);

                    if (!isWdj) {
                        $browser.find('iframe').attr({
                            src : url
                        });
                    }
                }
            },
            navigateToThirdParty : function (extentionId, extentionName, url, isPreview) {
                var selectedExtension = ExtensionsCollection.getInstance().find(function (extension) {
                    return extension.get('selected');
                });

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

                return extensionModel;
            }
        });

        var browserModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!browserModuleView) {
                    browserModuleView = new BrowserModuleView();

                    Backbone.on('switchModule', function (data) {

                        var name = '';
                        var url = '';
                        var tab = data.tab;

                        var extension = data.extension;
                        if (extension) {
                            name = extension.get('name');
                            url = extension.get('targetUrl');
                            tab = extension.id;
                        }

                        if (data.module === 'browser' && !data.silent) {
                            factory.navigateToThirdParty(tab, name, url);

                        }
                    });

                }

                return browserModuleView;
            },
            navigate : function (url, isDebug) {
                if (isDebug) {
                    factory.navigateToThirdParty(CONFIG.enums.TEMP_EXTENTION_ID, 'Debug Mode', url);
                    return;
                }

                var item;
                var id = 18;
                var name = i18n.browser.APP_SEARCH;
                if (navigator.language !== CONFIG.enums.LOCALE_ZH_CN) {
                    id = 138;
                    name = 'Google Play';
                }

                factory.navigateToThirdParty(id, name, url);
            },
            navigateToThirdParty : function (id, name, url, isPreview) {

                var extension = ExtensionsCollection.getInstance().get(id);
                var tab = 'misc';
                var ignore = true;

                if (extension !== undefined) {
                    extension.set({
                        selected : true
                    });

                    tab = id;
                    this.getInstance().navigate(extension, url);
                } else {
                    ignore = false;
                    isPreview = typeof isPreview === 'undefined' ? true : isPreview;
                    extension = this.getInstance().navigateToThirdParty(id, name, url, isPreview);
                }

                Backbone.trigger('switchModule', {
                    module : 'browser',
                    tab : tab,
                    silent : true,
                    ignore : ignore,
                    extension : extension
                });
            }
        });

        IO.Backend.onmessage({
            'data.channel' : CONFIG.events.SIDEBAR_PREVIEW
        }, function (data) {
            factory.navigateToThirdParty(data.id || data, data.name, data.targetURL);
        });

        return factory;
    });
}(this));
