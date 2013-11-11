/*global define*/
define({
    NAME : 'Name:',
    DATE : 'Date:',
    FILE_SIZE : 'File size:',
    USB_LOADING_INFO : 'Reading phone\'s data, please wait...',
    USB_LOADING_INFO_FAILED : 'Failed to read phone\'s data, please try again',
    USB_ROM_TOO_OLD : 'Your phone\'s ROM is lower than version 2.0. SnapPea doesn\'t support it.',
    USB_INSTALL_FAILED : 'Failed to install SnapPea to your phone, please try again.',
    USB_UPDATE_FAILED : 'Failed to update SnapPea on your phone, please try again.',
    USB_INSTALL_APK_INVALID : 'Version of SnapPea on your phone is invalid, please try again.',
    USB_APK_INSTALLING : 'After SnapPea finishes installing on your phone, you can start managing your phone...',
    USB_APK_UPDATING : 'After SnapPea finishes updating on your phone, you can start managing your phone...',
    USB_INSTALL_FAILED_NO_MORE_SPACE : 'Failed to install SnapPea on your phone, storage space is insufficient.',
    USB_INSTALL_FAILED_INTERNAL_ERROR : 'Failed to install SnapPea on your phone, internal error on phone.',
    PHTONE_DISCONNECTED : 'Phone disconnected',

    POSIBLE_REASON : 'Possible reason:',

    MTP_BLOCK_BY_SCREEN_LOCK : 'Your phone\'s screen may be locked. The SD Card Manager feature requires your phone to unlocked. Please unlock your phone\'s screen, or use FTP mode <span class="link button-ftp">to manage your SD Card.</span>',

    SELECT : 'Select',
    CAESURA_SIGN : ', ',
    DESELECT : 'Deselect',
    DISPLAY : 'Display: ',
    PAUSE : 'Pause',
    DELETE : 'Delete',
    IMPORT : 'Import',
    EXPORT : 'Export',
    REFRESH : 'Refresh',
    RETRY : 'Retry',
    HOME_PAGE : 'Home',
    REPORT_PROBLEM : 'Report a problem',
    REPORT_TIP : 'Woah, is this site not working right? Report it and the hard-working SnapPeas will fix it.',
    REPORT_SITE_NAME : 'Site name: ',
    REPORT_SUCCESS : 'Report sent. Thanks for making the world a better place!',
    REPORT_FAILED : 'Uh oh, report failed.',
    PROBLEM_DES : 'Problem description: ',
    EMAIL_LABEL : 'Email: ',
    LOCALE_EXTENTION : 'Locale extension:',
    ZIP_EXTENTION : 'Zip extension',
    RELOAD_EXTENTION : 'Reload extension',
    RELOAD_SUCCESS : 'Reload successful',
    CONFIRM_EXTENTION : 'Are you sure you want to restore the default extension settings?',
    MANGEMENT : 'Manage',
    ADD_TO_COLLECT : 'Add extension',
    BATCH_UNSTAR_PLUGINS : '<p>Remove {1} selected extension(s)？</p>',
    PUBLISH : 'Publish',
    LOGIN_TO_MANAGE : 'Register to add extensions',
    LOGIN_TO_STAR : 'Register to add extensions',
    DEVICE_CAPACITY_REMAIN : ', Remaining internal storage space: {1}',
    SD_CAPACITY_REMAIN : ', Remaining SD card space: {1}',
    STAR : 'Star',
    STARRED_COUNT : 'Starred total: {1}',
    FLASH_NOTIFIER : 'You need to download Adobe Flash Player in order to show all content on this page.',
    DOWNLOAD_FLASH : 'Download Adobe Flash Player',
    APP_DEPENDENCY_TIP : '「{1}」type of content requires you to download another app to view',
    SEND : 'Submit',

    PLEASE_UNMOUNT_SD_CARD : 'Please turn off USB storage mode',
    PLEASE_UNMOUNT_SD_CARD_DES : 'SnapPea can\'t read your SD card. Turn off USB storage mode and try again.',

    ALERT_TIP_NO_SD_CARD : 'Oh no, SD card is not available. Make sure SD card is properly inserted into your phone.',

    DEFAULT_DEVICE_NAME : 'Android Device',
    CONNECTION_LOSE : 'Disconnect',
    NOT_ENOUGH_ROOM_FOR_IMPORT : 'Import failed. Please make space on your device\'s internal storage or SD card and try again.',
    EXPLORE : 'Select',
    OPEN_EXPORT_FILE : 'Open export folder',

    SCREEN_SHOT_UNDER_USB : 'Connect via USB to mirror your device',

    SELECTOR_DESCRIPTION_TEXT : '{1} selected, {2} in total',
    ADD_FILE : 'Select file',
    ADD_FOLDER : 'Select folder',

    NAV_WELCOME_TO_WDJ : 'Welcome',
    NAV_OPTIMIZE : 'Optimizer',
    NAV_CONTACT : 'Contacts',
    NAV_CONTACT_ALL : 'All ',
    NAV_CONTACT_HAS_PHONE : 'With Phone # ',
    NAV_CONTACT_STARRED : 'Starred ',
    NAV_APP : 'Apps',
    NAV_APP_INSTALLED : 'Installed',
    NAV_APP_SYS : 'System',
    NAV_APP_UPDATABLE : 'Updates',
    NAV_SMS : 'Messages',
    NAV_SMS_ALL : 'All',
    NAV_SMS_UNREAD : 'Unread',
    NAV_MUSIC : 'Music',
    NAV_PIC : 'Photos',
    NAV_PIC_PHONE_LIB : 'My Photos',
    NAV_PIC_GALLERY : 'Picture Library',
    NAV_PIC_CLOUD : 'Cloud photos',
    NAV_VIDEO : 'Videos',
    NAV_SHOW_GALLERY : 'Add extensions',

    ADD_COLLECT : 'Save extension',
    MOVE_UP : 'Up',
    MOVE_DOWN : 'Down',
    REMOVE_COLLECT : 'Remove extension',
    SITE_NAME : 'Content source',
    DEVELOPER : 'Developer',
    DEVELOPER_LABEL : 'Developer:',
    LOAD_EXTENTION : 'Load extension:',
    CATEGORY : 'Category',
    POPULARITY : 'Popularity',
    GALLERY_EMPTY_LIST : 'No extensions saved. Add one!',
    REST_EXTENTION : 'Restore default extensions',

    ILLEGAL_LOGOUT : 'Sorry, you can only cancel your account when your device is connected.',
    BIND : 'Link',
    UNBIND : 'Don\'t link',
    BINDING_DEVICE : 'Link device',
    BINDING_TITLE : 'Link current device?',
    BINDING_DES : 'Linking your device lets you:',
    BINDING_AUTOBACKUP : 'Auto-backup data',
    BINDING_AUTOBACKUP_DES : '<span class="text-warning">Contacts, Messages, and Pictures</span> will auto-backup to your computer',
    BINDING_ACCOUNT : 'Remember my SnapPea account',
    BINDING_ACCOUNT_DES : 'Your login will be remembered.',
    BINDING_CONNECT : 'Auto-connect device',
    BINDING_CONNECT_DES : 'Launch SnapPea and your device will auto-connect',
    BINDING_UPDATE : 'App update notices',
    BINDING_UPDATE_DES : 'When you have apps to update, SnapPea will let you know',
    BINDING_WARNING : 'If this isn\'t your computer, don\'t link!',

    FTP_FIX : 'SnapPea will restore your FTP settings to let you browse your device\'s SD card. Do you want to restore?',
    FIX : 'Restore',
    FIX_FAILED : 'Restore failed',
    OPEN_DERICTLY : 'Open now',

    REVIEW_FOR_UNINSTALL_TIPS : 'Uninstall completed. Why did you uninstall?',
    REVIEW_FOR_UNINSTALL_TRAFFIC : 'Uses too much data',
    REVIEW_FOR_UNINSTALL_ADS : 'Ads',
    REVIEW_FOR_UNINSTALL_MEMORY : 'Uses too much space',
    REVIEW_FOR_UNINSTALL_OTHER : 'It just doesn\'t work',

    NOTIFY_SETTING : 'Desktop notifcations',
    DONT_SHOW_AGAIN : 'Don\'t show again',

    /* From common */

    SHARE : 'Share',
    VIEW_PIC : 'View larger image',
    REFRESH_ERROR : 'Reload failed',
    VIEW : 'View',
    RECOMMEND_YES : 'Yes (recommended)',
    OPEN : 'Open',
    WANDOUJIA_TOPIC : '#SnapPea# ',

    SHARE_TO : 'Share to:',
    SHARE_TO_FACEBOOK_FAILD : 'Share to Facebook failed',
    SHARE_TO_FACEBOOK : 'Share to Facebook',
    SHARE_WIDGET_TITLE : 'Share to {1}',
    SHARE_WIDGET_TITLE_2 : 'Share {1}',
    SHARE_WIDGET_INPUT_COUNT_TEXT : '{1}/120 characters',
    SHARE_WIDGET_INPUT_OVER_COUNT_TEXT : 'More than {1} characters, message will be shortened.',
    SHARE_WIDGET_CONTENT_TIP_TEXT : 'Image will be attached to your post',
    SHARE_WIDGET_SENT_TEXT : 'Shared to Facebook',
    SHARE_WIDGET_FAILED_TEXT : 'Failed to share to Facebook',
    SHARE_WIDGET_COOKIE_EXPIRED_TEXT : 'Faile to share, please login again',
    SHARE_WIDGET_PREVIEW_PIC : 'Image preview',
    SHARE_WIDGET_VIEW_FROM_PC_ERROR : 'Sorry, failed to display larger image',
    SHARE_WIDGET_PIC_LIMIT_SIZE_TIP : 'Sorry, you can\'t share pictures larger than {1} MB',
    SHARE_WIDGET_ERROR_NEED_SELECT_PLATFORM : 'Sorry, you can\'t share content without selecting social network',
    SHARE_WIDGET_SHARE_TIP : 'Share something',
    SHARE_WIDGET_EXIT_TEXT : 'Sign out',
    SHARE_CONTENT_TYPE_SCREENSHOT : 'Screenshot',
    SHARE_CONTENT_TYPE_PHOTO : 'Photo',
    SHARE_CONTENT_TYPE_WELCOME : 'SnapPea',
    SHARE_CONTENT_TYPE_APP : 'App',
    FACEBOOK_MESSAGE_FROM : ' From my {1}.',


    SHARE_BINDED : 'Already linked',
    SHARE_TO_SINA : 'Linked to Sina Weibo',
    SHARE_TO_QQ : 'Linked to Tencent Weibo',
    SHARE_TO_QZONE : 'Linked to Qzone',
    SHARE_TO_RENREN : 'Linked to Renren',

    TODAY : 'Today',
    YESTODAY : 'Yesterday',

    HOUR : '{1} hour(s)',

    NO_SD_CARD_TIP_TEXT : 'No SD card detected',

    CANCEL_IMPORT_TEXT : 'Import canceled',
    CANCEL_EXPORT_TEXT : 'Export canceled',


    SD_CAPACITY_TIP : 'Your SD card is almost full!',
    PHONE_CAPACITY_TIP : 'Not enough internal storage space',
    SD_CAPACITY_ACTION : 'Open your SD card manager',
    PHONE_CAPACITY_ACTION : 'Move all your apps to your SD card in one-click',

    SEND_MAIL_FAILD : 'Failed to send email',

    LOAD_MORE : 'Loading more...',
    LOADING : 'Loading...',
    LOAD_FAILD : 'Failed to load',

    /* New */

    MMS : 'MMS',
    COLLAPSE : 'Collapse',
    DELETING : 'Deleting, please wait...',
    EXPORTING : 'Exporting, please don\'t turn off your phone',
    BACKUP_RECORD : 'Auto backup files',
    IMPORT_FROM_FILE : 'Import from file',
    SIZE : 'Size',
    PLAY : 'Play',
    STOP : 'Stop',
    CLOUD_BACKUP : 'Cloud backup',
    CLOUD_BACKUP_OPEN : 'Turn on cloud backup',
    ACCOUNT : 'Account',
    NICKNAME : 'Nickname',
    CLOUD_PHOTO_OPEN : 'Turn on cloud photos',
    RESELECT_FILE_TEXT : 'Re-select file',
    SAVE : 'Save',
    DONTSAVE : 'Don\'t save',
    PHONE : 'Internal memory',
    SD_CARD : 'SD Card',
    MANAGE_SD_CARD : 'Manage SD Card',

    AGENT_NOTIFI : 'Connected, enjoy the SnapPea service!',
    SEND_TO_PHONE : 'Send to phone',
    DO_NOT_SEND_TO_PHONE : 'Don\'t send'
});
