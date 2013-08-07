/*global define*/
(function (window) {
    define(['jquery'], function ($) {

        var ImageLoader = function (path, $imgElement) {
            var $img = $(new window.Image());

            var loadHandler = function () {
                $imgElement.attr('src', path);
                $img.remove();
            }.bind(this);

            var errorHandler = function () {
                $img.remove();
            };

            $img.one('load', loadHandler)
                .one('error', errorHandler)
                .attr('src', path);
        };

        return ImageLoader;
    });
}(this));
