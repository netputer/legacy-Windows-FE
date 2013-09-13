/*global define*/
define({
    CONTACT : 'Contacts',
    SMS : 'Messages',
    APP : 'Apps',
    APP_DATA : 'App data',
    BR_TYPE_WORD_ENUM : ['', 'Contacts', 'Groups', 'Messages', 'MMS', 'Call history', 'Bookmarks', 'Settings', 'App files', 'App files', 'App data'],

    BACKUP_TITLE : 'Backup Data',
    BACKUP_TITLE_LOCAL : 'Backup to computer',
    BACKUP_TITLE_REMOTE : 'Backup to cloud server',
    RESTORE_TITLE_LOCAL : 'Restore from computer',
    RESTORE_TITLE_REMOTE : 'Restore from cloud server',
    RESTORE_TITLE : 'Restore Data',
    START_BACKUP : 'Start backup',
    START_RESTORE : 'Start restore',

    BACKUP_WAITING : 'Waiting to backup{1}',
    BACKUP_PROCESS : '{1} backup in progress, please be patient...',
    BACKUP_PROCESS_APP_DATA : 'Backing up data, please check progress on your phone',
    BACKUP_FINISH : '{1} completed',
    BACKUP_FAILED : '{1} failed',

    RESTORE_PROCESS : '{1} restore in progress, please wait...',
    RESTORE_WAITING : 'Waiting to restore {1}',
    RESTORE_FINISH : '{1} restore completed',
    RESTORE_FAILED : '{1} restore failed',

    TIP_IN_WIFI : 'To prevent data loss, SnapPea does not support backup or restore via Wi-Fi.<br />Please connect your device via USB cable and try again',

    ERROR_WHEN_WRITE_ROM :  'Unable to detect your SD card... <br />Please confirm:<br />- "USB Mass Storage Mode" is turned off on your device.<br />- SD card is properly inserted into your device. <br />- Or, try inserting another SD card.',

    BACKUP_RESTORE_RUNING : 'Your device is currently backing up or restoring data.',
    BACKUP_TO_CLOUD_FAILED : 'Failed to backup to cloud server.',
    BACKUP_TO_CLOUD_FAILED_DETAIL : '{1} of {2} backups failed',
    RESTORE_INVLID_FILE : 'Invalid backup file, please try again',
    RESTORE_INVLID_CONTACTS_FILE : 'Invalid contacts file. If you want to import a single contact, please use the import feature in Contacts.',
    RESTORING_TIP : 'Restoring, please don\'t disconnect your device',
    SELECT_BACKUP_FILE : 'Select backup file',
    SELECT_BACKUP_FILE_FOLDER : 'Set backup folder',
    BACKUP_FILE : 'Backup file',
    SELECT_FILE : 'Select file',

    CHOOSE_APP_TYPE_TITLE : 'Select your backup method',
    RESTORE_CONNECTION_LOST : 'Unable to complete restore, your device was disconnected',
    SD_CARD_ERROR : 'Unable to write SD card. Please ensure that your SD card is not locked and that that it has enough free space',
    FILE_DOWNLOAD_ERROR : 'Failed to transfer files',
    CANCELED : 'Canceled operation',
    UNKNOW_ERROR : 'Unknown error',
    TYPE : 'Data type',
    QUANTITY : 'Number',
    SAVE_LOCATION : 'Set backups folder',
    SAVE_LOCATION_LABEL : 'Backups folder: ',
    OPEN_BACKUP_FILE : 'Open backups folder',
    PRIVACY_TIP : 'SnapPea doesn\'t encrypt backup files stored on your computer, please keep them safe.',
    BACKUPING : 'Backing up, please don\'t disconnect your device',
    BACKUP_FINISH_LABEL : 'Backup completed',
    RESTORE_FINISH_LABEL : 'Restore completed',
    BACKUP_COMPRESSING : 'Compressing backup files, please wait...',
    RESTORE_APP_TIP : 'SnapPea has added the apps you want to restore to the task manager, you can check the status there.',
    RESTORE_PERMISSSION_TIP1 : 'Sorry, {1} restore failed',
    RESTORE_PERMISSSION_TIP2 : 'It seems you\'re using an app or ROM to control data permissions. Examples include Avast! or the MIUI ROM. Please authorize SnapPea to use the following permission: {1}',
    RESTORE_PERMISSSION_TIP3 : 'Have you stopped restoring all data?',
    RESTORE_PERMISSSION_PART_TIP1 : 'Unfortunately {1} of {2} restores failed',
    SELECT_FILE_FOLDER_TIP : 'Sorry, SnapPea couldn\'t find that backup file. Is it in another location?',

    APP_TYPE_WDAPK_TITLE : 'Backup app list (recommended)',
    APP_TYPE_WDAPK_CONTENT : 'Backup app names. When you restore, we\'ll download the newest version of the app.',
    APP_TYPE_APK_TITLE : 'Backup full app file',
    APP_TYPE_APK_CONTENT : 'SnapPea will backup the full app file to your computer.',
    APP_TYPE_APK_CONTENT_WIFI : 'You\'re connected via Wi-Fi. Please connect via USB to use the backup feature.',


    BACKUP_TYPE_LOCAL_CONTENT : 'Backs up your device\'s data to your computer',
    BACKUP_TYPE_REMOTE_CONTENT : 'Backs up your device\'s data to your account on SnapPea\'s cloud servers.',

    CHOOSE_BACKUP_DATA_TIP : 'Select data to backup',
    CHOOSE_RESTORE_DATA_TIP : 'Select data to restore',
    LOGIN_FAILED_TIP : 'Failed to login. Check your Internet connection or backup from your computer.',
    PERMISSION_TIP : 'Failed to read device\'s data. <br />It may be that a security app on your device is blocking SnapPea.',

    SET_FILE_NAME : 'Name your backup file',
    DEFAULT_FILE_NAME : 'SnapPea backup file',
    FILE_NAME_UNLEGAL :　'Invalid file name, please try again',
    GET_FILE_PATH_FAILED : 'Invalid file path, please browse to select',
    GET_FILE_NAME_FAILED : 'Invalid backup file, please browse to select',
    SET_FILE_PATH_FAILED : 'Invalid file path, please select another one',
    SET_FILE_PATH_LINK_BUTTON : 'Select folder',
    SET_RESTORE_FILE_FAILED : 'Invalid backup file',

    CONNECT_LOST : 'Uh-oh, connection lost between your computer and device',
    FILE_PATH_INVALID : 'Invalid backup file name or folder, please try again',
    OVERWIRTE_EXISTS_FILE_TIP : 'Overwrite existing backup file?',
    BACKUP_FAILED_TIP : 'Backup failed:',
    RESTORE_FAILED_TIP : 'Restore failed:',
    BACKUP_ABORT_TIP : 'Backup aborted',
    RESTORE_ABORT_TIP : 'Connection lost between your computer and device. <br />SnapPea will continue the restore on your device, please check there.',
    APP_ERROR_LIST_TITLE : '{1} app(s) failed to backup。Ignore and continue to backup apps?',
    APP_DATA_ERROR_LIST_TITLE : '{1} apps failed to restore. Ignore?',

    RESTORE_TYPE_LOCAL_CONTENT : 'Backs up your device from the file stored on your computer',
    RESTORE_TYPE_REMOTE_CONTENT : 'Backs up from the files stored on SnapPea\'s cloud servers',
    RESTORE_LIST_SNAPHOST_FAILED : 'Failed to load app list',

    CHOOSE_RESTORE_FILE_TITLE : 'Select backup file to restore',
    CHOOSE_RESTORE_DATE_TITLE : 'Select date to restore from',
    RESTORE_DATE : 'Date',
    RESTORE_DEVICE : 'Device',
    CHOOSE_RESTORE_FILE_TIP_BEFORE : 'You can ',
    CHOOSE_RESTORE_FILE_TIP_AFTER : 'Start restore',

    RESOTRE_OLD_VERSION_TIP_BEFORE : 'You can select your own backup file to restore. If you need to use a .bak file, please use ',
    RESOTRE_OLD_VERSION_TIP_LINK : 'the old version of SnapPea',
    RESOTRE_OLD_VERSION_TIP_AFTER : ' Restore',
    RESTORE_OLD_VERSION_DL_LINK : 'http://dl.wandoujia.com/files/release/wdj_installer.exe',

    RESTORE_REMOTE_EMPTY_LIST : 'Your files aren\'t on the cloud. <br /> You must first backup to the cloud, before you can restore.',
    RESTORE_BATTERY_TIP : 'Your device\'s batter power is less than 20%. If your device shuts down, your backup may be incomplete. We recommend that charge your device and then restore. Continue anyway?',
    RESTORE_CHOOSE_ACCOUNT_TIP : 'Backup contacts to which account? Please select:',
    RESTORE_DELETE_DATA_TIP : 'Don\'t want to delete any data? Choose to how to handle your restore.',
    RESTORE_DELETE_DATA_TIP_YES : 'Delete, I only need the data from the restore.',
    RESTORE_DELETE_DATA_TIP_NO : 'Don\'t delete, keep two copies of my data.',

    RESTORE_UNKNOW_DEVICE : 'Unrecognized device',
    RESTORE_DOWNLOAD_PROGRESSING : 'Downloading backup data from cloud servers, please wait...',

    AUTO_BACKUP_TIP_TITLE : 'Still backing up manually? Try our auto-backup!',
    AUTO_BACKUP_TIP_DESC : 'Link your device and we\'ll take care of backups automatically. Link and auto-backup your device?',
    AUTO_BACKUP_YES : "Activate auto-backup",
    AUTO_BACKUP_NO : "Don't activate",

    AUTO_BACKUP_REMOTE_TIP_TITLE : 'Don\'t lose your data. Activate cloud-backup!',
    AUTO_BACKUP_REMOTE_TIP_DESC : 'Connect your device and we\'ll backup your <em>Contacts / Messages / Apps</em> to the cloud. Backup to the cloud?',

    BACKUP_APP_DATA_TIP : 'SnapPea can backup your app data.<br />For example, high scores in a game or chat records.<br />This feature is only supported over USB.',
    BACKUP_APP_DATA_TIP_TITLE : 'Backup app data',
    BACKUP_APP_DATA_TIP_CONTENT : 'When you start your backup, your device will ask for permission. Select "Backup my app data" to get started.<br /><em>To let SnapPea restore your data, don\'t set a password.</em>',
    BACKUP_APP_DATA_WAITING : 'Waiting for your to confirm backup on your device',
    RESTORE_APP_DATA_WAITING : 'Waiting for your to confirm restore on your device',

    BACKUP_APP_DATA_ERROR : 'Failed to backup app data',
    BACKUP_APP_DATA_ERROR_DEVICE_INCOMPATIBLE : 'Device hasn\'t been rooted, or your device is too old.',
    BACKUP_APP_DATA_ERROR_DEVICE_WIFI : 'SnapPea doesn\'t support Wi-Fi backups of app data, please connect via USB.',
    BACKUP_APP_DATA_ERROR_ENCRYPT :　'SnapPea doesn\'t support encrypted backups. Please unencrypt and try again.',
    BACKUP_APP_DATA_ERROR_CONNECT_ERROR :　'Failed to transfer file.',
    USER_CANCELED :　'Canceled app data backup',
    CUSTOM_AUTH_FAILED_ERROR :　'Login data expired. Please logout and login again.',
    CUSTOM_SERVER_UNAVALABEL_ERROR :　'Sorry, our servers are busy. Please wait a little while and try again.',
    RESTORE_APP_DATA_ERROR : 'Failed to restore app data',

    AUTO_BACKUP_COMPLETE_FINISH : 'Auto-backup completed!',
    AUTO_BACKUP_COMPLETE_FINISH_TIP : 'Backups are not encrypted, please make sure to store them securely.',
    AUTO_BACKUP_COMPLETE_FINISH_CONTENT : 'Data backed up: <em>{1}</em>',

    PHOTO_DOWNLOAD_NOTIFY_TITLE : '{1} photo(s) synced from the cloud to your computer',
    PHOTO_DOWNLOAD_NOTIFY_CONTENT : 'We just synced photos on the cloud to your computer. You can view them in SnapPea.',

    BACKUP_GUIDE_TIP : 'You haven\'t backed up data!',
    BACKUP_GUIDE_TIP_DAY : '{1} days since your last backup!',
    BACKUP_GUIDE_CONTENT : 'SnapPea reminds you to backup up your phone to prevent data loss. You can backup contacts, messages, photos, and apps.',
    BACKUP_GUIDE_NOW : 'Backup now',

    BACKUP_APP_DATA_UNSUPPORT : 'Your device is not supported at present',
    BACKUP_APP_DATA_NON_USB : 'Please connect via USB',

    CUSTOM_UNZIP_BACKUP_FILE_ERROR : 'Sorry, failed to decompress and restore some apps.',

    /*NOT in SnapPea*/

    SYNC_PHOTO_PUSH_NOTIFY_TITLE : '您需要自动下载云相册图片到电脑吗？',
    SYNC_PHOTO_PUSH_NOTIFY_CONTENT : '您手机上的照片已同步到云端。在电脑上开启云相册同步后，豌豆荚将自动将您云相册的图片下载到电脑，查看图片更方便。'
});
