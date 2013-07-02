/*global define*/
(function (window) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {
        console.log('MainRouter - File loaded. ');

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

        return mainRouter;
    });
}(this));
