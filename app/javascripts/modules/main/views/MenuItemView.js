/*global define*/
(function (window) {
    define([
        'doT',
        'backbone',
        'underscore',
        'FunctionSwitch',
        'ui/PopupTip',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Internationalization',
        'Log',
        'Device',
        'main/collections/PIMCollection',
        'app/collections/AppsCollection'
    ], function (
        doT,
        Backbone,
        _,
        FunctionSwitch,
        PopupTip,
        TemplateFactory,
        StringUtil,
        i18n,
        log,
        Device,
        PIMCollection,
        AppsCollection
    ) {
        console.log('MenuItemView - File loaded. ');

        var pimCollection = PIMCollection.getInstance();

        var MenuItemView = Backbone.View.extend({
            tagName : 'li',
            className : 'title hbox',
            template : doT.template(TemplateFactory.get('misc', 'menu-item')),
            initialize : function () {
                var children = [];
                Object.defineProperties(this, {
                    children :　{
                        set : function (value) {
                            if (value instanceof Array) {
                                children = value;
                            }
                        },
                        get : function () {
                            return children;
                        }
                    }
                });

                this.model.on('change:selected', function (model, selected) {
                    this.$el.toggleClass('selected', selected);
                    if (selected) {
                        pimCollection.each(function (item) {
                            if (item.id !== model.id) {
                                item.set({
                                    selected : false
                                });
                            }
                        });
                    }
                }, this);

                this.model.on('change:hide', function (model, hide) {
                    this.$el.toggle(!hide);
                }, this);

                this.model.on('change:count', function (model, count) {
                    this.$('.count').html(count);

                    var $count = this.$('.count');
                    // Hack for display count of updatable apps
                    if (this.model.id === 3) {
                        $count.toggle(count > 0);
                        $count.data('title', StringUtil.format(i18n.app.UPDATE_DES, count));
                    }

                    if (this.model.id === 2) {
                        $count.toggle(count > 0);
                        $count.data('title', StringUtil.format(i18n.message.UNREAD_DES, count));
                    }
                }, this);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                if (this.model.get('hide')) {
                    this.$el.hide();
                }

                if (this.model.id === 3 || this.model.id === 2) {
                    var $count = this.$('.count');
                    $count.addClass('highlight');
                    if (this.model.get('count') > 0) {
                        $count.show();
                    } else {
                        $count.hide();
                    }
                }

                var tip = new PopupTip({
                    $host : this.$('[data-title]')
                });
                tip.zero();

                return this;
            },
            clickItem : function () {
                if (!this.model.get('selected')) {
                    this.model.set({
                        selected : true
                    });

                    if (FunctionSwitch.PRIVACY.RECORD_BROWSE_HISTORY) {
                        log({
                            'event' : 'ui.click.nav',
                            'id' : this.model.id,
                            'label' : this.model.get('label'),
                            'isFastADB' : Device.get('isFastADB')
                        });
                    }
                }

                Backbone.trigger('switchModule', {
                    module : this.model.get('module'),
                    tab : this.model.get('tab')
                });
            },
            clickTitleCount : function (evt) {
                var data = {};

                evt.stopPropagation();

                this.model.set({
                    selected : true
                });

                if (this.model.id === 3) {
                    data = {
                        module : 'app',
                        tab : 'update'
                    };
                } else {
                    data = {
                        module : 'message',
                        tab : 'all'
                    };
                }

                Backbone.trigger('switchModule', data);
            },
            events : {
                'click' : 'clickItem',
                'click .count' : 'clickTitleCount'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MenuItemView(args);
            }
        });

        return factory;
    });
}(this));
