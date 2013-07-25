/*global define*/
(function (window) {
    define([], function () {

        var FormatDate = function (format, date) {
            date = date ? new Date(parseInt(date, 10)) : new Date();
            var output = format;

            var zh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            var en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            output = output.replace(/y{4}|D{2}|M{2}|d{2}|h{2}|H{2}|m{2}|s{2}/g, function (keyword) {
                var result = '';
                switch (keyword) {
                case 'yyyy':
                    result = date.getFullYear();
                    break;
                case 'MM':
                    var MM = date.getMonth() + 1;
                    if (MM < 10) {
                        result = '0' + MM;
                    } else {
                        result = MM;
                    }
                    break;
                case 'dd':
                    var dd = date.getDate();
                    if (dd < 10) {
                        result = '0' + dd;
                    } else {
                        result = dd;
                    }
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
                    if (window.navigator.language.indexOf('zh') > -1) {
                        result = zh[DD];
                    } else {
                        result = en[DD];
                    }
                    break;
                }

                return result;
            });

            return output;
        };

        return FormatDate;
    });
}(this));
