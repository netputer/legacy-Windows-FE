/*global define*/
(function (window) {
    'use strict';

    define([
        'underscore',
        'doT',
        'jquery',
        'backbone',
        'Internationalization',
        'Account',
        'FunctionSwitch',
        'Log',
        'Configuration',
        'IO',
        'Device',
        'utilities/StringUtil',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'ui/Toolbar',
        'doraemon/views/ExtensionListView',
        'doraemon/models/ExtensionModel',
        'doraemon/collections/ExtensionsCollection'
    ], function (
        _,
        doT,
        $,
        Backbone,
        i18n,
        Account,
        FunctionSwitch,
        log,
        CONFIG,
        IO,
        Device,
        StringUtil,
        AlertWindow,
        TemplateFactory,
        Toolbar,
        ExtensionListView,
        ExtensionModel,
        ExtensionsCollection
    ) {
        console.log('DoramenonToolbarView - File loaded.');

        var alert = window.alert;
        var setTimeout = window.setTimeout;

        var extensionListView;
        var extensionsCollection;

        var DoramenonToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'toolbar')),
            initialize : function () {
                extensionsCollection = ExtensionsCollection.getInstance();
                this.listenTo(extensionsCollection, 'refresh', this.setButtonState);
                this.listenTo(FunctionSwitch, 'change', function (FunctionSwitch) {
                    this.$('.debug-wrap').toggle(FunctionSwitch.PRIVACY.ENABLE_DEBUG);
                });
                this.listenTo(Account, 'change:isLogin', this.setButtonState);

            },
            render : function () {
                this.$el.html(this.template({}));

                extensionListView = ExtensionListView.getInstance({
                    $observer : this.$('.check-select-all')
                });

                extensionListView.on('select:change', this.setButtonState, this);

                setTimeout(function () {
                    this.$('.debug-wrap').toggle(FunctionSwitch.PRIVACY.ENABLE_DEBUG).next().toggle(FunctionSwitch.PRIVACY.ENABLE_DEBUG);
                }.bind(this));

                this.setButtonState();
                return this;
            },
            setButtonState : function () {
                var selected = extensionListView.selected;
                var selectedLength = selected.length;
                var normalPlugins = extensionsCollection.getNormalPlugins();

                this.$('.button-gallery').prop({
                    disabled : !Account.get('isLogin')
                });

                this.$('.button-up').prop({
                    disabled : selectedLength !== 1 ||
                                extensionsCollection.at(0).id === selected[0] ||
                                !Account.get('isLogin') ||
                                extensionsCollection.get(selected[0]).get('dev_mode') === true
                });

                this.$('.button-down').prop({
                    disabled : selectedLength !== 1 ||
                                (normalPlugins.length > 0 && normalPlugins[normalPlugins.length - 1].id === selected[0]) ||
                                !Account.get('isLogin') ||
                                extensionsCollection.get(selected[0]).get('dev_mode') === true
                });

                this.$('.button-unstar').prop({
                    disabled : selectedLength === 0 ||
                                !Account.get('isLogin')
                });
            },
            clickButtonGallery : function () {
                Backbone.trigger('switchModule', {
                    module : 'gallery'
                });

                log({
                    'event' : 'ui.click.dora_more_button',
                    'source' : 'toolbar',
                    'connected' : Device.get('isConnected')
                });
            },
            clickButtonUp : function () {
                extensionsCollection.get(extensionListView.selected[0]).setOrderAsync(-1);
                log({
                    'event' : 'ui.click.dora.up.button',
                    'source' : 'toolbar'
                });
            },
            clickButtonDown : function () {
                extensionsCollection.get(extensionListView.selected[0]).setOrderAsync(1);
                log({
                    'event' : 'ui.click.dora.down.button',
                    'source' : 'toolbar'
                });
            },
            clickButtonUnstar : function () {
                var ids = extensionListView.selected;

                var disposableAlert = new AlertWindow({
                    draggable : true,
                    disposableName : 'batch-unstar-plugin',
                    disposableChecked : false,
                    buttonSet : 'yes_no',
                    $bodyContent : $(StringUtil.format(i18n.misc.BATCH_UNSTAR_PLUGINS, ids.length))
                });

                disposableAlert.once('button_yes', function () {
                    extensionsCollection.unstarredAsync(ids);
                });

                disposableAlert.show();

                log({
                    'event' : 'ui.click.dora.unstar.button',
                    'total' : extensionsCollection.length,
                    'count' : ids.length,
                    'source' : 'toolbar'
                });
            },
            clickButtonReset : function () {
                var ids = extensionsCollection.pluck('id');

                var resetAlert = new AlertWindow({
                    draggable : true,
                    disposableName : 'batch-reset-plugin',
                    disposableChecked : false,
                    buttonSet : 'yes_no',
                    $bodyContent : i18n.misc.CONFIRM_EXTENTION
                });

                resetAlert.once('button_yes', function () {

                    extensionListView.loading = true;
                    extensionsCollection.unstarredAsync(ids).done(function () {
                        extensionsCollection.reloadAsync().done(function () {
                            extensionsCollection.once('refresh', function() {
                                extensionListView.loading = false;
                            });
                            extensionsCollection.trigger('update');
                        });
                    });
                });

                resetAlert.show();

                log({
                    'event' : 'ui.click.dora.reset.button'
                });

            },
            clickButtonLoadExtention : function () {
                IO.requestAsync(CONFIG.actions.SELECT_FOLDER).done(function (resp) {
                    if (resp.state_code === 200) {
                        IO.requestAsync({
                            url : CONFIG.actions.PLUGIN_ADD,
                            data : {
                                dev_mode : 1,
                                path : resp.body.value
                            },
                            success : function (resp) {
                                if (resp.state_code === 200) {
                                    console.log('GalleryToolbarView - Load locale extention success. ');
                                    var extention = new ExtensionModel(JSON.parse(resp.body.value));
                                    extensionsCollection.add(extention);
                                    extensionsCollection.trigger('star', extention);
                                } else {
                                    console.error('GalleryToolbarView - Load locale extention failed. Error info: ' + resp.state_line);
                                    alert(resp.state_line);
                                }
                            }
                        });
                    }
                });

                log({
                    'event' : 'ui.click.dora.dev.load'
                });
            },
            events : {
                'click .button-gallery' : 'clickButtonGallery',
                'click .button-up' : 'clickButtonUp',
                'click .button-down' : 'clickButtonDown',
                'click .button-unstar' : 'clickButtonUnstar',
                'click .button-load-extention' : 'clickButtonLoadExtention',
                'click .button-reset' : 'clickButtonReset'
            }
        });

        var doramenonToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!doramenonToolbarView) {
                    doramenonToolbarView = new DoramenonToolbarView();
                }
                return doramenonToolbarView;
            }
        });

        return factory;
    });
}(this));
