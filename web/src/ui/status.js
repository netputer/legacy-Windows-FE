/**
 * @fileoverview Process Status widgget
 * @author chenxingrun@wandoujia.com
 *
 */
wonder.addModule('ui/status', function(W) {
    W.namespace('wonder.ui.status');
    W.ui.status = {};
    /**
     * Process Status Model
     * @class
     */
    var Process = Backbone.Model.extend({
        defaults : {
            processing : false
        },
        start : function() {
            this.set({
                processing : true
            });
        },
        finish : function() {
            this.set({
                processing : false
            });
        }
    });
    W.ui.status.Process = Process;

    /**
     * Process Status View
     * @class
     */
    function ProcessView(model) {
        W.ui.UIBase.call(this);
        this.model = model;
        this._isRendered = false;
        this.template = {
            module : 'ui',
            id : 'template-ui-process'
        };
        this.initialize();
    }


    W.extend(ProcessView, W.ui.UIBase);
    W.mix(ProcessView.prototype, {
        changeProcessing : function(model, processing) {
            if(!!processing) {
                this.show();
            } else {
                this.hide();
            }
        },
        show : function() {
            $(this._element).removeClass('wd-invisible');
        },
        hide : function() {
            $(this._element).addClass('wd-invisible');
        },
        initialize : function() {
            this.model.bind('change:processing', $.proxy(this.changeProcessing, this));
        },
        render : function(opt_parent) {
            if(this._isRendered) {
                throw new Error('component has rendered');
            }
            if(!this._element) {
                var tempstr = W.Template.get(this.template.module, this.template.id);
                this._element = $(W.template(tempstr, this.model.toJSON()));
                this._element.appendTo(opt_parent || document.body);
                this._isRendered = true;
            }
        }
    });
    W.ui.status.ProcessView = ProcessView;

    /**
     * Progressbar Status Model
     * @class
     */
    var Progressbar = Process.extend({
        defaults : {
            max : 100,
            progress : 0
        },
        setMax : function(val) {
            this.set({
                max : val
            });
        },
        setProgress : function(val) {
            this.set({
                progress : val
            });
        }
    });
    W.ui.status.Progressbar = Progressbar;

    /**
     * Progressbar Status View
     * @class
     */
    function ProgressbarView(model) {
        this.model = model || new Progressbar();
        ProcessView.call(this, this.model);
        this._isRendered = false;
        this.template = {
            module : 'ui',
            id : 'template-ui-progressbar'
        };
        this.initialize();
    }


    W.extend(ProgressbarView, ProcessView);
    W.mix(ProgressbarView.prototype, {
        setText : function(text) {
            this._element.find('.w-ui-progressbar-label').html(text);
        },
        changeProgress : function(model, progress) {
            $('progress', this._element).attr('value', progress);
            $('.w-ui-progressbar-curr', this._element).text(progress);
        },
        changeMax : function(model, max) {
            $('progress', this._element).attr('max', max);
            $('.w-ui-progressbar-max', this._element).text(max);
        },
        hideMax : function() {
            $('.w-ui-progressbar-max', this._element).hide();
        },
        setDelimiter : function(delimiter) {
            $('.w-ui-progressbar-delimiter', this._element).text(delimiter);
        },
        hideProgress : function() {
            $('.w-ui-progressbar-meter').hide();
        },
        showProgress : function() {
            $('.w-ui-progressbar-meter').show();
        },
        initialize : function() {
            this.model.bind('change:progress', $.proxy(this.changeProgress, this));
            this.model.bind('change:max', $.proxy(this.changeMax, this));
        }
    });
    W.ui.status.ProgressbarView = ProgressbarView;

    /**
     * @constructor Progress
     */
    function Progress(opt) {
        this.model = new W.ui.status.Progressbar();
        this.view = new W.ui.status.ProgressbarView(this.model);
        this.cancelBtn = new W.ui.Button(i18n.ui.CANCEL)
        this.completeBtn = new W.ui.Button(i18n.misc.COMPLETE_TEXT);
        this.interval = null;
        W.ui.Window.call(this, i18n.misc.DIALOG_TIP, '', opt);
        this.session = null;
        this.setDraggable(false);
        this.setSupportEsc(false);
    }


    W.extend(Progress, W.ui.Window);
    W.mix(Progress.prototype, {
        config : {},
        show : function() {
            if(!this._isRendered) {
                this.render();
            }
            Progress._super_.show.call(this);
            this.view.show();
        },
        hide : function() {
            if(!this._isRendered)
                return;
            Progress._super_.hide.call(this);
            this.view.hide();
            this.model.setProgress(0);
            this.model.setMax(100);
            clearInterval(this.interval);
            this.interval = null;
            this.completeBtn.hide();
        },
        setText : function(text) {
            this.view.setText(text);
        },
        setMax : function(val) {
            this.model.setMax(val);
        },
        setCompleteBtnDelay : function(delay) {
            this.completeBtn.setTitle(i18n.misc.COMPLETE_TEXT + '(' + delay + ')');
        },
        setProgress : function(val, max) {
            this.model.setProgress(val);
            if(!isNaN(max)) {//avoid inconsistency when the value of 'max' changes.
                this.model.setMax(max);
            }
            if(val === this.model.get('max')) {
                var self = this;
                var delay = 3;
                this.setCompleteBtnDelay(3);
                this.completeBtn.show();
                if(this.interval) {
                    clearInterval(this.interval);
                }
                this.interval = setInterval(function() {
                    delay -= 1;
                    self.setCompleteBtnDelay(delay);
                    if(delay === 0) {
                        self.finish();
                    }
                }, 1000);
                this.cancelBtn.hide();
            } else {
                this.cancelBtn.show();
            }
        },
        hideProgress : function() {
            this.view.hideProgress();
        },
        showProgress : function() {
            this.view.showProgress();
        },
        setConfig : function(config) {
            this.config = config;
        },
        start : function(progress, max, processText, successText, opt_sessionPrefix, opt_lazyShow, cancelUrl, opt_parent) {
            var sessionId = W.getUid();
            var bindId = opt_sessionPrefix ? opt_sessionPrefix + sessionId : sessionId;
            this.session = bindId;
            this.cancelUrl = cancelUrl;
            this.render(opt_parent);
            if(!opt_lazyShow) {
                this.show();
            }
            this.showProgress();
            this.setProgress(progress);
            this.setMax(max);
            this.setText(processText);

            this.hander = function(data) {
                this.show();
                this.current = data.current;
                this.setProgress(data.current, data.total);
                if(data.current === data.total) {
                    IO.Backend.Device.offmessage(this.handlerId);
                    this.config = null;
                    this.setText(window.StringUtil.format(successText, data.total));
                }
            }

            this.handlerId = IO.Backend.Device.onmessage({
                'data.channel' : bindId
            }, this.hander, this);

            return bindId;
        },
        getCurrent : function() {
            return this.current;
        },
        finish : function() {
            this.hide();
        },
        cancel : function() {
            var self = this;
            IO.Backend.Device.offmessage(this.handlerId);

            W.ajax({
                url : this.cancelUrl,
                data : {
                    session : this.session
                },
                success : function() {
                    if(self.config && self.config.cancelCallback) {
                        self.config.cancelCallback.call(self);
                        self.config.cancelCallback = null;
                    } else {
                        self.hide();
                    }
                }
            });
        },
        render : function(opt_parent) {
            if(!this._isRendered) {
                Progress._super_.render.call(this, opt_parent);
                this._element.addClass('w-ui-progress-window');
                var self = this;
                this.addBodyContent(this.view);

                this.addFooterContent(this.completeBtn);
                this.addFooterContent(this.cancelBtn);
                this.completeBtn.addClassName('primary');
                this.completeBtn.bind('click', this.finish, this);
                this.cancelBtn.bind('click', this.cancel, this);
                //this.maskEl.hide();
                this.closeEl && this.closeEl.hide();
                this.completeBtn.hide();
            }
        }
    });

    W.ui.Progress = Progress;
});
wonder.useModule('ui/status');
