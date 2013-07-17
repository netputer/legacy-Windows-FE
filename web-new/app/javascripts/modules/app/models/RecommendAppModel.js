/*global define*/
(function (window) {
    define([
        'jquery',
        'IO',
        'Configuration',
        'app/models/AppBaseModel'
    ], function (
        $,
        IO,
        CONFIG,
        AppBaseModel
    ) {
        console.log('RecommendAppModel - File loaded.');

        var RecommendAppModel = AppBaseModel.extend({
            parse : function (attrs) {
                delete attrs.app.ad;
                delete attrs.app.icons.px78;
                delete attrs.app.icons.px256;
                delete attrs.app.imprUrl;
                delete attrs.recReason.reasonType;
                return attrs;
            },
            dislikeAsync : function (pos) {
                var deferred = $.Deferred();

                var packageName = this.get('app').packageName;
                IO.requestAsync({
                    url : CONFIG.actions.APP_UNLIKE,
                    data : {
                        package_name : packageName,
                        pos : pos || ''
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('RecommendAppModel - Unlike "' + packageName + '" success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('RecommendAppModel - Unlike "' + packageName + '" failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            }
        });

        return RecommendAppModel;
    });
}(this));
