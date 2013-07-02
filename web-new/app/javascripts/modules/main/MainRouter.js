/*global define*/
(function (window) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {
        console.log('MainRouter - File loaded. ');
        whosYourDaddy();

        var MainRouter = Backbone.Router.extend({
            routes : {
                'main/:module/:tab' : 'switchModule',
                'main/:module' : 'switchModule',
                'browser/:extentionId/:url' : 'switchExtension'
            },
            switchModule : function (module, tab) {
                whosYourDaddy();
                console.log(module, tab);
                Backbone.trigger('switchModule', {
                    module : module,
                    tab : tab || ''
                });
            },
            switchExtension : function (id, url) {
                whosYourDaddy();
                console.log(id);
                console.log(url);

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
