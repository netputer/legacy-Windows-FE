/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/SmartList',
        'doraemon/collections/ExtensionsCollection',
        'doraemon/views/ExtensionItemView',
        'doraemon/views/DoraemonContextMenu'
    ], function (
        Backbone,
        _,
        doT,
        i18n,
        TemplateFactory,
        SmartList,
        ExtensionsCollection,
        ExtensionItemView,
        DoraemonContextMenu
    ) {
        console.log('ExtensionListView - File loaded.');

        var extensionList;
        var extensionsCollection;

        var ExtensionListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'extension-list')),
            className : 'w-extension-list-ctn vbox',
            initialize : function () {
                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return (extensionList && extensionList.selected) || [];
                        }
                    }
                });

                extensionsCollection = ExtensionsCollection.getInstance();

                extensionsCollection.on('refresh', this.buildList, this);
                extensionsCollection.on('add', this.buildList, this);
                extensionsCollection.on('remove', this.buildList, this);
                extensionsCollection.on('itemUpdate', this.buildList, this);
            },
            buildList : function () {
                if (!extensionList) {
                    extensionList = new SmartList({
                        itemView : ExtensionItemView.getClass(),
                        dataSet : [{
                            name : 'default',
                            getter : extensionsCollection.getAll
                        }],
                        keepSelect : false,
                        $observer : this.options.$observer,
                        itemHeight : 45,
                        enableContextMenu : true,
                        listenToCollection : extensionsCollection
                    });

                    this.$el.append(extensionList.render().$el);

                    extensionList.on('select:change', function (selected) {
                        this.trigger('select:change', selected);
                    }, this);

                    extensionList.on('switchSet', function () {
                        if (extensionList.currentModels.length === 0) {
                            extensionList.emptyTip = i18n.misc.GALLERY_EMPTY_LIST;
                            extensionList.toggleEmptyTip(true);
                        } else {
                            extensionList.toggleEmptyTip(false);
                        }
                    });

                    extensionList.on('contextMenu', this.showContextMenu, this);

                } else {
                    extensionList.switchSet('default', extensionsCollection.getAll);
                }
            },
            showContextMenu : function () {
                var menu = DoraemonContextMenu.getInstance({
                    selected : extensionList.selected
                });

                menu.show();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.buildList();

                return this;
            }
        });

        var extensionListView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!extensionListView) {
                    extensionListView = new ExtensionListView(args);
                }
                return extensionListView;
            }
        });

        return factory;
    });
}(this));
