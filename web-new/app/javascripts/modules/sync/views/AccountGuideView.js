/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'social/views/SocialPlatformSelectorView',
        'sync/SyncService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        SocialPlatformSelectorView,
        SyncService
    ) {
        console.log('AccountGuideView - File loaded. ');

        // --------------------------------- body view ----------------------------------

        var headerTemplateList = ['cloud-backup', 'cloud-photo', 'social-platform'];
        var contentTemplateList = ['account-guide-content-backup', 'account-guide-content-photo', 'account-guide-content-social'];
        var iconMarginList = [35, 204, 372];
        var handler = [SyncService.setPhotoSyncSwitchAsync, SyncService.setRemoteAutoBackupSwitchAsync];

        var AccountGuideBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('sync', 'account-guide-body')),
            className : 'w-sync-account-guide-body',
            currentPage : 0,
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));

                this.$('.guide-header').html(doT.template(TemplateFactory.get('sync', 'account-guide-header')));
                this.$('.guide-content').html(doT.template(TemplateFactory.get('sync', contentTemplateList[this.currentPage])));

                this.$('.icon').removeClass('step-on').addClass('step-off');
                this.$('.icon-' + headerTemplateList[this.currentPage]).addClass('step-on').removeClass('step-off');

                this.$('.guide-split .icon').css('margin-left', iconMarginList[this.currentPage]);

                // social
                var $social = this.$('.social-ctn');
                if ($social.length > 0) {
                    $social.html(SocialPlatformSelectorView.getInstance(true).render().$el);
                }

                return this;
            },
            resetPageIndex : function () {
                this.currentPage = 0;
            },
            isFirstPage : function () {
                return this.currentPage === 0;
            },
            isLastPage : function () {
                return this.currentPage === contentTemplateList.length - 1;
            },
            showNextPage : function () {
                if (this.isLastPage()) {
                    return;
                }

                this.currentPage++;
                this.render();
            },
            showLastPage : function () {
                if (this.isFirstPage()) {
                    return;
                }

                this.currentPage--;
                this.render();
            },
            saveCurrentOption : function () {
                var option = this.$('.guide-option input[type="checkbox"]').prop('checked');
                var currentHandler = handler[this.currentPage];
                if (option !== undefined && currentHandler !== undefined) {
                    currentHandler(option);
                }
            }
        });

        // ------------------------------ account guide view ----------------------------

        var bodyView;

        var AccountGuideView = Panel.extend({
            initialize : function () {
                AccountGuideView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new AccountGuideBodyView();
                    this.$bodyContent = bodyView.render().$el;

                    bodyView.resetPageIndex();
                    this.refreshButtonState();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.FINISH).addClass('button-finish primary'),
                    eventName : 'button_finish'
                }];
            },
            render : function () {
                _.extend(this.events, AccountGuideView.__super__.events);
                this.delegateEvents();
                AccountGuideView.__super__.render.apply(this, arguments);

                var $buttonLast = $('<button>').html(i18n.ui.PREV).addClass('button-last');
                this.$('.w-ui-window-footer-monitor').append($buttonLast);

                return this;
            },
            refreshButtonState : function () {
                if (bodyView.isFirstPage()) {
                    this.$('.button-next').show();
                    this.$('.button-last, .button-finish').hide();
                } else if (bodyView.isLastPage()) {
                    this.$('.button-next').hide();
                    this.$('.button-finish, .button-last').show();
                } else {
                    this.$('.button-next, .button-last').show();
                    this.$('.button-finish').hide();
                }
            },
            clickButtonNext : function () {
                bodyView.saveCurrentOption();
                bodyView.showNextPage();
                this.refreshButtonState();
            },
            clickButtonLast : function () {
                bodyView.showLastPage();
                this.refreshButtonState();
            },
            clickButtonFinish : function () {
                bodyView.saveCurrentOption();
                // TODO:  log
                this.remove();
            },
            events : {
                'click .button-next' : 'clickButtonNext',
                'click .button-last' : 'clickButtonLast',
                'click .button-finish' : 'clickButtonFinish'
            }
        });

        var accountGuideView;

        var factory = _.extend({
            getInstance : function () {
                if (!accountGuideView) {
                    accountGuideView = new AccountGuideView({
                        title : i18n.sync.ACCOUNT_GUIDE,
                        width : 549,
                        height : 400
                    });
                }
                return accountGuideView;
            }
        });

        return factory;
    });
}(this));
