/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'Configuration',
        'IO',
        'Log',
        'Device',
        'app/collections/AppsCollection',
        'browser/views/BrowserModuleView',
        'utilities/FormatString'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        CONFIG,
        IO,
        log,
        Device,
        AppsCollection,
        BrowserModuleView,
        formatString
    ) {
        console.log('HotCateView - File loaded.');

        var HotCateView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'hot-cate')),
            className : 'w-app-hot',
            initialize : function () {
                var appsCollection = AppsCollection.getInstance();
                this.listenTo(appsCollection, 'refresh', this.renderCategories);
            },
            renderCategories : function () {
                var appsCollection = AppsCollection.getInstance();

                var cates = appsCollection.getCategories();

                var fragment = document.createDocumentFragment();
                _.each(cates, function (cate) {
                    fragment.appendChild($('<li>')
                        .addClass('tag text-secondary')
                        .html(cate.name)
                        .data('alias', cate.alias)[0]);
                }, this);
                this.$('.tags-ctn').html(fragment);
            },
            getSpecialAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.APP_SPECIAL,
                    data : {
                        opt_fields : ['alias', 'thumbnails.*'].join(','),
                        sortType : 'MODIFICATION',
                        max : 1
                    },
                    success : function (resp) {
                        deferred.resolve(resp);
                    },
                    error : function () {
                        deferred.reject();
                    }
                });

                return deferred.promise();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.renderCategories();

                this.getSpecialAsync().done(function (resp) {
                    console.log(resp);
                    this.$('.banner')
                        .attr('src', resp[0].thumbnails.banner480)
                        .data('alias', resp[0].alias);
                }.bind(this));

                return this;
            },
            clickTag : function (evt) {
                var basePath = 'http://apps.wandoujia.com/category/{1}?pos=w/manage';

                var alias = $(evt.currentTarget).data('alias');
                BrowserModuleView.getInstance().navigateTo(formatString(basePath, alias));

                log({
                    'event' : 'ui.click.app_hot_cate',
                    'cate' : alias
                });
            },
            clickBanner : function (evt) {
                var alias = $(evt.target).data('alias');

                var basePath = 'http://apps.wandoujia.com/special/{1}?pos=w/manage';

                BrowserModuleView.getInstance().navigateTo(formatString(basePath, alias));

                log({
                    'event' : 'ui.click.app_hot_banner',
                    'alias' : alias
                });
            },
            events : {
                'click .tag' : 'clickTag',
                'click .banner' : 'clickBanner'
            }
        });

        var hotCateView;

        var factory = _.extend({
            getInstance : function () {
                if (!hotCateView) {
                    hotCateView = new HotCateView();
                }
                return hotCateView;
            }
        });

        return factory;
    });
}(this, this.document));
