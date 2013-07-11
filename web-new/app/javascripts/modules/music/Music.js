(function (window) {
    define([
        'video/views/ImportVideoView',
        'video/VideoService',
        'main/collections/PIMCollection',
        'browser/views/BrowserModuleView'
    ], function (
        ImportVideoView,
        VideoService,
        PIMCollection,
        BrowserModuleView
    ) {
        var Music = {
            ImportVideoView : ImportVideoView,
            VideoService : VideoService,
            PIMCollection : PIMCollection,
            BrowserModuleView : BrowserModuleView
        };

        window.Music = Music;

        return Music;
    });
}(this));
