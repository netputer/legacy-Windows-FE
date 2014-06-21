/*global define*/
(function (window) {
    define([
        'backbone',
        'IO'
    ], function (
        Backbone,
        IO
    ) {
        var Strategy = Backbone.Model.extend({
            initialize : function () {
                this.load();
            },
            defaults : {
                enableQqTijian : false,
                enableFalshDevice : false
            },
            load : function () {
                IO.requestAsync(CONFIG.actions.STRATEGY).done(function (resp) {
                    if (resp.state_code === 200) {
                        this.changeHandler(resp.body);
                    }
                }.bind(this));
            },
            changeHandler : function (data) {
                this.set({
                    enableQqTijian : data.enable_qq_tijian,
                    enableFalshDevice : data.enable_shuaji
                });
            }
        });

        var strategy = new Strategy();
        return strategy;
    });
}(this));
