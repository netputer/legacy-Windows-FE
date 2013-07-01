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
        PIMCollection,
        AppsCollection
    ) {
        console.log('MenuItemView - File loaded. ');

        var pimCollection = PIMCollection.getInstance();

        var MenuItemView = Backbone.View.extend({
            tagName : 'li',
            className : 'root',
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

                        var tab;
                        if (model.id === 3) {
                            if (AppsCollection.getInstance().getUpdatableApps().length > 0) {
                                tab = 'update';
                            } else {
                                tab = 'normal';
                            }
                        } else {
                            tab = model.get('tab');
                        }

                        Backbone.trigger('switchModule', {
                            module : model.get('module'),
                            tab : tab
                        });
                    }
                }, this);

                this.model.on('change:hide', function (model, hide) {
                    this.$el.toggle(!hide);
                }, this);

                this.model.on('change:count', function (model, count) {
                    this.$('.title .count').html(count);

                    var $count = this.$('.title .count');
                    // Hack for display count of updatable apps
                    if (this.model.id === 3) {
                        $count.toggle(count > 0);
                        $count.data('title', StringUtil.format(i18n.app.UPDATE_DES, count));
                    }
                }, this);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                if (this.model.get('hide')) {
                    this.$el.hide();
                }

                // Hack for display count of updatable apps
                if (this.model.id === 3) {
                    var $count = this.$('.title .count');
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


                return this;
            },
            clickRootItem : function () {
                if (!this.model.get('selected')) {
                    this.model.set({
                        selected : true
                    });

                    if (FunctionSwitch.PRIVACY.RECORD_BROWSE_HISTORY) {
                        log({
                            'event' : 'ui.click.nav',
                            'id' : this.model.id,
                            'label' : this.model.get('label')
                        });
                    }
                } else {
                    Backbone.trigger('switchModule', {
                        module : this.model.get('module'),
                        tab : this.model.get('tab')
                    });
                }
            },
            clickTitleCount : function (evt) {
                if (this.model.id === 3) {
                    evt.stopPropagation();

                    this.model.set({
                        selected : true
                    });

                    Backbone.trigger('switchModule', {
                        module : 'app',
                        tab : 'update'
                    });
                }
            },
            events : {
                'click .title' : 'clickRootItem',
                'click .title .count' : 'clickTitleCount'
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
