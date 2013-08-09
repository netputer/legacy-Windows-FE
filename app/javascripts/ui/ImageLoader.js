/*global define*/
(function (window) {
    define(['jquery'], function ($) {

        var ImageLoader = function (path, $imgElement, transition) {
            transition = transition === undefined ? false : transition;

            var $img = $(new window.Image());

            if (path !== $imgElement.attr('src')) {
                var loadHandler = function () {
                    if (transition) {
                        $imgElement.fadeOut('fast', function () {
                            $(this).attr('src', path).fadeIn('fast');
                        });
                    } else {
                        $imgElement.attr('src', path);
                    }
                    $img.remove();
                };

                var errorHandler = function () {
                    $img.remove();
                };

                $img.one('load', loadHandler)
                    .one('error', errorHandler)
                    .attr('src', path);
            }
        };

        return ImageLoader;
    });
}(this));
