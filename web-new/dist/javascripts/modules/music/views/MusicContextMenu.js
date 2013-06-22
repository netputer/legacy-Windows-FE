/*global define, _, $*/
(function (window, undefined) {
    define([
        'ui/Menu',
        'ui/behavior/ClickToHideMixin',
        'ui/AlertWindow',
        'Internationalization',
        'Device',
        'Log',
        'music/collections/MusicsCollection',
        'music/MusicService'
    ], function (
        Menu,
        ClickToHideMixin,
        AlertWindow,
        i18n,
        Device,
        log,
        MusicsCollection,
        MusicService
    ) {
        console.log('MusicContextMenu - File loaded. ');

        var musicsCollection;

        var MusicContextMenu = Menu.extend({
            initialize : function () {
                MusicContextMenu.__super__.initialize.apply(this, arguments);
                ClickToHideMixin.mixin(this);

                musicsCollection = MusicsCollection.getInstance();

                this.addItems();

                this.on('select', function (data) {
                    switch (data.value) {
                    case 'delete':
                        this.deleteMusics();
                        break;
                    case 'export':
                        this.exportMusics();
                        break;
                    }
                }, this);
            },
            deleteMusics : function () {
                MusicService.deleteMusicsAsync(this.options.selected);

                log({
                    'event' : 'ui.click.music.button.delete',
                    'count' : this.options.selected.length,
                    'source' : 'context-menu'
                });
            },
            exportMusics : function () {
                MusicService.exportMusicsAsync(this.options.selected);

                log({
                    'event' : 'ui.click.music.button.export',
                    'count' : this.options.selected.length,
                    'source' : 'context-menu'
                });
            },
            addItems : function () {
                var selected = this.options.selected;

                this.items = [{
                    type : 'normal',
                    name : 'delete',
                    value : 'delete',
                    label : i18n.misc.DELETE,
                    disabled : selected.length === 0 ||
                                !Device.get('isConnected')
                }, {
                    type : 'hr'
                }, {
                    type : 'normal',
                    name : 'export',
                    value : 'export',
                    label : i18n.misc.EXPORT,
                    disabled : !Device.get('isConnected') ||
                                !Device.get('hasSDCard')
                }];
            }
        });

        var musicContextMenu;

        var factory = _.extend({
            getInstance : function (args) {
                if (!musicContextMenu) {
                    musicContextMenu = new MusicContextMenu(args);
                } else {
                    musicContextMenu.options.selected = args.selected;
                    musicContextMenu.addItems();
                    musicContextMenu.render();
                }
                return musicContextMenu;
            }
        });

        return factory;
    });
}(this));