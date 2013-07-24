/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Internationalization',
        'contact/views/AvatarGalleryView'
    ], function (
        Backbone,
        _,
        doT,
        Panel,
        TemplateFactory,
        AlertWindow,
        i18n,
        AvatarGalleryView
    ) {
        console.log('AvatarEditorView - File loaded. ');

        var confirm = window.confirm;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'avatar-editor')),
            className : 'w-contact-avatar-editor vbox',
            render : function () {
                this.$el.html(this.template({}));

                this.listView = AvatarGalleryView.getInstance({
                    parentView : this.options.parentView
                });
                this.$el.append(this.listView.render().$el);
                return this;
            },
            remove : function () {
                this.listView.remove();
                BodyView.__super__.remove.call(this);
            },
            clickButtonDelete : function () {
                confirm(i18n.contact.ALERT_DEL_CONTACT_HEAD, function () {
                    this.options.parentView.refreshAvatar('');
                    this.trigger('remove');
                }, this);
            },
            events : {
                'click .button-delete' : 'clickButtonDelete'
            }
        });

        var AvatarEditorView = Panel.extend({
            initialize : function () {
                AvatarEditorView.__super__.initialize.apply(this, arguments);
                this.once('show', function () {
                    var bodyView = new BodyView({
                        parentView : this.options.parentView
                    });
                    this.$bodyContent = bodyView.render().$el;
                    this.listenToOnce(bodyView, 'remove', this.remove);

                    this.$('.w-ui-window-footer-monitor').html(i18n.contact.ALERT_PIC_FORMAT_TIP);

                    this.once('remove', bodyView.remove, bodyView);
                }, this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AvatarEditorView(_.extend({
                    title : i18n.contact.EDIT_CONTACT_HEAD,
                    height : 465,
                    width : 660
                }, args));
            }
        });

        return factory;
    });
}(this));
