/*global define, _, $*/
(function (window, undefined) {
    define([
        'ui/Menu',
        'ui/behavior/ClickToHideMixin',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'Internationalization',
        'Configuration',
        'Account',
        'Log',
        'doraemon/collections/ExtensionsCollection'
    ], function (
        Menu,
        ClickToHideMixin,
        AlertWindow,
        StringUtil,
        i18n,
        CONFIG,
        Account,
        log,
        ExtensionsCollection
    ) {
        console.log('DoraemonContextMenu - File loaded. ');

        var extensionsCollection;

        var DoraemonContextMenu = Menu.extend({
            initialize : function () {
                DoraemonContextMenu.__super__.initialize.apply(this, arguments);
                ClickToHideMixin.mixin(this);

                extensionsCollection = ExtensionsCollection.getInstance();

                this.addItems();

                this.on('select', function (data) {
                    switch (data.value) {
                    case 'up':
                        this.moveUpExtension();
                        break;
                    case 'down':
                        this.moveDownExtension();
                        break;
                    case 'delete':
                        this.unstarExtension();
                        break;
                    }
                }, this);
            },
            moveUpExtension : function () {
                extensionsCollection.get(this.options.selected[0]).setOrderAsync(-1);
                log({
                    'event' : 'ui.click.dora.up.button',
                    'source' : 'context-menu'
                });
            },
            moveDownExtension : function () {
                extensionsCollection.get(this.options.selected[0]).setOrderAsync(1);
                log({
                    'event' : 'ui.click.dora.down.button',
                    'source' : 'context-menu'
                });
            },
            unstarExtension : function () {
                var ids = this.options.selected;

                var disposableAlert = new AlertWindow({
                    draggable : true,
                    disposableName : 'batch-unstar-plugin',
                    disposableChecked : false,
                    buttonSet : 'yes_no',
                    $bodyContent : $(StringUtil.format(i18n.misc.BATCH_UNSTAR_PLUGINS, ids.length))
                });

                disposableAlert.on('button_yes', function () {
                    extensionsCollection.unstarredAsync(ids).done(function () {
                        extensionsCollection.remove(ids);
                    });
                }, this);

                disposableAlert.show();

                log({
                    'event' : 'ui.click.dora.unstar.button',
                    'total' : extensionsCollection.length,
                    'count' : ids.length,
                    'source' : 'context-menu'
                });
            },
            addItems : function () {
                var selected = this.options.selected;
                var normalPlugins = extensionsCollection.getNormalPlugins();

                this.items = [
                    {
                        type : 'normal',
                        name : 'up',
                        value : 'up',
                        label : i18n.misc.MOVE_UP,
                        disabled : selected.length !== 1 ||
                                    extensionsCollection.at(0).id === selected[0] ||
                                    !Account.get('isLogin') ||
                                    extensionsCollection.get(selected[0]).get('dev_mode') === true
                    }, {
                        type : 'normal',
                        name : 'down',
                        value : 'down',
                        label : i18n.misc.MOVE_DOWN,
                        disabled : selected.length !== 1 ||
                                    (normalPlugins.length > 0 && normalPlugins[normalPlugins.length - 1].id === selected[0]) ||
                                    !Account.get('isLogin') ||
                                    extensionsCollection.get(selected[0]).get('dev_mode') === true
                    }, {
                        type : 'hr'
                    }, {
                        type : 'normal',
                        name : 'delete',
                        value : 'delete',
                        label : i18n.misc.REMOVE_COLLECT,
                        disabled : selected.length === 0 ||
                                    !Account.get('isLogin')
                    }
                ];
            }
        });

        var doraemonContextMenu;

        var factory = _.extend({
            getInstance : function (args) {
                if (!doraemonContextMenu) {
                    doraemonContextMenu = new DoraemonContextMenu(args);
                } else {
                    doraemonContextMenu.options.selected = args.selected;
                    doraemonContextMenu.addItems();
                    doraemonContextMenu.render();
                }
                return doraemonContextMenu;
            }
        });

        return factory;
    });
}(this));
