/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'ui/TemplateFactory'
    ], function (
        $,
        Backbone,
        _,
        doT,
        CONFIG,
        TemplateFactory
    ) {

        console.log('BackupRestoreProgressView - File loaded.');

        var BackupRestoreProgressView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-restore-progress')),
            className : "w-backuprestore-progress hbox",
            initialize : function () {
                BackupRestoreProgressView.__super__.initialize.apply(this, arguments);

                var $contact;
                var $sms;
                var $app;

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
                    selectAppData : {
                        set : function (value) {
                            if (value) {
                                this.$('.app-only').hide();
                                this.$('.app-and-data').show();
                                this.$('.beta').show();
                            } else {
                                this.$('.app-only').show();
                                this.$('.app-and-data').hide();
                                this.$('.beta').hide();
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

                setTimeout(function () {
                    this.$contact = this.$('.content-box.contact');
                    this.$sms = this.$('.content-box.sms');
                    this.$app = this.$('.content-box.app');
                }.bind(this), 0);

                return this;
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