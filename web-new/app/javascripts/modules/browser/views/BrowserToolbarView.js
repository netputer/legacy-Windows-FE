/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'doT',
        'jquery',
        'ui/Toolbar',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/Panel',
        'Account',
        'FunctionSwitch',
        'Log',
        'IOBackendDevice',
        'Internationalization',
        'Configuration',
        'browser/views/BrowserMenuView',
        'doraemon/collections/ExtensionsCollection',
        'doraemon/views/ReportWindowView',
        'social/SocialService',
        'utilities/StringUtil'
    ], function (
        _,
        doT,
        $,
        Toolbar,
        TemplateFactory,
        AlertWindow,
        Panel,
        Account,
        FunctionSwitch,
        log,
        IO,
        i18n,
        CONFIG,
        BrowserMenuView,
        ExtensionsCollection,
        ReportWindowView,
        SocialService,
        StringUtil
    ) {
        console.log('BrowserToolbarView - File loaded.');

        var alert = window.alert;
        var setTimeout = window.setTimeout;
        var history = window.history;

        var extensionsCollection;

        var BrowserToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'browser-toolbar')),
            initialize : function () {
                var $iframe;
                var frameId;
                var frameBranch;
                Object.defineProperties(this, {
                    $iframe : {
                        set : function (value) {
                            $iframe = value;
                            frameId = $iframe.attr('id');
                            frameBranch = $iframe.attr('branch');
                        },
                        get : function () {
                            return $iframe;
                        }
                    },
                    frameId : {
                        get : function () {
                            return frameId;
                        }
                    },
                    frameBranch : {
                        get : function () {
                            return frameBranch;
                        }
                    }
                });

                extensionsCollection = ExtensionsCollection.getInstance();

                this.listenTo(extensionsCollection, 'refresh add remove', _.debounce(this.setButtonState));
                this.listenTo(FunctionSwitch, 'change', this.setButtonState);
                this.listenTo(this.model, 'change:extension', this.render);

                if (this.options.hasOwnProperty('$iframe')) {
                    this.$iframe = this.options.$iframe;
                }


                this.historyChangeHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.HISTORY_CHANGED
                }, function (data) {
                    if (data.frame_id === this.$iframe[0].id) {
                        this.setButtonState();
                    }
                }, this);
            },
            remove : function () {
                IO.Backend.Device.offmessage(this.historyChangeHandler);
                this.menuView.remove();
                BrowserToolbarView.__super__.remove.call(this);
            },
            setButtonState : function () {
                this.$('.button-back').prop({
                    disabled : history.backCount(this.frameId, this.frameBranch) === 0
                });

                this.$('.button-forward').prop({
                    disabled : history.forwardCount(this.frameId, this.frameBranch) === 0
                });

                var $buttonStar = this.$('.button-star');
                var $buttonShare = this.$('.button-share');
                if (FunctionSwitch.ENABLE_DORAEMON) {
                    $buttonStar.prop({
                        disabled : this.model.get('dev_mode') === true
                    });

                    var isStarred = !!extensionsCollection.get(this.model.id);
                    $('.star', $buttonStar).toggleClass('starred', isStarred);

                    $buttonStar.prop({
                        disabled : this.model.get('dev_mode') === true
                    });
                } else {
                    $buttonStar.remove();
                    $buttonShare.remove();
                }

                if (!!extensionsCollection.get(this.model.id)) {
                    $buttonStar.attr({
                        title : i18n.misc.REMOVE_COLLECT
                    });
                } else {
                    $buttonStar.attr({
                        title : i18n.misc.ADD_TO_COLLECT
                    });
                }

                this.$('.button-report').prop({
                    disabled : this.model.get('dev_mode') === true
                });

                this.$('.developer-wrap').toggle(FunctionSwitch.PRIVACY.ENABLE_DEBUG &&
                                                    this.model.get('dev_mode') === true);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.menuView = BrowserMenuView.getInstance({
                    model : this.model,
                    $iframe : this.$iframe
                });

                this.$el.append(this.menuView.render().$el);

                this.listenTo(this.menuView, 'select', function (url) {
                    this.$iframe[0].src = url;
                });

                this.$('.developer-wrap').hide();

                setTimeout(this.setButtonState.bind(this), 0);

                return this;
            },
            refreshBrowser : function () {
                var iframe = this.$iframe[0];
                iframe.reload(iframe.contentDocument.location.href);
            },
            clickButtonRefresh : function () {
                this.refreshBrowser();
            },
            clickButtonBack : function () {
                history.back2(this.frameId, this.frameBranch);
            },
            clickButtonForward : function () {
                history.forward2(this.frameId, this.frameBranch);
            },
            clickButtonStar : function () {
                if (!Account.get('isLogin')) {
                    Account.loginAsync(i18n.misc.LOGIN_TO_STAR, 'star-button-on-toolbar');
                } else {
                    if (extensionsCollection.get(this.model.id)) {
                        this.model.unstarredAsync();

                        log({
                            'event' : 'ui.click.dora.toolbar.button.unstar',
                            id : this.model.id
                        });
                    } else {
                        this.model.starAsync().done(function () {
                            extensionsCollection.add(this.model);
                            extensionsCollection.trigger('star', this.model);
                            this.clickButtonShare();
                        }.bind(this));

                        log({
                            'event' : 'ui.click.dora.toolbar.button.star',
                            id : this.model.id
                        });
                    }
                }
            },
            clickButtonShare : function () {
                var data = {
                    textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_URL, CONFIG.enums.SOCIAL_DORAEMON_EXTENSION, this.model.id),
                    hasPreview : false,
                    shareData : {
                        need_shell : 0,
                        rotation : 0
                    },
                    extraData : {
                        extension_id : this.model.id,
                        extension_title : this.model.get('name')
                    },
                    type : CONFIG.enums.SOCIAL_DORAEMON_EXTENSION
                };

                SocialService.setContent(data);
                SocialService.show();
            },
            clickButtonReport : function () {
                var reportWindowView = ReportWindowView.getInstance({
                    model : this.model,
                    currentURL : this.$iframe[0].contentDocument.location.href
                });

                reportWindowView.show();
            },
            clickButtonReload : function () {
                this.model.downloadAsync().done(function (resp) {
                    var newExtension = JSON.parse(resp.body.value);
                    var extension = extensionsCollection.get(newExtension.id);
                    extension.set(newExtension);
                    this.refreshBrowser();
                }.bind(this)).fail(function (resp) {
                    alert(resp.state_line);
                });
            },
            events : {
                'click .button-refresh' : 'clickButtonRefresh',
                'click .button-back' : 'clickButtonBack',
                'click .button-forward' : 'clickButtonForward',
                'click .button-star' : 'clickButtonStar',
                'click .button-share' : 'clickButtonShare',
                'click .button-report' : 'clickButtonReport',
                'click .button-reload' : 'clickButtonReload'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BrowserToolbarView(args);
            }
        });

        return factory;
    });
}(this));
