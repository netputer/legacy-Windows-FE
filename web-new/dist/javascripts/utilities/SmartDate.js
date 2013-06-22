/*global define*/
(function (window) {
    define([
        'utilities/FormatDate',
        'Environment',
        'Configuration'
    ], function (
        formatDate,
        Environment,
        CONFIG
    ) {

        var SmartDate = function (mills) {
            var sourceMills = parseInt(mills, 10);
            var sourceDate = new Date(sourceMills);
            var today = new Date();
            var difference = (new Date(today.getDate())) - (new Date(sourceDate.getDate()));
            var formatedDate = '';
            if (sourceDate.getFullYear() === today.getFullYear() &&
                    sourceDate.getMonth() === today.getMonth()) {
                switch (difference) {
                case 0:
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                        formatedDate = formatDate('Today MM / dd', sourceMills);
                    } else {
                        formatedDate = formatDate('今天 MM 月 dd 日', sourceMills);
                    }
                    break;
                case 1:
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                        formatedDate = formatDate('Yesterday MM / dd', sourceMills);
                    } else {
                        formatedDate = formatDate('昨天 MM 月 dd 日', sourceMills);
                    }
                    break;
                case 2:
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                        formatedDate = formatDate('MM / dd', sourceMills);
                    } else {
                        formatedDate = formatDate('前天 MM 月 dd 日', sourceMills);
                    }
                    break;
                default:
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                        formatedDate = formatDate('MM / dd', sourceMills);
                    } else {
                        formatedDate = formatDate('MM 月 dd 日', sourceMills);
                    }
                }
            } else {
                var yearDifference = today.getFullYear() - sourceDate.getFullYear();
                if (yearDifference !== 0) {
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                        formatedDate = formatDate('MM / dd / yyyy', sourceMills);
                    } else {
                        formatedDate = formatDate('yyyy 年 MM 月 dd 日', sourceMills);
                    }
                } else {
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                        formatedDate = formatDate('MM / dd', sourceMills);
                    } else {
                        formatedDate = formatDate('yyyy 年 MM 月 dd 日', sourceMills);
                    }
                }
            }
            return formatedDate;
        };

        return SmartDate;
    });
}(this));
