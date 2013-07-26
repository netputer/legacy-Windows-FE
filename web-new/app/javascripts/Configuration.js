/*global define*/
(function (window) {
    'use strict';

    define([], function () {

        var Configuration = {
            BASE_PATH : window.require.s.contexts._.config.baseUrl,
            actions : {
                BLOCK_WINDOW : 'wdj://window/blocking.json',

                // Universal and device related actions
                SEND_LOG : 'wdj://window/log.json',
                SCREEN_SHOT : 'wdj://window/screenshot_device.json',
                FULL_SCREEN : 'wdj://window/full_screenshot.json',
                WEIBO : 'wdj://window/weibo.json',
                SAVE_SCREENSHOT : 'wdj://window/save_screenshot_dir.json',
                SET_LAST_USED_DIR : 'wdj://window/set_last_used_dir.json',
                EDIT_IMAGE : 'wdj://window/edit_image.json',
                CHECK_FILE_PATH : 'wdj://window/check_file_path.json',
                SHOW_FILE : 'wdj://window/show_file.json',
                SELECT_CONTACT_PHOTO : 'wdj://window/select_contact_photo_file.json',
                OPEN_FILE : 'wdj://window/open_file.json',
                PUBLISH_EVENT : 'wdj://window/publish.json',
                UPDATE_NOTIFICATION_TITLE : 'wdj://window/update_notification.json',
                CLOSE_ALL_NOTIFICATION : 'wdj://window/close_all_notification.json',
                MAILTO : 'wdj://window/mailto.json',
                OPEN_WANDUJIA : 'wdj://helper/startup_wandoujia.json',
                ZIP_PACKAGE : 'wdj://window/zip.json',
                SAVE_APP_SETTING : 'wdj://window/save_app_setting.json',
                OPEN_URL : 'wdj://window/open_url.json',
                OPEN_URL_HELPER : 'wdj://helper/open_url.json',
                SELECT_FOLDER : 'wdj://window/select_folder.json',
                CONNET_PHONE : 'wdj://window/open_phone_selector.json',
                WINDOW_DEVICE_BIND : 'wdj://window/bind_device.json',
                WINDOW_DEVICE_UNBIND : 'wdj://window/unbind_device.json',
                WINDOW_DEVICE_NEED_BIND : 'wdj://window/need_bind.json',
                RECORD_CURRENT_BACKUP_TIME : 'wdj://window/record_backup_time.json',
                WINDOW_OPEN_PRIVACY_SETTING : 'wdj://window/open_privacy_setting.json',
                DEVICE_USB_REDETECT : 'wdj://window/usb_redetect.json',
                DEVICE_GET_USB_DETECT_STATE : 'wdj://window/usb_detect_state.json',
                WINDOW_OPEN_SETTING : 'wdj://window/open_setting.json',
                WINDOW_DISK_FREE_SPACE : 'wdj://window/disk_free_space.json',

                DEVICE_GET_WALLPAPER : 'wdj://device/wallpaper.json',
                DEVICE_GET_DEVICE_STATE : 'wdj://device/state.json',
                DEVICE_GET_SCREENSHOT_INFO : 'wdj://device/screenshot.json',
                DEVICE_GET_INTERNAL_ROOM : 'wdj://device/internal.json',
                DEVICE_GET_EXTERNAL_ROOM : 'wdj://device/external.json',
                DEVICE_OPEN_SD_CARD : 'wdj://device/open_sdcard.json',
                DEVICE_TITLE : 'wdj://device/title.json',
                DEVICE_GET_BATTERY : 'wdj://device/battery.json',
                DEVICE_IS_AUTOBACKUP : 'wdj://device/is_autobakup.json',
                DEVICE_CHECK_FTP_REG : 'wdj://device/check_ftp_reg.json',
                DEVICE_FIX_FTP : 'wdj://device/fix_ftp_reg.json',
                DEVICE_CAN_SCREENSHOT_WIFI : 'wdj://device/enable_wifi_srceen_shot.json',
                DEVICE_GET_UDID : 'wdj://device/get_udid.json',
                DEVICE_GET_SHELL : 'wdj://device/shell.json',

                // SOCIAL
                GET_WELCOM_PAGE_IMG : 'wdj://social/save_welcome_page.json',
                AUTH : 'wdj://social/auth.json',
                STATUS_UPLOAD : 'wdj://social/statuses_upload.json',
                USER_SHOW : 'wdj://social/users_show.json',
                USER_LOGOUT : 'wdj://social/users_logout.json',
                AUTH_INFO : 'wdj://social/auth_info.json',
                GET_TOKEN : 'wdj://social/get_token.json',

                // Contact Module
                CONTACT_GET_SHOW : 'wdj://contacts/show.json',
                CONTACT_GET_CONTACT : 'wdj://contacts/get.json',
                CONTACT_SEARCH : 'wdj://contacts/search.json',
                CONTACT_ADD : 'wdj://contacts/add.json',
                CONTACT_UPDATE : 'wdj://contacts/update.json',
                CONTACT_SYNC : 'wdj://contacts/sync.json',
                CONTACT_GROUPS_SHOW : 'wdj://groups/show.json',
                CONTACT_GROUPS_DELETE : 'wdj://groups/delete.json',
                CONTACT_GROUPS_UPDATE : 'wdj://groups/update.json',
                CONTACT_GROUPS_ADD : 'wdj://groups/add.json',
                CONTACT_SET_GROUPS : 'wdj://contacts/set_groups.json',
                CONTACT_CANCEL : 'wdj://contacts/cancel.json',
                CONTACT_BATCH_DELETE : 'wdj://contacts/batch_delete.json',
                CONTACT_EXPORT : 'wdj://contacts/export.json',
                CONTACT_IMPORT : 'wdj://contacts/import.json',
                CONTACT_START : 'wdj://contacts/star.json',
                CONTACT_UNSTART : 'wdj://contacts/unstar.json',
                CONTACT_SELECT_CONTACT_FILE : 'wdj://window/select_contact_file.json',
                CONTACT_SYNCED_ACCOUNTS : 'wdj://contacts/syncd_accounts.json',
                CONTACT_BATCH_GROUP : 'wdj://contacts/batch_group.json',
                CONTACT_HAS_BACKUP : 'wdj://contacts/has_backup.json',
                CONTACT_LOAD_BACKUP : 'wdj://contacts/load_backup.json',

                // Application Module
                APP_SHOW : 'wdj://apps/show.json',
                APP_SYNC : 'wdj://apps/sync.json',
                APP_DUMP_LOCAL : 'wdj://apps/dump.json',
                APP_DOWNLOAD : 'wdj://apps/download.json',
                APP_BATCH_DOWNLOAD : 'wdj://apps/batch_download.json',
                APP_INSTALL : 'wdj://apps/install.json',
                APP_UNINSTALL : 'wdj://apps/batch_uninstall.json',
                APP_IGNORE_UPDATE : 'wdj://apps/ignore.json',
                APP_UNIGNORE_UPDATE : 'wdj://apps/unignore.json',
                APP_GET_RECOMMEND : 'wdj://apps/recommend.json',
                APP_BATCH_UNINSTALL : 'wdj://apps/batch_uninstall.json',
                APP_UNLIKE : 'wdj://apps/unlike.json',
                APP_GET_SELECTED_APK : 'wdj://window/select_apps.json',
                APP_MOVE : 'wdj://apps/move.json',
                APP_EXPORT : 'wdj://apps/export.json',
                APP_UPDATE_NOTIFI_FREQUENCE : 'wdj://helper/check_frequence.json',
                APP_CLOSE_UPDAYE_NOTIFI : 'wdj://helper/close_app_checker.json',
                APP_COMMENTARY : 'wdj://apps/comment.json',
                APP_GET_COMMENT : 'wdj://apps/app_comment.json',
                APP_ENJOY : 'wdj://apps/enjoy.json',
                APP_SNAP_SHOT : 'wdj://helper/app_snapshot.json',
                APP_CANCEL : 'wdj://apps/cancel.json',
                APP_SYNC_SHOW : 'wdj://apps/sync_show.json',
                APP_BATCH_INSTALL : 'wdj://apps/batch_install.json',
                APP_APK_DETAIL : 'wdj://apps/apk_detail.json',
                APP_DOWNLOAD_DATA : 'wdj://apps_data/download.json',
                APP_HAS_BACKUP : 'wdj://apps/has_backup.json',
                APP_LOAD_BACKUP : 'wdj://apps/load_backup.json',
                APP_SHOW_WEB_APPS : 'wdj://apps/my_apps.json',
                APP_SYNC_WEB_APPS : 'wdj://apps/refresh_my_apps.json',
                APP_HIDE_WEB_APPS : 'wdj://apps/hide_my_app.json',
                APP_SHOW_SUGGESTION_INSTALLATION : 'wdj://apps/show_new_device_apps.json',
                APP_GET_MD5 : 'wdj://apps/get_md5.json',
                APP_EXPORT_APP_DATA : 'wdj://apps/export_app_data.json',
                APP_IGNORE_WASH : 'wdj://apps/ignore_wash.json',
                APP_GET_APP_DATA_COUNT : 'wdj://apps/app_data_count.json',
                APP_GET_APP_DETAIL : 'wdj://apps/apk_detail.json',

                // SMS and Calllog Module
                SMS_GET_CONVERSATION : 'wdj://sms/conversations.json',
                SMS_GET_THREADS : 'wdj://sms/threads.json',
                SMS_MARK_AS_READ : 'wdj://sms/mark_read.json',
                SMS_MARK_AS_UNREAD : 'wdj://sms/mark_unread.json',
                SMS_DELETE : 'wdj://sms/remove.json',
                SMS_SEND : 'wdj://sms/send.json',
                SMS_BATCH_SEND : 'wdj://sms/batch_send.json',
                SMS_DELETE_CONVERSATION : 'wdj://sms/remove_conversation.json',
                SMS_SYNC : 'wdj://sms/sync.json',
                SMS_RESEND : 'wdj://sms/resend.json',
                SMS_CONVERSATION_MARK_AS_READ : 'wdj://sms/mark_conversation_read.json',
                SMS_GET_SERVICE_CENTER : 'wdj://sms/services.json',
                SMS_IMPORT : 'wdj://sms/import.json',
                SMS_EXPORT : 'wdj://sms/export.json',
                SMS_BATCH_RESEND : 'wdj://sms/batch_resend.json',
                SMS_OPEN_ON_DEVICE : 'wdj://sms/show_in_device.json',
                SMS_CANCEL : 'wdj://sms/cancel.json',
                SMS_SELECT_SMS_FILE : 'wdj://window/select_sms_file.json',
                SMS_HAS_BACKUP : 'wdj://sms/has_backup.json',
                SMS_LOAD_BACKUP : 'wdj://sms/load_backup.json',
                SMS_COPY : 'wdj://window/copy_clipboard.json',
                SMS_SEARCH_CONVERSATION : 'wdj://sms/conversation_id.json',
                SMS_SEARCH_SMS : 'wdj://sms/sms_id.json',

                // Task Manager Module
                TASK_SHOW_PROGRESS : 'wdj://jobs/show.json',
                TASK_DELETE_TASK : 'wdj://jobs/clear.json',
                TASK_PAUSE_TASK : 'wdj://jobs/pause.json',
                TASK_RESUME_TASK : 'wdj://jobs/resume.json',
                TASK_STOP_TASK : 'wdj://jobs/stop.json',
                TASK_START_TASK : 'wdj://jobs/start.json',
                TASK_REMOVE_FINISHI : 'wdj://jobs/clean_finished.json',
                TASK_OPEN_DOWNLOAD_DIRECTORY : 'wdj://window/apps_folder.json',
                TASK_START_ALL : 'wdj://jobs/start_all.json',
                TASK_FORCE_RESTART : 'wdj://jobs/force_restart.json',
                TASK_OPEN_FOLDER : 'wdj://window/apps_folder.json',
                TASK_CACHE_SIZE : 'wdj://jobs/cache_size.json',

                // Music Module
                MUSID_SHOW : 'wdj://music/show.json',
                MUSIC_DOWNLOAD : 'wdj://music/download.json',
                MUSIC_IMPORT : 'wdj://music/import.json',
                MUSIC_EXPORT : 'wdj://music/export.json',
                MUSIC_SELECT : 'wdj://window/select_music.json',
                MUSIC_SYNC : 'wdj://music/sync.json',
                MUSIC_DELETE : 'wdj://music/delete.json',
                MUSIC_RESET_RINGTONE : 'wdj://music/reset_ringtone.json',
                MUSIC_SET_RINGTONE : 'wdj://music/set_ringtone.json',
                MUSIC_GET_RINGTONE : 'wdj://music/get_ringtone.json',
                MUSIC_LOAD : 'wdj://music/load.json',
                MUSIC_CANCEL : 'wdj://music/cancel.json',
                MUSIC_PLAY : 'wdj://music/play.json',
                MUSIC_STOP : 'wdj://music/stop.json',

                // Photo Module
                PHOTO_DOWNLOAD : 'wdj://photo/download.json',
                PHOTO_SET_WALLPAPER : 'wdj://photo/wallpaper.json',
                PHOTO_IGNORE_FOLDER : 'wdj://photo/ignore_folder.json',
                PHOTO_UNIGNORE_FOLDER : 'wdj://photo/unignore_folder.json',
                PHOTO_GET : 'wdj://photo/get.json',
                PHOTO_DELETE : 'wdj://photo/delete.json',
                PHOTO_THUMBNAIL : 'wdj://photo/thumbnail.json',
                PHOTO_THUMBNAILS : 'wdj://photo/thumbnails.json',
                PHOTO_ROTATE : 'wdj://photo/rotate.json',
                PHOTO_SELECT_PHOTO : 'wdj://window/select_photo.json',
                PHOTO_CANCEL : 'wdj://photo/cancel.json',
                PHOTO_IMPORT : 'wdj://photo/import.json',
                PHOTO_EXPORT : 'wdj://photo/export.json',
                PHOTO_SHOW : 'wdj://photo/show.json',
                PHOTO_SYNC : 'wdj://photo/sync.json',
                PHOTO_CLOUD_THUMBNAIL : 'wdj://photo/cloud_thumbnail.json',
                PHOTO_CLOUD_THUMBNAILS : 'wdj://photo/cloud_thumbnails.json',
                PHOTO_CLOUD_GET : 'wdj://photo/cloud_get.json',
                PHOTO_CANCEL_THUMBNAIL : 'wdj://photo/cancel_thumbnail.json',

                // Video Module
                VIDEO_DOWNLOAD : 'wdj://video/download.json',
                VIDEO_CANCEL : 'wdj://video/cancel.json',
                VIDEO_THUMBNAIL : 'wdj://video/thumbnail.json',
                VIDEO_SHOW : 'wdj://video/show.json',
                VIDEO_SYNC : 'wdj://video/sync.json',
                VIDEO_DELETE : 'wdj://video/delete.json',
                VIDEO_EXPORT : 'wdj://video/export.json',
                VIDEO_LOAD : 'wdj://video/load.json',
                VIDEO_IMPORT : 'wdj://video/import.json',
                VIDEO_PLAY : 'wdj://video/play.json',
                VIDEO_SELECT_VIDEO : 'wdj://window/select_video.json',

                // eBook Module
                BOOK_DOWNLOAD : 'wdj://book/download.json',

                // Account Module
                ACCOUNT_LOGIN : 'wdj://account/login.json',
                ACCOUNT_LOGOUT : 'wdj://account/logout.json',
                ACCOUNT_BIND : 'wdj://account/bind.json',
                ACCOUNT_REGIST : 'wdj://account/register.json',
                ACCOUNT_INFO : 'wdj://account/account_info.json',
                ACCOUNT_SHARE : 'wdj://account/share.json',

                // Backup
                BACKUP_PREPARE : 'wdj://backup/prepare.json',
                BACKUP_CHECK_FILE : 'wdj://backup/check_file.json',
                BACKUP_GET_SETTING : 'wdj://backup/get_setting.json',
                BACKUP_SET_SETTING : 'wdj://backup/set_setting.json',
                BACKUP_START : 'wdj://backup/start.json',
                BACKUP_CANCEL : 'wdj://backup/cancel.json',
                BACKUP_FINISH : 'wdj://backup/finish.json',

                // Restore
                RESTORE_BACKUP_FILE : 'wdj://restore/backup_file.json',
                RESTORE_READ_FILE : 'wdj://restore/read_file.json',
                RESTORE_FILE_SELECT : 'wdj://restore/file_select.json',
                RESTORE_CLEAR : 'wdj://restore/clear.json',
                RESTORE_RESUME : 'wdj://restore/resume.json',
                RESTORE_CANCEL : 'wdj://restore/cancel.json',
                RESTORE_FINISH : 'wdj://restore/finish.json',
                RESTORE_RETRY : 'wdj://restore/retry.json',
                RESTORE_START : 'wdj://restore/start.json',
                RESTORE_APPS : 'wdj://restore/restore_apps.json',

                // iTunes
                ITUNES_IMPORT_CHECK : 'wdj://itunes/check.json',
                ITUNES_IMPORT_BEGIN : 'wdj://itunes/begin.json',
                ITUNES_IMPORT_FINISH: 'wdj://itunes/finish.json',
                ITUNES_IMPORT_PARSE : 'wdj://itunes/parser.json',
                ITUNES_IMPORT_QUERY : 'wdj://itunes/query.json',
                ITUNES_IMPORT_AUDIO : 'wdj://itunes/import_audio.json',
                ITUNES_CREATE_PLAYLIST : 'wdj://itunes/create_playlist.json',

                // Doraemon
                PLUGIN_LIST : 'wdj://sidebar/list.json',
                PLUGIN_LOAD : 'wdj://sidebar/load_extension.json',
                PLUGIN_PREVIEW : 'wdj://sidebar/preview.json',
                PLUGIN_REMOVE : 'wdj://sidebar/delete_item.json',
                PLUGIN_ADD : 'wdj://sidebar/add_item.json',
                PLUGIN_UPDATE : 'wdj://sidebar/update.json',
                PLUGIN_LOAD_LOCAL : 'wdj://sidebar/load_local_extension.json',
                PLUGIN_RELOAD : 'wdj://sidebar/reload_list.json',

                // Rom Flash
                FLASH_ROM_FLASHABLE : 'wdj://flash/is_flashable.json',

                // PhotoSync
                IS_PHOTO_SYNC_ON : 'wdj://sync/is_sync_on.json',
                SET_PHOTO_SYNC : 'wdj://sync/set_sync_switch.json',
                UPLOAD_PHOTO : 'wdj://sync/start_sync.json',

                GET_LATEST_AUTO_BACKUP : 'wdj://sync/latest_bacukup_file.json',
                OPEN_AUTO_BACKUP_FILE : 'wdj://window/open_auto_backup_folder.json',
                OPEN_PHOTO_AUTO_BACKUP_FILE : 'wdj://window/open_photo_backup_folder.json',
                OPEN_PHOTO_AUTO_BACKUP_FILE_HELPER : 'wdj://helper/open_photo_backup_folder.json',
                IS_USER_FLASHED : 'wdj://sync/is_flashed.json',
                GET_SYSTEM_SETTING : 'wdj://window/get_system_setting.json',
                OPEN_NOTIFY_SETTING : 'wdj://window/save_desktop_notification.json',

                OPEN_SYNC_AND_START : 'wdj://window/open_sync_and_start.json',
                OPEN_SYNC_AND_START_HELPER : 'wdj://helper/open_sync_and_start.json',
                OPEN_SYNC_DISABLE_NOTFIY : 'wdj://helper/disable_download_photo_notify.json',
                CLOSE_ALL_NOTIFICATION_HELPER : 'wdj://helper/close_all_notification.json',
                OPEN_NOTIFY_SETTING_HELPER : 'wdj://helper/open_notify_setting.json',

                // Optimize
                OPTIMIZE_SCAN : 'wdj://optimize/scan_all.json',
                OPTIMIZE_CHECK : 'wdj://optimize/check.json',
                OPTIMIZE_INSTALL : 'wdj://optimize/install.json',
                OPTIMIZE_RAM :　'wdj://optimize/optimize_tasks.json',
                OPTIMIZE_CACHE : 'wdj://optimize/optimize_cache.json',
                OPTIMIZE_CANCEL : 'wdj://optimize/cancel.json',

                // Cloud Backup Restore
                SYNC_MANUAL_BACKUP : 'wdj://sync/manual_sync.json',
                SYNC_SNAPSHOT_LIST : 'wdj://sync/snapshot_list.json',
                SYNC_SNAPSHOT_INFO : 'wdj://sync/snapshot_info.json',
                SYNC_SNAPSHOT_FILE : 'wdj://sync/snapshot_file.json',
                SYNC_SET_SWITCH : 'wdj://window/sync_set_cloud_switch.json',
                SYNC_IS_SWITCH_ON : 'wdj://window/sync_is_cloud_switch_on.json',
                SYNC_STOP_REMOTE_SYNC : 'wdj://sync/stop_sync.json',

                // Cloud API
                APP_QUERY_INFO : 'http://apps.wandoujia.com/api/v1/apps',
                APP_WASH_FEEDBACK : 'http://apps.wandoujia.com/api/v1/xibaibai/feedback',
                APP_WASH_GET_TEXT : 'http://apps.wandoujia.com/api/v1/xibaibai/feedback',
                APP_WASH_SCAN : 'http://apps.wandoujia.com/api/v1/xibaibai/scanner',
                APP_STARTER : 'http://apps.wandoujia.com/api/v1/apps?app_type=starter',

                ACCOUNT_REG : 'https://account.wandoujia.com/v1/wandoujia/register.json'
            },
            events : {
                // Backend events - Public events
                DEVICE_STATE_CHANGE : 'device.state_changed',
                DEVICE_OFFLINE_CHANGE : 'device.offline_changed',
                DEVICE_USB_DETECT : 'usb.detect',
                DEVICE_ID_CHANGE : 'device.change_to',
                WEB_NAVIGATE : 'web.navigate',
                WEB_FORCE_NAVIGATE : 'web.force.navigate',
                SETTING_PRIVACY : 'setting.privacy',
                THEME_CHANGED : 'themes.folder_changed',
                SETTING_APP_CHANGE : 'app.setting.changed',

                // Backend events - Task manager module
                TASK_START : 'jobs.start',
                TASK_ADD : 'jobs.add',
                TASK_STOP : 'jobs.stop',
                TASK_OPEN_MONITOR : 'jobs.autoopen',
                TASK_CHANGE : 'jobs.changed',
                TASK_NEED_CONFIRM : 'jobs.need_force',
                TASK_DUPLICATED : 'jobs.duplicated',
                TASK_STATUS_CHANGE : 'jobs.status_changed',

                // Backend events - Contact module
                CONTACT_UPDATED : 'contacts.updated',
                CONTACT_SYNCED : 'contacts.synced',

                // Backend events - Application module
                APP_LIST_UPDATED : 'apps.updated',
                APP_INSTALL_STARTED : 'apps.install.started',
                APP_INSTALL_FAILED : 'apps.install.failed',
                APP_INSTALL_SUCCESS : 'apps.install.success',
                APP_INSTALLED : 'apps.install.success',
                APP_INSTALL_1_X : 'web.download',
                APP_INSTALL_LOCAL : 'web.install',
                WEB_APP_LIST_UPDATED : 'apps.my_apps.updated',

                // Backend events - SMS_CallLog module
                SMS_CALLLOG_SMS_RECEIVE : 'sms.received',
                SMS_CALLLOG_SMS_UPDATED : 'sms.updated',

                // Backend events - Music module
                MUSIC_DOWNLOAD_SUCCESS : 'music_download',
                MUSIC_UPDATED : 'music.updated',

                // Backend events - Photo module
                PHOTO_DOWNLOAD_SUCCESS : 'photo_download',
                PHOTO_UPDATED : 'photo.updated',
                PHOTO_SHOW_IMPORTOR : 'photo.show.importor',

                // Backend events - Account module
                ACCOUNT_STATE_CHANGE : 'account.state_changed',

                // Backend events - Video module
                VIDEO_UPDATED : 'video.updated',
                VIDEO_DOWNLOAD_SUCCESS : 'video.download',

                // Backend events - Message module
                MESSAGE_CLOSE_MESSAGE_NOTIFICATION : 'close_message_notification',
                MESSAGE_MARK_AS_READ : 'mark_as_read',

                // Backend events - Iframe events
                HISTORY_CHANGED : 'history.changed',
                FLASH_ERROR : 'flash.error',

                // iTunes
                AUDIOS_IMPORT_MESSAGE : 'iTunes_audios_import',
                PLAYLIST_IMPORT_MESSAGE : 'iTunes_playlist_import',

                SIDEBAR_UPDATED : 'sidebar.list',
                SIDEBAR_PREVIEW : 'sidebar.preview',
                SIDEBAR_STAR : 'sidebar.star',
                SIDEBAR_ITEM_UPDATED : 'sidebar.updated',

                BACKUP_FINISH : 'backup.finish.success',

                // Sync
                SYNC_PHOTO_COMPLETE : 'sync.complete',
                SYNC_CLOUD_SETTING_CHANGE : 'sync.cloud_setting_changed',
                SYNC_PHOTO_NOTIFY_UPDATE : 'sync.photo.num',
                SYNC_BACKUP_START : 'backup.guide.start',

                // Auto Backup
                AUTO_BACKUP_START : 'autobackup.progress.start',
                AUTO_BACKUP_CHANGE : 'autobackup.progress.changing',
                AUTO_BACKUP_COMPLETE : 'autobackup.progress.completed',
                DOWNLOAD_PHOTO_COMPLETE : 'sync.photo.updated',

                CUSTOM_WELCOME_BILLBOARD_NAVIGATE : 'billborad.navigate',
                CUSTOM_WELCOME_USER_GUIDE_READY : 'welcome.guide.ready',
                CUSTOM_WELCOME_USER_GUIDE_FINISH : 'welcome.guide.finish',
                CUSTOM_GALLERY_STAR : 'gallery.star',
                CUSTOM_GALLERY_UNSTAR : 'gallery.unstar',
                CUSTOM_IFRAME_ALERT : 'iframe.alert',
                CUSTOM_IFRAME_CONFIRM : 'iframe.confirm',
                CUSTOM_IFRAME_DISPOSABLE : 'iframe.disposable',
                CUSTOM_IFRAME_PHOTO_SHARE : 'iframe.photo.share',
                CUSTOM_IFRAME_PHOTO_DELETE : 'iframe.photo.delete',
                CUSTOM_IFRAME_PHOTO_DELETED : 'iframe.photo.deleted',
                CUSTOM_IFRAME_PHOTO_EXPORT : 'iframe.photo.export',
                CUSTOM_IFRAME_PHOTO_SYNC_ALERT : 'iframe.photo.sync.alert',
                CUSTOM_IFRAME_PHOTO_RENDERED : 'iframe.photo.rendered',
                CUSTOM_IFRAME_PHOTO_SELECT_TAB : 'iframe.photo.select.tab'
            },
            enums : {
                /*Environment locale*/
                LOCALE_DEFAULT : 0,
                LOCALE_ZH_CN : 1,
                LOCALE_EN_US : 2,

                /* Device and connection type */
                VIRTUAL_DEVICE : 0,
                OFFLINE_DEVICE : 1,
                USB_DEVICE : 2,
                WIFI_DEVICE : 3,
                INTERNET_DEVICE : 4,
                ADB_DEVICE : 6,

                /* Web navigate types */
                NAVIGATE_TYPE_MARKET : 'market',
                NAVIGATE_TYPE_GROUP_APP : 'group_app',
                NAVIGATE_TYPE_APP : 'app',
                NAVIGATE_TYPE_GROUP_CONTACT : 'group_contacts',
                NAVIGATE_TYPE_CONTACT : 'contact',
                NAVIGATE_TYPE_CONTACT_CREATE : 'contact_create',
                NAVIGATE_TYPE_GROUP_SMS : 'group_sms',
                NAVIGATE_TYPE_SMS : 'sms',
                NAVIGATE_TYPE_SEND_SMS : 'send_sms',
                NAVIGATE_TYPE_PAGE : 'page',
                NAVIGATE_TYPE_WEBAPP : 'web_app',
                NAVIGATE_TYPE_PHOTO_CLOUD : 'photo_cloud',
                NAVIGATE_TYPE_BACKUP_CLOUD : 'backup_cloud',
                NAVIGATE_TYPE_ILLEGAL_LOGOUT : 'illegal_logout',
                NAVIGATE_TYPE_GALLERY : 'gallery',
                NAVIGATE_TYPE_IMPORT_MUSIC : 'import_music',
                NAVIGATE_TYPE_IMPORT_IMAGE : 'import_image',
                NAVIGATE_TYPE_IMPORT_VIDEO : 'import_video',
                NAVIGATE_TYPE_THEME : 'themes',
                NAVIGATE_TYPE_APP_WASH : 'wash',
                NAVIGATE_TYPE_TASK_MANAGER : 'task_manager',

                /* Update ignore states */
                UPDATE_IGNORE_NONE : 'none',
                UPDATE_IGNORE_THIS_VERSION : 'version',
                UPDATE_IGNORE_FOREVER : 'forever',

                /* Application installation locations */
                INSTALL_LOCATION_EXTENTION : 2,
                INSTALL_LOCATION_DEVICE : 1,

                /* Default contact icon */
                CONTACT_DEFAULT_ICON : 'images/contact-default-small.png',
                CONTACT_DEFAULT_BATCH_ICON : 'images/contact-default-batch.png',
                CONTACT_DEFAULT_ICON_LARGE : 'images/contact-default-large.png',
                CONTACT_DESCRIPTION_ITEM_TYPE_PHONE_NUMBER : 0,

                /* MUSIC ITUNES IMPORT TYPE*/
                ITUNES_IMPORT_ALL : '0',
                ITUNES_IMPORT_PLAYLIST : '1',
                ITUNES_IMPORT_AUDIOS : '2',

                /* SMS Conversation Type*/
                SMS_CONVERSATION_TYPE_ALL : 0,
                SMS_CONVERSATION_TYPE_UNREAD : 1,
                SMS_CONVERSATION_TYPE_SPECIFY_ID : 2,
                SMS_CONVERSATION_TYPE_SPECIFY_SMS_ID : 3,

                /* SMS Conversation Sortby */
                SMS_CONVERSATION_SORTBY_DATE_DESC : 0,
                SMS_CONVERSATION_SORTBY_DATE_ASC : 1,
                SMS_CONVERSATION_SORTBY_NAME_DESC : 2,
                SMS_CONVERSATION_SORTBY_NAME_ASC : 3,
                SMS_CONVERSATION_SORTBY_UNREAD_AMOUNT_DESC : 4,
                SMS_CONVERSATION_SORTBY_UNREAD_AMOUNT_ASC : 5,
                SMS_CONVERSATION_SORTBY_TOTAL_AMOUNT_DESC : 6,
                SMS_CONVERSATION_SORTBY_TOTAL_AMOUNT_ASC : 7,

                /* SMS Threads Type */
                SMS_THREADS_TYPE_SPECIFY_ID : 0,
                SMS_THREADS_TYPE_SPECIFY_CONTACT : 1,
                SMS_THREADS_TYPE_SPECIFY_NUMBER : 2,
                SMS_THREADS_TYPE_ALL : 3,

                /* SMS Type*/
                SMS_TYPE_RECEIVE : 1,
                SMS_TYPE_SENT : 2,
                SMS_TYPE_SENDING : 4,
                SMS_TYPE_SENT_FAILD : 5,
                SMS_TYPE_QUEUE : 6,

                /* Task type */
                TASK_TYPE_PUSH : 4,
                TASK_TYPE_LOCAL_INSTALL : 3,
                TASK_TYPE_DOWNLOAD : 2,
                TASK_TYPE_INSTALL : 1,
                TASK_TYPE_PARSING_VIDEO_URL : 5,
                TASK_TYPE_MERGE_VIDEO : 6,
                TASK_TYPE_UNZIP : 7,
                TASK_TYPE_RESTORE_APP_DATA : 8,

                /* Task state */
                TASK_STATE_ADDED : 0,
                TASK_STATE_WAITING : 1,
                TASK_STATE_PAUSE : 2,
                TASK_STATE_PROCESSING : 3,
                TASK_STATE_SUCCESS : 4,
                TASK_STATE_FAILD : 5,
                TASK_STATE_STOPPED : 6,

                /* Task default icon path */
                TASK_DEFAULT_ICON_PATH_APP : 'images/icon_default_app_36X36.png',
                TASK_DEFAULT_ICON_PATH_MUSIC : 'images/icon_default_music_36X36.png',
                TASK_DEFAULT_ICON_PATH_PHOTO : 'images/icon_default_pic_36X36.png',
                TASK_DEFAULT_ICON_PATH_VIDEO : 'images/icon_default_video_36X36.png',
                TASK_DEFAULT_ICON_PATH_BOOK : 'images/icon_default_ebook_36X36.png',
                TASK_DEFAULT_ICON_PATH_FILE : 'images/icon_default_file_36X36.png',
                IMAGE_SPACER : 'images/spacer-20X20.png',

                /* Defaut icon */
                DEFAULT_30X30 : 'images/default-30X30.png',
                DEFAULT_42X42 : 'images/default-42X42.png',

                /* Model type */
                MODEL_TYPE_APPLICATION : 'app',
                MODEL_TYPE_APPLICATION_DATA : 'app_data',
                MODEL_TYPE_MUSIC : 'music',
                MODEL_TYPE_VIDEO : 'video',
                MODEL_TYPE_PHOTO : 'photo',
                MODEL_TYPE_BOOK : 'ebook',

                /* Screen shot settings */
                SCREEN_SHOT_DESTINATION_FILE : 0,
                SCREEN_SHOT_DESTINATION_CLIPBOARD : 1,

                /* Sina share pic size */
                SINA_SHARE_PIC_LIMIT_SIZE : 5,

                // Photo type
                PHOTO_ALL_TYPE : 0,
                PHOTO_PHONE_TYPE : 1,
                PHOTO_LIBRARY_TYPE : 2,
                PHOTO_CLOUD_TYPE : 3,

                // External links
                URL_TAPAS_HELP : 'http://bbs.dianxinos.com/',
                URL_MULTI_SIM_HELP : 'http://help.wandoujia.com/entries/21550442',
                URL_EXTENSION_PUBLISH : 'http://www.wandoujia.com/webstore/dev',
                URL_WELCOME_BILLBOARD : 'http://www.wandoujia.com/webstore/billboard',
                URL_WELCOME_BILLBOARD_EN : 'https://s3.amazonaws.com/snappea_welcome/startpage.html',
                URL_WANDOUJIA_APP_DETAIL_PAGE : 'http://apps.wandoujia.com/apps/{1}?{2}',

                /* Facebook share api */
                FACEBOOK_LOGOUT_URI : 'https://www.facebook.com/logout.php',
                FACEBOOK_REDIRECT_URI : 'http://www.snappea.com/facebook/proxy.html',
                FACEBOOK_OAUTH_API : 'https://graph.facebook.com/oauth/authorize?client_id=265004820250785&scope=publish_stream&display=popup&response_type=token&redirect_uri=',

                GALLERY_URL : 'http://www.wandoujia.com/webstore/sidebar/gallery',

                // PhotoSync
                PHOTO_SYNC_TEXT_LINK : 'www.wandoujia.com/photos',
                PHOTO_SYNC_LINK : 'https://account.wandoujia.com/?auth={1}&callback=http%3A%2F%2Fwww.wandoujia.com%2Fphotos%3Fsource%3Dwindows',

                REPORT_URL : 'http://www.wandoujia.com/webstore/sidebar/report',
                IFRAME_PREFIX : 'wdj-extension-frame-',
                TEMP_EXTENTION_ID : 'wdj-extention-temp',
                EXTENTION_ERROR_PAGE_URL : 'javascripts/modules/browser/extention-error.html',

                SYNC_DATA_TYPE_CONTACTS : 30101,
                SYNC_DATA_TYPE_SMS : 30201,
                SYNC_DATA_TYPE_PHOTO : 40101,
                SYNC_DATA_TYPE_APP : 50101,

                SYNC_PROGRESS_START : 1,
                SYNC_PROGRESS_SUCCESS : 2,
                SYNC_PROGRESS_FAILED : 3,
                SYNC_PROGRESS_COMPLETED : 4,

                FLASH_DOWNLOAD_URL : 'http://dl.wandoujia.com/files/flash/latest/flashplayer',

                // Social Urls
                SOCIAL_APP_BIO_URL : 'http://app-bio.wandoujia.com/apps/{1}',
                SOCIAL_TEXT_PREVIEW_POST_URL : 'http://social-services.wandoujia.com/preview/text?content_type={1}',
                SOCIAL_TEXT_PREVIEW_URL : 'http://social-services.wandoujia.com/preview/text?content_type={1}&content={2}',
                SOCIAL_IMAGE_PREVIEW_URL : 'http://social-services.wandoujia.com/preview/image?content_type={1}&content={2}',

                // Social Share Type
                SOCIAL_PHOTO : 'photo',
                SOCIAL_APP : 'app',
                SOCIAL_WELCOME : 'welcome',
                SOCIAL_SET_WALLPAPER : 'set_wallpaper',
                SOCIAL_UNINSTALL_APP : 'uninstall_app',
                SOCIAL_WASH : 'wandoujia_wash',

                // Social Share Errorcode
                SOCIAL_SHARE_FAILED : '10',
                SOCIAL_SHARE_COOKIE_EXPIRED : '101',

                // Backup Restore
                BR_TYPE_CONTACT : 1,
                BR_TYPE_CONTACT_GROUP : 2,
                BR_TYPE_SMS : 3,
                BR_TYPE_MMS : 4,
                BR_TYPE_CALLLOG : 5,
                BR_TYPE_BOOKMARK : 6,
                BR_TYPE_SETTING : 7,
                BR_TYPE_APP : 8,
                BR_TYPE_WDAPK : 9,
                BR_TYPE_APP_DATA : 10,

                BACKUP_APP_DATA_MESSAGE_NEED_USER : 'NEED_USER_BACKUP',
                BACKUP_APP_DATA_MESSAGE_START : 'BACKUP_START',
                BACKUP_APP_DATA_MESSAGE_SPLIT : 'SPLIT_BACKUP_FILE',
                BACKUP_APP_DATA_MESSAGE_NEED_USER_RESTORE : 'NEED_USER_RESTORE',

                SETTING_AUTO_BACKUP_COMPLETE : 'auto_backup_complete',
                DOWNLOAD_PHOTO_COMPLETE : 'download_photo_complete',

                APP_WASH_AUTH_KEY : 'gpo3uybFexlfH0NJWaZPjFtLFkEPkCHl',

                SINFGLE_MESSAGE_CHAR_NUMBER : 140
            }
        };

        /* apply Object.freeze recursively to an object */
        var objectDeepFreeze = function (object) {
            Object.keys(object).forEach(function (key) {
                if (typeof object[key] === 'object') {
                    objectDeepFreeze(object[key]);
                }
            });
            Object.freeze(object);
            return object;
        };

        objectDeepFreeze(Configuration);

        Object.defineProperty(window, 'CONFIG', {
            value : Configuration,
            writable : false,
            enumerable : true,
            configurable : false
        });

        return Configuration;
    });
}(this));
