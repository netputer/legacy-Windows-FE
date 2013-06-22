/*global define*/
(function (window, undefined) {
    define([
        'utilities/StringUtil',
        'utilities/FormatDate',
        'utilities/EventsHelper'
    ], function (
        StringUtil,
        FormatDate,
        EventsHelper
    ) {
        console.log('Util - File loaded.');

        var Util = {
            StringUtil : StringUtil,
            FormatDate : FormatDate,
            EventsHelper : EventsHelper
        };

        window.Util = Util;

        return Util;
    });
}(this));