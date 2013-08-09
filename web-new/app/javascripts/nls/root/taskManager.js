/*global define*/
define({
    OPEN_DOWNLOAD_FOLDER : '打开下载文件夹',
    RUNNING_STATUS : '已下载 {1}，{2}/s',
    PUSHING_STATUS : '已传输 {1}, {2}/s',
    PAUSE_STATUS : '已下载 {1}，已暂停',
    PUSH_PAUSE_STATUS : '已传输 {1}，已暂停',
    WAITING_DOWNLOAD : '等待下载',
    WAITING_PUSHING : '等待传输',
    WAITING_INSTALL : '等待安装',
    UNINSTALL_THEN_INSTALL : '卸载后安装',
    CHANGE_INSTALL_LOCATION : '修改安装位置',
    MANAGE_APP : '管理应用',
    INSTALL_TO_DEVICE : '安装到内存',
    MANAGE_SD : '管理 SD 卡',
    TASK_NAME : '任务名称',
    PROGRESS : '进度',
    RUNNING_COUNT : '{1} 项任务正在进行',
    FAILED_COUNT : '{1} 项任务失败',
    WATING_PUSH_COUNT : '{1} 项任务待传输',
    NO_TASK_RUNNING : '没有正在进行的任务',
    HOW_TO_CONNECT_URL : 'http://help.wandoujia.com/entries/401079-2-0',
    UNKNOWN : '未知',
    CONFIRM_DELETE : '确定要删除这个任务吗？',
    CONFIRM_DELETE_BATCH : '确定要删除选中的任务吗？',
    DELET_APK_ALSO : '同时把下载文件移到回收站',
    DELETE_TITLE : '删除下载任务',
    RUNNING_COUNT_TIP : '{1} 项进行中',
    ERROR_COUNT_TIP : '{1} 项失败',
    COMPLETE_COUNT_TIP : '{1} 项完成',
    DEVICE_NOT_CONNECT : '没有连接手机',
    DEVICE_NOT_CONNECT_TIP : '豌豆荚检测到您没有连接手机，任务在连接后将自动传输到手机上。',
    CONFIRM_ON_DEVICE_TIP : '您正在使用 Wi-Fi 模式连接手机，需要在手机上确认才能完成安装。',
    CONFIRM_ON_DEVICE_MIUI_V5_TIP : '您的手机使用的是 MIUI 系统，需要在手机上确认才能完成安装。',
    DEVICE_DISCONNECT : '连接已断开',
    DEVICE_DISCONNECT_TIP : '豌豆荚检测到您的手机已经断开连接，任务下载完成后将保存在电脑上，下次连接时将自动传输到手机上。',
    OFFLINE_TASK_TIP : '从您的手机上获取到 {1} 个零流量下载任务',
    OUT_OF_SPACE_WARN : '硬盘空间预警',
    OUT_OF_SPACE_TIP : '豌豆荚检测到您的硬盘空间已不足 500M。<br />建议您重新设置下载位置。',
    MODIFY_STORAGE_DISK : '修改下载位置',
    NOT_ENOUGH_SPACE_WARN : '硬盘空间不足',
    NOT_ENOUGH_SPACE_TIP : '豌豆荚检测到您的硬盘空间已满，请重新设置下载位置。',

    STOPPED : '已停止',
    DOWNLOAD_FAILED : '下载失败',
    NO_SPACE : '硬盘已满',
    INSTALLING : '正在安装',
    CONFIRM_ON_DEVICE : '请在手机上完成安装',
    UNKNOWN_ERROR : '未知错误',
    TASK_ADDED : '任务已添加',
    PROCESSING : '任务进行中',
    PUSHING : '正在传输 ',
    PARSING_VIDEO_URL : '正在解析 MP4 视频地址',
    PARSING_VIDEO_URL_SUCCESS : '解析 MP4 视频地址成功',
    MERGE_VIDEO : '正在合并 MP4 视频',
    MERGE_VIDEO_SUCCESS : '合并 MP4 视频成功',
    UNKNOWN_NAME : '未知名称',

    CACHE_SIZE : '节省了 {1} 流量',
    ADD_TASK_TIP : '添加了 {1} 项任务',
    FINISH_TASK_TIP : '{1} 项任务已完成',

    DELETE_TASK : '删除应用',
    CONTINUE_INSTALL : '继续安装',

    /* Install failed reasons */
    INSTALL_FAILED_DEVICE_NOT_FOUND : '设备没有连接，无法安装',
    INSTALL_FAILED_UNKNOWN : '安装失败，未知错误',
    INSTALL_FAILED_DISCONNECT : '安装失败，连接已断开',
    INSTALL_FAILED_APK_MISSED : '安装失败，无法找到安装文件',
    INSTALL_FAILED_APK_READ_FILE : '安装失败，无法读取安装文件',
    INSTALL_FAILED_CANNOT_PUSH : '安装失败，无法传输文件',
    INSTALL_FAILED_WRITE_ERROR : '安装失败，无法传输安装文件',
    INSTALL_FAILED_ALREADY_EXISTS : '安装失败，目标已经存在',
    INSTALL_FAILED_CONFLICTING_PROVIDER : '安装失败，软件供应商冲突',
    INSTALL_FAILED_CONTAINER_ERROR : '安装到 SD 卡失败',
    INSTALL_FAILED_CPU_ABI_INCOMPATIBLE : '安装失败，CPU 的 ABI 未协调错误',
    INSTALL_FAILED_DEXOPT : '安装时手机内存剩余空间不足',
    INSTALL_FAILED_DUPLICATE_PACKAGE : '安装文件包名重复',
    INSTALL_FAILED_INSUFFICIENT_STORAGE : '安装时手机内存剩余空间不足',
    INSTALL_FAILED_INVALID_APK : '无效的安装文件',
    INSTALL_FAILED_INVALID_INSTALL_LOCATION : '该应用不支持您选定的安装位置',
    INSTALL_FAILED_INVALID_URI : '安装失败，无效的 URI',
    INSTALL_FAILED_MEDIA_UNAVAILABLE : '传输失败',
    INSTALL_FAILED_MISSING_FEATURE : '安装失败，该应用不支持您的设备',
    INSTALL_FAILED_MISSING_SHARED_LIBRARY : '您的设备不支持 Add-on 属性',
    INSTALL_FAILED_NEWER_SDK : '您的设备系统版本不兼容',
    INSTALL_FAILED_NO_SHARED_USER : '无共享用户权限',
    INSTALL_FAILED_OLDER_SDK : '您的设备系统版本低于应用所需版本',
    INSTALL_FAILED_REPLACE_COULDNT_DELETE : '修复已安装的本程序失败',
    INSTALL_FAILED_SHARED_USER_INCOMPATIBLE : '共享用户权限不完整',
    INSTALL_FAILED_TEST_ONLY : '仅用于测试',
    INSTALL_FAILED_TIME_OUT : '安装超时',
    INSTALL_FAILED_UNKOWNED_ERROR : '安装遇到错误',
    INSTALL_FAILED_UPDATE_INCOMPATIBLE : '更新不完整，请卸载后重试',
    INSTALL_PARSE_FAILED_BAD_MANIFEST : '安装文件的配置文件错误',
    INSTALL_PARSE_FAILED_BAD_PACKAGE_NAME : '安装文件名错误',
    INSTALL_PARSE_FAILED_BAD_SHARED_USER_ID : '文件用户权限错误',
    INSTALL_PARSE_FAILED_CERTIFICATE_ENCODING : '文件认证编码错误',
    INSTALL_PARSE_FAILED_INCONSISTENT_CERTIFICATES : '与已安装版本签名不一致，要卸载已安装版本才能继续，但会同时删除应用数据',
    INSTALL_PARSE_FAILED_MANIFEST_EMPTY : '安装文件无配置文件',
    INSTALL_PARSE_FAILED_MANIFEST_MALFORMED : '安装文件的配置文件异常',
    INSTALL_PARSE_FAILED_NO_CERTIFICATES : '该应用签名有问题，无法安装',
    INSTALL_PARSE_FAILED_NOT_APK : '文件分析失败（无 APK 信息）',
    INSTALL_PARSE_FAILED_UNEXPECTED_EXCEPTION : '文件分析时遇到未知错误',
    INSTALL_PARSE_FAILED_UNKNOWN_FORMAT : '安装文件格式错误',
    SDCARD_WAS_FULL : 'SD 卡空间已满',
    PUSH_FAILED_CONTAINER_ERROR : '传输到 SD 卡失败',
    PUSH_FILE_FAILED : '文件传输失败',
    PUSH_FAILED_DEVICE_NOT_FOUND : '设备没有连接，无法传输',
    PUSH_FAILED_NO_SDCARD : '没有插入 SD 卡，无法传输文件',
    install_command_send_failed : '无法安装应用',
    install_command_send_error : '无法安装应用',
    install_command_send_disconnect : '无法连接手机',
    INVALID_FILE_PATH : '无法创建文件',
    SDCARD_CAN_NOT_WRITE : 'SD 卡暂时无法写入',
    NO_PERMISSION_TO_WRITE_FILE : '没有权限创建文件',
    LOCAL_FILE_WAS_MISSED : '本地文件无法找到',
    CONNECTION_LOST : '无法连接手机',
    UNKNOWN_EXECPTION_FOR_PUSHING_FILE : '文件传输失败',
    RESOLVE_URL_FAILED : '无法解析到 MP4 视频地址',
    MP4_MERGE_FAILED : 'MP4 视频合并失败',
    NO_VEDIO_SEGMENT_FOUND : '此地址没有发现 MP4 视频',
    UNKNOWN_VEDIO_URL : '不支持的视频网站地址',
    NO_SUCH_FILE_ERROR : '此文件不存在',
    NO_MORE_SPACE_ERROR : 'SD 卡空间已满',
    FILE_READ_ONLY : '已存在同名的文件并且无法覆盖',
    INSTALL_FAILED_NO_SDCARD : 'SD 卡不可用',
    INSTALL_FAILED_SDCARD_MOUNT : '请不要挂载 SD 卡',
    INSTALL_FAILED_MALICIOUS_APK : '扫描发现是恶意应用，不建议继续安装。',
    FILE_OPERATION_IO_ERROR : '文件传输失败',
    FILE_OPERATION_SDCARD_IO_ERROR : '文件传输失败',
    DOWNLOAD_APK_VERIFY_FAILED : '文件下载错误，<a href="http://wandoujia.zendesk.com/entries/23613118--%E5%AE%98%E6%96%B9%E5%B8%AE%E5%8A%A9-%E6%96%87%E4%BB%B6%E4%B8%8B%E8%BD%BD%E9%94%99%E8%AF%AF%E6%98%AF%E6%80%8E%E4%B9%88%E5%9B%9E%E4%BA%8B-" target="_default">查看帮助</a>',
    NOT_SUPPORT : '格式不支持',

    SCANNING : '正在进行安全扫描',
    SCAN_PASS : '已通过安全扫描',
    SCAN_FAILED : '未通过安全扫描',


    SET_AS_WALL_PAPER : '设为手机壁纸',
    SET_AS_RINGTONE : '设为来电铃声',
    START_UNZIPPING : '开始解压',
    UNZIPING : '正在解压...',
    UNZIP_COMPLETE : '解压成功',
    UNZIP_FAILED : '解压失败',

    HOW_TO_CONNECT : '如何连接',
    EMPTY_LIST : '没有任务',

    SET_AS_WALLPAPER_SUCCESS : '壁纸设置成功',
    SET_AS_WALLPAPER_FAIL: '壁纸设置失败',
    SET_AS_RINGTONE_SUCCESS : '铃声设置成功',
    SET_AS_RINGTONE_FAIL : '铃声设置失败',

    WAITING_RESTORE_APP_DATA : '等待恢复应用数据',
    PROCESSING_RESTORE_APP_DATA : '正在恢复应用数据',
    WAITING_UNZIP : '等待解压缩'
});
