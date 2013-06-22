/*global define*/
(function (window, document, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Internationalization',
        'Device',
        'ui/TemplateFactory',
        'contact/models/ContactModel',
        'contact/collections/ContactsCollection',
        'message/collections/ThreadsCollection',
        'message/collections/Threads4ContactCollection',
        'message/collections/ConversationsCollection',
        'message/views/ThreadsItemView',
        'message/views/ThreadsHeaderView',
        'message/views/MessageSender4ThreadsPanelView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        i18n,
        Device,
        TemplateFactory,
        ContactModel,
        ContactsCollection,
        ThreadsCollection,
        Threads4ContactCollection,
        ConversationsCollection,
        ThreadsItemView,
        ThreadsHeaderView,
        MessageSender4ThreadsPanelView
    ) {
        console.log('ThreadsPanelView - File loaded. ');

        var setTimeout = window.setTimeout;

        var CLASS_MAPPING = {
            THREADS_LIST_CTN : '.w-message-threads-list-ctn'
        };

        var ThreadsHeaderModel = Backbone.Model.extend({});

        var threadsHeaderView;

        var quickSenderView;

        var threshold = 20;

        var addHeader = function (collection) {
            var modelValues = {};
            if (collection.isBatch) {
                var phoneNumbers = _.pluck(collection.toJSON(), 'phone_number');
                modelValues = {
                    isBatch : true,
                    contactId : -1,
                    contactIcon : CONFIG.enums.CONTACT_DEFAULT_ICON,
                    contactName : collection.toJSON(),
                    phoneNumber : phoneNumbers,
                    failedCount : collection.failedCount
                };
            } else {
                var sampleThread = collection.models[0];

                modelValues = {
                    isBatch : false,
                    contactId : sampleThread.get('contact_id'),
                    contactIcon : sampleThread.get('contact_icon') ? 'file:///' + sampleThread.get('contact_icon') : CONFIG.enums.CONTACT_DEFAULT_ICON,
                    contactName : sampleThread.get('contact_name') || sampleThread.get('phone_number') || i18n.contact.UNNAMED_CONTACT,
                    phoneNumber : sampleThread.get('phone_number'),
                    failedCount : 0
                };
            }

            if (!threadsHeaderView) {
                threadsHeaderView = ThreadsHeaderView.getInstance({
                    model : new ThreadsHeaderModel(modelValues)
                });
                this.$el.prepend(threadsHeaderView.render().$el);
            } else {
                threadsHeaderView.model.clear({
                    silent : true
                }).set(modelValues);
            }

        };

        var addQuickSender = function (collection) {
            var addSender = function (contact) {
                if (!quickSenderView) {
                    if (!collection.isBatch) {
                        quickSenderView  = MessageSender4ThreadsPanelView.getInstance({
                            model : contact,
                            defaultNumber : collection.defaultNumber
                        });
                        this.$el.append(quickSenderView.render().$el);
                    }
                } else {
                    if (collection.isBatch) {
                        quickSenderView.$el.hide();
                    } else {
                        quickSenderView.update(contact, collection.defaultNumber);
                        if (Device.get('isConnected')) {
                            quickSenderView.$el.show();
                        }
                    }
                }
            };

            var threadModel = collection.models[0];
            var contact;
            var contactsCollection = ContactsCollection.getInstance();

            if (threadModel.get('contact_id') !== '-1') {
                if (contactsCollection.loading) {
                    contactsCollection.once('refresh', function (contactsCollection) {
                        contact = contactsCollection.get(threadModel.get('contact_id'));
                        addSender.call(this, contact);
                    }, this);
                } else {
                    contact = contactsCollection.get(threadModel.get('contact_id'));
                    addSender.call(this, contact);
                }
            } else {
                contact = new ContactModel({
                    id : '-1',
                    phone : [{
                        number : threadModel.get('phone_number'),
                        address : threadModel.get('address')
                    }]
                });
                addSender.call(this, contact);
            }
        };

        var ThreadsPanelView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'threads-panel')),
            className : 'w-message-threads-ctn vbox',
            initialize : function () {
                var modelPool = [];
                var modelSlibingNextPool = [];
                var searchMsg = {};

                var subViews = [];

                Object.defineProperties(this, {
                    modelPool : {
                        set : function (value) {
                            if (value instanceof Array) {
                                modelPool = value;
                            } else {
                                console.error('ThreadsPanelView - Paramater type error.');
                            }
                        },
                        get : function () {
                            return modelPool;
                        }
                    },
                    modelSlibingNextPool : {
                        set : function (value) {
                            if (value instanceof Array) {
                                modelSlibingNextPool = value;
                            } else {
                                console.error('ThreadsPanelView - Paramater type error.');
                            }
                        },
                        get : function () {
                            return modelSlibingNextPool;
                        }
                    },
                    searchMsg : {
                        set : function (value) {
                            searchMsg = value;
                        },
                        get : function () {
                            return searchMsg;
                        }
                    },
                    subViews : {
                        get : function () {
                            return subViews;
                        }
                    }
                });

                Backbone.on('updateConversation', function (message) {
                    ConversationsCollection.getInstance().updateConversationAsync(message);

                    if (Threads4ContactCollection.getInstance().getThreadWithMessage(message.get('id'))) {
                        Threads4ContactCollection.getInstance().trigger('update');
                    }
                });

                this.collection.on('refresh', function (collection) {
                    if (collection.length > 0) {
                        addQuickSender.call(this, collection);
                        addHeader.call(this, collection);
                    }

                    this.$el.toggleClass('batch', collection.isBatch);

                    this.buildList();
                }, this);

                this.collection.on('empty', this.restore, this);
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            update : function (id, searchMsg) {
                this.searchMsg = searchMsg;

                if (this.collection.data.filter === id) {
                    if (searchMsg) {
                        if (!this.collection.loading) {
                            this.buildList();
                        }
                    } else {
                        this.trigger('rendered');
                    }
                } else {
                    this.collection.data.filter = id;
                    this.collection.trigger('update');
                }

                return this;
            },
            buildList : function () {
                _.each(this.subViews, function (item) {
                    item.remove();
                });
                this.subViews.length = 0;

                var models = this.collection.models.concat();
                var modelPool = [];
                var modelSlibingNextPool = [];
                var contentHeight = 0;
                var smsCount = 0;

                var fragment;
                var threadModel;
                var threadItemView;

                var $itemCtn = this.$(CLASS_MAPPING.THREADS_LIST_CTN);
                if (this.searchMsg && this.searchMsg.hasOwnProperty('id')) {
                    fragment = document.createDocumentFragment();

                    var targetThread = this.collection.getThreadWithMessage(this.searchMsg.id);

                    var targetThreadItemView = ThreadsItemView.getInstance({
                        model : targetThread
                    });

                    fragment.appendChild(targetThreadItemView.render().$el[0]);
                    this.subViews.push(targetThreadItemView);

                    _.each(models.slice(models.indexOf(targetThread) + 1, models.length), function (threadModel) {
                        modelPool.push(threadModel);
                    });

                    _.each(models.slice(0, models.indexOf(targetThread)), function (threadModel) {
                        modelSlibingNextPool.push(threadModel);
                    });

                    while (modelPool.length > 0) {
                        threadModel = modelPool.shift();
                        threadItemView = ThreadsItemView.getInstance({
                            model : threadModel
                        });

                        fragment.insertBefore(threadItemView.render().$el[0], fragment.firstChild);
                        this.subViews.push(threadItemView);

                        smsCount += threadModel.get('sms').length;

                        if (smsCount > threshold) {
                            if (modelPool.length > 0) {
                                threadItemView.showPreviousButton();
                            }
                            break;
                        }
                    }

                    smsCount = 0;

                    while (modelSlibingNextPool.length > 0) {
                        threadModel = modelSlibingNextPool.pop();
                        threadItemView = ThreadsItemView.getInstance({
                            model : threadModel
                        });

                        fragment.appendChild(threadItemView.render().$el[0]);
                        this.subViews.push(threadItemView);

                        smsCount += threadModel.get('sms').length;

                        if (smsCount > threshold) {
                            if (modelSlibingNextPool.length > 0) {
                                threadItemView.showNextButton();
                            }
                            break;
                        }
                    }

                    $itemCtn.append(fragment);

                    targetThreadItemView.highlightSearch(this.searchMsg);
                    targetThreadItemView.scrollTo(this.searchMsg);

                    this.searchMsg = {};
                } else {
                    modelPool = models;
                    fragment = document.createDocumentFragment();

                    while (modelPool.length > 0) {
                        threadModel = modelPool.shift();
                        threadItemView = ThreadsItemView.getInstance({
                            model : threadModel
                        });

                        fragment.insertBefore(threadItemView.render().$el[0], fragment.firstChild);
                        this.subViews.push(threadItemView);

                        smsCount += threadModel.get('sms').length;

                        if (smsCount >= threshold) {
                            if (modelPool.length > 0) {
                                threadItemView.showPreviousButton();
                            }
                            break;
                        }
                    }

                    $itemCtn.append(fragment);

                    var lastItem = $itemCtn.find('li:last-child > ul > li:last-child')[0];
                    if (lastItem) {
                        setTimeout(function () {
                            lastItem.scrollIntoView();
                        }, 0);
                    }
                }

                this.modelPool = modelPool;
                this.modelSlibingNextPool = modelSlibingNextPool;

                this.trigger('rendered');
            },
            onMouseWheel : function (evt) {
                this.supplementItem(evt.originalEvent.wheelDelta > 0);
            },
            supplementItem : function (wheelUp) {
                var modelPool = this[wheelUp ? 'modelPool' : 'modelSlibingNextPool'];
                var $itemCtn = this.$(CLASS_MAPPING.THREADS_LIST_CTN);
                var oldTop = $itemCtn[0].scrollTop;
                var oldHeight = $itemCtn[0].scrollHeight;
                var smsCount = 0;
                var i;

                var fragment = document.createDocumentFragment();
                for (i = modelPool.length; i--; undefined) {
                    var threadModel =  modelPool[wheelUp ? 'shift' : 'pop']();
                    var threadItemView = ThreadsItemView.getInstance({
                        model : threadModel
                    });

                    fragment[wheelUp ? 'insertBefore' : 'appendChild'](threadItemView.render().$el[0], fragment[wheelUp ? 'firstChild' : 'lastChild']);
                    this.subViews.push(threadItemView);

                    smsCount += threadModel.get('sms').length;

                    if (smsCount > threshold) {
                        break;
                    }
                }

                $itemCtn[wheelUp ? 'prepend' : 'append'](fragment);

                var newHeight = $itemCtn[0].scrollHeight;

                // Scroll to old position
                var difference = newHeight - oldHeight;
                if (difference !== 0) {
                    $itemCtn[0].scrollTop = oldTop + difference;
                }

                return modelPool.length > 0;
            },
            restore : function () {
                this.collection.reset([], {
                    silent : true
                });
            },
            clickButtonPrevious : function (evt) {
                $(evt.target).remove();
                if (this.supplementItem(true)) {
                    var handler = setInterval(function () {
                        if (!this.supplementItem(true)) {
                            clearInterval(handler);
                        }
                    }.bind(this), 300);
                }

            },
            clickButtonNext : function (evt) {
                $(evt.target).remove();
                if (this.supplementItem(false)) {
                    var handler = setInterval(function () {
                        if (!this.supplementItem(false)) {
                            clearInterval(handler);
                        }
                    }.bind(this), 300);
                }
            },
            events : {
                'click .button-previous' : 'clickButtonPrevious',
                'click .button-next' : 'clickButtonNext'
            }
        });

        var threadsPanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!threadsPanelView) {
                    threadsPanelView = new ThreadsPanelView({
                        collection : ThreadsCollection.getInstance()
                    });
                }
                return threadsPanelView;
            },
            getClass : function () {
                return ThreadsPanelView;
            }
        });

        return factory;
    });
}(this, this.document));
