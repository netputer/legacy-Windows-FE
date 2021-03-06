/*global define*/
(function (window) {
    define([
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/Panel',
        'ui/AlertWindow',
        'ui/SmartList',
        'ui/Button',
        'ui/MenuButton',
        'ui/TipPanel',
        'ui/PopupTip',
        'ui/Menu'
    ], function (
        UIHelper,
        TemplateFactory,
        Panel,
        AlertwWindow,
        SmartList,
        Button,
        MenuButton,
        TipPanel,
        PopupTip,
        Menu
    ) {
        console.log('UI - File loaded.');

        var UI = {
            UIHelper : UIHelper,
            TemplateFactory : TemplateFactory,
            Panel : Panel,
            AlertWindow : AlertwWindow,
            SmartList : SmartList,
            Button : Button,
            MenuButton : MenuButton,
            TipPanel : TipPanel,
            PopupTip : PopupTip,
            Menu : Menu
        };

        return UI;
    });
}(this));
