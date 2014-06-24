/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'FunctionSwitch',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'ui/AlertWindow',
        'ui/behavior/ButtonSetMixin'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        FunctionSwitch,
        TemplateFactory,
        UIHelper,
        AlertWindow,
        ButtonSetMixin
    ) {
        console.log('FalshCardView - File loaded');

        var progressHandler;
        var confirmWindow;

        var confirm = function (error, yesCallback, cancelCallback, context) {

            if (_.isUndefined(confirmWindow)) {
                confirmWindow = new AlertWindow({
                    buttonSet : ButtonSetMixin.BUTTON_SET.YES_CANCEL,
                    draggable : true,
                    width : 360,
                    height : 180,
                    title : i18n.tools.FALSH_TITLE
                });
            }

            confirmWindow.$bodyContent = $(doT.template(TemplateFactory.get('tools', 'tools-falsh-confirm'))({
                'error' : error
            }));

            var yesHandler = function () {
                yesCallback.call(context);
            };

            var cancelHandler = function () {
                cancelCallback.call(context);
            };


            confirmWindow.on(UIHelper.EventsMapping.BUTTON_YES, yesHandler);
            confirmWindow.on(UIHelper.EventsMapping.BUTTON_CANCEL, yesHandler);

            var removeHandler = function () {
                confirmWindow.off(UIHelper.EventsMapping.BUTTON_YES, yesHandler);
                confirmWindow.off(UIHelper.EventsMapping.BUTTON_CANCEL, yesHandler);
                confirmWindow.off(UIHelper.EventsMapping.REMOVE, removeHandler);
            };

            confirmWindow.on(UIHelper.EventsMapping.REMOVE, removeHandler);

            confirmWindow.show();
        };

        var FalshCardView = Backbone.View.extend({
            className : 'w-tools-card falsh hbox',
            template : doT.template(TemplateFactory.get('tools', 'tools-falsh-card')),
            initialize : function () {

                var $progressBar;
                var $actionButton;
                var $cancelButton;
                var $desc;
                var $title;

                Object.defineProperties(this, {
                    $progressBar : {
                        get : function () {
                            return $progressBar;
                        },
                        set : function (value) {
                            $progressBar = value;
                        }
                    },
                    $actionButton : {
                        get : function () {
                            return $actionButton;
                        },
                        set : function (value) {
                            $actionButton = value;
                        }
                    },
                    $cancelButton : {
                        get : function () {
                            return $cancelButton;
                        },
                        set : function (value) {
                            $cancelButton = value;
                        }
                    },

                    $desc : {
                        get : function () {
                            return $desc;
                        },
                        set : function (value) {
                            $desc = value;
                        }
                    },
                    $title : {
                        get : function () {
                            return $title;
                        },
                        set : function (value) {
                            $title = value;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                setTimeout(function () {
                    this.$progressBar = this.$('progress');
                    this.$actionButton = this.$('.button-action');
                    this.$cancelButton = this.$('.button-cancel');
                    this.$desc = this.$('.desc');
                    this.$title = this.$('.title');
                }.bind(this), 0);

                return this;
            },
            startFalsh : function () {

                IO.requestAsync({
                    url : CONFIG.actions.TOOLBOX_FALSH_INIT,
                    success : function (resp) {
                        if (resp.body.value) {
                            IO.Backend.Device.offmessage(progressHandler);
                        } else {
                            this.changeStatus(true);
                        }
                    }.bind(this)
                });

                var intervalHandler;
                var timeoutHandler;
                progressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.FALSH_DEVICE_STATUS_CHANGE
                }, function (msg) {

                    if (msg.progress) {
                        this.setProgress(msg.progress);

                        var num = msg.progress;
                        if (num  === 100) {
                            this.$cancelButton.prop('disabled', true);
                            intervalHandler = setInterval(function (){
                                num = 4 + num;
                                this.setProgress(num);
                            }.bind(this), 500);

                            timeoutHandler = setTimeout(function (){
                                this.changeStatus(false);
                                clearInterval(intervalHandler);
                            }.bind(this), 5000);
                        }

                    } else {

                        clearTimeout(timeoutHandler);
                        clearInterval(intervalHandler);

                        this.changeStatus(false);
                        IO.Backend.Device.offmessage(progressHandler);

                        if (msg.error !== 'launch') {
                            confirm(msg.error.toUpperCase(), function (){
                                this.startFalsh();

                                log({
                                    'event' : 'ui.click.shuaji_error_retry'
                                });

                            }, function () {

                                log({
                                    'event' : 'ui.click.shuaji_error_cancel'
                                });

                            }, this);
                        }
                    }
                }, true, this);

            },
            clickActionButton : function () {

                if (!_.isUndefined(progressHandler)) {
                    IO.Backend.Device.offmessage(progressHandler);
                }

                this.startFalsh();

                log({
                    'event' : 'ui.click.shuaji'
                });
            },
            clickCancelButton : function () {
                IO.requestAsync(CONFIG.actions.TOOLBOX_FALSH_CANCEL);
                IO.Backend.Device.offmessage(progressHandler);
                this.changeStatus(false);

                log({
                    'event' : 'ui.click.shuaji_cancel'
                });

            },
            changeStatus : function (showProgress) {

                this.$progressBar.toggle(showProgress);
                this.$desc.toggle(!showProgress);
                this.$actionButton.toggle(!showProgress);
                this.$cancelButton.toggle(showProgress).prop('disabled', !showProgress);
                this.$title.html(showProgress ? i18n.tools.FALSHING_DEVICE : i18n.tools.FALSH_TITLE);
            },
            setProgress : function (num) {
                this.$progressBar.attr('value', num);
            },
            events : {
                'click .button-action' : 'clickActionButton',
                'click .button-cancel' : 'clickCancelButton'
            }
        });

        var falshCardView;
        var factory = {
            getInstance : function (){
                if (!falshCardView) {
                    falshCardView = new FalshCardView();
                }

                return falshCardView;
            }
        };

        return factory;

    });
}(this));
