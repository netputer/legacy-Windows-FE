/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Internationalization',
        'IOBackendDevice',
        'Log',
        'utilities/QueryString',
        'Environment',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'ui/Panel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        i18n,
        IO,
        log,
        QueryString,
        Environment,
        AlertWindow,
        TemplateFactory,
        Panel
    ) {
        console.log('Device - File loaded. ');

        var alert = window.alert;

        var Device = Backbone.Model.extend({
            defaults : {
                isConnected : false,
                isMounted : false,
                hasSDCard : false,
                hasEmulatedSD : false,
                isUSB : false,
                isWifi : false,
                isInternet : false,
                isFlashed : false,
                isFastADB : false,
                isDualSIM : false,
                SDKVersion : 0,
                productId : '',
                isRoot : false,
                internalCapacity : 0,
                externalCapacity : 0,
                internalFreeCapacity : 0,
                externalFreeCapacity : 0,
                isAutoBackup : false,
                deviceName : QueryString.get('device_name') || i18n.misc.DEFAULT_DEVICE_NAME,
                udid : '',
                shell : {},
                screenshot : {},
                canScreenshot : false,
                deviceCapacity : 0,
                deviceFreeCapacity : 0,
                internalSDCapacity : 0,
                internalSDFreeCapacity : 0,
                internalSDPath : '',
                externalSDCapacity : 0,
                externalSDFreeCapacity : 0,
                externalSDPath : '',
                dualSIM : [],
                connectionState : CONFIG.enums.CONNECTION_STATE_PLUG_OUT
            },
            initialize : function () {
                var listenBack = false;

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.DEVICE_STATE_CHANGE
                }, function (data) {
                    console.log('Device - Device state change.');
                    listenBack = true;
                    this.changeHandler(data);
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.DEVICE_CONNECTION_STATE_CHANGE,
                }, function (data) {
                    console.log('Device - Device connection state change');
                    this.set({connectionState : data.value.toUpperCase()});
                }, true, this);

                IO.requestAsync(CONFIG.actions.DEVICE_IS_AUTOBACKUP).done(function (resp) {
                    if (resp.state_code === 200) {
                        console.log('Device - Get device autobackup success.');
                        this.offlineChangeHandler(resp.body.value);
                    } else {
                        console.error('Device - Get device autobackup failed. Error info: ' + resp.state_line);
                    }
                }.bind(this));

                this.isUserFlashedAsync().done(this.flashChangeHandler.bind(this));

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.DEVICE_OFFLINE_CHANGE
                }, _.debounce(function (data) {
                    console.log('Device - Device offline change.');
                    this.offlineChangeHandler(data);
                }, 500), this);

                this.on('change:deviceName', function () {
                    this.isUserFlashedAsync().done(this.flashChangeHandler.bind(this));
                }, this);

                this.getUdidAsync().done(function (resp) {
                    this.set('udid', resp.body.value);
                }.bind(this));

                var getShellInfoHandler = function () {

                    if (!this.get('isConnected')) {
                        return;
                    }

                    this.getShellInfoAsync().done(function () {
                        if (Environment.get('deviceId') !== 'Default' && this.get('shell').path) {
                            this.off('change:isConnected', getShellInfoHandler, this);
                        }
                    }.bind(this));
                };

                this.on('change:isConnected', getShellInfoHandler, this);

                var setCanScreenshotAsync = function (Device) {
                    if (Device.get('isConnected')) {
                        if (Device.get('isUSB')) {
                            Device.set('canScreenshot', true);
                        } else {
                            if (Device.get('isWifi')) {
                                Device.canScreenshotAsync().done(function (resp) {
                                    Device.set('canScreenshot', resp.body.value);
                                }.bind(this));
                            } else {
                                Device.set('canScreenshot', false);
                            }
                        }
                    } else {
                        Device.set('canScreenshot', Device.get('isFastADB'));
                    }
                };

                this.on('change:isConnected change:isUSB change:isWifi change:isFastADB', setCanScreenshotAsync, this);

                var setServiceCenterAsync = function () {

                    if (!this.get('isConnected')) {
                        return;
                    }

                    this.getDualSimInfoAsync().done(function (resp) {
                        if (resp.body.sim.length > 0) {
                            this.set({
                                isDualSIM : true,
                                dualSIM : resp.body.sim
                            });
                        } else {
                            this.set({
                                isDualSIM : false,
                                dualSIM : []
                            });
                        }
                    }.bind(this));
                };

                this.on('change:isConnected', setServiceCenterAsync, this);
            },
            getUdidAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync(CONFIG.actions.DEVICE_GET_UDID).done(function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    }
                });

                return deferred;
            },
            offlineChangeHandler : function (data) {
                this.set({
                    isAutoBackup : JSON.parse(data)
                });
            },
            flashChangeHandler : function (resp) {
                this.set({
                    isFlashed : resp.body.value
                });
            },
            changeHandler : function (data) {
                this.set({
                    isConnected : data.connection_state,
                    isMounted : data.mmount_state === 1 ? true : false,
                    hasSDCard : data.mmount_state === 2 ? false : true,
                    hasEmulatedSD : !data.has_non_emulated_external_storage,
                    isUSB : data.type === CONFIG.enums.USB_DEVICE,
                    isWifi : data.type === CONFIG.enums.WIFI_DEVICE,
                    isInternet : data.type === CONFIG.enums.INTERNET_DEVICE,
                    isFastADB : data.type === CONFIG.enums.ADB_DEVICE,
                    SDKVersion : data.sdk_version,
                    productId : data.product_id,
                    isRoot : data.is_root,
                    deviceName : data.device_name
                });

                if (!data.connection_state) {
                    this.set({connectionState : CONFIG.enums.CONNECTION_STATE_PLUG_OUT});
                }
            },
            getSDCapacityAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_GET_EXTERNAL_ROOM,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Get external capacity success.');
                            this.set({
                                externalCapacity : parseInt(resp.body.total_size, 10),
                                externalFreeCapacity : parseInt(resp.body.available_size, 10),
                                internalSDCapacity : parseInt(resp.body.total_size, 10),
                                internalSDFreeCapacity : parseInt(resp.body.available_size, 10)
                            });
                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Get external capacity failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getDeviceCapacityAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_GET_INTERNAL_ROOM,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Get internal capacity success.');
                            this.set({
                                internalCapacity : parseInt(resp.body.total_size, 10),
                                internalFreeCapacity : parseInt(resp.body.available_size, 10),
                                deviceCapacity : parseInt(resp.body.total_size, 10),
                                deviceFreeCapacity : parseInt(resp.body.available_size, 10)
                            });
                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Get internal capacity failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getCapacityAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_GET_CAPACITY,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Get device capacity success.');

                            var data = {
                                deviceCapacity : 0,
                                deviceFreeCapacity : 0,
                                internalSDCapacity : 0,
                                internalSDFreeCapacity : 0,
                                internalSDPath : '',
                                externalSDCapacity : 0,
                                externalSDFreeCapacity : 0,
                                externalSDPath : ''
                            };

                            _.each(resp.body.storage_infos, function (info) {
                                if (info.is_emulated === true &&
                                        parseInt(info.total_size, 10) === data.deviceCapacity) {
                                    return;
                                }

                                switch (info.type) {
                                case 0:
                                    data.deviceCapacity = parseInt(info.total_size, 10);
                                    data.deviceFreeCapacity = parseInt(info.available_size, 10);
                                    break;
                                case 1:
                                    data.internalSDCapacity = parseInt(info.total_size, 10);
                                    data.internalSDFreeCapacity = parseInt(info.available_size, 10);
                                    data.internalSDPath = info.path || '';
                                    break;
                                case 2:
                                    data.externalSDCapacity = parseInt(info.total_size, 10);
                                    data.externalSDFreeCapacity = parseInt(info.available_size, 10);
                                    data.externalSDPath = info.path || '';
                                    break;
                                }
                            }, this);

                            this.set(data);
                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Get device capacity failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            manageSDCardAsync : function (path) {
                var deferred = $.Deferred();

                if (this.get('isInternet')) {
                    alert(i18n.welcome.MANAGE_SD_INTERNET);
                } else {
                    var execute = function () {
                        var showAlert = function (content) {
                            var alertDialog = new AlertWindow({
                                draggable : true,
                                buttonSet : 'retry_cancel',
                                $bodyContent : content
                            });

                            alertDialog.on('button_retry', function () {
                                this.manageSDCardAsync();
                                alertDialog.close();
                            }, this);

                            alertDialog.show();
                        };

                        IO.requestAsync({
                            url  : CONFIG.actions.DEVICE_OPEN_SD_CARD,
                            data : {
                                path : path || ''
                            },
                            success : function (resp) {
                                if (resp.state_code === 200) {
                                    console.log('Device - Open SD card success.');
                                    deferred.resolve(resp);
                                } else {
                                    console.log('Device - Open SD card failed. Error info: ' + resp.state_line);

                                    switch (resp.state_code) {
                                    case 500:
                                        showAlert(i18n.welcome.MANAGE_SD_UNCONNECT);
                                        break;
                                    case 703:
                                        showAlert(doT.template(TemplateFactory.get('misc', 'sd-mount'))({}));
                                        break;
                                    case 702:
                                        alert(i18n.misc.ALERT_TIP_NO_SD_CARD);
                                        break;
                                    case 745:
                                        var $content = $('<div>').html(i18n.misc.MTP_BLOCK_BY_SCREEN_LOCK);
                                        var alertDialog = new AlertWindow({
                                            draggable : true,
                                            buttonSet : 'retry_cancel',
                                            $bodyContent : $content
                                        });

                                        alertDialog.on('button_retry', function () {
                                            this.manageSDCardAsync();
                                            alertDialog.close();
                                        }, this);

                                        $content.one('click', '.button-ftp', function () {
                                            IO.requestAsync({
                                                url : CONFIG.actions.DEVICE_OPEN_SD_CARD,
                                                data : {
                                                    use_ftp_directly : 1
                                                }
                                            });
                                            alertDialog.close();
                                        });

                                        var handler = setInterval(function () {
                                            IO.requestAsync(CONFIG.actions.DEVICE_OPEN_SD_CARD).done(function (resp) {
                                                if (resp.state_code === 200) {
                                                    alertDialog.close();
                                                    log({
                                                        'event' : 'debug.device_mtp_retry_success'
                                                    });
                                                }
                                            });
                                        }, 5000);

                                        alertDialog.on('remove', function () {
                                            clearInterval(handler);
                                            $content.remove();
                                        });

                                        alertDialog.show();
                                        log({
                                            'event' : 'ui.show.device_mtp_block_show'
                                        });
                                        break;
                                    default:
                                        alert(i18n.welcome.MANAGE_SD_ERROR);
                                        break;
                                    }

                                    deferred.reject(resp);
                                }
                            }
                        });
                    }.bind(this);

                    IO.requestAsync(CONFIG.actions.DEVICE_CHECK_FTP_REG).done(function (resp) {
                        if (resp.body.value) {
                            execute.call(this);
                        } else {
                            var alertWindow = new Panel({
                                buttons : [{
                                    $button : $('<button>').html(i18n.misc.FIX).addClass('primary'),
                                    eventName : 'button_yes'
                                }, {
                                    $button : $('<button>').html(i18n.misc.OPEN_DERICTLY),
                                    eventName : 'button_no'
                                }],
                                $bodyContent : i18n.misc.FTP_FIX,
                                title : i18n.misc.MANAGE_SD_CARD
                            });

                            alertWindow.on('button_yes', function () {
                                IO.requestAsync(CONFIG.actions.DEVICE_FIX_FTP).done(function () {
                                    execute.call(this);
                                }).fail(function () {
                                    alert(i18n.misc.FIX_FAILED);
                                });
                            }, this);

                            alertWindow.on('button_no', function () {
                                execute.call(this);
                            }, this);

                            alertWindow.show();
                        }
                    });
                }

                return deferred.promise();
            },
            getBatteryInfoAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_GET_BATTERY,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Get battery info success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Get battery info failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            getWallpaperAsync : function (height, width) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_GET_WALLPAPER,
                    data : {
                        height : height,
                        width : width
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Get wallpaper image success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Get welcome wallpaper faild:' + resp.state_code);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            getScreenshotAsync : function (compress) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_GET_SCREENSHOT_INFO,
                    data : {
                        compress : compress !== undefined ? Number(compress) : 0
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Get display info success.', resp);

                            this.set({
                                screenshot : {
                                    rotation : resp.body.display_info.rotation,
                                    path : resp.body.screenshot.file || '',
                                    date : new Date().getTime()
                                }
                            });

                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Get display info failed: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getShellInfoAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_GET_SHELL,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Get shell info success.', resp);

                            this.set({
                                shell : {
                                    width : resp.body.shell_width,
                                    height : resp.body.shell_height,
                                    path : resp.body.shell_file,
                                    screenshot : resp.body.screenshot
                                }
                            });

                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Get shell info failed: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            screenShotAsync : function (type, wrapWithShell) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SCREEN_SHOT,
                    data : {
                        save_as : type,
                        image_type : wrapWithShell
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('Device - Screen shot success.', resp);

                            deferred.resolve(resp);
                        } else {
                            console.error('Device - Screen shot failed: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            isDeviceAutoBackupAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_IS_AUTOBACKUP,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            isUserFlashedAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.IS_USER_FLASHED,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            getIsUserFlashed : function () {
                this.isUserFlashedAsync().done(function (resp) {
                    if (resp.state_code === 200) {
                        console.log('Device - Get device is isFlashed success.');
                        this.flashChangeHandler(resp.body.value);
                    } else {
                        console.error('Device - Get device is isFlashed failed. Error info: ' + resp.state_line);
                    }
                }.bind(this));
            },
            canScreenshotAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_CAN_SCREENSHOT_WIFI,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            getDualSimInfoAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_GET_SERVICE_CENTER,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MessageService - Get SMS service center success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('MessageService - Get SMS service center faild. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            }
        });

        var device = new Device();

        device.on('change:isConnected', function (Device, isConnected) {
            $('body').toggleClass('connected', isConnected)
                        .toggleClass('disconnected', !isConnected);
        });

        $('body').toggleClass('connected', device.get('isConnected'))
                    .toggleClass('disconnected', !device.get('isConnected'));

        window.Device = device;

        return device;
    });
}(this));
