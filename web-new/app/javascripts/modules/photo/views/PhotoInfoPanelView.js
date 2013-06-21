/*global define*/
(function (window, undefined) {
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
        console.log('PhotoInfoPanelView - File loaded. ');

        var PhotoInfoPanelView = PopupPanel.extend({
            className : 'w-ui-popup-tip',
            initialize : function () {
                PhotoInfoPanelView.__super__.initialize.apply(this, arguments);
                this.$content = doT.template(TemplateFactory.get('photo', 'info'))(this.model.toJSON());
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new PhotoInfoPanelView(args);
            }
        });

        return factory;
    });
}(this));
