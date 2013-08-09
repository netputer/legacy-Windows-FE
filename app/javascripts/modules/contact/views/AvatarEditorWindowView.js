/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/ClipImage',
        'Internationalization',
        'contact/collections/ContactsCollection'
    ], function (
        $,
        Backbone,
        _,
        doT,
        Panel,
        TemplateFactory,
        ClipImage,
        i18n,
        ContactsCollection
    ) {
        console.log('AvatarEditorWindowView - File loaded. ');

        var contactsCollection = ContactsCollection.getInstance();

        var AvatarEditorWindowView = Panel.extend({
            initialize : function () {
                AvatarEditorWindowView.__super__.initialize.apply(this, arguments);

                var clipImage;
                Object.defineProperties(this, {
                    clipImage : {
                        get : function () {
                            return clipImage;
                        },
                        set : function (value) {
                            clipImage = value;
                        }
                    }
                });

                this.once('show', function () {

                    if (this.options.selectPhoto) {
                        this.listenTo(this.options.selectPhoto, 'change:orientation', function () {
                            this.clipImage.remove();
                            this.options.selectPhoto.getOriginalPicAsync().done(this.createClipImage.bind(this));
                        });

                        this.options.selectPhoto.getOriginalPicAsync().done(this.createClipImage.bind(this));

                        this.once('remove', function () {
                            this.options.selectPhoto.set('selected', false);
                            this.clipImage.remove();
                        });
                    } else {

                        this.createClipImage(this.options.selectPhotoPath);
                        this.once('remove', this.clipImage.remove, this);
                    }
                });

                this.buttons = [{
                    $button : $('<button>').html(i18n.misc.SAVE).addClass('button-save primary')

                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel')
                }];

                this.$reSelectBtn = $('<button>').html(i18n.misc.RESELECT_FILE_TEXT).addClass('button-reselect-file').addClass('primary');
            },
            createClipImage : function (source) {

                var path;
                var orientation;

                if (typeof source === 'string') {
                    path  = source;
                    orientation = 0;
                } else {
                    path = this.options.selectPhoto.get('originalPic');
                    orientation = this.options.selectPhoto.get('orientation');
                }
                this.clipImage = new ClipImage({
                    path : path,
                    imageOrientation : orientation
                });

                this.$('.w-ui-window-body').append(this.clipImage.render().$el);
            },
            render : function () {

                _.extend(this.events, AvatarEditorWindowView.__super__.events);
                this.delegateEvents();
                AvatarEditorWindowView.__super__.render.apply(this, arguments);

                this.$('.w-ui-window-footer-monitor').append(this.$reSelectBtn);
                return this;
            },
            clickButtonSave : function () {
                var data = this.clipImage.clip();
                var path = this.options.selectPhotoPath || this.options.selectPhoto.get('originalPic');

                path = path.replace('file:///', '');
                contactsCollection.editorAvatarAsync({
                    'rect' : [data.left, data.top, data.width, data.height].join(';'),
                    'dst_size' : this.options.detialView.getAvatarSize(),
                    'path' : path,
                    'degree' : this.options.selectPhotoPath ? 0 : this.options.selectPhoto.get('orientation')
                }).done(function (resp) {
                    this.options.detialView.refreshAvatar(resp.body.value);
                    this.remove();
                    this.options.editorView.remove();
                }.bind(this));
            },
            clickButtonReselect : function () {
                this.remove();
                this.options.editorView.show();
            },
            clickButtonCancel : function () {
                this.remove();
                this.options.editorView.remove();
            },
            events : {
                'click .button-save' : 'clickButtonSave',
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-reselect-file' : 'clickButtonReselect'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AvatarEditorWindowView(_.extend({
                    title : i18n.contact.EDIT_CONTACT_HEAD,
                    height : 510,
                    width : 660
                }, args));
            }
        });

        return factory;
    });
}(this));
