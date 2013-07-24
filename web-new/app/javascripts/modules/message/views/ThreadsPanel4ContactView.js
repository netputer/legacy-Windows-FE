/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'message/collections/ConversationsCollection',
        'message/collections/ThreadsCollection',
        'message/collections/Threads4ContactCollection',
        'message/views/ThreadsItemView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        TemplateFactory,
        ConversationsCollection,
        ThreadsCollection,
        Threads4ContactCollection,
        ThreadsItemView
    ) {
        console.log('ThreadsPanel4ContactView - File loaded.');

        var CLASS_MAPPING = {
            THREADS_LIST_CTN : '.w-message-threads-list-ctn'
        };

        var ThreadsPanel4ContactView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'threads-panel')),
            className : 'w-message-threads-ctn vbox',
            initialize : function () {
                var emptyTip = '';
                Object.defineProperties(this, {
                    emptyTip : {
                        set : function (value) {
                            emptyTip = String(value);
                            this.$('.empty-tip').html(emptyTip);
                        }
                    }
                });

                this.collection.on('refresh', function (collection) {
                    this.buildList();
                    this.toggleEmptyTip(collection.length === 0);

                    this.$('.w-message-threads-nameplate').hide();
                }, this);

                this.collection.on('empty', function () {
                    this.toggleEmptyTip(true);
                }, this);

                Backbone.on('updateConversation', function (message) {
                    ConversationsCollection.getInstance().updateConversationAsync(message);

                    if (ThreadsCollection.getInstance().getThreadWithMessage(message.get('id'))) {
                        ThreadsCollection.getInstance().trigger('update');
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                this.emptyTip = i18n.message.EMPTY_TIP_4_CONTACT;
                return this;
            },
            buildList : function () {
                var $itemCtn = this.$(CLASS_MAPPING.THREADS_LIST_CTN).hide().empty();

                var fragment = document.createDocumentFragment();

                _.each(this.collection.models, function (thread) {
                    var threadItemView = ThreadsItemView.getInstance({
                        model : thread,
                        parentView : this
                    });
                    fragment.appendChild(threadItemView.render().$el[0]);
                }, this);

                $itemCtn.append(fragment).show();
            },
            toggleEmptyTip : function (toggle) {
                var show = toggle;
                var $tipCtn = this.$('.empty-tip');
                if (show !== undefined) {
                    $tipCtn[show ? 'show' : 'hide']();
                } else {
                    $tipCtn.toggle();
                }
            }
        });

        var threadsPanel4ContactView;

        var factory = _.extend({
            getInstance : function () {
                if (!threadsPanel4ContactView) {
                    threadsPanel4ContactView = new ThreadsPanel4ContactView({
                        collection : Threads4ContactCollection.getInstance()
                    });
                }
                return threadsPanel4ContactView;
            }
        });

        return factory;
    });
}(this, this.document));
