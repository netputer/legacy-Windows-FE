/*global define*/
(function (window) {
    'use strict';

    define([
        'jquery',
        'utilities/StringUtil',
        'text!ui/ui.tpl',
        'text!modules/misc.tpl',
        'text!app/app.tpl',
        'text!message/message.tpl',
        'text!task/taskmanager.tpl',
        'text!social/social.tpl',
        'text!music/iTunes/iTunes.tpl',
        'text!modules/photo/photo.tpl',
        'text!contact/contact.tpl',
        'text!welcome/welcome.tpl',
        'text!sync/sync.tpl',
        'text!optimize/optimize.tpl',
        'text!doraemon/doraemon.tpl',
        'text!music/music.tpl',
        'text!video/video.tpl',
        'text!backuprestore/backup.tpl',
        'text!backuprestore/restore.tpl',
        'text!app/wash/wash.tpl',
        'text!guide/guide.tpl'
    ], function (
        $,
        StringUtil,
        UITplStr,
        MiscTplStr,
        AppTplStr,
        MessageTplStr,
        TaskManagerTplStr,
        SocialTplStr,
        iTunesTplStr,
        PhotoTplStr,
        ContactTplStr,
        WelcomeTplStr,
        SyncTplStr,
        OptimizeTplStr,
        DoraemonTplStr,
        MusicTplStr,
        VideoTplStr,
        BackupTplStr,
        RestoreTplStr,
        WashTplStr,
        GuideTplStr
    ) {

        var templateList = {
            ui : $(StringUtil.compressHTML(UITplStr)),
            misc : $(StringUtil.compressHTML(MiscTplStr)),
            contact : $(StringUtil.compressHTML(ContactTplStr)),
            app : $(StringUtil.compressHTML(AppTplStr)),
            message : $(StringUtil.compressHTML(MessageTplStr)),
            taskManager : $(StringUtil.compressHTML(TaskManagerTplStr)),
            social : $(StringUtil.compressHTML(SocialTplStr)),
            iTunes : $(StringUtil.compressHTML(iTunesTplStr)),
            photo : $(StringUtil.compressHTML(PhotoTplStr)),
            welcome : $(StringUtil.compressHTML(WelcomeTplStr)),
            sync : $(StringUtil.compressHTML(SyncTplStr)),
            optimize : $(StringUtil.compressHTML(OptimizeTplStr)),
            doraemon : $(StringUtil.compressHTML(DoraemonTplStr)),
            music : $(StringUtil.compressHTML(MusicTplStr)),
            video : $(StringUtil.compressHTML(VideoTplStr)),
            backup : $(StringUtil.compressHTML(BackupTplStr)),
            restore : $(StringUtil.compressHTML(RestoreTplStr)),
            wash : $(StringUtil.compressHTML(WashTplStr)),
            guide : $(StringUtil.compressHTML(GuideTplStr))
        };

        var TemplateFactory = {};

        TemplateFactory.get = function (moduleName, tplId) {
            var $templateFile;

            if (templateList[moduleName]) {
                $templateFile = templateList[moduleName];
            } else {
                console.error('TemplateFactory - Load template with module name \'' + moduleName + '\' failed.');
            }

            var $template = $templateFile.find('#' + tplId);

            if ($template.length <= 0) {
                console.error('TemplateFactory - Load template with ID \'' + tplId + '\' failed.');
            } else {
                return $template.html();
            }
        };

        window.TemplateFactory = TemplateFactory;

        return TemplateFactory;
    });
}(this));
