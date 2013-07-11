/*global define*/
(function (window) {
    define([
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'ui/PopupPanel'
    ], function (
        doT,
        _,
        TemplateFactory,
        PopupPanel
    ) {
        console.log('ChangeLogView - File loaded. ');

        var ChangeLogView = PopupPanel.extend({
            className : PopupPanel.prototype.className + ' w-app-changelog vbox',
            initialize : function () {
                ChangeLogView.__super__.initialize.apply(this, arguments);
                this.$content = doT.template(TemplateFactory.get('app', 'changelog'))(this.model.toJSON());
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ChangeLogView(args);
            }
        });

        return factory;
    });
}(this));
