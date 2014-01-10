/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'IO',
        'Configuration',
        'ui/UI',
        'ui/behavior/ClickToHideMixin',
        'contact/collections/ContactsCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        IO,
        CONFIG,
        UI,
        ClickToHideMixin,
        ContactsCollection
    ) {
        console.log('ContactSuggestionView - File loaded.');

        var TemplateFactory = UI.TemplateFactory;
        var KeyMapping = UI.UIHelper.KeyMapping;
        var EventsMapping = UI.UIHelper.EventsMapping;

        var contactsCollection;

        var SearchResultModel = Backbone.Model.extend({
            defaults : {
                highlight : false
            },
            initialize : function () {
                contactsCollection = contactsCollection || ContactsCollection.getInstance();
                var contact = contactsCollection.get(this.get('contactId'));

                this.set({
                    id : this.get('id'),
                    displayTitle : this.get('title'),
                    title : this.get('title').replace(/<em>|<\/em>/gi, ''),
                    displayNumber : this.get('sub_title'),
                    phoneNumber : this.get('sub_title').replace(/<em>|<\/em>/gi, ''),
                    avatar : contact ? (contact.get('avatarSmall') || CONFIG.enums.CONTACT_DEFAULT_ICON) : CONFIG.enums.CONTACT_DEFAULT_ICON
                });
            }
        });

        var SearchResultCollection = Backbone.Collection.extend({
            model : SearchResultModel,
            getCurrentSelectContact : function () {
                var currentSelectContact = this.filter(function (contact) {
                    return contact.get('highlight');
                });
                return currentSelectContact.length > 0 ? currentSelectContact[0] : undefined;
            }
        });

        var SearchResultView = Backbone.View.extend({
            tagName : 'li',
            className : 'hbox',
            template : doT.template(TemplateFactory.get('message', 'search-result-item')),
            initialize : function () {
                this.listenTo(this.model, 'change:highlight', function (contact, highlight) {
                    this.$el.toggleClass('highlight', highlight);

                    if (highlight) {
                        var lastHighlight = contact.collection.find(function (model) {
                            return model.get('highlight') && model.id !== contact.id;
                        });

                        if (lastHighlight !== undefined) {
                            lastHighlight.set({
                                highlight : false
                            });
                        }
                    }
                });

                this.listenTo(this.model, 'remove', this.remove);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.$el.toggleClass('highlight', this.model.get('highlight'));
                return this;
            },
            mouseoverContact : function () {
                this.model.set({
                    highlight : true
                });
            },
            mouseoutContact : function () {
                this.model.set({
                    highlight : false
                });
            },
            events : {
                'mouseover' : 'mouseoverContact',
                'mouseout' : 'mouseoutContact'
            }
        });

        var ContactSuggestionView = Backbone.View.extend({
            tagName : 'ul',
            className : 'w-message-suggestion-ctn',
            initialize : function () {
                ClickToHideMixin.mixin(this);

                var $host;
                var $locator;
                var lastQuery = '';
                var rendered;
                var autoHighlight = true;
                Object.defineProperties(this, {
                    $host : {
                        set : function (value) {
                            $host = value;
                        },
                        get : function () {
                            return $host;
                        }
                    },
                    lastQuery : {
                        set : function (value) {
                            lastQuery = value.toString();
                        },
                        get : function () {
                            return lastQuery;
                        }
                    },
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    width : {
                        get : function (value) {
                            var width;
                            if (this.options.hasOwnProperty('width')) {
                                width = this.options.width;
                            } else {
                                if ($locator) {
                                    width = this.$locator.outerWidth() - 2;
                                } else {
                                    width = this.$host.outerWidth() - 2;
                                }
                            }
                            return width;
                        }
                    },
                    autoHighlight : {
                        set : function (value) {
                            autoHighlight = value;
                        },
                        get : function () {
                            return autoHighlight;
                        }
                    },
                    $locator : {
                        set : function (value) {
                            $locator = value;
                        },
                        get : function () {
                            return $locator;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }

                this.collection = new SearchResultCollection();
                this.listenTo(this.collection, 'reset', this.renderList);

                if (this.$host) {
                    $host.on('focus', this.focusHost.bind(this));
                }
            },
            render : function () {
                this.delegateEvents();

                $('body').append(this.$el);

                this.$el.width(this.width);

                this.rendered = true;

                this.trigger(EventsMapping.RENDERED);

                return this;
            },
            renderList : function () {
                if (!this.$host.is(':visible')) {
                    return;
                }

                if (this.collection.length > 0) {
                    var $ctn = this.$el.hide().empty();
                    var fragement = document.createDocumentFragment();
                    this.collection.each(function (contact) {
                        var resultView = new SearchResultView({
                            model : contact
                        });
                        fragement.appendChild(resultView.render().$el[0]);
                    }, this);
                    $ctn.append(fragement).show();
                    this.show();
                } else {
                    this.close();
                }
            },
            locate : function () {
                var $target = this.$locator || this.$host;
                var hostOffset = $target.offset();
                this.$el.offset({
                    left : hostOffset.left,
                    top : hostOffset.top + $target[0].offsetHeight
                });
            },
            show : function () {
                if (!this.rendered) {
                    this.render();
                }
                this.locate();

                this.$el.show();

                this.trigger(EventsMapping.SHOW);
            },
            sendQuery : function () {
                var currentQuery = this.$host.val().trim();

                if (currentQuery !== this.lastQuery) {
                    this.lastQuery = currentQuery;
                    if (this.lastQuery.length > 0) {
                        this.searchAsyc().done(function (resp) {
                            this.collection.reset(resp.body.result);
                            if (this.autoHighlight && this.collection.length > 0) {
                                this.collection.at(0).set({
                                    highlight : true
                                });
                            }
                        }.bind(this)).fail(function () {
                            this.close();
                        }.bind(this));
                    } else {
                        this.close();
                    }
                }
            },
            searchAsyc : function () {
                var deferred = $.Deferred();

                IO.requestAsync(CONFIG.actions.CONTACT_SEARCH, {
                    data : {
                        filter : 'just_phone',
                        query : this.lastQuery,
                        is_detail : true,
                        max_result : 5
                    }
                }).done(function (resp) {

                    var conditioner = function  () {
                        var rest = {
                            body: {
                                result : [],
                                state_code : resp.state_code
                            }
                        };

                        _.each(resp.body.result, function (re) {
                            var subTitleArr = re.sub_title.split(',');

                            if (subTitleArr.length === 1) {
                                var nre = JSON.parse(JSON.stringify(re));
                                rest.body.result.push(nre);
                            } else {
                                _.each(subTitleArr, function (subTitle) {
                                    var nre = JSON.parse(JSON.stringify(re));
                                    nre.sub_title = subTitle;
                                    nre.contactId = nre.id;
                                    nre.id = nre + '|' + subTitle.replace(/<em>|<\/em>/gi, '');
                                    rest.body.result.push(nre);
                                });
                            }
                        });

                        return rest;
                    };

                    if (resp.state_code === 200 ||
                            resp.state_code === 202) {
                        console.log('ContactSuggestionView - Search contact success.');
                        resp = conditioner();
                        deferred.resolve(resp);
                    } else {
                        console.log('ContactSuggestionView - Search contact failed. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                });

                return deferred.promise();
            },
            remove : function () {
                this.collection.set([]);
                delete this.collection;
                ContactSuggestionView.__super__.remove.call(this);
            },
            close : function () {
                this.$el.remove();
                this.rendered = false;
            },
            hide : function () {
                this.close();
            },
            next : function () {
                var collection = this.collection;
                var currentSelectContact = collection.getCurrentSelectContact();
                if (collection.length > 0 && !currentSelectContact) {
                    collection.at(0).set({
                        highlight : true
                    });
                } else {
                    var currentIndex = collection.models.indexOf(currentSelectContact);
                    collection.at(currentIndex + 1 === collection.length ? 0 : currentIndex + 1).set({
                        highlight : true
                    });
                }
            },
            prev : function () {
                var collection = this.collection;
                var currentSelectContact = collection.getCurrentSelectContact();
                if (collection.length > 0 && !currentSelectContact) {
                    collection.at(collection.length - 1).set({
                        highlight : true
                    });
                } else {
                    var currentIndex = collection.models.indexOf(currentSelectContact);
                    collection.at(currentIndex === 0 ? collection.length - 1 : currentIndex - 1).set({
                        highlight : true
                    });
                }
            },
            selectContact : function () {
                this.trigger('selectContact', this.collection.getCurrentSelectContact());
                this.$host.val('');
            },
            keydownHost : function (evt) {
                var keyCode = evt.keyCode;
                if (this.rendered) {
                    switch (keyCode) {
                    case KeyMapping.DOWN:
                        evt.preventDefault();
                        this.next();
                        break;
                    case KeyMapping.UP:
                        evt.preventDefault();
                        this.prev();
                        break;
                    case KeyMapping.ENTER:
                        evt.preventDefault();
                        evt.stopPropagation();
                        if (this.collection.getCurrentSelectContact()) {
                            this.selectContact();
                        }
                        this.close();
                        break;
                    case KeyMapping.ESC:
                        evt.preventDefault();
                        this.close();
                        break;
                    }
                } else {
                    if (keyCode === KeyMapping.ENTER) {
                        evt.preventDefault();
                        evt.stopPropagation();
                    }
                }
            },
            focusHost : function () {
                var $host = this.$host;

                if ($host.hasClass('focus')) {
                    return;
                }

                var delegate = setInterval(this.sendQuery.bind(this), 100);

                var keydownHostHandler = this.keydownHost.bind(this);

                $host.on('keydown', keydownHostHandler);
                var blurHandler = function () {

                    clearInterval(delegate);

                    this.lastQuery = '';

                    $host.off('keydown', keydownHostHandler)
                            .off('blur', blurHandler)
                            .removeClass('focus');
                }.bind(this);

                $host.on('blur', blurHandler).addClass('focus');
                this.trigger('focused');
            },
            clickContact : function (evt) {
                this.close();
                this.selectContact();
            },
            events : {
                'click li' : 'clickContact'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ContactSuggestionView(args);
            }
        });

        return factory;
    });
}(this, this.document));
