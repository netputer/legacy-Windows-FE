/*global define*/
(function (window) {
    define([
        'doT',
        'underscore',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/PopupPanel',
        'utilities/StringUtil'
    ], function (
        doT,
        _,
        i18n,
        TemplateFactory,
        PopupPanel,
        StringUtil
    ) {
        console.log('MideaInfoPanelView - File loaded. ');

        var MideaInfoPanelView = PopupPanel.extend({
            className : 'w-ui-popup-tip',
            initialize : function () {
                MideaInfoPanelView.__super__.initialize.apply(this, arguments);
                this.$content = doT.template(TemplateFactory.get('photo', 'info'))(this.model.toJSON());
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MideaInfoPanelView(args);
            }
        });

        return factory;
    });
}(this));
