/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'Internationalization',
        'Device',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'utilities/StringUtil',
        'task/views/TaskActionView'
    ], function (
        _,
        doT,
        i18n,
        Device,
        TemplateFactory,
        BaseListItem,
        StringUtil,
        TaskActionView
    ) {
        console.log('TaskListItemView - File loaded.');

        var TaskListItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('taskManager', 'list-item')),
            className : 'w-task-manager-list-item hbox',
            initialize : function () {
                TaskListItemView.__super__.initialize.apply(this, arguments);

                this.$el.on('mouseenter', function () {
                    var isConnected = Device.get('isConnected') && !Device.get('isWifi');
                    var showByMessage = /CONNECTION_LOST|DEVICE_NOT_FOUND|NEED_USB_CONNECTION/.test(this.model.get('message'));

                    if (isConnected || showByMessage) {
                        this.$el.addClass('hover');
                    }
                }.bind(this));

                this.$el.on('mouseleave', function () {
                    this.$el.removeClass('hover');
                }.bind(this));
            },
            render : function () {
                if (this.taskActionView !== undefined) {
                    this.taskActionView.$el.detach();
                    this.taskActionView.model = this.model;
                    this.taskActionView.render();
                } else {
                    this.taskActionView = TaskActionView.getInstance({
                        model : this.model
                    }).render();
                }

                this.$el.html(this.template(this.model.toJSON()));

                this.$el.append(this.taskActionView.$el);
                return this;
            },
            uninstall : function () {
                this.taskActionView.remove();
            },
            remove : function () {
                this.taskActionView.remove();
                TaskListItemView.__super__.remove.apply(this, arguments);
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new TaskListItemView();
            },
            getClass : function () {
                return TaskListItemView;
            }
        });

        return factory;
    });
}(this));
