/*global define*/
define({
    CONTACT : 'Contacts',
    SMS : 'Messages',
    APP : 'Apps',
    APP_DATA : 'App data',
    BR_TYPE_WORD_ENUM : ['', 'Contacts', 'Groups', 'Messages', 'MMS', 'Call history', 'Bookmarks', 'Settings', 'App files', 'App files', 'App data'],

    BACKUP_TITLE_LOCAL : 'Backup to computer',
    BACKUP_TITLE_REMOTE : 'Backup to cloud server',
    RESTORE_TITLE_LOCAL : 'Restore from computer',
    RESTORE_TITLE_REMOTE : 'Restore from cloud server',
    BACKUP_TITLE : 'Backup Data',
    RESTORE_TITLE : 'Restore Data',
    START_BACKUP : 'Start backup',
    START_RESTORE : 'Start restore',

    RESTORE_FINISH : '{1} restore completed',
    RESTORE_FAILED : '{1} restore failed',

    TIP_IN_WIFI : 'To prevent data loss, SnapPea does not support backup or restore via Wi-Fi.<br />Please connect your device via USB cable and try again',

    ERROR_WHEN_WRITE_ROM :  'Unable to detect your SD card... <br />Please confirm:<br />- "USB Mass Storage Mode" is turned off on your device.<br />- SD card is properly inserted into your device. <br />- Or, try inserting another SD card.',

    BACKUP_RESTORE_RUNING : 'Your device is currently backing up or restoring data.',
    BACKUP_TO_CLOUD_FAILED : 'Failed to backup to cloud server.',
    BACKUP_TO_CLOUD_FAILED_DETAIL : '{1} of {2} backups failed',
    RESTORE_INVLID_FILE : 'Invalid backup file, please try again',
    RESTORE_INVLID_CONTACTS_FILE : 'Invalid contacts file. If you want to import a single contact, please use the import feature in Contacts.',
    BACKUP_FILE : 'Backup file',

    RESTORE_CONNECTION_LOST : 'Unable to complete restore, your device was disconnected',
    SD_CARD_ERROR : 'Unable to write SD card. Please ensure that your SD card is not locked and that that it has enough free space',
    FILE_DOWNLOAD_ERROR : 'Failed to transfer files',
    CANCELED : 'Canceled operation',
    UNKNOW_ERROR : 'Unknown error',
    OPEN_BACKUP_FILE : 'Open backups folder',
    BACKUP_FINISH_LABEL : 'Backup completed',
    RESTORE_FINISH_LABEL : 'Restore completed',
    BACKUP_COMPRESSING : 'Compressing backup files, please wait...',
    RESTORE_PERMISSSION_TIP1 : 'Sorry, {1} restore failed',
    RESTORE_PERMISSSION_TIP2 : 'It seems you\'re using an app or ROM to control data permissions. Examples include Avast! or the MIUI ROM. Please authorize SnapPea to use the following permission: {1}',
    RESTORE_PERMISSSION_TIP3 : 'Have you stopped restoring all data?',
    RESTORE_PERMISSSION_PART_TIP1 : 'Unfortunately {1} of {2} restores failed',

    PERMISSION_TIP : 'Failed to read device\'s data. <br />It may be that a security app on your device is blocking SnapPea.',

    FILE_NAME_UNLEGAL :　'Invalid file name, please try again',
    GET_FILE_NAME_FAILED : 'Invalid backup file, please browse to select',
    SET_FILE_PATH_FAILED : 'Invalid file path, please select another one',
    SET_RESTORE_FILE_FAILED : 'Invalid backup file',

    FILE_PATH_INVALID : 'Invalid backup file name or folder, please try again',
    OVERWIRTE_EXISTS_FILE_TIP : 'Overwrite existing backup file?',
    BACKUP_FAILED_TIP : 'Backup failed:',
    RESTORE_FAILED_TIP : 'Restore failed:',
    BACKUP_ABORT_TIP : 'Backup aborted',
    RESTORE_ABORT_TIP : 'Connection lost between your computer and device. <br />SnapPea will continue the restore on your device, please check there.',
    APP_ERROR_LIST_TITLE : '{1} app(s) failed to backup。Ignore and continue to backup apps?',
    APP_DATA_ERROR_LIST_TITLE : '{1} apps failed to restore. Ignore?',

    RESTORE_LIST_SNAPHOST_FAILED : 'Failed to load app list',
    RESTORE_DEVICE : 'Device',

    RESTORE_CHOOSE_ACCOUNT_TIP : 'Backup contacts to which account? Please select:',
    RESTORE_DELETE_DATA_TIP : 'Don\'t want to delete any data? Choose to how to handle your restore.',
    RESTORE_DOWNLOAD_PROGRESSING : 'Downloading backup data from cloud servers, please wait...',

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

    RESTORE_BATTERY_TIP : 'Your device\'s batter power is less than 20%. If your device shuts down, your backup may be incomplete. We recommend that charge your device and then restore. Continue anyway?',
    AUTO_BACKUP_TIP_TITLE : 'Still backing up manually? Try our auto-backup!',
    AUTO_BACKUP_TIP_DESC : 'Link your device and we\'ll take care of backups automatically. Link and auto-backup your device?',
    AUTO_BACKUP_YES : "Activate auto-backup",
    AUTO_BACKUP_NO : "Don't activate",
    AUTO_BACKUP_REMOTE_TIP_TITLE : 'Don\'t lose your data. Activate cloud-backup!',
    AUTO_BACKUP_REMOTE_TIP_DESC : 'Connect your device and we\'ll backup your <em>Contacts / Messages / Apps</em> to the cloud. Backup to the cloud?',

    BACKUP : '备份',
    BACKUP_DES : '将您的手机数据存储电脑或云端',
    BACKUP_TO_LOCAL : '备份到电脑',
    BACKUP_TO_LOCAL_DESC : '速度较快，恢复的时候需要连接电脑',
    BACKUP_TO_CLOUD : '备份到云端',
    BACKUP_TO_CLOUD_DESC : '需登录账号并在联网时进行，可在其他电脑或直接在手机上恢复',
    BACKUP_DEVICE_TITLE : '备份 {1} 的数据',
    BACKUP_DEVICE_LOCAL_DESC : '豌豆荚已经准备好为您备份以下数据到电脑。',
    BACKUP_DEVICE_REMOTE_DESC : '豌豆荚已经准备好为您备份以下数据到云端。',
    BACKUP_ADVANCE_TITLE : '备份高级选项',
    GET_FILE_PATH_FAILED : 'Invalid file path, please browse to select',
    BACKUP_FINISH : '{1} completed',
    BACKUP_FAILED : '{1} failed',
    BACKUPING_TO_LOCAL : '正在备份数据到电脑，请不要断开连接...',
    BACKUPING_TO_REMOTE : '正在备份数据到云端，请不要断开连接...',
    BACKUP_LOCAL_COMPLATE_TITLE : '已成功将以下数据备份到电脑。',
    BACKUP_REMOTE_COMPLATE_TITLE : '已成功将以下数据备份到云端。',
    CANCEL_BACKUP : '备份正在进行，是否取消备份？',

    RESTORE : '恢复',
    RESTORE_DES : '将您之前备份的数据恢复到手机',
    RESTORE_FROM_LOCAL : '从电脑恢复',
    RESTORE_FROM_LOCAL_DESC : '恢复您之前备份到电脑的手机数据',
    RESTORE_FROM_CLOUD : '从云端恢复',
    RESTORE_FROM_CLOUD_DESC : '恢复您之前备份到云端的手机数据，需登录账号并在联网的状态下进行',
    RESTORE_DEVICE_TITLE : '恢复数据到 {1}',
    RESTORE_DEVICE_LOCAL_DESC : '豌豆荚已经准备好为您恢复以下数据到手机。',
    RESTORE_CHOOSE_DESC : '请选择一个备份文件开始恢复',
    OPEN_RESTORE_FILE : '手动选择备份文件',
    RESTORE_ADVANCE_TITLE : '恢复高级选项',
    RESTORE_CONTACT_COMPLATE : '联系人已经恢复到您的手机。',
    RESTORE_SMS_COMPLATE : '短信已经恢复到您的手机。',
    RESTORE_NONAPP_COMPLATE : '联系人和短信已经恢复到您的手机。',
    RESTORE_APP_COMPLATE : '软件已经开始安装，期间请不要断开连接。',
    RESTORING_FROM_LOCAL : '正在从电脑恢复数据，请不要断开连接...',
    RESTORING_FROM_REMOTE : '正在从云端恢复数据，请不要断开连接...',
    INCLUDE_APP_DATA : '包含应用数据',
    CANCEL_RESTORE : '恢复正在进行，是否取消恢复？',
    NO_REMOTE_BACKUP_FILE : '您还没有备份过数据到云端。',

    ENABLE : '已开启',
    DISABLE : '未开启',
    DO_ENABLE : '开启',
    DO_SETTING : '设置',
    APP_AND_DATA: '软件＋数据',
    ADVANCED : '高级选项',
    CANCEL : '取消',
    DATA_TYPE: '数据类型',
    BACKUP_TYPE: '软件备份方式',
    BACKUP_FILE_PATH: '备份文件路径',
    BACKUP_FILE_NAME: '备份文件名',
    APP_TYPE_WDAPK_TITLE: 'Backup app list (recommended)',
    APP_TYPE_WDAPK_TITLE_DESC: '仅备份应用列表，不备份安装文件，恢复时将从豌豆荚下载这些应用并安装，备份速度较快',
    APP_TYPE_APK_TITLE: 'Backup full app file',
    APP_TYPE_APK_TITLE_DESC: '备份完整的安装文件，备份速度较慢',
    BACKUP_CHANGE_FILE_PATH: '修改',
    LAST_BACKUP_TIME : '上次备份时间',
    AUTO_BACKUP_TO_LOCAL : '自动备份到电脑',
    AUTO_BACKUP_TO_REMOTE : '自动备份到云端',
    DONE : '完成',
    SWITCH_TASK_MODULE : '查看下载任务',
    SHOW_MORE : '显示更多',
    WRITE_LOCAL_FILE_ERROR : '写入本地文件出错',
    COMPRASS_FILE_ERROR : '压缩文件失败',
    PROGRESS_DONE : '已完成',
    NAV_AUTO_BACKUPING : '正在进行自动备份',
    NAV_BACKUPING : '备份正在进行',
    NAV_RESTORING : '恢复正在进行',
    CUSTOM_UNZIP_BACKUP_FILE_ERROR : 'Sorry, failed to decompress and restore some apps.',
    RESTORE_SMS_ANDROID_4_4 : '由于 Android 4.4 系统的限制，为保证您能正常收发短信，请您在「设置」> 「更多」>「默认短信应用」中将「豌豆荚USB连接传输服务」设为默认短信程序。',
    RESTORE_SMS_COMPLATE_ANDROID_4_4 : '备份完成，为保证您能正常收发短信，请您在「设置」> 「更多」>「默认短信应用」中将原有的短信程序恢复为默认。',

    /*NOT in SnapPea*/

    CUSTOM_RESOURCE_LOCKED : '豌豆荚在 8 月 25 日碰到技术故障，当天我们暂时关闭了豌豆荚的账号服务，12 个小时后账号服务修复完成。但为了您的信息安全考虑，目前通过旧的密码将不能使用云恢复、云相册等功能。请您立即修改密码，以便正常使用豌豆荚。',
    SYNC_PHOTO_PUSH_NOTIFY_TITLE : '您需要自动下载云相册图片到电脑吗？',
    SYNC_PHOTO_PUSH_NOTIFY_CONTENT : '您手机上的照片已同步到云端。在电脑上开启云相册同步后，豌豆荚将自动将您云相册的图片下载到电脑，查看图片更方便。'
});
