/*global define*/
(function () {
    define([], function () {

        var CompressHTML = function (input) {
            return input.replace(/\n/gi, '').
                            replace(/>\s+</gi, '><').
                            replace(/>\s+\{\{/gi, '>{{').
                            replace(/\}\}\s+</gi, '}}<').
                            replace(/\}\}\s+\{\{/gi, '}}{{');
        };

        return CompressHTML;
    });
}(this));
