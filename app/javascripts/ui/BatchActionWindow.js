/*global define*/
(function (window) {
    define([
        'doT',
        'jquery',
        'ui/UIHelper',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Internationalization',
        'IO',
        'WindowController'
    ], function (
        doT,
        $,
        UIHelper,
        AlertWindow,
        TemplateFactory,
        StringUtil,
        i18n,
        IO,
        WindowController
    ) {
        console.log('BatchActionWindow - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

        var CLASS_MAPPING = {
            BUTTON_CTN : '.w-ui-window-footer-button-ctn'
        };

        var BatchActionWindow = AlertWindow.extend({
            initialize : function () {
                BatchActionWindow.__super__.initialize.apply(this, arguments);

                var total = 0;
                var progress = 0;
                var blockWindow = true;
                Object.defineProperties(this, {
                    total : {
                        set : function (value) {
                            total = parseInt(value, 10);
                            this.$('.total').html(total);
                            this.$('progress').attr({
                                max : total * 100
                            });
                        },
                        get : function () {
                            return total;
                        }
                    },
                    progress : {
                        set : function (value) {
                            progress = parseInt(value, 10);
                            this.$('.progress').html(progress);
                        },
                        get : function () {
                            return progress;
                        }
                    },
                    progressBar :  {
                        set : function (value) {
                            this.$('progress').attr({
                                value : value
                            });
                        }
                    },
                    blockWindow : {
                        set : function (value) {
                            blockWindow = value;
                        },
                        get : function () {
                            return blockWindow;
                        }
                    }
                });

                this.height = 140;
                this.width = 360;
                this.disableX = true;

                var sessionHandler = IO.Backend.onmessage({
                    'data.channel' : this.options.session
                }, function (data) {
                    if (this.options.delay) {
                        if (!this.$el.is(':visible')) {
                            this.show();
                        }
                    }

                    this.progress = data.current;
                    this.progressBar = Math.max(data.current * 100 + (data.current_progress || 0), 0);
                    this.total = data.total;
                    if (data.current === data.total) {
                        IO.Backend.offmessage(sessionHandler);

                        this.$('.tip').html(StringUtil.format(this.options.successText, data.total));

                        this.$(CLASS_MAPPING.BUTTON_CTN).empty();
                        this.addButton($('<button>').addClass('button-yes').html(i18n.ui.CONFIRM), EventsMapping.BUTTON_YES);

                        this.delay = 3000;
                        this.initAutoClose();
                        this.countDown();

                        if (this.options.oncomplate) {
                            this.options.oncomplate.apply(this);
                        }
                    }
                }, this);

                var removeHandler = function () {
                    IO.Backend.offmessage(sessionHandler);
                    this.off(EventsMapping.REMOVE, removeHandler);
                    if (this.blockWindow) {
                        WindowController.releaseWindowAsync();
                    }
                };
                this.on(EventsMapping.REMOVE, removeHandler);

                this.on(EventsMapping.BUTTON_CANCEL, function () {
                    IO.requestAsync({
                        url : this.options.cancelUrl,
                        data : {
                            session : this.options.session
                        }
                    }).always(function () {
                        IO.Backend.offmessage(sessionHandler);
                    }.bind(this));
                }, this);

                this.on(EventsMapping.BUTTON_YES, this.remove, this);
            },
            render : function () {
                BatchActionWindow.__super__.render.apply(this, arguments);

                this.$bodyContent = doT.template(TemplateFactory.get('ui', 'batch-action-body'))({});
                this.$('.tip').html(this.options.progressText);
                this.total = this.options.total;

                this.addButton($('<button>').html(i18n.ui.CANCEL), EventsMapping.BUTTON_CANCEL);
            },
            show : function () {
                BatchActionWindow.__super__.show.apply(this, arguments);
                if (this.blockWindow) {
                    WindowController.blockWindowAsync();
                }
            }
        });

        return BatchActionWindow;
    });
}(this));
