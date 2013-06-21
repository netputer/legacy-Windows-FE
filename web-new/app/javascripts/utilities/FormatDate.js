/*global define*/
(function (window, undefined) {
    define([], function () {

        var FormatDate = function (format, date) {
            date = date ? new Date(parseInt(date, 10)) : new Date();
            var output = format;

            // TODO Add day support
            output = output.replace(/y{4}|M{2}|d{2}|h{2}|H{2}|m{2}|s{2}/g, function (keyword) {
                switch (keyword) {
                case 'yyyy':
                    return date.getFullYear();
                case 'MM':
                    var mm = date.getMonth() + 1;
                    if (mm < 10) {
                        return '0' + mm;
                    } else {
                        return mm;
                    }
                case 'dd':
                    var dd = date.getDate();
                    if (dd < 10) {
                        return '0' + dd;
                    } else {
                        return dd;
                    }
                case 'HH':
                    var HH = date.getHours();
                    if (HH < 10) {
                        return '0' + HH;
                    } else {
                        return HH;
                    }
                case 'hh':
                    var HH = date.getHours();
                    if (HH > 12) {
                        HH = HH -12;
                    }
                    if (HH < 10) {
                        return '0' + HH;
                    } else {
                        return HH;
                    }
                case 'mm':
                    var mm = date.getMinutes();
                    if(mm < 10) {
                        return '0' + mm;
                    } else {
                        return mm;
                    }
                case 'ss':
                    var ss = date.getSeconds();
                    if (ss < 10) {
                        return '0' + ss;
                    } else {
                        return ss;
                    }
                }
            });

            return output;
        };

        return FormatDate;
    });
}(this));
