/*!
 * 看我们的源码？不如来加入我们吧！豌豆实验室的前端团队正在寻找和您一样有好奇心的优秀前端工程师！
 *
 *   11
 *    01
 *    1001
 *     01111
 *     111111
 *      111111  1
 *      11111111
 *       11111111  01
 *        111111111
 *        1111111111  10                         111111    10       11111111111111      11    1
 *         11111111111 11                        111111 001000000   00111111111101  0000000100000001
 *          11111111111  101                      01111 01     10                       11 1  01
 *           111111111111  00                    10  10  01   11     001111111101     1 1 100 1 11
 *            111111111111    11                 101110 10 010100    0         01     101110111101
 *             1011111111111  101                 1  1  01 0 0 10    011111111101      01  0   01
 *               1111111111101    1               01 0  1 01 0 01     101111 001    1000110000101001
 *                111111111111111 11              1110   10  0         0     01         100 101
 *                      1        11              100001 00   0110  1111001110011101 100001    10000
 *              1111111  11111111 1011           11     1    1111  111111111111111  11            1
 *             01 11  11111  111 1 1100011
 *            101111111111111101111 001111
 *            10      11111      11 1
 *             11    101111      01
 *               110011  100111101
 *                         1111
 *
 *
 * http://www.wandoujia.com/join
 * @author Zeke Zhao
 * @mail wangye.zhao@wandoujia.com
 * @twitter @wangyezhao
 * @weibo @赵望野
 */

/*global define*/
(function (window) {
    'use strict';

    // require([
    //     'underscore',
    //     'jquery',
    //     'doT',
    //     'ui/TemplateFactory',
    //     'utilities/QueryString',
    //     'utilities/BrowserSniffer'
    // ], function (
    //     _,
    //     $,
    //     doT,
    //     TemplateFactory,
    //     QueryString,
    //     BrowserSniffer
    // ) {
    //     // Disable `console` object under release mode
    //     if (BrowserSniffer.is('wandoujia') && QueryString.get('debug') !== 'true') {
    //         var originalConsole = window.console;

    //         var emptFunc = function () {};

    //         window.console = {
    //             debug : emptFunc,
    //             log : emptFunc,
    //             time : emptFunc,
    //             timeEnd : emptFunc,
    //             dir : emptFunc,
    //             error : emptFunc
    //         };

    //         window.whosYourDaddy = function () {
    //             window.console = originalConsole;
    //         };
    //     }

    //     // Hack for XP can't render Microsoft Yahei clearly
    //     if (BrowserSniffer.sysIs('WindowsXP')) {
    //         $('head').append(doT.template(TemplateFactory.get('misc', 'font-style-xp'))({}));
    //     }
    // });
    require([
        'jquery',
        'backbone',
        'DB',
        'main/HistoryManager',
        'main/views/MainView',
        'doraemon/views/DoraemonModuleView',
        'doraemon/views/GalleryView',
        'message/views/MessageModuleView',
        'browser/views/BrowserModuleView',
        'app/views/AppModuleView',
        'welcome/views/WelcomeModuleView',
        'music/views/MusicModuleView',
        'contact/views/ContactModuleView',
        'photo/views/PhotoModuleView',
        'video/views/VideoModuleView',
        'optimize/views/OptimizeModuleView',
        'app/wash/views/AppWashModuleView',
        'sync/SyncModule',
        'FunctionSwitch',
        'social/SocialService',
        'Device',
        'Settings',
        'Environment',
        'ui/Notification',
        'ui/TemplateFactory',
        'IOBackendDevice',
        'Configuration',
        'Log',
        'IframeMessageListener',
        'PerformanceTracker',
        'main/views/BindingDeviceWindowView',
        'backuprestore/BackupController'
    ], function (
        $,
        Backbone,
        DB,
        HistoryManager,
        MainView,
        DoraemonModuleView,
        GalleryView,
        MessageModuleView,
        BrowserModuleView,
        AppModuleView,
        WelcomeModuleView,
        MusicModuleView,
        ContactModuleView,
        PhotoModuleView,
        VideoModuleView,
        OptimizeModuleView,
        AppWashModuleView,
        SyncModule,
        FunctionSwitch,
        SocialService,
        Device,
        Settings,
        Environment,
        Notification,
        TemplateFactory,
        IO,
        CONFIG,
        log,
        IframeMessageListener,
        PerformanceTracker,
        BindingDeviceWindowView,
        BackupController
    ) {
        window.SnapPea = window.SnapPea || {};

        // Backbone.history.start({
        //     pushState : false
        // });

        var mainView = MainView.getInstance();
        mainView.regModule('welcome', WelcomeModuleView);

        mainView.render();

        mainView.regModule('doraemon', DoraemonModuleView);
        mainView.regModule('browser', BrowserModuleView);
        mainView.regModule('message', MessageModuleView);
        mainView.regModule('app', AppModuleView);
        mainView.regModule('music', MusicModuleView);
        mainView.regModule('photo', PhotoModuleView);
        mainView.regModule('video', VideoModuleView);
        mainView.regModule('contact', ContactModuleView);
        mainView.regModule('optimize', OptimizeModuleView);
        mainView.regModule('app-wash', AppWashModuleView);
        mainView.regModule('gallery', GalleryView);

        var init = function () {
            BindingDeviceWindowView.getInstance().checkAsync();
        };

        // Binding device
        if (Environment.get('deviceId') !== 'Default') {
            init.call(this);
        } else {
            Environment.once('change:deviceId', init, this);
        }

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.SYNC_BACKUP_START
        }, function (data) {
            BackupController.start();
        }, this);

        window.externalCall('', 'page_ready', '');
        PerformanceTracker.launch();
    });
}(this));
