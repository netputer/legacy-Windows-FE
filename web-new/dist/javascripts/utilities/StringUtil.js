/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 */
(function (window, undefined) {
    'use strict';

    define([
        'utilities/MD5',
        'utilities/ValidateURL',
        'utilities/FormatString',
        'utilities/ReadableSize',
        'utilities/ConditionalEscape',
        'utilities/FormatDate',
        'utilities/ShortenQuantity',
        'utilities/ValidateEmail',
        'utilities/FormatDuration',
        'utilities/CompressHTML',
        'utilities/SmartDate'
    ], function (
        MD5,
        ValidateURL,
        FormatString,
        ReadableSize,
        ConditionalEscape,
        FormatDate,
        ShortenQuantity,
        ValidateEmail,
        FormatDuration,
        CompressHTML,
        SmartDate
    ) {

        var StringUtil = {
            MD5 : MD5,
            isURL : ValidateURL,
            format : FormatString,
            readableSize : ReadableSize,
            conditionalEscape : ConditionalEscape,
            formatDate : FormatDate,
            shortenQuantity : ShortenQuantity,
            isEmail : ValidateEmail,
            formatDuration : FormatDuration,
            compressHTML : CompressHTML,
            smartDate : SmartDate
        };

        window.StringUtil = StringUtil;

        return StringUtil;
    });
}(this));
