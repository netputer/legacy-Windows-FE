/*global define*/
(function (window) {
    define([], function () {

        var ConditionalEscape = function (source, condition) {
            return source.replace(/<\s*([^>]+)>/g, function (tag, tagName) {
                var result;

                var conditionIndex = tag.indexOf(condition);
                if (conditionIndex === 1 || conditionIndex === 2) {
                    result = tag;
                } else {
                    result = ('&lt;' + tagName + '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&rsquo;');
                }

                return result;
            });
        };

        return ConditionalEscape;
    });
}(this));
