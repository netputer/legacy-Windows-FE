/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'utilities/StringUtil',
        'task/views/TaskActionView'
    ], function (
        _,
        doT,
        i18n,
        TemplateFactory,
        BaseListItem,
        StringUtil,
        TaskActionView
    ) {
        console.log('TaskListItemView - File loaded.');

        var TaskListItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('taskManager', 'list-item')),
            className : 'w-task-manager-list-item hbox',
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

                if (this.taskActionView) {
                    this.taskActionView.remove();
                }
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
