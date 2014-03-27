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
            defaults : {
                enableQqTijian : false
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
                    enableQqTijian : data.enable_qq_tijian
                });
            }
        });

        var strategy;
        var factory = {
            getInstance : function () {
                if (!strategy) {
                    strategy = new Strategy();
                }
                return strategy;
            }
        };
        return factory;
    });
}(this));
