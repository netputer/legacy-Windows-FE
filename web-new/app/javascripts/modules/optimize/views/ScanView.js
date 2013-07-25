/*global console, define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'Log',
        'Internationalization',
        'Settings',
        'IOBackendDevice',
        'Device',
        'optimize/OptimizeService',
        'optimize/views/InstallProgressView',
        'app/collections/AppsCollection',
        'app/AppService',
        'app/views/OneKeyUpdateWindowView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        AlertWindow,
        StringUtil,
        log,
        i18n,
        Settings,
        IO,
        Device,
        OptimizeService,
        InstallProgressView,
        AppsCollection,
        AppService,
        OneKeyUpdateWindowView
    ) {
        console.log('ScanView - File loaded.');

        var confirm = window.confirm;
        var alert = window.alert;
        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;
        var setTimeout = window.setTimeout;

        var itemCount = 0;

        var ramResult = [];
        var ramCount = 0;
        var cacheResult = [];
        var cacheCount = 0;
        var virusResult = [];

        var resetResult = function () {
            ramResult.length = 0;
            ramCount = 0;
            cacheResult.length = 0;
            cacheCount = 0;
            virusResult.length = 0;
        };

        var ScanProgressView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('optimize', 'scan-progress')),
            className : 'w-optimize-scan-progress hbox',
            initialize : function () {
                Device.on('change:isConnected change:isUSB', function (Device) {
                    this.$('.button-optimize-all, .button-optimize-virus, .button-optimize-cache, .button-optimize-ram').prop({
                        disabled : !Device.get('isConnected') || !Device.get('isUSB')
                    });
                }, this);
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            setProgress : function (item) {
                this.$('.tip').html(StringUtil.format(i18n.optimize.SCAN_TIP, itemCount, item.package_name));
                itemCount++;
            },
            finishScan : function () {
                if (ramResult.length + cacheResult.length + virusResult.length !== 0) {
                    this.$('.scanning').removeClass('scanning').addClass('warn');
                    this.$('.title').html(i18n.optimize.OPTIMIZE_TIP);
                    this.$('.tip').html(i18n.optimize.FINISH_TIP + i18n.optimize.ACTION_TIP);
                    this.$('.progress-ctn').remove();
                    this.$('button').removeClass('button-cancel').addClass('button-optimize-all').html('').show().prop({
                        disabled : !Device.get('isConnected') || !Device.get('isUSB')
                    });
                } else {
                    this.setToFinishi();
                }
            },
            setToOptimizing : function () {
                this.$('.warn, .finish').removeClass('warn finish').addClass('scanning');
                this.$('.title').html(i18n.optimize.OPTIMIZING);
                this.$('.tip').hide();
                this.$('.progress-ctn').remove();
                this.$('button').hide();
            },
            setToFinishi : function () {
                this.$('.scanning, .warn').removeClass('scanning warn').addClass('finish');
                this.$('.title').html(i18n.optimize.OPTIMIZE_FINISH);
                this.$('.progress-ctn').remove();
                this.$('.tip').html(i18n.optimize.ACTION_TIP).show();
                this.$('button').hide();
            },
            cancel : function () {
                this.$('.scanning, .finish').removeClass('scanning finish').addClass('warn');
                this.$('.title').html(i18n.optimize.CANCEL_TIP);
                this.$('.tip').html(i18n.optimize.ACTION_TIP);
                this.$('button, .progress-ctn').remove();
            }
        });

        var scanProgressView;

        var ScanMonitorView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('optimize', 'scan-monitor')),
            className: 'w-optimize-scan-monitor',
            initialize : function () {
                AppsCollection.getInstance().on('refresh', function (appsCollection) {
                    var updatableApps = appsCollection.getUpdatableApps();

                    this.$('.update').toggle(updatableApps.length !== 0).find('.tip').html(StringUtil.format(i18n.optimize.UPDATE_TIP, updatableApps.length));
                    this.$('.suggestion-title').html(StringUtil.format(i18n.optimize.SUGGESTION_TITLE, this.$('.suggestion li:visible').length)).toggle(this.$('.suggestion li:visible').length !== 0);
                }, this);
            },
            render : function () {
                this.$el.html(this.template({}));

                var updatableApps = AppsCollection.getInstance().getUpdatableApps();

                setTimeout(function () {
                    this.$('.update').toggle(updatableApps.length !== 0).find('.tip').html(StringUtil.format(i18n.optimize.UPDATE_TIP, updatableApps.length));
                    this.$('.suggestion-title').html(StringUtil.format(i18n.optimize.SUGGESTION_TITLE, this.$('.suggestion li:visible').length)).toggle(this.$('.suggestion li:visible').length !== 0);
                    this.$('.finish-title').hide();
                    this.$('.optimize-title').hide();
                }.bind(this), 0);

                this.$('.button-optimize-virus, .button-optimize-cache, .button-optimize-ram').prop({
                    disabled : !Device.get('isConnected') || !Device.get('isUSB')
                });
                return this;
            },
            setProgress : function (item) {
                switch (item.type) {
                case OptimizeService.enums.OPTIMIZE_TYPE_VIRUS:
                    if (item.virus_type === 2 ||
                            item.virus_type === 3) {
                        virusResult.push(item);
                        this.$('.optimize .virus').css({
                            display : '-webkit-box'
                        }).find('.tip').html(StringUtil.format(i18n.optimize.VIRUS_TIP, virusResult.length));
                    }
                    break;
                case OptimizeService.enums.OPTIMIZE_TYPE_RAM:
                    ramResult.push(item);
                    ramCount += parseInt(item.ram_size, 0);
                    this.$('.optimize .ram').css({
                        display : '-webkit-box'
                    }).find('.tip').html(StringUtil.format(i18n.optimize.RAM_TIP, ramResult.length, StringUtil.readableSize(ramCount)));
                    break;
                case OptimizeService.enums.OPTIMIZE_TYPE_CACHE:
                    cacheResult.push(item);
                    cacheCount += parseInt(item.cache_size, 0);
                    this.$('.optimize .cache').css({
                        display : '-webkit-box'
                    }).find('.tip').html(StringUtil.format(i18n.optimize.CACHE_TIP, cacheResult.length, StringUtil.readableSize(cacheCount)));
                    break;
                }
                this.$('.optimize-title').show().html(StringUtil.format(i18n.optimize.OPTIMIZE_TITLE, this.$('.optimize li:visible').length)).toggle(this.$('.optimize li:visible').length !== 0);
            },
            setRunning : function (type) {
                var $targetTask;
                switch (type) {
                case OptimizeService.enums.OPTIMIZE_TYPE_VIRUS:
                    $targetTask = this.$('.virus .icon');
                    this.$('.virus .link').prop({
                        disabled : true
                    });
                    break;
                case OptimizeService.enums.OPTIMIZE_TYPE_RAM:
                    $targetTask = this.$('.ram .icon');
                    this.$('.ram .link').prop({
                        disabled : true
                    });
                    break;
                case OptimizeService.enums.OPTIMIZE_TYPE_CACHE:
                    $targetTask = this.$('.cache .icon');
                    this.$('.cache .link').prop({
                        disabled : true
                    });
                    break;
                }
                $targetTask.removeClass('icon-warn').addClass('icon-running');
            },
            setFinishi : function (type) {
                switch (type) {
                case OptimizeService.enums.OPTIMIZE_TYPE_VIRUS:
                    this.$('.finish .virus').css({
                        display : '-webkit-box'
                    }).find('.tip').html(this.$('.optimize .virus .tip').html());
                    this.$('.optimize .virus').remove();

                    virusResult.length = 0;
                    break;
                case OptimizeService.enums.OPTIMIZE_TYPE_RAM:
                    this.$('.finish .ram').css({
                        display : '-webkit-box'
                    }).find('.tip').html(StringUtil.format(i18n.optimize.RAM_FINISH, StringUtil.readableSize(ramCount)));
                    this.$('.optimize .ram').remove();

                    ramResult.length = 0;
                    ramCount = 0;
                    break;
                case OptimizeService.enums.OPTIMIZE_TYPE_CACHE:
                    this.$('.finish .cache').css({
                        display : '-webkit-box'
                    }).find('.tip').html(StringUtil.format(i18n.optimize.CACHE_FINISH, StringUtil.readableSize(cacheCount)));
                    this.$('.optimize .cache').remove();

                    cacheResult.length = 0;
                    cacheCount = 0;
                    break;
                }
                this.$('.finish-title').toggle(true).html(StringUtil.format(i18n.optimize.FINISH_TITLE, this.$('.finish li:visible').length));
                this.$('.optimize-title').html(StringUtil.format(i18n.optimize.OPTIMIZE_TITLE, this.$('.optimize li:visible').length)).toggle(this.$('.optimize li:visible').length !== 0);
                if (virusResult.length + ramResult.length + cacheResult.length === 0) {
                    scanProgressView.setToFinishi();
                }
            }
        });

        var scanDelegate;
        var scanHandle;
        var scanResult = [];

        var resetScanState = function () {
            IO.Backend.offmessage(scanHandle);

            var setProgressToFinish = function () {
                clearInterval(scanDelegate);
                scanDelegate = undefined;
                itemCount = 0;
            };

            if (scanResult.length === 0) {
                setProgressToFinish();
            } else {
                var delegate = setInterval(function () {
                    if (scanResult.length === 0) {
                        clearInterval(delegate);
                        setProgressToFinish();
                    }
                }, 50);
            }
        };

        var scanMonitorView;

        var errorHandler = function () {
            alert(i18n.optimize.OPTIMIZE_ERROR);
            this.render();
        };

        var optimizeVirusAsync = function () {
            var deffered = $.Deferred();

            scanProgressView.$('.button-optimize-all').prop({
                disabled : true
            });

            AppService.uninstallAppsAsync(virusResult).done(function (resp) {
                scanMonitorView.setFinishi(OptimizeService.enums.OPTIMIZE_TYPE_VIRUS);

                deffered.resolve(resp);

                log({
                    'event' : 'debug.optimize.optimize.finish',
                    'cate' : 'virus'
                });
            }).fail(deffered.reject).always(function () {
                scanProgressView.$('.button-optimize-all').prop({
                    disabled : false
                });
            });

            return deffered.promise();
        };

        var optimizeRamAsync = function () {
            var deffered = $.Deferred();

            scanProgressView.$('.button-optimize-all').prop({
                disabled : true
            });

            scanMonitorView.setRunning(OptimizeService.enums.OPTIMIZE_TYPE_RAM);
            OptimizeService.optimizeRamAsync(_.pluck(ramResult, 'package_name')).done(function (resp) {
                scanMonitorView.setFinishi(OptimizeService.enums.OPTIMIZE_TYPE_RAM);

                deffered.resolve(resp);

                log({
                    'event' : 'debug.optimize.optimize.finish',
                    'cate' : 'ram'
                });
            }).fail(function (resp) {
                errorHandler.call(this);
                deffered.reject(resp);
            }.bind(this)).always(function () {
                scanProgressView.$('.button-optimize-all').prop({
                    disabled : false
                });
            });

            return deffered.promise();
        };

        var optimizeCacheAsync = function () {
            var deffered = $.Deferred();

            scanProgressView.$('.button-optimize-all').prop({
                disabled : true
            });

            scanMonitorView.setRunning(OptimizeService.enums.OPTIMIZE_TYPE_CACHE);
            OptimizeService.optimizeCacheAsync().done(function (resp) {
                scanMonitorView.setFinishi(OptimizeService.enums.OPTIMIZE_TYPE_CACHE);

                deffered.resolve(resp);

                log({
                    'event' : 'debug.optimize.optimize.finish',
                    'cate' : 'cache'
                });
            }).fail(function (resp) {
                errorHandler.call(this);
                deffered.reject(resp);
            }.bind(this)).always(function () {
                scanProgressView.$('.button-optimize-all').prop({
                    disabled : false
                });
            });

            return deffered.promise();
        };

        var ScanView = Backbone.View.extend({
            className : 'w-optimize-scan vbox',
            template : doT.template(TemplateFactory.get('optimize', 'scan')),
            initialize : function () {
                Device.on('change:isConnected change:isUSB', function (Device) {
                    var disable = !Device.get('isConnected') || !Device.get('isUSB');
                    this.$('.button-scan').prop({
                        disabled : disable
                    });
                    this.$('.wifi-tip').toggle(disable);
                }, this);
            },
            checkState : function () {
                OptimizeService.checkAsync().done(function (resp) {
                    var state = resp.body.value;
                    switch (state) {
                    case 1:
                        confirm(i18n.optimize.INSTALL_DES, function () {
                            this.installAPK();
                            log({
                                'event' : 'ui.click.install.confirm',
                                'type' : 'install',
                                'actions' : 'yes'
                            });
                        }, function () {
                            log({
                                'event' : 'ui.click.install.confirm',
                                'type' : 'install',
                                'actions' : 'cancel'
                            });
                        }, this);
                        break;
                    case 2:
                        confirm(i18n.optimize.UPDATE_DES, function () {
                            this.installAPK();
                            log({
                                'event' : 'ui.click.install.confirm',
                                'type' : 'update',
                                'actions' : 'yes'
                            });
                        }, function () {
                            log({
                                'event' : 'ui.click.install.confirm',
                                'type' : 'update',
                                'actions' : 'cancel'
                            });
                        }, this);
                        break;
                    case 3:
                        this.startScan();
                        break;
                    }

                    log({
                        'event' : 'debug.optimize.check.result',
                        'value' : state
                    });
                }.bind(this));
            },
            installAPK : function () {
                this.$('.button-scan').prop({
                    disabled : true
                });

                OptimizeService.installAsync().done(function (resp) {
                    var installProgressView = InstallProgressView.getInstance({
                        taskId : resp.body.value
                    });
                    this.$('.progress').replaceWith(installProgressView.render().$el);

                    var finishHandler = function () {
                        this.startScan();
                        this.$('.button-scan').prop({
                            disabled : false
                        });

                        log({
                            'event' : 'debug.optimize.install.finish'
                        });

                        installProgressView.off('finish', finishHandler);
                    };

                    installProgressView.on('finish', finishHandler, this);

                    var removeHandler = function () {
                        this.render();
                        installProgressView.off('remove', removeHandler);
                    };

                    installProgressView.on('remove', removeHandler, this);
                }.bind(this));

                log({
                    'event' : 'debug.optimize.installStart'
                });
            },
            finishScan : function () {
                Settings.set('tx-last-time', new Date().getTime(), true);
            },
            startScan : function () {
                resetResult.call();

                var session = _.uniqueId('optimize.scan_');

                scanProgressView = new ScanProgressView();
                scanMonitorView = new ScanMonitorView();

                this.$('.progress').html(scanProgressView.render().$el);
                this.$('.monitor').html(scanMonitorView.render().$el);

                scanHandle = IO.Backend.onmessage({
                    'data.channel' : session
                }, this.setScanProgress, this);

                OptimizeService.scanAsync(session).done(function () {
                    this.finishScan();

                    var delegate = setInterval(function () {
                        if (scanResult.length === 0) {
                            scanProgressView.finishScan();
                            clearInterval(delegate);
                        }
                    }, 25);

                    log({
                        'event' : 'debug.optimize.scan.finish'
                    });
                }.bind(this)).fail(function (resp) {
                    scanResult.length = 0;
                    if (resp.state_code === 402) {
                        scanProgressView.cancel();
                    } else {
                        alert(i18n.optimize.SCAN_FAILED);
                        resetResult.call(this);
                        this.render();
                    }
                }.bind(this)).always(resetScanState);

                log({
                    'event' : 'debug.optimize.scanStart'
                });
            },
            setScanProgress : function (data) {
                scanResult = scanResult.concat(data.item);
                scanProgressView.$('.progress-inside').addClass('wrap').css({
                    width : data.progress + '%'
                });

                if (!scanDelegate) {
                    scanDelegate = setInterval(function () {
                        var item = scanResult.shift();
                        if (item) {
                            scanProgressView.setProgress(item);
                            scanMonitorView.setProgress(item);
                        }
                    }, 50);
                }
            },
            render : function () {
                this.$el.html(this.template({}));

                var lastScanDate = Settings.get('tx-last-time');

                var diff = new Date().getTime() - parseInt(lastScanDate, 10);
                diff = Math.round(diff / 1000 / 3600 * 100) / 100;
                this.$('.tip').html(lastScanDate ? StringUtil.format(i18n.optimize.LAST_TIME_TIP, diff) : i18n.optimize.NEVER_TIP);

                this.$('.button-scan').prop({
                    disabled : !Device.get('isConnected') ||
                                !Device.get('isUSB')
                });

                setTimeout(function () {
                    this.$('.wifi-tip').toggle(!Device.get('isConnected') ||
                                                !Device.get('isUSB'));
                }.bind(this), 0);

                return this;
            },
            clickButtonScan : function () {
                this.checkState();
            },
            clickButtonCancel : function () {
                this.$('.button-cancel').prop({
                    disabled : true
                });

                OptimizeService.cancelAsync();

                log({
                    'event' : 'debug.optimize.scan.cancel'
                });
            },
            clickButtonOptimizeAll : function () {
                var queue = [];

                if (virusResult.length > 0) {
                    queue.push(optimizeVirusAsync);
                }
                if (ramResult.length > 0) {
                    queue.push(optimizeRamAsync);
                }
                if (cacheResult.length > 0) {
                    queue.push(optimizeCacheAsync);
                }

                if (queue.length > 0) {
                    scanProgressView.setToOptimizing();
                    queue[0].call(this).always(function () {
                        if (queue[1]) {
                            queue[1].call(this).always(function () {
                                if (queue[2]) {
                                    queue[2].call(this).always(function () {
                                        scanProgressView.setToFinishi();
                                    });
                                } else {
                                    scanProgressView.setToFinishi();

                                    log({
                                        'event' : 'debug.optimize.optimize.all.finish'
                                    });
                                }
                            });
                        } else {
                            scanProgressView.setToFinishi();

                            log({
                                'event' : 'debug.optimize.optimize.all.finish'
                            });
                        }
                    });
                } else {
                    scanProgressView.setToFinishi();
                }

                log({
                    'event' : 'ui.click.optimize.button.optimize.all'
                });
            },
            clickButtonOptimizeVirus : function () {
                optimizeVirusAsync.call(this);
                log({
                    'event' : 'ui.click.optimize.button.optimize',
                    'cate' : 'virus'
                });
            },
            clickButtonOptimizeCache : function () {
                optimizeCacheAsync.call(this);
                log({
                    'event' : 'ui.click.optimize.button.optimize',
                    'cate' : 'cache'
                });
            },
            clickButtonOptimizeRam : function () {
                optimizeRamAsync.call(this);
                log({
                    'event' : 'ui.click.optimize.button.optimize',
                    'cate' : 'ram'
                });
            },
            clickButtonUpdateAll : function () {
                OneKeyUpdateWindowView.getInstance().show();
            },
            clickButtonRestart : function () {
                this.checkState();

                log({
                    'event' : 'ui.click.optimize.button.restart'
                });
            },
            clickButtonBackward : function () {
                this.render();

                log({
                    'event' : 'ui.click.optimize.button.backward'
                });
            },
            events : {
                'click .button-optimize-all' : 'clickButtonOptimizeAll',
                'click .button-scan' : 'clickButtonScan',
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-optimize-virus' : 'clickButtonOptimizeVirus',
                'click .button-optimize-cache' : 'clickButtonOptimizeCache',
                'click .button-optimize-ram' : 'clickButtonOptimizeRam',
                'click .button-update-all' : 'clickButtonUpdateAll',
                'click .button-restart' : 'clickButtonRestart',
                'click .button-backward' : 'clickButtonBackward'
            }
        });

        var scanView;

        var factory = _.extend({
            getInstance : function () {
                if (!scanView) {
                    scanView = new ScanView();
                }
                return scanView;
            }
        });

        return factory;
    });
}(this));
