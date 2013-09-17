/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/models/RestoreContextModel'
    ], function (
        $,
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        TemplateFactory,
        BackupContextModel,
        RestoreContextModel
    ) {

        console.log('BackupRestoreProgressView - File loaded.');

        var backupList = [
            CONFIG.enums.BR_TYPE_CONTACT,
            CONFIG.enums.BR_TYPE_SMS,
            CONFIG.enums.BR_TYPE_APP,
            CONFIG.enums.BR_TYPE_APP_DATA
        ];

        var BackupRestoreProgressView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-restore-progress')),
            className : "w-backuprestore-progress hbox",
            initialize : function () {
                BackupRestoreProgressView.__super__.initialize.apply(this, arguments);

                var $contact;
                var $sms;
                var $app;

                var isBackup = true;
                var selectAppData = false;
                Object.defineProperties(this, {
                    $contact : {
                        set : function (value) {
                            $contact = value;
                        },
                        get : function () {
                            return $contact;
                        }
                    },
                    $sms : {
                        set : function (value) {
                            $sms = value;
                        },
                        get : function () {
                            return $sms;
                        }
                    },
                    $app : {
                        set : function (value) {
                            $app = value;
                        },
                        get : function () {
                            return $app;
                        }
                    },
                    contact : {
                        set : function (value) {
                            $contact.find('.count').text(value);
                        }
                    },
                    sms : {
                        set : function (value) {
                            $sms.find('.count').text(value);
                        }
                    },
                    app : {
                        set : function (value) {
                            $app.find('.count').text(value);
                        }
                    },
                    isBackup : {
                        set : function (value) {
                            isBackup = value;
                        },
                        get : function () {
                            return isBackup;
                        }
                    },
                    selectAppData : {
                        set : function (value) {
                            this.$('.app-only').toggle(!value);
                            this.$('.app-and-data').toggle(value);
                            this.$('.beta').toggle(value);

                            if (value) {

                                if (this.isBackup) {
                                    this.app = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA] + BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP];
                                } else {
                                    this.app = RestoreContextModel.get('restoreData')[CONFIG.enums.BR_TYPE_APP_DATA] + RestoreContextModel.get('restoreData')[CONFIG.enums.BR_TYPE_APP];
                                }

                            } else {

                                if (this.isBackup) {
                                    this.app = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP];
                                } else {
                                    this.app = RestoreContextModel.get('restoreData')[CONFIG.enums.BR_TYPE_APP];
                                }
                            }
                        },
                        get : function () {
                            return selectAppData;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                this.$contact = this.$('.content-box.contact');
                this.$sms = this.$('.content-box.sms');
                this.$app = this.$('.content-box.app');

                this.initState();

                return this;
            },
            initState : function () {

                var toggleContent = function (list) {
                    var content;
                    var hideList = _.difference(backupList, list);
                    _.each(hideList, function (item) {
                        content = this.getContent(item);
                        content.hide();
                    }, this);

                    _.each(list, function (item) {
                        content = this.getContent(item);
                        content.show();
                    }, this);
                }.bind(this);

                this.listenTo(BackupContextModel, 'change:dataIDList', function () {
                    toggleContent(BackupContextModel.get('dataIDList'));
                });
                this.listenTo(RestoreContextModel, 'change:dataIDList', function () {
                    toggleContent(RestoreContextModel.get('dataIDList'));
                });
            },
            getProgress : function (type) {
                var $progress;

                switch (type) {
                case CONFIG.enums.BR_TYPE_CONTACT:
                    $progress = this.$contact.find('progress');
                    break;
                case CONFIG.enums.BR_TYPE_SMS:
                    $progress = this.$sms.find('progress');
                    break;
                case CONFIG.enums.BR_TYPE_APP:
                case CONFIG.enums.BR_TYPE_APP_DATA:
                    $progress = this.$app.find('progress');
                    break;
                }

                return $progress;
            },
            getContent : function (type) {
                var $content;

                switch (type) {
                case CONFIG.enums.BR_TYPE_CONTACT:
                    $content = this.$contact;
                    break;
                case CONFIG.enums.BR_TYPE_SMS:
                    $content = this.$sms;
                    break;
                case CONFIG.enums.BR_TYPE_APP:
                case CONFIG.enums.BR_TYPE_APP_DATA:
                    $content = this.$app;
                    break;
                }

                return $content;
            },
            getStatus : function (type) {
                var $status;

                switch (type) {
                case CONFIG.enums.BR_TYPE_CONTACT:
                    $status = this.$contact.find('.status');
                    break;
                case CONFIG.enums.BR_TYPE_SMS:
                    $status = this.$sms.find('.status');
                    break;
                case CONFIG.enums.BR_TYPE_APP:
                case CONFIG.enums.BR_TYPE_APP_DATA:
                    $status = this.$app.find('.status');
                    break;
                }

                return $status;
            },
            updateStatus : function (type, value, max, isDone) {
                var $status = this.getStatus(type);
                if ($status) {

                    if (isDone) {
                        $status.text(i18n.new_backuprestore.PROGRESS_DONE);
                        return;
                    }
                    $status.text(value + ' / ' + max);
                }
            },
            showProgress : function (type) {
                var $progress = this.getProgress(type);
                if ($progress) {
                    $progress.show();
                }
            },
            updateProgress : function (type, value, max) {
                var $progress = this.getProgress(type);
                if ($progress) {
                    $progress.prop({
                        value : value,
                        max : max
                    });
                }
            },
            setProgressState : function (type, isRunning) {
                var $progress = this.getProgress(type);
                if ($progress) {
                    $progress.toggleClass('running', isRunning);
                }
            },
            setContentState : function (type, isFinish) {
                var $content = this.getContent(type);
                if ($content) {
                    $content.toggleClass('finish', isFinish);
                }
            }
        });

        return BackupRestoreProgressView;
    });
}(this));
