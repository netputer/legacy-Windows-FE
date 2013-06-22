/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/MenuButton',
        'ui/Panel',
        'ui/BaseListItem',
        'utilities/StringUtil',
        'Internationalization',
        'Device',
        'Configuration',
        'music/MusicService',
        'social/SocialService',
        'FunctionSwitch'
    ], function (
        _,
        doT,
        $,
        TemplateFactory,
        MenuButton,
        Panel,
        BaseListItem,
        StringUtil,
        i18n,
        Device,
        CONFIG,
        MusicService,
        SocialService,
        FunctionSwitch
    ) {
        console.log('MusicItemView - File loaded. ');

        var MusicItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('music', 'music-item')),
            className : 'w-music-list-item hbox',
            initialize : function () {
                MusicItemView.__super__.initialize.apply(this, arguments);

                this.listenTo(Device, 'change:isConnected', function () {
                    this.$('.play').toggleClass('disabled', !Device.get('isConnected'));
                });

                this.listenTo(this.model.collection, 'refresh', this.render);
            },
            remove : function () {
                if (this.settingButton) {
                    this.settingButton.remove();
                    delete this.settingButton;
                }
                MusicItemView.__super__.remove.call(this);
            },
            render : function () {
                this.$el.html(this.template(_.extend(this.model.toJSON(), {
                    collection : this.model.collection
                })));

                if (this.model.collection.settings) {
                    this.renderRingSettingButton();
                }

                this.$('.play').toggleClass('disabled', !Device.get('isConnected'));

                return this;
            },
            renderRingSettingButton : function () {
                if (this.settingButton) {
                    this.settingButton.remove();
                    delete this.settingButton;
                }
                var collection = this.model.collection;
                var settingButton = new MenuButton({
                    label : i18n.music.SETTING_RING_TEXT,
                    items : [{
                        type : 'checkbox',
                        label : i18n.music.SETTING_ITEM_CALL_RING_TEXT,
                        value : 0,
                        name : 'ring-setting',
                        checked : collection.settings.ringtone === this.model.id
                    }, {
                        type : 'checkbox',
                        label : i18n.music.SETTING_ITEM_NOTIFY_RING_TEXT,
                        value : 1,
                        name : 'ring-setting',
                        checked : collection.settings.notification === this.model.id
                    }, {
                        type : 'checkbox',
                        label : i18n.music.SETTING_ALARM_RING_TEXT,
                        value : 2,
                        name : 'ring-setting',
                        checked : collection.settings.alarm === this.model.id
                    }]
                });

                settingButton.render().$el.addClass('w-icon-btn hbox min').prepend($('<span>').addClass('icon ring'));

                settingButton.on('select', function (data) {
                    var type = parseInt(data.value, 10);

                    var actionCall;
                    var context = this.model.collection;

                    switch (type) {
                    case 0:
                        if (this.model.id === collection.settings.ringtone) {
                            actionCall = collection.resetRingAsync;
                        }
                        break;
                    case 1:
                        if (this.model.id === collection.settings.notification) {
                            actionCall = this.model.collection.resetRingAsync;
                        }
                        break;
                    case 2:
                        if (this.model.id === collection.settings.alarm) {
                            actionCall = this.model.collection.resetRingAsync;
                        }
                        break;
                    }

                    if (actionCall === undefined) {
                        actionCall = this.model.setRingAsync;
                        context = this.model;
                    }

                    actionCall.call(context, type).done(function () {
                        if (actionCall === this.model.setRingAsync && FunctionSwitch.ENABLE_SHARE_SET_RINGTONE) {
                            var panel = new Panel({
                                disposableName : 'social.set_ringtone.not_hint',
                                disposableChecked : false,
                                $bodyContent : i18n.music.SHARE_SET_RINGTONE,
                                title : i18n.common.DIALOG_TIP,
                                buttonSet : 'yes_cancel',
                                height : 160
                            });

                            var size = parseInt(this.model.get('size'), 10);
                            var contentType = size >= 2 * 1024 * 1024 ? CONFIG.enums.SOCIAL_SET_MUSIC_AS_RINGTONE : CONFIG.enums.SOCIAL_SET_RINGTONE;
                            var data = {
                                textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_POST_URL, contentType),
                                textData : {
                                    content : JSON.stringify({
                                        title : this.model.get('title'),
                                        artist : this.model.get('artist')
                                    })
                                },
                                hasPreview : false,
                                shareData : {
                                    need_shell : 0,
                                    rotation : 0
                                },
                                extraData : {
                                    ringtone_id : this.model.id,
                                    ringtone_title : this.model.get('title'),
                                    ringtone_artist : this.model.get('artist')
                                },
                                type : contentType
                            };

                            panel.on('button_yes', function () {
                                SocialService.setContent(data);
                                SocialService.show();
                            }).on('button_cancel', function () {
                                panel.saveSetting();
                            });

                            if (!panel.getSetting()) {
                                panel.show();
                            }
                        }
                        collection.trigger('refresh', collection);
                    }.bind(this));
                }, this);

                settingButton.$el.prop({
                    disabled : !Device.get('isConnected') ||
                                !Device.get('hasSDCard') ||
                                Device.get('isMounted')
                });

                settingButton.listenTo(Device, 'change', function () {
                    settingButton.$el.prop({
                        disabled : !Device.get('isConnected') ||
                                    !Device.get('hasSDCard') ||
                                    Device.get('isMounted')
                    });
                });

                this.$('.type').prepend(settingButton.$el);
                this.settingButton = settingButton;
            },
            clickButtonPlay : function () {
                MusicService.stopAsync().done(function () {
                    MusicService.playAsync(this.model.id);
                }.bind(this));
            },
            clickButtonStop : function () {
                MusicService.stopAsync();
            },
            dblclickItem : function () {
                if (Device.get('isConnected')) {
                    MusicService.stopAsync().done(function () {
                        MusicService.playAsync(this.model.id);
                    }.bind(this));
                }
            },
            events : {
                'click .button-play' : 'clickButtonPlay',
                'click .button-stop' : 'clickButtonStop',
                'dblclick' : 'dblclickItem'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MusicItemView(args);
            },
            getClass : function () {
                return MusicItemView;
            }
        });

        return factory;
    });
}(this));
