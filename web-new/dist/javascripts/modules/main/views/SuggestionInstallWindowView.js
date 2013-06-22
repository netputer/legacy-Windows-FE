/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'ui/Panel',
        'ui/EventsMapping',
        'Environment',
        'Settings',
        'Configuration',
        'IO',
        'Log',
        'Device',
        'Internationalization',
        'utilities/QueryString',
        'app/collections/AppsCollection'
    ], function (
        $,
        _,
        Panel,
        EventsMapping,
        Environment,
        Settings,
        CONFIG,
        IO,
        log,
        Device,
        i18n,
        QueryString,
        AppsCollection
    ) {
        console.log('SuggestionInstallWindowView - File loaded. ');

        var SuggestionInstallWindowView = Panel.extend({
            initialize : function () {
                SuggestionInstallWindowView.__super__.initialize.apply(this, arguments);

                var installHandler = function () {
                    this.$('iframe')[0].contentWindow.aiInstall();
                    this.remove();

                    this.trigger('button_yes');

                    log({
                        'event' : 'ui.click.suggestion.install.all'
                    });
                };


                var yesHandler = function () {
                    log({
                        'event' : 'ui.click.suggestion.install.close'
                    });
                };

                this.listenTo(this, 'button_install', installHandler);
                this.listenTo(this, 'button_yes', yesHandler);

                this.listenTo(this, EventsMapping.DRAGSTART, function () {
                    this.$('.mask').show();
                });

                this.listenTo(this, EventsMapping.DRAGEND, function () {
                    this.$('.mask').hide();
                });
            },
            checkAppsAsync : function () {
                var deferred = $.Deferred();

                var appsCollection = AppsCollection.getInstance();
                var refreshHandler = function (appsCollection) {
                    if (!appsCollection.syncing && !appsCollection.loading && Device.get('isConnected')) {
                        this.stopListening(appsCollection, 'refresh', refreshHandler);
                        if (appsCollection.getNormalApps().length <= 20) {
                            deferred.resolve();
                        }
                    }
                };

                this.listenTo(appsCollection, 'refresh', refreshHandler);
                appsCollection.trigger('update');

                return deferred.promise();
            },
            renderContentAsync : function () {
                var deferred = $.Deferred();

                var $iframe = $('<iframe>').attr({
                    src : 'http://apps.wandoujia.com/appinterface'
                }).css({
                    width : '750px',
                    height : '395px'
                });

                var $content = $('<div>').addClass('w-misc-suggestion-install')
                                            .append($('<div>').addClass('mask').hide())
                                            .append($iframe);

                this.$bodyContent = $content;

                var stateChangeHandler = function (evt) {
                    var state = evt.originalEvent.srcElement.readyState;
                    if (state === 'complete') {
                        deferred.resolve();
                        $iframe.off('readystatechange', stateChangeHandler);
                    }
                }.bind(this);

                $iframe.on('readystatechange', stateChangeHandler);

                return deferred.promise();
            },
            check : function () {
                if (Environment.get('deviceId') !== 'Default') {
                    this.checkAppsAsync().done(function () {
                        this.render();
                        this.renderContentAsync().done(this.show.bind(this));
                    }.bind(this));
                }
            }
        });

        var suggestionInstallWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!suggestionInstallWindowView) {
                    suggestionInstallWindowView = new SuggestionInstallWindowView({
                        title : i18n.misc.SUGGESTION_INSTALL,
                        disposableName : 'suggestion-install-window',
                        disableX : true,
                        width : 780,
                        buttons : [{
                            $button : $('<button>').html(i18n.app.INSTALL_ALL).addClass('primary'),
                            eventName : 'button_install'
                        }, {
                            $button : $('<button>').html(i18n.common.CLOSE),
                            eventName : 'button_yes'
                        }]
                    });
                }
                return suggestionInstallWindowView;
            }
        });

        return factory;
    });
}(this));
