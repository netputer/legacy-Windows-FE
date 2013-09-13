/*global define*/
define({
    OPEN_DOWNLOAD_FOLDER : 'Downloads folder',
    RUNNING_STATUS : '{1}, {2}/s',
    PUSHING_STATUS : '{1} transfering, {2}/s',
    PAUSE_STATUS : '{1}, paused',
    PUSH_PAUSE_STATUS : '{1} transfering，now paused',
    WAITING_DOWNLOAD : 'Download queued',
    WAITING_PUSHING : 'Transfer queued',
    WAITING_INSTALL : 'Install queued',
    UNINSTALL_THEN_INSTALL : 'Uninstall & reinstall',
    CHANGE_INSTALL_LOCATION : 'Settings',
    MANAGE_APP : 'Manage',
    INSTALL_TO_DEVICE : 'Install to internal storage',
    MANAGE_SD : 'Manage SD card',
    TASK_NAME : 'Task',
    PROGRESS : 'Status',
    RUNNING_COUNT : '{1} tasks...',
    FAILED_COUNT : '{1} task(s) failed',
    WATING_PUSH_COUNT : '{1} items to push',
    NO_TASK_RUNNING : 'No tasks in progress',
    HOW_TO_CONNECT_URL : 'http://snappea.zendesk.com/forums/20791302-connecting-your-device',
    UNKNOWN : 'Unknown',
    CONFIRM_DELETE : 'Remove this item?',
    CONFIRM_DELETE_BATCH : 'Remove these items?',
    DELET_APK_ALSO : ' Also move files to Recycle Bin?',
    DELETE_TITLE : 'Remove downloaded items',
    RUNNING_COUNT_TIP : '{1} items in progress',
    ERROR_COUNT_TIP : '{1} items failed',
    COMPLETE_COUNT_TIP : '{1} items completed',
    DEVICE_NOT_CONNECT : 'No device connected',
    DEVICE_NOT_CONNECT_TIP : 'You haven\'t connected a device. Downloads will automatically transfer the next time you connect.',
    CONFIRM_ON_DEVICE_TIP : 'You\'re using Wi-Fi to connect, which requires you to confirm the install on your device.',
    CONFIRM_ON_DEVICE_MIUI_V5_TIP : 'You\' using MIUI, which requires you to confirm the install on your device.',
    DEVICE_DISCONNECT : 'Device disconnected',
    DEVICE_DISCONNECT_TIP : 'Device disconnected. Downloads will automatically transfer the next time you connect.',
    OFFLINE_TASK_TIP : '{1} zero-data mode download task(s) initiated from your phone',
    OUT_OF_SPACE_WARN : 'Warning: Running out of hard drive space',
    OUT_OF_SPACE_TIP : 'You have less than 500M of hard drive space remaining.<br />You could set a new download folder',
    MODIFY_STORAGE_DISK : 'Set download folder',
    NOT_ENOUGH_SPACE_WARN : 'Hard drive space is insufficient',
    NOT_ENOUGH_SPACE_TIP : 'Your hard drive space is already full. Please set set a new download folder.',

    STOPPED : 'Paused',
    DOWNLOAD_FAILED : 'Download failed',
    NO_SPACE : 'Disk full',
    INSTALLING : 'Installing...',
    CONFIRM_ON_DEVICE : 'Finish install on your device',
    UNKNOWN_ERROR : 'Unknown error',
    TASK_ADDED : 'Task added',
    PROCESSING : 'Processing...',
    PUSHING : 'Transfering to your device...',
    PARSING_VIDEO_URL : 'Parsing mp4 video URLs...',
    PARSING_VIDEO_URL_SUCCESS : 'Parsing mp4 video URLs completed',
    MERGE_VIDEO : 'Merging mp4 videos',
    MERGE_VIDEO_SUCCESS : 'Merging mp4 videos completed',
    UNKNOWN_NAME : 'Unknown name',

    CACHE_SIZE : 'You\'ve saved: {1}',
    ADD_TASK_TIP : '{1} task added',
    FINISH_TASK_TIP : '{1} task completed',

    DELETE_TASK : 'Delete task',
    CONTINUE_INSTALL : 'Resume install',

    CAPACITY_TIPS : '{1}（{2} / {3}，remaining space {4}）',

    /* Install failed reasons */
    INSTALL_FAILED_DEVICE_NOT_FOUND : 'Unable to install, no device connected',
    INSTALL_FAILED_UNKNOWN : 'Install failed, unknown error',
    INSTALL_FAILED_DISCONNECT : 'Install failed, device is disconnected',
    INSTALL_FAILED_APK_MISSED : 'Install failed, APK file not found',
    INSTALL_FAILED_APK_READ_FILE : 'Install failed, unable to read install file',
    INSTALL_FAILED_CANNOT_PUSH : 'Install failed, unable to transfer file',
    INSTALL_FAILED_WRITE_ERROR : 'Install failed, unable to transfer install file',
    INSTALL_FAILED_ALREADY_EXISTS : 'Install failed, file already exists',
    INSTALL_FAILED_CONFLICTING_PROVIDER : 'Install failed, due to conflicting app providers',
    INSTALL_FAILED_CONTAINER_ERROR : 'Failed to install to SD card',
    INSTALL_FAILED_CPU_ABI_INCOMPATIBLE : 'Install failed, CPU ABI incompatible',
    INSTALL_FAILED_DEXOPT : 'Not enough internal storage space, please make space',
    INSTALL_FAILED_DUPLICATE_PACKAGE : 'Install file name already exists',
    INSTALL_FAILED_INSUFFICIENT_STORAGE : 'Not enough internal storage space, please make space',
    INSTALL_FAILED_INVALID_APK : 'Invalid APK file',
    INSTALL_FAILED_INVALID_INSTALL_LOCATION : 'App doesn\'t seem to support that install location',
    INSTALL_FAILED_INVALID_URI : 'Install failed, URL invalid',
    INSTALL_FAILED_MEDIA_UNAVAILABLE : 'Transfer failed',
    INSTALL_FAILED_MISSING_FEATURE : 'Install failed, unknown error',
    INSTALL_FAILED_MISSING_SHARED_LIBRARY : 'Your device doesn\'t support Add-ons',
    INSTALL_FAILED_NEWER_SDK : 'Incompatible with your device\'s system version',
    INSTALL_FAILED_NO_SHARED_USER : 'No shared user permissions',
    INSTALL_FAILED_OLDER_SDK : 'This app requires a higher device system version',
    INSTALL_FAILED_REPLACE_COULDNT_DELETE : 'Failed to replace app',
    INSTALL_FAILED_SHARED_USER_INCOMPATIBLE : 'Shared user permissions incomplete',
    INSTALL_FAILED_TEST_ONLY : 'Only for testing',
    INSTALL_FAILED_TIME_OUT : 'Timed out',
    INSTALL_FAILED_UNKOWNED_ERROR : 'Install failed, unknown error',
    INSTALL_FAILED_UPDATE_INCOMPATIBLE : 'Update failed, please uninstall and try again',
    INSTALL_PARSE_FAILED_BAD_MANIFEST : 'Install file manifest error',
    INSTALL_PARSE_FAILED_BAD_PACKAGE_NAME : 'Install file name error',
    INSTALL_PARSE_FAILED_BAD_SHARED_USER_ID : 'Install file user permissions error',
    INSTALL_PARSE_FAILED_CERTIFICATE_ENCODING : 'Install file certificate error',
    INSTALL_PARSE_FAILED_INCONSISTENT_CERTIFICATES : 'Install file certificates are inconsistent',
    INSTALL_PARSE_FAILED_MANIFEST_EMPTY : 'Install file manifest is empty',
    INSTALL_PARSE_FAILED_MANIFEST_MALFORMED : 'Install file manifest is malformed',
    INSTALL_PARSE_FAILED_NO_CERTIFICATES : 'Unable to install, certificate error',
    INSTALL_PARSE_FAILED_NOT_APK : 'Failed to parse file, no APK data',
    INSTALL_PARSE_FAILED_UNEXPECTED_EXCEPTION : 'Failed to parse file, unknown error',
    INSTALL_PARSE_FAILED_UNKNOWN_FORMAT : 'Install file format is invalid',
    SDCARD_WAS_FULL : 'SD card is full',
    PUSH_FAILED_CONTAINER_ERROR : 'Failed to transfer to SD card',
    PUSH_FILE_FAILED : 'Failed to transfer file',
    PUSH_FAILED_DEVICE_NOT_FOUND : 'Unable to transfer file, no device connected',
    PUSH_FAILED_NO_SDCARD : 'Unable to transfer file, no SD card found',
    install_command_send_failed : 'Unable to install app',
    install_command_send_error : 'Unable to install app',
    install_command_send_disconnect : 'Unable to connect device',
    INVALID_FILE_PATH : 'Unable to create file',
    SDCARD_CAN_NOT_WRITE : 'temporarily unable to write SD card',
    NO_PERMISSION_TO_WRITE_FILE : 'No permission to write file',
    LOCAL_FILE_WAS_MISSED : 'Local file can\'t be found',
    CONNECTION_LOST : 'Unable to connect to device',
    UNKNOWN_EXECPTION_FOR_PUSHING_FILE : 'Failed to transfer file',
    RESOLVE_URL_FAILED : 'Unable to read MP4 video URL',
    MP4_MERGE_FAILED : 'Failed to merge MP4 videos',
    NO_VEDIO_SEGMENT_FOUND : 'No MP4 video found at this URL',
    UNKNOWN_VEDIO_URL : 'This video URL is not supported',
    NO_SUCH_FILE_ERROR : 'File not found',
    NO_MORE_SPACE_ERROR : 'SD card is full',
    FILE_READ_ONLY : 'File already exists and is read-only',
    INSTALL_FAILED_NO_SDCARD : 'SD card can\'t be used',
    INSTALL_FAILED_SDCARD_MOUNT : 'Please don\'t remove SD card',
    INSTALL_FAILED_MALICIOUS_APK : 'Scan detected a security threat, we advise you not to install this app',
    FILE_OPERATION_IO_ERROR : 'Failed to transfer document',
    FILE_OPERATION_SDCARD_IO_ERROR : 'Failed to transfer document',
    DOWNLOAD_APK_VERIFY_FAILED : 'Download error',
    NOT_SUPPORT : 'Unsupported format',

    SCANNING : 'Security scan in progress...',
    SCAN_PASS : 'Safe! Passed security scan.',
    SCAN_FAILED : 'Failed security scan.',

    SET_AS_WALL_PAPER : 'Set as wallpaper',
    SET_AS_RINGTONE : 'Set as ringtone',
    START_UNZIPPING : 'Unzipping...',
    UNZIPING : 'Unzipping...',
    UNZIP_COMPLETE : 'Unzip completed',
    UNZIP_FAILED : 'Unzip failed',

    HOW_TO_CONNECT : 'Connection help',
    EMPTY_LIST : 'No tasks in progress',

    SET_AS_WALLPAPER_SUCCESS : 'Wallpaper is set!',
    SET_AS_WALLPAPER_FAIL: 'Failed to set wallpaper',
    SET_AS_RINGTONE_SUCCESS : 'Ringtone is set!',
    SET_AS_RINGTONE_FAIL : 'Failed to set ringtone',

    WAITING_RESTORE_APP_DATA : 'Waiting to restore app data',
    PROCESSING_RESTORE_APP_DATA : 'Restoring app data...',
    WAITING_UNZIP : 'Waiting to unzip...',

    SEND_TO_PHONE : 'Send to phone',
    DO_NOT_SEND_TO_PHONE : 'Don\'t send to phone',
    SEND_TO_PHONE_HEAD : 'Phone isn\'t connected. Send content to your phone?',
    SEND_TO_PHONE_CONTENT : 'Phone isn\'t connected, so we can\'t download to your phone. <br /> Send content to your phone?',

    MORE_MEMORY : 'Not enough internal storage space',
    NO_MORE_SDCARD : 'Not enough SD card space',
    SDCARD_MOUNT : 'Please don\'t remove SD card',
    NO_SDCARD : 'No SD card found, unable to transfer files',
    DEVICE_NOT_FOUND : 'Connect your device to transfer',
    DEVICE_NOT_FOUND_TIP : 'Connect your device via USB or Wi-Fi, and SnapPea will finish these tasks',
    PUSHING_PHONE : 'Sending to phone...',
    PUSH_PHONE_FAILED : 'Failed to send',
    PUSH_PHONE_SUCCESS : 'Sent to phone',
    RETRY_PUSH_PHONE : 'Send again',
    CANCEL_PUSH_PHONE : 'Cancel send'
});
