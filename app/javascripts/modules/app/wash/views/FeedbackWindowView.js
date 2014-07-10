/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/SmartList',
        'ui/BaseListItem',
        'utilities/StringUtil',
        'Environment',
        'Internationalization',
        'Configuration',
        'app/collections/AppsCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Panel,
        TemplateFactory,
        SmartList,
        BaseListItem,
        StringUtil,
        Environment,
        i18n,
        CONFIG,
        AppsCollection
    ) {
        console.log('FeedbackWindowView - File loaded. ');

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('wash', 'wash-feedback')),
            className : 'w-wash-feedback',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            getReason : function () {
                return this.$('input[type="radio"]:checked').val();
            },
            getFeedbackType : function () {
                return parseInt(this.$('input[type="radio"]:checked').val(), 10);
            },
            keyupInputReason : function (evt) {
                this.$('input[type="radio"]:last').val(evt.originalEvent.srcElement.value);
            },
            clickLastRadio : function () {
                this.$('.input-reason').prop({
                    disabled : false
                }).focus();
            },
            clickNoneLastRadio : function () {
                this.$('.input-reason').prop({
                    disabled : true
                });
            },
            events : {
                'click input[type="radio"]:last' : 'clickLastRadio',
                'click input[type="radio"]:not(:last)' : 'clickNoneLastRadio',
                'keyup .input-reason' : 'keyupInputReason'
            }
        });

        var ItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('wash', 'wash-feedback-item')),
            className : 'w-wash-feedback-app-list-item',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var ListView = Backbone.View.extend({
            className : 'w-wash-feedback-app-list vbox',
            render : function () {
                this.$el.empty();
                this.listView = new SmartList({
                    itemView : ItemView,
                    dataSet : [{
                        name : 'default',
                        getter : this.options.type === 1 && this.options.ids.length > 0 ? function () {
                            return AppsCollection.getInstance().filter(function (app) {
                                return this.options.ids.indexOf(app.id) >= 0;
                            }, this);
                        }.bind(this) : AppsCollection.getInstance().getNormalApps
                    }],
                    keepSelect : false,
                    itemHeight : 43,
                    listenToCollection : AppsCollection.getInstance()
                });

                this.$el.append(this.listView.render().$el);

                return this;
            },
            getSelectedAppPackageName : function () {
                return this.$('input[type="radio"]:checked').val();
            },
            remove : function () {
                this.listView.remove();
                ListView.__super__.remove.call(this);
            }
        });

        var text = [];

        var ReasonView = Backbone.View.extend({
            className : 'w-wash-feedback',
            template : doT.template(TemplateFactory.get('wash', 'wash-feedback-reason')),
            getTextAsync : function () {
                var deferred = $.Deferred();

                if (text.length > 0) {
                    deferred.resolve(text);
                } else {
                    $.ajax(CONFIG.actions.APP_WASH_GET_TEXT).done(function (resp) {
                        text = resp;
                        deferred.resolve(resp);
                    }.bind(this));
                }

                return deferred.promise();
            },
            render : function () {
                this.getTextAsync().done(function () {
                    this.$el.html(this.template({
                        type : this.options.type,
                        text : text
                    }));
                }.bind(this));
                return this;
            },
            getReason : function () {
                return this.$('input[type="radio"]:checked').val();
            },
            keyupInputReason : function (evt) {
                this.$('input[type="radio"]:last').val(evt.originalEvent.srcElement.value);
            },
            clickLastRadio : function () {
                this.$('.input-reason').prop({
                    disabled : false
                }).focus();
            },
            clickNoneLastRadio : function () {
                this.$('.input-reason').prop({
                    disabled : true
                });
            },
            events : {
                'click input[type="radio"]:last' : 'clickLastRadio',
                'click input[type="radio"]:not(:last)' : 'clickNoneLastRadio',
                'keyup .input-reason' : 'keyupInputReason'
            }
        });

        var bodyView;
        var listView;
        var reasonView;

        var step;

        var FeedbackWindowView = Panel.extend({
            initialize : function () {
                FeedbackWindowView.__super__.initialize.apply(this, arguments);

                this.once('show', function () {
                    bodyView = new BodyView();

                    this.$bodyContent = bodyView.render().$el;
                    var $button = this.buttons[0].$button.prop('disabled', true);

                    bodyView.$('input[type="radio"]').on('click', function (evt) {
                        if (bodyView.getFeedbackType() !== 1 && bodyView.getFeedbackType() !== 2) {
                            $button.html(i18n.app.SUBMIT);
                        } else {
                            $button.html(i18n.app.NEXT);
                        }
                        $button.prop('disabled', false);
                    });

                    step = 1;

                    this.once('remove', function () {
                        if (bodyView !== undefined) {
                            bodyView.remove();
                        }
                        if (listView !== undefined) {
                            listView.remove();
                        }
                        if (reasonView !== undefined) {
                            reasonView.remove();
                        }
                        bodyView = undefined;
                        listView = undefined;
                        reasonView = undefined;

                        this.off();
                    });
                }, this);

                this.on('next', function () {
                    var $button = this.buttons[0].$button.prop('disabled', true);
                    if (step === 1) {
                        if (bodyView.getFeedbackType() === 1 || bodyView.getFeedbackType() === 2) {
                            listView = new ListView({
                                type : bodyView.getFeedbackType(),
                                ids : this.options.ids || []
                            });
                            this.$bodyContent = listView.render().$el;
                            setTimeout(function () {
                                var clickHandler = function () {
                                    $button.prop('disabled', false);
                                    listView.$el.undelegate('input[type="radio"]', 'click', clickHandler);
                                };
                                listView.$el.delegate('input[type="radio"]', 'click', clickHandler);
                            }.bind(this), 0);

                            this.title = i18n.app.CHOOSE_BAD_APPS;

                            step = 2;
                        } else {
                            if (bodyView.$('.input-reason').val().trim() !== '') {
                                this.trigger('submit');
                            }
                        }
                    } else {
                        reasonView = new ReasonView({
                            type : bodyView.getFeedbackType()
                        });

                        this.$bodyContent = reasonView.render().$el;

                        this.buttons = [{
                            $button : $('<button>').html(i18n.app.SUBMIT).addClass('primary'),
                            eventName : 'submit'
                        }, {
                            $button : $('<button>').html(i18n.ui.CANCEL),
                            eventName : 'button_cancel'
                        }];

                        $button = this.buttons[0].$button.prop('disabled', true);

                        var clickHandler = function () {
                            $button.prop('disabled', false);
                            reasonView.$el.undelegate('input[type="radio"]', 'click', clickHandler);
                        };
                        reasonView.$el.delegate('input[type="radio"]', 'click', clickHandler);

                        this.title = bodyView.getFeedbackType() === 1 ? i18n.app.WASH_WRONG : i18n.app.WASH_LEAP;

                        step = 3;
                    }
                }, this);

                this.once('submit', function () {
                    var type = bodyView.getFeedbackType() || 0;
                    var packageName = listView ? (listView.getSelectedAppPackageName() || '') : '';
                    var reason = reasonView ? reasonView.getReason() : bodyView.getReason();
                    var app = packageName && AppsCollection.getInstance().get(packageName);

                    $.ajax({
                        type : 'POST',
                        url : CONFIG.actions.APP_WASH_FEEDBACK,
                        data : {
                            udid : Environment.get('deviceId'),
                            from : 'windows',
                            'package' : packageName,
                            md5 : packageName ? (app.get('fileMd5') || app.get('base_info').md5) : '',
                            type : type === 1 ? 'wrong' : (type === 2 ? 'missing' : 'other'),
                            reason : reason
                        }
                    });

                    this.remove();
                }, this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new FeedbackWindowView(_.extend({
                    title : i18n.app.WASH_FEEDBACK_TITLE,
                    height : 250,
                    buttons : [{
                        $button : $('<button>').html(i18n.app.NEXT).addClass('primary'),
                        eventName : 'next'
                    }, {
                        $button : $('<button>').html(i18n.ui.CANCEL),
                        eventName : 'button_cancel'
                    }]
                }, args));
            }
        });

        return factory;
    });
}());
