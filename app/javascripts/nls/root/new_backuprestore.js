/*global define*/
define({
    CONTACT : '联系人',
    SMS : '短信',
    APP : '应用程序',
    APP_DATA : '应用数据',
    BR_TYPE_WORD_ENUM : ['', '联系人', '分组', '短信', '彩信', '通话记录', '书签', '设置', '应用程序', '应用程序', '应用数据'],

    BACKUP_TITLE : '备份数据',
    BACKUP_TITLE_LOCAL : '备份到电脑',
    BACKUP_TITLE_REMOTE : '备份到云端',
    RESTORE_TITLE_LOCAL : '从电脑恢复',
    RESTORE_TITLE_REMOTE : '从云端恢复',
    RESTORE_TITLE : '恢复数据',
    START_BACKUP : '开始备份',
    START_RESTORE : '开始恢复',

    BACKUP_WAITING : '稍后备份{1}',
    BACKUP_PROCESS : '正在备份{1}',
    BACKUP_PROCESS_APP_DATA : '正在备份应用数据，详细备份进度请在手机上查看。',
    RESTORE_PROCESS : '正在恢复{1}，请稍候...',
    RESTORE_WAITING : '稍后恢复{1}',
    RESTORE_FINISH : '{1}恢复完成。',
    RESTORE_FAILED : '{1}恢复失败。',

    TIP_IN_WIFI : '为了确保您的数据不会丢失，豌豆荚暂时不支持在 Wi-Fi 连接手机时备份和恢复数据。<br />请连接 USB 数据线后重试。',

    ERROR_WHEN_WRITE_ROM : '好像找不到您的 SD 卡了……<br />请您确认一下：<br />- 连接电脑时一定要在手机上关闭「USB 大容量存储模式」哦<br />- SD 卡是否正确地插入手机了呢？<br />- 或者……您的SD 卡是不是坏掉啦？换一张卡试试呢？',

    BACKUP_RESTORE_RUNING : '设备上已有备份或恢复任务在进行中。',
    BACKUP_TO_CLOUD_FAILED : '很抱歉，备份到云端失败。',
    BACKUP_TO_CLOUD_FAILED_DETAIL : '{1} 条{2}备份失败。',
    RESTORE_INVLID_FILE : '您指定的备份文件无效，请重新指定。',
    RESTORE_INVLID_CONTACTS_FILE : '您指定的备份文件无效。如果您想单独恢复联系人，请使用联系人管理中的导入功能。',
    RESTORING_TIP : '正在恢复，请勿断开手机连接。',
    SELECT_BACKUP_FILE : '指定备份文件',
    SELECT_BACKUP_FILE_FOLDER : '指定备份文件夹',
    BACKUP_FILE : '备份文件',
    SELECT_FILE : '请选择备份文件',

    CHOOSE_APP_TYPE_TITLE : '请选择备份应用数据的方式',
    RESTORE_CONNECTION_LOST : '您的电脑和手机的连接中断。无法完成恢复。',
    SD_CARD_ERROR : 'SD 卡无法写入。请检查您的 SD 卡是否有足够的存储空间, 或者是否处于写保护状态。',
    FILE_DOWNLOAD_ERROR : '数据传输失败',
    CANCELED : '已取消操作。',
    UNKNOW_ERROR : '很抱歉，出现未知错误：',
    TYPE : '数据类型',
    QUANTITY : '数量',
    SAVE_LOCATION : '设置保存位置',
    SAVE_LOCATION_LABEL : '备份保存位置：',
    OPEN_BACKUP_FILE : '查看备份文件',
    PRIVACY_TIP : '豌豆荚未对备份数据进行加密，备份的数据是您的私人数据，请妥善保管。',
    MOBILE_TIP : '您可以在电脑或手机上恢复这些数据。',
    BACKUP_FINISH_LABEL : '备份完成',
    RESTORE_FINISH_LABEL : '恢复完成',
    BACKUP_COMPRESSING : '正在为您压缩备份文件，请稍候...',
    RESTORE_APP_TIP : '豌豆荚已将要恢复的应用添加到任务管理器，您可以在下载管理界面中查看应用安装的情况。',
    RESTORE_PERMISSSION_TIP1 : '很抱歉，{1}恢复失败。',
    RESTORE_PERMISSSION_TIP2 : '您可能使用了控制手机数据读写权限的系统或者程序。例如MIUI系统、Flyme系统、LBE、腾讯手机管家等。请您授予豌豆荚读写{1}的权限后再继续恢复数据。<a target="_default" href="http://help.wandoujia.com/entries/22017678?utm_campaign=tips&utm_medium=client&utm_source=backup">帮助</a>',
    RESTORE_PERMISSSION_TIP3 : '是否忽略并继续恢复其他数据？',
    RESTORE_PERMISSSION_PART_TIP1 : '很抱歉，{1} 个{2}恢复失败。',
    SELECT_FILE_FOLDER_TIP : '抱歉，豌豆荚没有找到您备份的文件，您是否把备份文件移动到了其他位置？',

    APP_TYPE_WDAPK_CONTENT : '备份应用的名称。恢复时会根据应用名称即时下载最新版本恢复到您的手机上。备份速度飞快，但<em>恢复时需要联网</em>。',
    APP_TYPE_APK_CONTENT : '豌豆荚会将您的应用完整复制到电脑上保存。备份速度一般，但恢复时不需联网。',
    APP_TYPE_APK_CONTENT_WIFI : '您处于Wi-Fi连接状态，备份完整应用功能不可用。请使用 USB 数据线连接。',


    BACKUP_TYPE_LOCAL_CONTENT : '将您手机上的数据备份到电脑上，方便恢复',
    BACKUP_TYPE_REMOTE_CONTENT : '将您的数据备份到云端的私人豌豆荚账号中，数据不会丢失。可以恢复到任意历史时间点，还可以直接从手机恢复',

    CHOOSE_BACKUP_DATA_TIP : '请选择要备份的数据',
    CHOOSE_RESTORE_DATA_TIP : '请选择要恢复的数据',
    LOGIN_FAILED_TIP : '很抱歉，登录失败。请检查您的网络后重试登录，或选择本地备份',
    PERMISSION_TIP : '读取手机数据失败。<br />可能是手机上的安全软件阻止了豌豆荚读取联系人或信息的权限，请在手机上「权限管理」中授权。<a target="_default" href="http://help.wandoujia.com/entries/22017678?utm_campaign=tips&utm_medium=client&utm_source=sms">帮助</a>',

    SET_FILE_NAME : '请命名备份文件',
    FILE_NAME_UNLEGAL :　'您指定的文件名无效，可能其中包含非法字符，请重新指定',
    GET_FILE_NAME_FAILED : '很抱歉，获取备份文件失败，请手工指定',
    SET_FILE_PATH_FAILED : '很抱歉，设置备份路径失败',
    SET_FILE_PATH_LINK_BUTTON : '修改保存位置',
    SET_RESTORE_FILE_FAILED : '很抱歉，选择备份文件失败',

    CONNECT_LOST : '您的电脑和手机的连接中断。',
    FILE_PATH_INVALID : '很抱歉，您设置的备份文件名或者目录不可用，请重新设置。',
    OVERWIRTE_EXISTS_FILE_TIP : '是否覆盖已有的备份文件？',
    BACKUP_FAILED_TIP : '很抱歉，备份失败：',
    RESTORE_FAILED_TIP : '很抱歉，恢复失败：',
    BACKUP_ABORT_TIP : '很抱歉，备份终止',
    RESTORE_ABORT_TIP : '您的电脑和手机的连接中断。<br />豌豆荚会在手机上继续恢复，请到手机上查看恢复进度。',
    APP_ERROR_LIST_TITLE : '以下 {1} 个应用备份失败。是否忽略并继续备份其他数据？',
    APP_DATA_ERROR_LIST_TITLE : '以下 {1} 个应用的应用数据备份失败。是否忽略？',

    RESTORE_TYPE_LOCAL_CONTENT : '从您电脑上的本地备份文件中进行恢复',
    RESTORE_TYPE_REMOTE_CONTENT : '从云端的备份数据进行恢复，可以恢复到任意历史时间点',
    RESTORE_LIST_SNAPHOST_FAILED : '很抱歉，加载数据列表失败。',

    CHOOSE_RESTORE_FILE_TITLE : '请选择您要恢复的备份文件',
    CHOOSE_RESTORE_DATE_TITLE : '请选择您要恢复到的日期',
    RESTORE_DATE : '日期',
    RESTORE_DEVICE : '设备',
    CHOOSE_RESTORE_FILE_TIP_BEFORE : '您也可以 ',
    CHOOSE_RESTORE_FILE_TIP_AFTER : ' 进行恢复',

    RESOTRE_OLD_VERSION_TIP_BEFORE : '您可以自己指定备份文件进行恢复，如果您要恢复后缀为 .bak 的备份文件请使用 ',
    RESOTRE_OLD_VERSION_TIP_LINK : '旧版豌豆荚',
    RESOTRE_OLD_VERSION_TIP_AFTER : ' 恢复',
    RESTORE_OLD_VERSION_DL_LINK : 'http://dl.wandoujia.com/files/release/wdj_installer.exe',

    RESTORE_REMOTE_EMPTY_LIST : '云端还没有您的备份数据。<br />您必须先使用备份到云端功能备份数据，才能从云端进行恢复。',
    RESTORE_BATTERY_TIP : '您的手机电量已不足 20%，继续恢复有可能导致手机电量耗尽造成数据丢失，建议充电后再进行恢复。您确认要继续恢复数据吗？',
    RESTORE_CHOOSE_ACCOUNT_TIP : '您要把联系人恢复到哪个账号？请选择',
    RESTORE_DELETE_DATA_TIP : '是否要删除手机上原有数据？',
    RESTORE_DELETE_DATA_TIP_YES : '删除，只需要刚刚恢复的数据',
    RESTORE_DELETE_DATA_TIP_NO : '不删除，同时保留两份数据',

    RESTORE_UNKNOW_DEVICE : '未知设备',
    RESTORE_DOWNLOAD_PROGRESSING : '正在从云端下载备份数据，请稍候...',

    AUTO_BACKUP_TIP_TITLE : '还在手动备份？试试自动备份吧！',
    AUTO_BACKUP_TIP_DESC : '绑定手机后，备份手机再也不需要您亲自动手了！您是否要绑定手机并开启自动备份？',
    AUTO_BACKUP_YES : '开启自动备份',
    AUTO_BACKUP_NO : '暂不开启',

    AUTO_BACKUP_REMOTE_TIP_TITLE : '电脑数据容易丢，试试自动云备份吧！',
    AUTO_BACKUP_REMOTE_TIP_DESC : '自动将您的 <em>联系人/短信/应用</em> 备份到云端，不需要再手动备份。开启后同时也会在手机上生效。您是否要开启云备份？',

    BACKUP_APP_DATA_TIP : '豌豆荚可以帮助您备份应用的数据。<br />例如游戏进度、聊天记录、离线地图等。在恢复应用时就能恢复之前应用的使用状态。<br />此功能仅在 USB 连接下提供。',
    BACKUP_APP_DATA_TIP_TITLE : '请确认备份应用数据',
    BACKUP_APP_DATA_TIP_CONTENT : '备份应用数据时，您手机会弹出提示让您确认是否要备份数据。请点击「备份我的数据」进行备份。<br /><em>为方便数据恢复，请勿设置备份密码。</em>',
    BACKUP_APP_DATA_WAITING : '正在等待您在手机上确认备份应用数据',
    RESTORE_APP_DATA_WAITING : '正在等待您在手机上确认恢复应用数据',

    BACKUP_APP_DATA_ERROR : '很抱歉，备份应用数据失败。',
    BACKUP_APP_DATA_ERROR_DEVICE_INCOMPATIBLE : '设备未 root，或系统版本过低。',
    BACKUP_APP_DATA_ERROR_DEVICE_WIFI : '豌豆荚暂不支持 Wi-Fi 连接下备份应用数据。',
    BACKUP_APP_DATA_ERROR_ENCRYPT :　'豌豆荚暂不支持对备份加密，请不要输入密码。',
    BACKUP_APP_DATA_ERROR_CONNECT_ERROR :　'文件传输失败。',
    USER_CANCELED :　'备份应用数据操作被取消。',
    CUSTOM_AUTH_FAILED_ERROR :　'登录信息过期，请退出后重新登录。',
    CUSTOM_SERVER_UNAVALABEL_ERROR :　'很抱歉，辛勤的豌豆荚服务器太累了，请稍后再试。 <a target="_default" href="http://wandoujia.zendesk.com/entries/22604406#QuestionA">帮助</a>',
    RESTORE_APP_DATA_ERROR : '应用数据恢复失败。',
    CUSTOM_UNZIP_BACKUP_FILE_ERROR : '很抱歉，解压缩失败，部分应用未能恢复。',

    AUTO_BACKUP_COMPLETE_FINISH : '自动备份完成！',
    AUTO_BACKUP_COMPLETE_FINISH_TIP : '备份数据未加密，请确保您使用的是自己的手机和电脑。',
    AUTO_BACKUP_COMPLETE_FINISH_CONTENT : '本次为您备份了 <em>{1}</em>',

    PHOTO_DOWNLOAD_NOTIFY_TITLE : '已从云同步 {1} 张照片到电脑',
    PHOTO_DOWNLOAD_NOTIFY_CONTENT : '云相册刚刚帮您从云端同步了新照片到电脑。您可以查看同步的照片。',

    BACKUP_GUIDE_TIP : '您还没有备份数据！',
    BACKUP_GUIDE_TIP_DAY : '您已经 {1} 天没有备份啦！',
    BACKUP_GUIDE_CONTENT : '豌豆荚提醒您，定期备份手机防止重要数据丢失。您可以使用豌豆荚备份联系人、短信、应用和照片。',
    BACKUP_GUIDE_NOW : '马上备份',

    BACKUP_APP_DATA_UNSUPPORT : '暂不支持您的设备',
    BACKUP_APP_DATA_NON_USB : '请使用 USB 连接',

    SYNC_PHOTO_PUSH_NOTIFY_TITLE : '您需要自动下载云相册图片到电脑吗？',
    SYNC_PHOTO_PUSH_NOTIFY_CONTENT : '您手机上的照片已同步到云端。在电脑上开启云相册同步后，豌豆荚将自动将您云相册的图片下载到电脑，查看图片更方便。',
    CUSTOM_RESOURCE_LOCKED : '豌豆荚在 8 月 25 日碰到技术故障，当天我们暂时关闭了豌豆荚的账号服务，12 个小时后账号服务修复完成。但为了您的信息安全考虑，目前通过旧的密码将不能使用云恢复、云相册等功能。请您立即修改密码，以便正常使用豌豆荚。',

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
    DEFAULT_FILE_NAME : '豌豆荚的备份文件',
    GET_FILE_PATH_FAILED : '很抱歉，获取备份路径名失败，请手工指定。',
    BACKUP_FINISH : '{1}备份完成。',
    BACKUP_FAILED : '{1}备份失败。',
    BACKUPING_CONTACT : '正在备份联系人，请不要断开连接...',
    BACKUPING_SMS: '正在备份短信，请不要断开连接...',
    BACKUPING_APP : '正在备份软件，请不要断开连接...',
    BACKUPING_APP_DATA : '正在备份应用数据，请不要断开连接...',
    BACKUPING : '正在备份数据，请不要断开连接...',
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
    RESTORING : '正在恢复数据，请不要断开连接...',
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
    APP_TYPE_WDAPK_TITLE: '快速备份',
    APP_TYPE_WDAPK_TITLE_DESC: '仅备份应用列表，不备份安装文件，恢复时将从豌豆荚下载这些应用并安装，备份速度较快',
    APP_TYPE_APK_TITLE: '完整备份',
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
    PROGRESS_DONE : '已完成'
});
