/*global define*/
(function (window) {
    define([
        'backbone',
        'IOBackendDevice',
        'Configuration',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        IO,
        CONFIG,
        PIMCollection
    ) {
        console.log('MainRouter - File loaded. ');

        var history = window.history;
        var pimCollection = PIMCollection.getInstance();

        var MainRouter = Backbone.Router.extend({
            routes : {
                'main/:module/:tab' : 'switchModule',
                'main/:module' : 'switchModule',
                'browser/:extentionId/:url' : 'switchExtension'
            },
            switchModule : function (module, tab) {
                Backbone.trigger('switchModule', {
                    module : module,
                    tab : tab || ''
                });

                var target = pimCollection.find(function (model) {
                    return (model.get('module') === module) &&
                            (model.get('tab') === tab);
                });

                if (target === undefined) {
                    target = pimCollection.find(function (model) {
                        return (model.get('module') === module) && model.get('root');
                    });
                }

                target.set('selected', true);
            },
            switchExtension : function (id, url) {
                console.log(id);
                console.log(url);
                console.log(history.backCount());
                Backbone.trigger('switchModule:browser', {
                    id : id,
                    url : decodeURIComponent(url)
                });

                window.externalCall('', 'navigation', JSON.stringify({
                    id : '',
                    canGoBack : history.backCount(),
                    canGoForward : history.forwardCount()
                }));
            }
        });

        var mainRouter = new MainRouter();

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_BACK
        }, function (data) {
            history.back();
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_FORWARD
        }, function (data) {
            history.forward();
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_REFRESH
        }, function (data) {
        });

        whosYourDaddy();
        window.onhashchange = function (e) {
            console.log(e);
        };

        window.popstate = function (e) {
            console.log(e);
        };

        return mainRouter;
    });
}(this));
