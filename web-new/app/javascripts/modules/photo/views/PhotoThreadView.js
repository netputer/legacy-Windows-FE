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
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'photo/views/PhotoItemView'
    ], function (
        _,
        Backbone,
        doT,
        IO,
        CONFIG,
        Environment,
        TemplateFactory,
        StringUtil,
        PhotoItemView
    ) {
        console.log('PhotoThreadView - File loaded. ');

        var PhotoThreadView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('photo', 'photo-thread')),
            className : 'w-photo-thread',
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

                    Backbone.trigger('photo:selected:change', selectedItem);
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

                this.listenTo(this.options.models[0].collection, 'remove', function (photo) {
                    var targetView = _.find(subView, function (view) {
                        return view.model.id === photo.id;
                    });

                    if (targetView !== undefined) {
                        subView.splice(this.subView.indexOf(targetView), 1);
                        targetView.remove();
                        if (this.subView.length === 0) {
                            this.remove();
                        }
                    }

                    var targetModel = _.find(this.options.models, function (model) {
                        return model.id === photo.id;
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
                var cur_photo_type = this.options.models[0].collection.data.photo_type;
                if (cur_photo_type === CONFIG.enums.PHOTO_PHONE_TYPE || cur_photo_type === CONFIG.enums.PHOTO_CLOUD_TYPE) {
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) {
                        key = StringUtil.formatDate('yyyy 年 MM 月', this.options.models[0].get('date'));
                    } else {
                        key = StringUtil.formatDate('yyyy-MM', this.options.models[0].get('date'));
                    }
                } else {
                    key = this.options.models[0].get('key');
                }
                this.$el.html(this.template({
                    key : key,
                    count : this.options.models.length
                }));
                var fragment = document.createDocumentFragment();
                _.each(this.options.models, function (photo) {
                    var photoItemView = new PhotoItemView.getInstance({
                        model : photo,
                        $ctn : this.options.$ctn,
                        template : this.options.itemTemplate
                    });
                    fragment.appendChild(photoItemView.render().$el[0]);
                    this.subView.push(photoItemView);
                    this.listenTo(photo, 'change:selected', this.changeSelectedHandler);
                }, this);

                this.changeSelectedHandler();

                this.$('.photo-ctn').append(fragment);
                return this;
            },
            remove : function () {
                _.each(this.subView, function (view) {
                    view.remove();
                });
                this.subView.length = 0;
                PhotoThreadView.__super__.remove.call(this);
            },
            getThumbsAsync : function () {
                var collection = this.options.models[0].collection;
                collection.getThumbsAsync(_.pluck(this.options.models, 'id'));
            },
            clickChecker : function (evt) {
                _.each(this.options.models, function (photo) {
                    photo.set({
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
                return new PhotoThreadView(args);
            }
        });

        return factory;
    });
}(this, this.document));
