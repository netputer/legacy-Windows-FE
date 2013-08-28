/*global define*/
(function (window, document) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Log',
        'Internationalization',
        'Configuration',
        'ui/TemplateFactory',
        'ui/PopupTip',
        'ui/ImageLoader',
        'utilities/StringUtil',
        'app/collections/RecommendAppsCollection',
        'task/TaskService',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        doT,
        $,
        _,
        log,
        i18n,
        CONFIG,
        TemplateFactory,
        PopupTip,
        imageLoader,
        StringUtil,
        RecommendAppsCollection,
        TaskService,
        BrowserModuleView
    ) {
        console.log('RecommendView - File loaded.');

        var RecommendItemView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'app-recommend-item')),
            tagName : 'li',
            className : 'hbox',
            initialize : function () {
                this.listenTo(this.model, 'remove', this.remove);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                imageLoader(this.model.get('app').icons.px48, this.$('.icon'), true);

                var tip = new PopupTip({
                    $host : this.$('[data-title]')
                });
                tip.zero();

                return this;
            },
            removeItem : function () {
                var slideUpCallback = function () {
                    this.remove();
                    this.trigger('removed');
                }.bind(this);

                this.$el.css({
                    'overflow-y' : 'hidden'
                }).animate({
                    height: 0,
                    opacity: 0
                }, 200, slideUpCallback);

                this.model.collection.remove(this.model);

                this.trigger('remove', this.model);
            },
            clickButtonInstall : function () {
                var model = new Backbone.Model({
                    source : 'recommend',
                    downloadUrl : this.model.get('app').apks[0].downloadUrls[0].url,
                    title : this.model.get('app').title,
                    iconPath : this.model.get('app').icons.px48
                });
                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                this.removeItem();

                log({
                    'event' : 'ui.click.app.button_suggestion_install'
                });
            },
            clickButtonDislike : function () {
                this.model.dislikeAsync('app');

                this.removeItem();

                log({
                    'event' : 'ui.click.app.button_suggestion_x'
                });
            },
            clickButtonNavigateToDetail : function (evt) {
                evt.stopPropagation();
                BrowserModuleView.getInstance().navigateTo(StringUtil.format(CONFIG.enums.URL_WANDOUJIA_APP_DETAIL_PAGE, this.model.get('app').packageName, this.model.get('app').detailParam));
            },
            clickButtonNavigateToRefPage : function () {
                BrowserModuleView.getInstance().navigateTo(StringUtil.format(CONFIG.enums.URL_WANDOUJIA_APP_DETAIL_PAGE, this.model.get('recReason').packageName, this.model.get('recReason').detailParam));
            },
            events : {
                'click .button-install' : 'clickButtonInstall',
                'click .button-dislike' : 'clickButtonDislike',
                'click .button-navigate-to-detail' : 'clickButtonNavigateToDetail',
                'click .button-navigate-to-ref-page' : 'clickButtonNavigateToRefPage'
            }
        });

        var refreshCallback = function (collection) {
            var modelsPool = this.modelsPool;
            var originalLegth = modelsPool.length;
            var packageNames = _.map(modelsPool, function (model) {
                return model.get('app').packageName;
            }).concat(_.map(this.items, function (item) {
                return item.model.get('app').packageName;
            }));

            this.modelsPool = modelsPool = modelsPool.concat(this.collection.filter(function (model) {
                return packageNames.indexOf(model.get('app').packageName) < 0;
            }));

            if (originalLegth === 0
                    && modelsPool.length > 0) {
                this.buildList();
            }
        };

        var updateFailedCallback = function () {
            this.$('.tip').html(i18n.app.GET_RECOMMEND_ERROR);
        };

        var renderItem;

        var supplyItem = function () {
            if (this.modelsPool.length > 0) {
                var $item = renderItem.call(this);
                this.$('.list').append($item);
            }
        };

        var removeCallback = function (model) {
            if (this.modelsPool.length <= 10) {
                this.collection.trigger('update');
            }

            var target = _.find(this.items, function (item) {
                return item.model === model;
            });
            this.items.splice(this.items.indexOf(target), 1);

            supplyItem.call(this);
        };

        var removedCallback = function () {
            if (this.$('li').length === 0) {
                this.$('.tip').html(i18n.app.RECOMMEND_LIST_EMPTY).show();
            }
        };

        renderItem = function () {
            var listItem = new RecommendItemView({
                model : this.modelsPool.shift().set({
                    isDefaultPanel : this.model === undefined
                }, {
                    silent : true
                })
            });

            listItem.once('remove', removeCallback, this)
                .once('removed', removedCallback, this);

            this.items.push(listItem);

            return listItem.render().$el;
        };

        var refreshCollectionCallback = function (collection) {
            var $tip = this.$('.tip');
            if (collection.length === 0) {
                $tip.html(i18n.app.RECOMMEND_LIST_EMPTY);
            } else {
                $tip.hide();
            }
        };

        var showTip = function () {
            var $tip = this.$('.tip');
            if (this.collection.loading) {
                $tip.html(i18n.app.GETTING_RECOMMEND).show();

                this.collection.once('refresh', refreshCollectionCallback, this);
            } else {
                if (this.collection.length === 0) {
                    $tip.html(i18n.app.RECOMMEND_LIST_EMPTY).show();
                } else {
                    this.buildList();
                }
            }
        };

        var RecommendView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'app-recommend-list')),
            className : 'w-app-recommend-list',
            initialize : function () {
                var modelsPool = [];
                var items = [];
                Object.defineProperties(this, {
                    modelsPool : {
                        set : function (value) {
                            if (value instanceof Array) {
                                modelsPool = value;
                            }
                        },
                        get : function () {
                            return modelsPool;
                        }
                    },
                    items : {
                        set : function (value) {
                            items = value;
                        },
                        get : function () {
                            return items;
                        }
                    }
                });

                if (this.model) {
                    this.collection = RecommendAppsCollection.getInstance('app', this.model.get('base_info').package_name);
                } else {
                    this.collection = RecommendAppsCollection.getInstance('app');
                }

                this.listenTo(this.collection, 'refresh', refreshCallback)
                    .listenTo(this.collection, 'updateFailed', updateFailedCallback, this);
            },
            render : function () {
                this.$el.html(this.template({}));

                var $title = this.$('h3');
                if (this.model) {
                    $title.html(i18n.app.RECOMMENDATION);
                } else {
                    $title.html(i18n.app.RECOMMENDATION_DEFAULT);
                }

                setTimeout(showTip.bind(this), 0);

                return this;
            },
            buildList : function () {
                var modelsPool = this.modelsPool;

                var $ctn = this.$('.list').empty();
                var fragment = document.createDocumentFragment();
                var i;
                for (i = 0; i < 8; i++) {
                    if (modelsPool.length > 0) {
                        fragment.appendChild(renderItem.call(this)[0]);
                    } else {
                        break;
                    }
                }
                $ctn.append(fragment);
            },
            remove : function () {
                _.each(this.items, function (item) {
                    item.model.trigger('remove')
                        .clear({
                            silent : true
                        });
                });
                this.items = [];

                this.modelsPool.length = 0;
                this.collection.reset([], {
                    silent : true
                });

                RecommendView.__super__.remove.call(this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new RecommendView(args);
            }
        });

        return factory;
    });
}(this, this.document));
