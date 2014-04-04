/*global define*/
(function (window, document) {
    'use strict';

    define([
        'underscore',
        'backbone',
        'doT',
        'IO',
        'Configuration',
        'Environment',
        'Internationalization',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'video/views/VideoItemView'
    ], function (
        _,
        Backbone,
        doT,
        IO,
        CONFIG,
        Environment,
        i18n,
        TemplateFactory,
        StringUtil,
        VideoItemView
    ) {
        console.log('VideoThreadView - File loaded. ');

        var VideoThreadView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('video', 'video-thread')),
            className : 'w-media-thread',
            initialize : function () {
                var subView = [];
                var changeSelectedHandler = _.debounce(function () {
                    var selectedItem = _.filter(this.options.models, function (model) {
                        return model.get('selected');
                    });

                    this.$('.checker').prop({
                        checked : selectedItem.length === this.options.models.length
                    });

                    this.$('.count').html(this.options.models.length);

                    Backbone.trigger('video:selected:change', selectedItem);
                }.bind(this));
                Object.defineProperties(this, {
                    subView : {
                        get : function () {
                            return subView;
                        }
                    },
                    changeSelectedHandler : {
                        get : function () {
                            return changeSelectedHandler;
                        }
                    }
                });

                this.listenTo(this.options.models[0].collection, 'remove', function (video) {
                    var targetView = _.find(subView, function (view) {
                        return view.model.id === video.id;
                    });

                    if (targetView !== undefined) {
                        subView.splice(this.subView.indexOf(targetView), 1);
                        targetView.remove();
                        if (this.subView.length === 0) {
                            this.remove();
                        }
                    }

                    var targetModel = _.find(this.options.models, function (model) {
                        return model.id === video.id;
                    });

                    if (targetModel !== undefined) {
                        this.options.models.splice(this.options.models.indexOf(targetModel), 1);
                        changeSelectedHandler.call(this);
                    }
                });

                if (this.options.template) {
                    this.template = this.options.template;
                }
            },
            render : function () {
                var key;
                if (navigator.language === CONFIG.enums.LOCALE_ZH_CN) {
                    key = StringUtil.formatDate(i18n.video.SMART_DATE_SOME_MONTH, this.options.models[0].get('date_added'));
                } else {
                    key = StringUtil.formatDate('yyyy-MM', this.options.models[0].get('date_added'));
                }
                this.$el.html(this.template({
                    key : key,
                    count : this.options.models.length
                }));
                var fragment = document.createDocumentFragment();
                _.each(this.options.models, function (video) {
                    var videoItemView = new VideoItemView.getInstance({
                        model : video,
                        $ctn : this.options.$ctn,
                        template : this.options.itemTemplate
                    });
                    fragment.appendChild(videoItemView.render().$el[0]);
                    this.subView.push(videoItemView);
                    this.listenTo(video, 'change:selected', this.changeSelectedHandler);
                }, this);

                this.changeSelectedHandler();

                this.$('.media-ctn').append(fragment);
                return this;
            },
            remove : function () {
                _.each(this.subView, function (view) {
                    view.remove();
                });
                this.subView.length = 0;
                VideoThreadView.__super__.remove.call(this);
            },
            getThumbsAsync : function () {
                var collection = this.options.models[0].collection;
                collection.getThumbsAsync(_.pluck(this.options.models, 'id'));
            },
            clickChecker : function (evt) {
                _.each(this.options.models, function (video) {
                    video.set({
                        selected : evt.target.checked
                    });
                });
            },
            clickButtonIgnore : function () {
                this.options.models.collection.ignoreThreadAsync(this.options.models[0].get('key'));
            },
            mousedownLabel : function (evt) {
                evt.stopPropagation();
            },
            events : {
                'mousedown .label' : 'mousedownLabel',
                'click .checker' : 'clickChecker',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new VideoThreadView(args);
            }
        });

        return factory;
    });
}(this, this.document));
