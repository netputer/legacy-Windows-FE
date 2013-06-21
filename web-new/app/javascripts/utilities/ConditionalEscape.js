/*global define*/
(function (window, undefined) {
    define([], function () {

        var ConditionalEscape = function (source, condition) {
            return source.replace(/<\s*([^>]+)>/g, function (tag, tagName) {
                var conditionIndex = tag.indexOf(condition);
                if(conditionIndex === 1 || conditionIndex === 2) {
                    return tag;
                } else {
                    return ('&lt;' + tagName + '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&rsquo;');
                }
            });
        };

        return ConditionalEscape;
    });
}(this));
