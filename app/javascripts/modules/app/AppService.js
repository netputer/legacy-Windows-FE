/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'Configuration',
        'IO',
        'Device',
        'Settings',
        'ui/AlertWindow',
        'ui/BatchActionWindow',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'app/views/RetryWindowView',
        'app/collections/AppsCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        CONFIG,
        IO,
        Device,
        Settings,
        AlertWindow,
        BatchActionWindow,
        TemplateFactory,
        StringUtil,
        RetryWindowView,
        AppsCollection
    ) {
        console.log('AppService - File loaded. ');

        var alert = window.alert;
        var confirm = window.confirm;

        var AppService = _.extend({}, Backbone.Events);

        var exportPath;

        AppService.moveToSDCardAsync = function (ids) {
            var deferred = $.Deferred();

            var appsCollection = AppsCollection.getInstance();

            var appsSuggestMove = [];

            var apps = [];

            appsCollection.each(function (app) {
                if (ids.indexOf(app.id) >= 0) {
                    apps.push(app);
                    if (app.isSuggestMove) {
                        appsSuggestMove.push(app);
                    }
                }
            });

            var tipText = appsSuggestMove.length !== apps.length ?
                            i18n.app.APPS_TRANSFER_TIP_TEXT : StringUtil.format(i18n.app.MOVE_TO_SD_CARD, apps.length);

            confirm(tipText, function () {
                var session;
                var batchActionWindow;
                if (ids.length > 1) {
                    session = _.uniqueId('app.move_to_sd_');

                    batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.app.APPS_TRANSFER_PROCESSING_TEXT,
                        cancelUrl : CONFIG.actions.APP_CANCEL,
                        total : ids.length,
                        successText : i18n.app.APPS_TRANSFER_SUCCESS_TEXT
                    });

                    batchActionWindow.show();
                }

                if (ids.length === 1) {
                    appsCollection.get(ids[0]).set('running', true);
                }

                appsCollection.moveAppsAsync(ids, session, CONFIG.enums.INSTALL_LOCATION_EXTENTION).done(function (resp) {
                    var body = resp.body || {};

                    var success = body.success || [];
                    var failed = body.failed || [];

                    if (success.length > 0) {
                        if (_.pluck(success, 'error_code').indexOf(722) >= 0) {
                            alert(i18n.app.ALERT_TIP_MOVE_NEED_CONFIRM);
                        }
                    }

                    if (failed.length > 0) {
                        if (batchActionWindow !== undefined) {
                            batchActionWindow.remove();
                        }
                    }

                    deferred.resolve(resp);
                }).fail(function (resp) {
                    if (resp.state_code !== 402) {
                        alert(i18n.app.MOVE_FAILED);
                        if (batchActionWindow !== undefined) {
                            batchActionWindow.remove();
                        }
                    }

                    deferred.reject(resp);
                }).always(function () {
                    if (ids.length === 1) {
                        appsCollection.get(ids[0]).set('running', false);
                    }
                });
            });

            return deferred.promise();
        };

        AppService.batchMoveToSDCardAsync = function (ids) {
            var deferred = $.Deferred();

            if (Device.get('productId') === 'xiaomi-m1' &&
                    Device.get('SDKVersion') === 10) {
                alert(i18n.app.XIAOMI_SD_DISABLE);
                return;
            }

            var appsCollection = AppsCollection.getInstance();

            if (Device.get('isMounted')) {
                var alertWindow = new AlertWindow({
                    draggable : true,
                    buttonSet : 'retry_cancel',
                    $bodyContent : doT.template(TemplateFactory.get('app', 'mount-sd'))({})
                });

                alertWindow.on('button_retry', function () {
                    if (!Device.get('isMounted')) {
                        alertWindow.remove();
                        AppService.batchMoveToSDCardAsync(ids);
                    }
                }, this);

                alertWindow.once('button_cancel', deferred.reject);

                alertWindow.show();
            }

            var callback = function (resp) {
                var failed = resp.body.failed;

                if (failed && failed.length > 0) {

                    var retryWindowView = RetryWindowView.getInstance({
                        failedApps : failed,
                        tip : i18n.app.APPS_TRANSFER_FAILED_TEXT,
                        needConnection : true
                    });

                    retryWindowView.show();

                    retryWindowView.once('button_retry', function () {
                        AppService.moveToSDCardAsync(_.pluck(failed, 'item')).done(callback);
                    });

                    retryWindowView.once('button_cancel', function () {
                        deferred.reject();
                    });
                } else {
                    deferred.resolve();
                }
            };

            AppService.moveToSDCardAsync(appsCollection.ableMoveToSD(ids)).done(callback);

            return deferred.promise();
        };

        AppService.moveToDeviceAsync = function (ids) {
            var deferred = $.Deferred();

            var appsCollection = AppsCollection.getInstance();

            var apps = appsCollection.filter(function (app) {
                return ids.indexOf(app.id) >= 0;
            });

            var disposableAlert = new AlertWindow({
                draggable : true,
                disposableName : 'app-move-to-device',
                buttonSet : 'yes_no',
                $bodyContent : StringUtil.format(i18n.app.MOVE_TO_DEVICE, apps.length)
            });

            disposableAlert.once('button_yes', function () {
                var session;
                var batchActionWindow;
                if (ids.length > 1) {
                    session = _.uniqueId('app.move_to_device_');

                    batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.app.APPS_TRANSFER_PROCESSING_TEXT,
                        cancelUrl : CONFIG.actions.APP_CANCEL,
                        total : ids.length,
                        successText : i18n.app.APPS_TRANSFER_SUCCESS_TEXT
                    });

                    batchActionWindow.show();
                }

                if (ids.length === 1) {
                    appsCollection.get(ids[0]).set('running', true);
                }

                appsCollection.moveAppsAsync(ids, session, CONFIG.enums.INSTALL_LOCATION_DEVICE).done(function (resp) {
                    var body = resp.body || {};

                    var success = body.success || [];
                    var failed = body.failed || [];

                    if (success.length > 0) {
                        if (_.pluck(success, 'error_code').indexOf(722) >= 0) {
                            alert(i18n.app.ALERT_TIP_MOVE_NEED_CONFIRM);
                        }
                    }

                    if (failed.length > 0) {
                        if (batchActionWindow !== undefined) {
                            batchActionWindow.remove();
                        }
                    }

                    deferred.resolve(resp);
                }).fail(function (resp) {
                    if (resp.state_code !== 402) {
                        alert(i18n.app.MOVE_FAILED);
                        if (batchActionWindow !== undefined) {
                            batchActionWindow.remove();
                        }
                    }

                    deferred.reject(resp);
                }).always(function () {
                    if (ids.length === 1) {
                        appsCollection.get(ids[0]).set('running', false);
                    }
                });
            });

            disposableAlert.show();

            return deferred.promise();
        };

        AppService.batchMoveToDeviceAsync = function (ids) {
            var deferred = $.Deferred();

            var appsCollection = AppsCollection.getInstance();

            var callback = function (resp) {
                var failed = resp.body.failed;

                if (failed && failed.length > 0) {

                    var retryWindowView = RetryWindowView.getInstance({
                        failedApps : failed,
                        tip : i18n.app.APPS_TRANSFER_FAILED_TEXT,
                        needConnection : true
                    });

                    retryWindowView.show();

                    retryWindowView.once('button_retry', function () {
                        AppService.moveToDeviceAsync(_.pluck(failed, 'item')).done(callback);
                    });

                    retryWindowView.once('button_cancel', deferred.reject);
                } else {
                    deferred.resolve();
                }
            };

            AppService.moveToDeviceAsync(appsCollection.ableMoveToDevice(ids)).done(callback);

            return deferred.promise();
        };

        var exportAsync = function (ids, session, path) {
            var deferred = $.Deferred();

            var appsCollection = AppsCollection.getInstance();

            if (ids.length === 1) {
                appsCollection.get(ids[0]).set('running', true);
            }

            IO.requestAsync({
                url : CONFIG.actions.APP_EXPORT,
                data : {
                    package_list : ids.join(','),
                    session : session,
                    source : "frontend_async",
                    export_dir : path || '',
                    default_path : Settings.get('app_export_default_path')
                },
                success : function (resp) {
                    if (ids.length === 1) {
                        appsCollection.get(ids[0]).set('running', false);
                    }

                    if (resp.state_code === 200) {
                        console.log('AppsCollection - Application export success. ');

                        deferred.resolve(resp);
                    } else if (resp.state_code === 402) {
                        console.log('AppsCollection - Application export canceled. ');

                        deferred.reject(resp);
                    } else {
                        console.error('AppsCollection - Application export failed. Error info: ' + resp.state_line);

                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        AppService.batchExportAppsAsync = function (ids) {
            var deferred = $.Deferred();

            var callback = function (resp) {
                var failed = resp.body.failed;

                if (failed && failed.length > 0) {

                    var retryWindowView = RetryWindowView.getInstance({
                        failedApps : failed,
                        tip : i18n.app.APPS_EXPORT_ERROR_TEXT,
                        needConnection : true
                    });

                    retryWindowView.show();

                    retryWindowView.once('button_retry', function () {
                        AppService.exportAppsAsync(_.pluck(failed, 'item')).done(callback).fail(deferred.reject);
                    });

                    retryWindowView.once('button_cancel', function () {
                        exportPath = undefined;
                    });
                } else {
                    deferred.resolve();
                }
            };

            AppService.exportAppsAsync(ids).done(callback).fail(deferred.reject);

            return deferred.promise();
        };

        AppService.exportAppsAsync = function (ids) {
            var deferred = $.Deferred();

            var session = _.uniqueId('app.export_');
            var batchActionWindow;
            if (ids.length > 1) {
                batchActionWindow = new BatchActionWindow({
                    session : session,
                    progressText : i18n.app.APP_EXPORT_PROGRESS,
                    cancelUrl : CONFIG.actions.APP_CANCEL,
                    total : ids.length,
                    successText : i18n.app.APP_EXPORT_SUCCESS,
                    delay : true
                });
            }

            if (!exportPath) {
                var handler = IO.Backend.onmessage({
                    'data.channel' : session
                }, function (data) {
                    if (!exportPath) {
                        exportPath = data.info;
                        IO.Backend.offmessage(handler);
                    }
                });
            }

            exportAsync(ids, session, exportPath).done(function (resp) {
                Settings.set('app_export_default_path', exportPath, true);

                var failed = resp.body.failed;

                if (failed && failed.length > 0) {
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }
                } else {
                    exportPath = null;
                }

                deferred.resolve(resp);
            }).fail(function (resp) {
                if (resp.state_code === 402) {
                    exportPath = null;
                } else {
                    alert(i18n.app.EXPORT_ERROR);
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }
                }

                deferred.reject(resp);
            });

            return deferred.promise();
        };

        AppService.uninstallAppsAsync = function (ids) {
            var deferred = $.Deferred();

            var appsCollection = AppsCollection.getInstance();

            var apps = [];
            var criticalApp = [];
            var systemApp = [];

            appsCollection.each(function (app) {
                if (ids.indexOf(app.id) >= 0) {
                    apps.push(app);

                    if (app.isCritical) {
                        criticalApp.push(app);
                    }

                    if (app.isSystem) {
                        systemApp.push(app);
                    }
                }
            });

            var uninstall = function () {
                var session;
                var batchActionWindow;
                if (ids.length > 1) {
                    session = _.uniqueId('app.batch.uninstall_');

                    batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.app.APP_DELETE_PROGRESS,
                        cancelUrl : CONFIG.actions.APP_CANCEL,
                        total : ids.length,
                        successText : i18n.app.APP_DELETE_SUCCESS
                    });

                    batchActionWindow.show();
                }

                appsCollection.uninstallAppsAsync(ids, session).done(function (resp) {
                    var failed = resp.body.failed;

                    if (failed && failed.length) {

                        if (!Device.get('isUSB') && failed.length < ids.length) {
                            alert(i18n.app.CONFIRM_UNINSTALL_ON_DEVICE);
                        }

                    } else if (!Device.get('isUSB')) {
                        alert(i18n.app.CONFIRM_UNINSTALL_ON_DEVICE);
                    }

                    deferred.resolve(resp);
                }).fail(function (resp) {
                    if (resp.state_code !== 402) {
                        alert(i18n.app.UNINSTALL_ERROR);
                    }

                    deferred.reject(resp);
                }).always(function () {
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }
                });
            };

            if (criticalApp.length > 0) {
                alert(StringUtil.format(i18n.app.ALERT_TIP_CRITICAL_APP, criticalApp[0].get('base_info').name));
            } else if (systemApp.length > 0) {
                var disposableAlert = new AlertWindow({
                    draggable : true,
                    disposableName : 'app-uninstall-system-app',
                    buttonSet : 'yes_no',
                    $bodyContent : StringUtil.format(i18n.app.ALERT_TIP_DEL_SYS_APP_CONFIRM, systemApp.length)
                });

                disposableAlert.once('button_yes', uninstall);

                disposableAlert.show();
            } else {
                confirm(ids.length === 1 ? i18n.app.CONFIRM_UNINSTALL : StringUtil.format(i18n.app.UNINSTALL_TIP, ids.length), uninstall, deferred.reject);
            }

            return deferred.promise();
        };

        AppService.selectAppsDetailAsync = function (files) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_GET_APP_DETAIL,
                data : {
                    file : files
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('AppService - Get selected APKs detail success.');
                        deferred.resolve(resp);
                    } else {
                        console.error('AppService - Get selected APKs detail faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };


        AppService.selectAppsAsync = function (type) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_GET_SELECTED_APK,
                data : {
                    type : type
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('AppService - Get selected APKs success.');
                        deferred.resolve(resp);
                    } else {
                        console.error('AppService - Get selected APKs faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        AppService.hasAutoBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_HAS_BACKUP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        AppService.loadAutoBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_LOAD_BACKUP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        AppService.batchUninstallAsync = function (ids) {
            var deferred = $.Deferred();
            var appsCollection = AppsCollection.getInstance();

            var callback = function (resp) {
                var failed = resp.body.failed;

                if (failed && failed.length > 0){

                    var retryWindowView = RetryWindowView.getInstance({
                        failedApps : failed,
                        tip : i18n.app.APPS_BATCH_UNINSTALL_FAILED,
                        needConnection : true
                    });

                    retryWindowView.show();

                    retryWindowView.once('button_retry', function () {
                        AppService.uninstallAppsAsync(_.pluck(failed, 'item')).done(callback).always(function (resp) {
                            appsCollection.trigger('update');
                        });
                    });

                    retryWindowView.once('button_cancel', deferred.reject);
                } else {
                    deferred.resolve(resp);
                }
            };

            AppService.uninstallAppsAsync(ids).done(callback).always(function (resp) {
                appsCollection.trigger('update');
            });

            return deferred.promise();
        };

        AppService.scanMD5Async = function (packageNames, session) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_GET_MD5,
                data : {
                    package_list : packageNames.join(','),
                    session : session || ''
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        return AppService;
    });
}(this));
