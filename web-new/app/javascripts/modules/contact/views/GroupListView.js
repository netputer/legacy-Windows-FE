/*global console, define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'ui/TemplateFactory',
        'ui/behavior/BlurToHideMixin',
        'ui/WindowState',
        'contact/collections/AccountCollection'
    ], function (
        Backbone,
        doT,
        $,
        _,
        TemplateFactory,
        BlurToHideMixin,
        WindowState,
        AccountCollection
    ) {
        console.log('GroupListView - File loaded. ');

        var GroupListView = Backbone.View.extend({
            className : 'w-contact-group-list',
            template : doT.template(TemplateFactory.get('contact', 'group-list')),
            initialize : function () {
                BlurToHideMixin.mixin(this);
            },
            render : function () {
                this.$el.html(this.template({
                    group : this.model.get('group')
                }));

                $('body').append(this.$el);

                this.locate();

                return this;
            },
            getGroup : function (id) {
                return AccountCollection.getInstance().getGroupById(id);
            },
            show : function () {
                this.$el.addClass('w-layout-hide');

                this.render();

                this.$el.removeClass('w-layout-hide');
            },
            locate : function () {
                var hostOffset = this.$host.offset();

                var hostOffsetHeight = this.$host[0].offsetHeight;
                var thisOffsetHeight = this.$el[0].offsetHeight;

                if (hostOffset.top + hostOffsetHeight + thisOffsetHeight > WindowState.height) {
                    var calculatedTop = hostOffset.top - thisOffsetHeight;
                    this.$el.offset({
                        left : hostOffset.left - 6,
                        top : calculatedTop + 25
                    });
                } else {
                    this.$el.offset({
                        left : hostOffset.left - 6,
                        top : hostOffset.top + 8
                    });
                }
            },
            hide : function () {
                this.remove();
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new GroupListView(args);
            }
        });

        return factory;
    });
}(this));
