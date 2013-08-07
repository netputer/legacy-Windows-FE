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
        'contact/views/AvatarGalleryView',
        'contact/views/AvatarEditorWindowView',
        'photo/collections/PhotoCollection'
    ], function (
        Backbone,
        _,
        doT,
        Panel,
        TemplateFactory,
        AlertWindow,
        i18n,
        AvatarGalleryView,
        AvatarEditorWindowView,
        PhotoCollection
    ) {
        console.log('AvatarEditorView - File loaded. ');

        var confirm = window.confirm;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'avatar-editor')),
            className : 'w-contact-avatar-editor vbox',
            render : function () {
                this.$el.html(this.template({}));

                this.listView = AvatarGalleryView.getInstance({
                    detialView : this.options.detialView,
                    editorView : this.options.editorView
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
            clickButtonSelectFromPC : function () {
                PhotoCollection.getInstance().getPhotoFromPcAsync(0).done(function (resp) {

                    AvatarEditorWindowView.getInstance({
                        detialView : this.options.detialView,
                        editorView : this.options.editorView,
                        selectPhotoPath : 'file:///' + resp.body.value
                    }).show();
                }.bind(this));
            },
            events : {
                'click .button-delete' : 'clickButtonDelete',
                'click .button-select-from-pc' : 'clickButtonSelectFromPC'
            }
        });

        var AvatarEditorView = Panel.extend({
            initialize : function () {
                AvatarEditorView.__super__.initialize.apply(this, arguments);
                this.once('show', function () {
                    var bodyView = new BodyView({
                        detialView : this.options.detialView,
                        editorView : this
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
                    height : 510,
                    width : 660
                }, args));
            }
        });

        return factory;
    });
}(this));
