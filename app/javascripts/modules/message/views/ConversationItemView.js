/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'utilities/StringUtil',
        'Configuration',
        'Environment'
    ], function (
        _,
        doT,
        TemplateFactory,
        BaseListItem,
        StringUtil,
        CONFIG,
        Environment
    ) {
        console.log('ConversationItemView - File loaded.');

        var ConversationItemView = BaseListItem.extend({
            className : 'w-message-conversation-list-item hbox',
            template : doT.template(TemplateFactory.get('message', 'conversation-list-item')),
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ConversationItemView(args);
            },
            getClass : function () {
                return ConversationItemView;
            }
        });

        return factory;
    });
}(this));
