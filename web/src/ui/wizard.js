/**
 * @fileoverview
 * @author chenxingrun@wandoujia.com
 */

wonder.addModule('ui/wizard', function(W) {
    wonder.namespace('wonder.ui');
    var locale = i18n.ui;

    /**
     * Wizard View
     * @class
     */
    function Wizard() {
        W.ui.UIBase.call(this);
        this._isRendered = false;
        this._data = {};
        this._pages = [];

        this._model = new Backbone.Model({
            'step' : 1,
            'total' : 0,
            'data' : {}
        });
        this.buttons = {
            prev : new W.ui.Button(locale.PREV),
            next : new W.ui.Button(locale.NEXT),
            cancel : new W.ui.Button(locale.CANCEL),
            finish : new W.ui.Button(locale.FINISH)
        };
    }


    W.extend(Wizard, W.ui.UIBase);
    W.mix(Wizard.prototype, {
        initialize : function() {
            this._model.unbind();
            this._model.bind('change:step', $.proxy(this.onChangeStep, this));
            this._model.bind('change:total', $.proxy(this.onChangeTotal, this));
        },
        addPage : function(view) {
            var total = this._model.get('total');
            view._idx = total;
            this._pages.push(view);
            this._model.set({
                'total' : total + 1
            });
            return this;
        },
        renderPage : function(view) {
            var step = view._idx + 1;
            var el = $('<div class="w-ui-wizard-step step-' + step + '"/>');
            view.render(el);
            if(step > 1) {
                view.hide();
            }
            el.appendTo(this._contentEl);
        },
        prev : function() {
            this.go(-1);
        },
        next : function() {
            this.go(1);
        },
        go : function(delta) {
            var step = this._model.get('step');
            var total = this._model.get('total');
            var target = step + delta;
            if(target > 0 && target <= total) {
                this._pages[step - 1].hide();
                $('.step-' + step, this._contentEl).hide();
                $('.step-' + target, this._contentEl).show();
                this._model.set({
                    'step' : target
                });
                var view = this._pages[target - 1];
                view.show();
                this.resetButtonsStatus();
                if(view._btnCfg) {
                    this.updateButtonsStatus(view._btnCfg);
                }
            }
        },
        cancel : function() {
            throw new Error('no implements');
        },
        finish : function() {
            throw new Error('no implements');
        },
        onChangeStep : function(model, step) {
        },
        onChangeTotal : function(model, step) {
        },
        updateButtonsStatus : function(cfgs) {
            for(var name in cfgs) {
                var cfg = cfgs[name];
                var btn = this.buttons[name];
                if(btn) {
                    if(cfg.title) {
                        btn.setTitle(cfg.title);
                    }
                    btn.setDisabled(!cfg.enable);
                    cfg.show ? btn.show() : btn.hide();
                }
            }
        },
        resetButtonsStatus : function() {
            var step = this._model.get('step');
            var total = this._model.get('total');
            var buttons = this.buttons;
            var cfgs = {};
            if(step < total) {
                cfgs.next = {
                    show : true,
                    enable : true
                };
            } else {
                cfgs.next = {
                    show : false
                };
            }
            if(step > 1) {
                cfgs.prev = {
                    show : true,
                    enable : true
                };
            } else {
                cfgs.prev = {
                    show : false
                };
            }
            if(step == total) {
                cfgs.cancel = {
                    show : false
                };
                cfgs.finish = {
                    show : true,
                    enable : true
                };
            } else {
                cfgs.cancel = {
                    show : true,
                    enable : true
                };
                cfgs.finish = {
                    show : false
                };
            }
            this.updateButtonsStatus(cfgs);
        },
        render : function(content, opt_buttons) {
            if(this._contentEl) {
                this._contentEl.remove();
            }
            if(this._buttonsEl) {
                this._buttonsEl.remove();
            }
            if(!this._isRendered) {
                this._contentEl = $('<div class="w-ui-wizard-content"/>');
                this._buttonsEl = $('<div class="w-ui-wizard-buttons"/>');
                this.buttons.prev.bind('click', this.prev, this);
                this.buttons.next.bind('click', this.next, this);
                this.buttons.cancel.bind('click', this.cancel, this);
                this.buttons.finish.bind('click', this.finish, this);

                this.buttons.prev.render(this._buttonsEl);
                this.buttons.next.render(this._buttonsEl);
                this.buttons.cancel.render(this._buttonsEl);
                this.buttons.finish.render(this._buttonsEl);

                for(var idx in this._pages) {
                    this.renderPage(this._pages[idx]);
                }
                this.initialize();
                this._isRendered = true;
            }
            this._contentEl.appendTo(content);
            this._buttonsEl.appendTo(opt_buttons || content);

        },
        show : function() {
            if(this._isRendered) {
                this._contentEl.show();
                this._buttonsEl.show();
                this.go(0);
            }
        },
        hide : function() {
            if(this._isRendered) {
                this._contentEl.hide();
                this._buttonsEl.hide();
            }
        }
    });
    W.ui.Wizard = Wizard;

    function WizardPage(wizard, model, template) {
        this._wizard = wizard;
        this._model = model;
        this._idx = 0;
        this._template = template;
    }


    W.extend(WizardPage, W.ui.UIBase);
    W.mix(WizardPage.prototype, {
        render : function(parent) {
            var tempstr = W.Template.get(this._template.module, this._template.id);
            this._element = $(W.template(tempstr, this._model.toJSON()));
            this._element.appendTo(parent);
            this._isRendered = true;
        }
    });
    W.ui.WizardPage = WizardPage;
});
wonder.useModule('ui/wizard');
