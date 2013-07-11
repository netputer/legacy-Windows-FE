/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'Account',
        'Configuration',
        'Environment',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/Panel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        Account,
        CONFIG,
        Environment,
        TemplateFactory,
        AlertWindow,
        Panel
    ) {
        console.log('ReportWindowView - File loaded.');

        var alert = window.alert;

        var encodeURIComponent = window.encodeURIComponent;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'report')),
            className : 'w-browser-report',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.$('.input-email').val(Account.get('userMail'));

                return this;
            }
        });

        var bodyView;

        var ReportWindowView = Panel.extend({
            initialize : function () {
                ReportWindowView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    extensionModel : {
                        set : function (value) {
                            bodyView.model = value;
                        }
                    }
                });

                bodyView = new BodyView({
                    model : this.model
                });

                this.on('show', function () {
                    this.$bodyContent = bodyView.render().$el;
                }, this);

                this.off('button_yes');

                this.on('button_yes', function () {
                    var $inputEmail = this.$('.input-email');
                    var $inputContent = this.$('.input-content');

                    if (!$inputEmail[0].validity.valid ||
                            $inputEmail.val().length === 0) {
                        $inputEmail.focus();
                    } else if ($inputContent.val().length === 0) {
                        $inputContent.focus();
                    } else {
                        var url = [CONFIG.enums.REPORT_URL];

                        url.push('?id=' + encodeURIComponent(bodyView.$('.input-id').val()));
                        url.push('&email=' + encodeURIComponent(bodyView.$('.input-email').val()));
                        url.push('&content=' + encodeURIComponent(bodyView.$('.input-content').val()));
                        url.push('&version=' + encodeURIComponent(Environment.get('backendVersion')));
                        url.push('&extversion=' + (this.model.get('extension') ? this.model.get('extension').version : 'unknow'));
                        url.push('&currenturl=' + encodeURIComponent(this.options.currentURL));

                        url.push('&callback=?');

                        $.getJSON(url.join('')).success(function (data) {
                            if (data) {
                                alert(i18n.misc.REPORT_SUCCESS);
                            } else {
                                alert(i18n.misc.REPORT_FAILED);
                            }
                        }).error(function () {
                            alert(i18n.misc.REPORT_FAILED);
                        });

                        this.remove();
                    }
                }, this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ReportWindowView(_.extend(args, {
                    height : 350,
                    width : 550,
                    title : i18n.misc.REPORT_PROBLEM,
                    buttonSet : 'yes_cancel'
                }));
            }
        });

        return factory;
    });
}(this));
