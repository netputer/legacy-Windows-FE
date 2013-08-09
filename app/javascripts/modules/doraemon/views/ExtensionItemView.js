/*global define*/
(function (window) {
    define([
        'doT',
        'jquery',
        'underscore',
        'Internationalization',
        'IO',
        'Log',
        'Configuration',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'doraemon/collections/ExtensionsCollection'
    ], function (
        doT,
        $,
        _,
        i18n,
        IO,
        log,
        CONFIG,
        AlertWindow,
        TemplateFactory,
        BaseListItem,
        ExtensionsCollection
    ) {
        console.log('PluginItemView - File loaded.');

        var alert = window.alert;

        var ExtensionItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'extension-item')),
            className : 'w-extension-list-item hbox',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                var iconURL = this.model.get('icon');
                if (iconURL) {
                    var icon = new window.Image();
                    var $icon = $(icon);
                    var loadHandler = function () {
                        if (this.model.get('icon') === $icon.data('path')) {
                            this.$('.icon img').attr({
                                src : icon.src
                            });
                        }
                        $icon.off('load');
                        $icon.off('error');
                    }.bind(this);

                    var errorHandler = function () {
                        $icon.off('load');
                        $icon.off('error');
                    };

                    $icon.on('load', loadHandler);
                    $icon.on('error', errorHandler);
                    $icon.attr({
                        'src' : iconURL
                    }).data('path', iconURL);
                }

                return this;
            },
            clickButtonZip : function (evt) {
                evt.stopPropagation();
                this.model.zipAsync().done(function () {
                    IO.requestAsync({
                        url : CONFIG.actions.SHOW_FILE,
                        data : {
                            file_path : this.model.get('path') + '.wdx'
                        }
                    });
                }.bind(this));

                log({
                    'event' : 'ui.click.dora.dev.zip'
                });
            },
            clickButtonReload : function (evt) {
                evt.stopPropagation();
                this.model.downloadAsync().done(function (resp) {
                    alert(i18n.misc.RELOAD_SUCCESS);
                    var newExtension = JSON.parse(resp.body.value);
                    ExtensionsCollection.getInstance().get(newExtension.id).set(newExtension);
                }).fail(function (resp) {
                    alert(resp.state_line);
                });

                log({
                    'event' : 'ui.click.dora.dev.reload'
                });
            },
            clickButtonPublish : function (evt) {
                evt.stopPropagation();
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : CONFIG.enums.URL_EXTENSION_PUBLISH
                    }
                });

                log({
                    'event' : 'ui.click.dora.dev.publish'
                });
            },
            events : {
                'click .button-zip' : 'clickButtonZip',
                'click .button-reload' : 'clickButtonReload',
                'click .button-publish' : 'clickButtonPublish'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ExtensionItemView(args);
            },
            getClass : function () {
                return ExtensionItemView;
            }
        });

        return factory;
    });
}(this));
