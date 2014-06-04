/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Log',
        'ui/TemplateFactory',
        'ui/Panel',
        'Internationalization',
        'Configuration',
        'Device',
        'IO',
        'task/TaskService',
        'task/collections/TasksCollection'
    ], function (
        Backbone,
        doT,
        $,
        _,
        log,
        TemplateFactory,
        Panel,
        i18n,
        CONFIG,
        Device,
        IO,
        TaskService,
        TasksCollection
    ) {

        console.log('TaskChangeStoragePathView - File loaded');

        var TaskChangeStoragePathView = Panel.extend({
            className : 'w-ui-window w-task-no-space',
            initialize : function () {
                TaskChangeStoragePathView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    type : {
                        set : function (value) {
                            switch (value) {
                            case 'NO_MORE_SPACE' :
                                this.$('.desc').html(i18n.taskManager.DISK_NO_SPACE_DESC);
                                break;
                            case 'DIR_CAN_NOT_USED' :
                                this.$('.desc').html(i18n.taskManager.DISK_NO_SPACE_CAN_NOT_USE_DESC);
                                break;
                            }
                        }
                    }
                });

                this.buttons = [{
                    $button : $('<button>').html(i18n.taskManager.DISK_NO_SPACE_CHANGE_FOLDER).addClass('button-change primary'),
                    eventName : 'button_cancel'
                }, {
                    $button : $('<button>').html(i18n.taskManager.DISK_NO_SPACE_CLEAN_FOLDER).addClass('button-clean'),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {

                _.extend(this.events, TaskChangeStoragePathView.__super__.events);
                this.delegateEvents();
                TaskChangeStoragePathView.__super__.render.apply(this, arguments);

                var template = doT.template(TemplateFactory.get('taskManager', 'disk_nospace_panel'));
                this.$bodyContent = $(template());
                return this;
            },
            clickChangeBtn : function () {

                log({
                    'event' : 'ui.click.change_download_folder'
                });

                IO.requestAsync(CONFIG.actions.SAVE_SCREENSHOT);
            },
            clickCleanBtn : function () {

                log({
                    'event' : 'ui.click.clean_download_folder'
                });

                IO.requestAsync(CONFIG.actions.TASK_OPEN_DOWNLOAD_DIRECTORY);
            },
            events : {
                'click .button-change' : 'clickChangeBtn',
                'click .button-clean' : 'clickCleanBtn'
            }
        });


        var changePathView;

        var factory = _.extend({
            getInstance : function () {
                if (!changePathView) {
                    changePathView = new TaskChangeStoragePathView({
                        title : i18n.taskManager.DISK_NO_SPACE_TITLE
                    });
                }
                return changePathView;
            }
        });

        return factory;

    });
}(this));
