/*global define*/
(function (window) {
    define([
        'backbone',
        'IOBackendDevice',
        'Configuration',
        'jquery',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        IO,
        CONFIG,
        $,
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
            },
            switchExtension : function (id, url) {
                Backbone.trigger('switchModule:browser', {
                    id : id,
                    url : decodeURIComponent(url)
                });
            }
        });

        var mainRouter = new MainRouter();

        // IO.Backend.Device.onmessage({
        //     'data.channel' : CONFIG.events.NAVIGATE_BACK
        // }, function (data) {
        //     if (window.SnapPea.CurrentModule === 'browser') {
        //         var $iframe = $('iframe[extension="' + window.SnapPea.CurrentTab + '"]');
        //         console.log();
        //         if (history.backCount($iframe.attr('id'), $iframe.attr('branch')) !== 0) {
        //             history.back2($iframe.attr('id'), $iframe.attr('branch'));
        //         } else {
        //             // history.back();
        //         }
        //     } else {
        //         // history.back();
        //     }
        // });

        // IO.Backend.Device.onmessage({
        //     'data.channel' : CONFIG.events.NAVIGATE_FORWARD
        // }, function (data) {
        //     if (window.SnapPea.CurrentModule === 'browser') {
        //         var $iframe = $('iframe[extension="' + window.SnapPea.CurrentTab + '"]');
        //         if (history.forwardCount($iframe.attr('id'), $iframe.attr('branch')) !== 0) {
        //             history.forward2($iframe.attr('id'), $iframe.attr('branch'));
        //         } else {
        //             // history.forward();
        //         }
        //     } else {
        //         // history.forward();
        //     }
        // });

        // IO.Backend.Device.onmessage({
        //     'data.channel' : CONFIG.events.NAVIGATE_REFRESH
        // }, function (data) {
        // });


        // window.onhashchange = function (e) {
        //     console.log(e);
        // };

        // window.popstate = function (e) {
        //     console.log(e);
        // };

        return mainRouter;
    });
}(this));
