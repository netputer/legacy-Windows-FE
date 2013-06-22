/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/Panel',
        'ui/TemplateFactory',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        Panel,
        TemplateFactory,
        i18n
    ) {
        console.log('AvatarEditorWindowView - File loaded. ');

        var BodyView = Backbone.View.extend({
            render : function () {
                return this;
            }
        });

        var AvatarEditorWindowView = Panel.extend({
            initialize : function () {
                AvatarEditorWindowView.__super__.initialize.apply(this, arguments);
                this.once('show', function () {
                    var bodyView = new BodyView({
                        parentView : this.options.parentView
                    });
                    this.$bodyContent = bodyView.render().$el;

                    this.once('remove', bodyView.remove, bodyView);
                }, this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AvatarEditorWindowView(_.extend({
                    title : i18n.contact.EDIT_CONTACT_HEAD,
                    height : 465,
                    width : 660
                }, args));
            }
        });

        return factory;
    });
}(this));
