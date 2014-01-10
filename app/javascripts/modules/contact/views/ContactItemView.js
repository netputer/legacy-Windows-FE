/*global console, define*/
(function (window) {
    define([
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'Log',
        'contact/views/GroupListView',
        'contact/collections/AccountCollection'
    ], function (
        doT,
        _,
        TemplateFactory,
        BaseListItem,
        log,
        GroupListView,
        AccountCollection
    ) {
        console.log('ContactItemView - File loaded.');

        var ContactItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('contact', 'contact-item')),
            className : 'w-contact-list-item hbox',
            render : function () {
                this.uninstall();

                this.$el.html(this.template(this.model.toJSON()));

                this.$('.name').toggleClass('text-secondary', this.model.get('read_only'));

                this.groupListView = GroupListView.getInstance({
                    model : this.model,
                    $host : this.$('.group-menu')
                });

                return this;
            },
            uninstall : function () {
                if (this.groupListView) {
                    this.groupListView.remove();
                    delete this.groupListView;
                }
            },
            remove : function () {
                ContactItemView.__super__.remove.call(this);
                this.uninstall();
            },
            getGroup : function (id) {
                return AccountCollection.getInstance().getGroupById(id);
            },
            clickButtonStar : function (evt) {
                evt.stopPropagation();
                this.$el.addClass('starring');
                this.model.toggleStarAsync();

                log({
                    'event' :　'ui.click.contact.button.star',
                    'favorite' :  this.model.get('starred')
                });
            },
            events : {
                'click .button-star' : 'clickButtonStar'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new TemplateFactory(args);
            },
            getClass : function () {
                return ContactItemView;
            }
        });

        return factory;
    });
}(this));
