/*global define*/
(function (window, document) {
    require([
        'jquery',
        'photo/views/PhotoModuleToolbarView',
        'photo/views/PhotoGalleryView',
        'photo/views/SlideShowView'
    ], function (
        $,
        PhotoModuleToolbarView,
        PhotoGalleryView,
        SlideShowView
    ) {
        var fragment = document.createDocumentFragment();

        fragment.appendChild(PhotoModuleToolbarView.getInstance().render().$el[0]);
        fragment.appendChild(PhotoGalleryView.getInstance().render().$el[0]);
        fragment.appendChild(SlideShowView.getInstance().render().$el[0]);

        $('body').append(fragment);

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.WEB_SWITCH_MODULE
        }, function (data) {
            Backbone.trigger('switchModule', {
                module : data.module,
                tab : data.tab
            });
        });
    });
}(this, this.document));
