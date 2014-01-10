/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 */
(function (window) {
    define([], function () {
        var URL_PATTREN = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        var ValidateURL = function (string) {
            return URL_PATTREN.test(string);
        };

        return ValidateURL;
    });
}(this));
