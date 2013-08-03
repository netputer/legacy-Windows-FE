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
        console.log('MediaInfoPanelView - File loaded. ');

        var MediaInfoPanelView = PopupPanel.extend({
            className : 'w-ui-popup-tip',
            initialize : function () {
                MediaInfoPanelView.__super__.initialize.apply(this, arguments);
                this.$content = doT.template(TemplateFactory.get('photo', 'info'))(this.model.toJSON());
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MediaInfoPanelView(args);
            }
        });

        return factory;
    });
}(this));
