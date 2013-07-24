/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Configuration',
        'Internationalization',
        'task/collections/TasksCollection'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        AlertWindow,
        CONFIG,
        i18n,
        TasksCollection
    ) {
        console.log('InstallProgressView - File loaded.');

        var alert = window.alert;

        var tasksCollection;

        var InstallProgressView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('optimize', 'install')),
            className : 'progress hbox',
            initialize : function () {
                tasksCollection = tasksCollection || TasksCollection.getInstance();

                var stateFlag = false;

                var refreshHandler = function (tasksCollection) {
                    var task = tasksCollection.get(this.options.taskId);
                    if (task) {
                        stateFlag = true;
                        if (task.get('type') === CONFIG.enums.TASK_TYPE_DOWNLOAD) {
                            this.$el.html(this.template({
                                progress : task.get('processing')
                            }));
                        } else if (task.get('type') === CONFIG.enums.TASK_TYPE_PUSH ||
                                    task.get('type') === CONFIG.enums.TASK_TYPE_INSTALL) {
                            this.$el.html(this.template({
                                progress : 100
                            }));
                            this.$('progress').addClass('running');
                        }

                        if (task.get('type') === CONFIG.enums.TASK_TYPE_INSTALL
                                && task.get('state') === CONFIG.enums.TASK_STATE_SUCCESS) {
                            tasksCollection.off('refresh', refreshHandler);
                            this.trigger('remove');
                        } else if (task.get('state') === CONFIG.enums.TASK_STATE_FAILD) {
                            tasksCollection.off('refresh', refreshHandler);
                            alert(i18n.optimize.INSTALL_ERROR);
                            this.trigger('remove');
                        } else if (task.get('state') === CONFIG.enums.TASK_STATE_STOPPED) {
                            tasksCollection.off('refresh', refreshHandler);
                            this.trigger('remove');
                        }
                    } else {
                        if (stateFlag) {
                            this.trigger('remove');
                        }
                    }
                };

                tasksCollection.on('refresh', refreshHandler, this);

                this.$el.remove();
            },
            render : function () {
                this.$el.html(this.template({
                    progress : 0
                }));
                return this;
            },
            buttonClickCancel : function (evt) {
                evt.stopPropagation();

                this.$('.button-cancel').prop({
                    disabled : true
                });

                tasksCollection.get(this.options.taskId).deleteTaskAsync().done(function () {
                    alert(i18n.optimize.INSTALL_CANCEL);
                    this.trigger('remove');
                }.bind(this));
            },
            events : {
                'click .button-cancel' :　'buttonClickCancel'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new InstallProgressView(args);
            }
        });

        return factory;
    });
}(this));
