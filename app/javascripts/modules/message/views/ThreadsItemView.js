/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'message/collections/MessageCollection',
        'message/views/ThreadsMessageItemView',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        StringUtil,
        MessageCollection,
        ThreadsMessageItemView,
        i18n
    ) {
        console.log('ThreadsItemView - File loaded.');

        var CLASS_MAPPING = {
            MESSAGE_CTN : '.w-message-item-ctn'
        };

        var updateHandler = function (message) {
            Backbone.trigger('updateConversation', message);
        };

        var ThreadsItemView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'threads-item')),
            tagName : 'li',
            className : 'w-message-thread',
            initialize : function () {
                var subViews = [];
                Object.defineProperties(this, {
                    subViews : {
                        get : function () {
                            return subViews;
                        }
                    }
                });
                this.collection = MessageCollection.getInstance().set(this.model.get('sms'));

                this.listenTo(this.collection, 'empty', this.remove);
                this.listenTo(this.collection, 'remove', updateHandler);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                // Add SMS items
                var $itemCtn = this.$(CLASS_MAPPING.MESSAGE_CTN);

                var fragment = document.createDocumentFragment();
                var smsItemView;
                _.each(this.collection.models, function (message) {
                    smsItemView = ThreadsMessageItemView.getInstance({
                        model : message
                    });

                    fragment.appendChild(smsItemView.render().$el[0]);
                    this.subViews.push(smsItemView);
                }, this);
                $itemCtn.append(fragment);

                return this;
            },
            smartDate : function (days) {
                var date;

                var sourceMills = days * 24 * 60 * 60 * 1000;
                var sourceDate = new Date(sourceMills);
                var today = new Date();
                var difference = (new Date(today.getDate())) - (new Date(sourceDate.getDate()));
                if (sourceDate.getFullYear() === today.getFullYear() && sourceDate.getMonth() === today.getMonth()) {
                    switch (difference) {
                    case 0:
                        date = StringUtil.formatDate(i18n.message.SMART_DATE_TODAY, sourceMills);
                        break;
                    case 1:
                        date = StringUtil.formatDate(i18n.message.SMART_DATE_YESTERDAY, sourceMills);
                        break;
                    case 2:
                        date = StringUtil.formatDate(i18n.message.SMART_DATE_TDBY, sourceMills);
                        break;
                    default:
                        date = StringUtil.formatDate(i18n.message.SMART_DATE_SOME_DAY, sourceMills);
                    }
                } else {
                    var yearDifference = today.getFullYear() - sourceDate.getFullYear();
                    if (yearDifference > 0) {
                        date = StringUtil.formatDate(i18n.message.SMART_DATE_DIFF_YEAR, sourceMills);
                    } else {
                        date = StringUtil.formatDate(i18n.message.SMART_DATE_SOME_DAY, sourceMills);
                    }
                }

                return date;
            },
            highlightSearch : function (msg) {
                var message = this.collection.get(msg.id);
                message.set({
                    body : StringUtil.conditionalEscape(message.get('body').replace(new RegExp(msg.keyword), function (arg1) {
                        return '<em>' + arg1 + '</em>';
                    }), 'em')
                });
            },
            scrollTo : function (msg) {
                var message = this.collection.get(msg.id);
                if (message !== undefined) {
                    message.trigger('scrollTo');
                }
            },
            showPreviousButton : function () {
                this.$el.prepend('<div class="button-previous link">' + i18n.message.LOAD_MORE + '</div>');
            },
            showNextButton : function () {
                this.$el.append('<div class="button-next link">' + i18n.message.LOAD_MORE + '</div>');
            },
            remove : function () {
                if (this.collection) {
                    this.$el.hide();
                    _.each(this.subViews, function (item) {
                        item.remove();
                    });
                    delete this.collection;
                }
                ThreadsItemView.__super__.remove.call(this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ThreadsItemView(args);
            }
        });

        return factory;
    });
}(this, this.document));
