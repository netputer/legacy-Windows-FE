/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Settings',
        'ui/Panel',
        'ui/TemplateFactory',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        Settings,
        Panel,
        TemplateFactory,
        i18n
    ) {
        console.log('DeleteConfirmWindowView - File loaded. ');

        var footerMonitorView;

        var FooterMonitorView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('taskManager', 'delete-monitor')),
            tagName : 'label',
            className : 'w-task-delete-footer',
            render : function () {
                this.$el.html(this.template({}));

                if (Settings.get('task_manager_delete_file')) {
                    this.$('.check-delete-apk').attr('checked', 'checked');
                }

                return this;
            },
            clickDeleteApk : function () {
                Settings.set('task_manager_delete_file', this.$('.check-delete-apk')[0].checked);
            },
            events : {
                'click .check-delete-apk' : 'clickDeleteApk'
            }
        });

        var DeleteConfirmWindowView = Panel.extend({
            initialize : function () {
                DeleteConfirmWindowView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    deleteFile : {
                        get : function () {
                            return this.$('.check-delete-apk')[0].checked;
                        }
                    }
                });

                this.on('show', function () {
                    footerMonitorView = new FooterMonitorView();
                    this.$('.w-ui-window-footer-monitor').append(footerMonitorView.render().$el);

                    this.once('remove', footerMonitorView.remove, footerMonitorView);
                }, this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new DeleteConfirmWindowView(_.extend({
                    $bodyContent : i18n.taskManager.CONFIRM_DELETE,
                    buttonSet : 'yes_no',
                    title : i18n.taskManager.DELETE_TITLE
                }, args));
            }
        });

        return factory;
    });
}());
