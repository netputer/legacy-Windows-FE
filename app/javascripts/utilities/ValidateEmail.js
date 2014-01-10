/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 */
(function (window) {
    define([], function () {

        var EMAIL_PATTREN = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/;

        var ValidateEmail = function (string) {
            return EMAIL_PATTREN.test(string);
        };

        return ValidateEmail;
    });
}(this));
