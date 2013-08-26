/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'ui/TipPanel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        StringUtil,
        TemplateFactory,
        TipPanel
    ) {
        console.log('CapacityTipsView - File loaded.');

        var CapacityTipsView = TipPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide',
            contentTemplate : doT.template(TemplateFactory.get('taskManager', 'capacity-tips')),
            initialize : function () {
                CapacityTipsView.__super__.initialize.apply(this, arguments);
                this.fillData();
            },
            fillData : function (Device) {
                this.$content = $(this.contentTemplate({
                    source : this.source,
                    total : this.total,
                    free : this.free
                }));
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new CapacityTipsView(_.extend({
                    alignToHost : true
                }, args));
            },
            getClass : function () {
                return CapacityTipsView;
            }
        });

        return factory;
    });
}(this));
