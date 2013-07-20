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

    POSIBLE_REASON : 'Possible reason:',

    MTP_BLOCK_BY_SCREEN_LOCK : 'Your phone\'s screen may be locked. The SD Card Manager feature requires your phone to unlocked. Please unlock your phone\'s screen, or use FTP mode <span class="link button-ftp">to manage your SD Card.</span>',

    SELECT : 'Select',
    CAESURA_SIGN : ', ',
    DESELECT : 'Deselect',
    DISPLAY : 'Display: ',
    PAUSE : 'Pause',
    CONTINUE : 'Continue',
    DELETE : 'Delete',
    IMPORT : 'Import',
    EXPORT : 'Export',
    FORWARD : 'Forward',
    BACK : 'Back',
    RESUME : 'Resume',
    REFRESH : 'Refresh',
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
    LOGIN_TO_SHARE : 'Register to share extensions',
    DEVICE_CAPACITY_REMAIN : ', Remaining internal storage space: {1}',
    SD_CAPACITY_REMAIN : ', Remaining SD card space: {1}',
    SUGGESTION_INSTALL : 'Recommended apps',
    STAR : 'Star',
    STARRED_COUNT : 'Starred total: {1}',
    DOWNLOAD_COUNT : 'Downloaded total: {1}',
    GALLERY_LOADING : 'Expanding download resources...',
    FLASH_NOTIFIER : 'You need to download Adobe Flash Player in order to show all content on this page.',
    DOWNLOAD_FLASH : 'Download Adobe Flash Player',
    GALLERY_TITLE : 'Download content',
    SUGGESTION_TIP : 'Unable to find the right content? Check out these:',
    APP_DEPENDENCY_TIP : '「{1}」type of content requires you to download another app to view',
    SEND : 'Submit',

    PLEASE_UNMOUNT_SD_CARD : 'Please turn off USB storage mode',
    PLEASE_UNMOUNT_SD_CARD_DES : 'SnapPea can\'t read your SD card. Turn off USB storage mode and try again.',

    ALERT_TIP_NO_SD_CARD : 'Oh no, SD card is not available. Make sure SD card is properly inserted into your phone.',

    DEFAULT_DEVICE_NAME : 'Android Device',
    CONNECTION_LOSE : 'Disconnect',
    NOT_ENOUGH_ROOM_FOR_IMPORT : 'Import failed. Please make space on your device\'s internal storage or SD card and try again.',
    EXPLORE : 'Select',
    FINISH : 'Completed',
    IMPORTING : 'Importing, please don\'t disconnect your device',
    IMPORT_FINISH : 'Import completed',
    OPEN_EXPORT_FILE : 'Open export folder',
    SHORE_TO_WEIBO : 'Share to Sina Weibo',

    SET_RINGTONE : 'Sounds',
    SCREEN_SHOT_UNDER_USB : 'Connect via USB to mirror your device',

    SELECTOR_DESCRIPTION_TEXT : '{1} selected, {2} in total',
    ADD_FILE : 'Select file',
    ADD_FOLDER : 'Select folder',

    TITLE_PIM : 'My device',
    TITLE_DOWNLOAD : 'Download',
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
    NAV_APP_IGNORED : 'Updates ignored',
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
    CONFIRM_RESET_EXTENTION : 'Are you sure you want to restore the default extension settings?',

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
    DONT_SHOW_AGAIN : 'Don\'t show again'
});
