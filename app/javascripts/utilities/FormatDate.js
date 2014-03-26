/*global define*/
(function (window) {
    define([
        'Internationalization'
    ], function (
        i18n
    ) {

        var FormatDate = function (format, date) {
            date = date ? new Date(parseInt(date, 10)) : new Date();
            var output = format;
            var dateArr = i18n.misc.DATE_STR.split(',');

            output = output.replace(/y{4}|D{2}|0?M{2}|d{2}|h{2}|H{2}|m{2}|s{2}/g, function (keyword) {
                var result = '';
                switch (keyword) {
                case 'yyyy':
                    result = date.getFullYear();
                    break;
                case '0MM':
                case 'MM':
                    var MM = date.getMonth() + 1;
                    if (keyword.substr(0, 1) === '0') {
                        if (MM < 10) {
                            result = '0' + MM;
                        } else {
                            result = MM;
                        }
                    } else {
                        result = MM;
                    }
                    break;
                case 'dd':
                    result = date.getDate();
                    break;
                case 'HH':
                    var HH = date.getHours();
                    if (HH < 10) {
                        result = '0' + HH;
                    } else {
                        result = HH;
                    }
                    break;
                case 'hh':
                    var hh = date.getHours();
                    if (hh > 12) {
                        hh = hh - 12;
                    }
                    if (hh < 10) {
                        result = '0' + hh;
                    } else {
                        result = hh;
                    }
                    break;
                case 'mm':
                    var mm = date.getMinutes();
                    if (mm < 10) {
                        result = '0' + mm;
                    } else {
                        result = mm;
                    }
                    break;
                case 'ss':
                    var ss = date.getSeconds();
                    if (ss < 10) {
                        result = '0' + ss;
                    } else {
                        result = ss;
                    }
                    break;
                case 'DD':
                    var DD = date.getDay();
                    result = dateArr[DD];
                    break;
                }

                return result;
            });

            return output;
        };

        return FormatDate;
    });
}(this));
