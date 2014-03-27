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
            navigate : function (extensionModel, url) {

                this.$('.w-browser').addClass('w-module-hide');
                var $browser = this.$('#' + IFRAME_PREFIX + extensionModel.id);
                var isWdj = (url && url.substr(0, 13) === 'wdj-extension');

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
                        autoGotoURL : url ? false : true
                    }).render().$el;

                    this.$el.prepend($browser);

                    if (!isWdj) {
                        $browser.find('iframe').attr({
                            src : url
                        });
                    }
                }

                Backbone.trigger('switchModule', {
                    module : 'browser',
                    tab : extensionModel.id,
                    silent : true,
                    ignore : true
                });

            },
            navigateToThirdParty : function (extentionId, extentionName, url, isPreview) {
                var extension = ExtensionsCollection.getInstance().get(extentionId);

                if (extension !== undefined) {
                    extension.set({
                        selected : true
                    });

                   this.navigate(extension, url);

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
                    return;
                }

                var item;
                var id = 18;
                var name = i18n.browser.APP_SEARCH;
                if (Environment.get('locale') !== CONFIG.enums.LOCALE_DEFAULT && Environment.get('locale') !== CONFIG.enums.LOCALE_ZH_CN) {
                    id = 138;
                    name = 'Google Play';
                }

                this.navigateToThirdParty(id, name, url);
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
