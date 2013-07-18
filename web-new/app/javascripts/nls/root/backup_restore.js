/*global define*/
define({
    CONTACT : '联系人',
    CONTACT_GROUP : '分组',
    SMS : '短信',
    MMS : '彩信',
    CALLLOG : '通话记录',
    BOOKMARK : '书签',
    SETTING : '设置',
    APP : '应用程序',
    APP_DATA : '应用数据',
    BR_TYPE_WORD_ENUM : ['', '联系人', '分组', '短信', '彩信', '通话记录', '书签', '设置', '应用程序', '应用程序', '应用数据'],

    CONFIRM_TITLE : '提示',
    BACKUP_TITLE : '备份数据',
    BACKUP_TITLE_LOCAL : '备份到电脑',
    BACKUP_TITLE_REMOTE : '备份到云端',
    RESTORE_TITLE_LOCAL : '从本地恢复',
    RESTORE_TITLE_REMOTE : '从云端恢复',
    RESTORE_TITLE : '恢复数据',
    START_BACKUP : '开始备份',
    START_RESTORE : '开始恢复',

    BACKUP_WAITING : '稍后备份{1}',
    BACKUP_PROCESS : '正在备份{1}',
    BACKUP_PROCESS_APP_DATA : '正在备份应用数据，详细备份进度请在手机上查看',
    BACKUP_FINISH : '{1}备份完成。',
    BACKUP_FAILED : '{1}备份失败。',

    RESTORE_PROCESS : '正在恢复{1}，请稍候...',
    RESTORE_WAITING : '稍后恢复{1}',
    RESTORE_FINISH : '{1}恢复完成。',
    RESTORE_FAILED : '{1}恢复失败。',

    TIP_IN_WIFI : '很抱歉，为了确保您的数据不会丢失，豌豆荚暂时不支持在 Wi-Fi 连接手机时备份和恢复数据。<br />请连接 USB 数据线后重试。',

    ERROR_WHEN_WRITE_ROM : '好像找不到您的 SD 卡了……<br />请您确认一下：<br />- 连接电脑时一定要在手机上关闭「USB 大容量存储模式」哦<br />- SD 卡是否正确地插入手机了呢？<br />- 或者……您的SD 卡是不是坏掉啦？换一张卡试试呢？',

    RESTORE_CONFIRM_1_TITLE : '恢复数据期间，为了确保数据的完整性，请确认',
    RESTORE_CONFIRM_1_TIP1 : '您的手机电量已不足 20%，继续恢复有可能导致手机电量耗尽造成数据丢失，建议充电后再进行恢复。您确认要继续恢复数据吗？',
    RESTORE_CONFIRM_1_TIP2 : '- 不要对联系人、短信、应用进行导入、安装、删除等操作',
    RESTORE_CONFIRM_1_TIP3 : '- 手机剩余电量大于 20%',
    RESTORE_CONFIRM_2_TITLE : '您指定的备份文件无效，请重新指定。',
    RESTORE_CONFIRM_3_TITLE : '您要把联系人恢复到哪个账号？请选择',
    RESTORE_CONFIRM_4_TITLE : '是否要删除手机上原有数据？',
    RESTORE_CONFIRM_4_TIP1 : '不删除，同时保留两份数据',
    RESTORE_CONFIRM_4_TIP2 : '删除，只需要刚刚恢复的数据',
    DELETING : '正在删除，请稍候...',
    DELETE_SUCCESS : '成功删除手机原有的数据。',
    DELETE_FAILED : '很抱歉，删除手机原有数据失败。',
    RESTORE_CONFIRM_6_TIP1 : '您的电脑和手机的连接中断。',
    RESTORE_CONFIRM_6_TIP2 : '豌豆荚会在手机上继续恢复，请到手机上查看恢复进度。',
    RESTORE_CONFIRM_7_TITLE : '您的电脑和手机的连接中断。无法完成恢复。',
    RESTORE_CONFIRM_8_TITLE : '以下 {1} 个联系人恢复失败。是否忽略并继续恢复其他数据？',
    RESTORE_CONFIRM_9_TITLE : '很抱歉，有 {1} 条{2}恢复失败。是否忽略并继续恢复其他数据？',
    RESTORE_CONFIRM_10_TITLE : '以下 {1} 个应用恢复失败，可能原因有：',
    RESTORE_CONFIRM_10_TIP1 : '是否忽略并继续恢复其他数据？',
    RESTORE_RUNING : '设备上已有恢复任务在进行中。',
    BACKUP_RESTORE_RUNING : '设备上已有备份或恢复任务在进行中。',
    BACKUP_TO_CLOUD_FAILED : '很抱歉，备份到云端失败。',
    BACKUP_TO_CLOUD_FAILED_DETAIL : '{1} 条{2}备份失败。',
    NETWORK_ERROR : '很抱歉，网络连接失败。',
    RESTORE_INVLID_FILE : '您指定的备份文件无效，请重新指定。',
    RESTORE_INVLID_CONTACTS_FILE : '您指定的备份文件无效。如果您想单独恢复联系人，请使用联系人管理中的导入功能。',
    RESTORE_SUCCESS : '豌豆荚成功恢复了您的数据。',
    RESTART : '某些数据可能要重启手机才能看到, 建议您立即重启手机。',
    RESTORE_STEP_2_TITLE : '请选择您要恢复的数据',
    RESTORE_FINISH_TIP : '恢复完成',
    RESTORING_TIP : '正在恢复，请勿断开手机连接',
    RESTORING_ON_DEVICE_TIP : '正在恢复，请到手机上查看恢复进度。',
    SELECT_BACKUP_FILE : '指定备份文件',
    SELECT_BACKUP_FILE_FOLDER : '指定备份文件夹',
    BACKUP_FILE : '备份文件',
    SELECT_FILE : '请选择备份文件',
    BAK_TIP_PREFIX : '（后缀为 .bak 的备份文件请使用 ',
    OLD_VERSION : '旧版豌豆荚',
    BAK_TIP_SUFFIX : '进行恢复）',

    BACKUP_CONFIRM_1_TITLE : '备份数据期间，为了确保数据的完整性，请确认',
    BACKUP_CONFIRM_2_TIP1 : '由于应用程序「{1}」的权限设置，豌豆荚无法备份此应用程序。',
    BACKUP_CONFIRM_2_TIP2 : '建议您忽略此应用程序并继续备份其他数据。',
    BACKUP_CONFIRM_3_TIP1 : '是否覆盖已有的备份文件？',
    BACKUP_CONFIRM_4_TITLE : '很抱歉，您设置的备份文件名或者目录不可用，请重新设置。',
    BACKUP_CONFIRM_5_TITLE : '以下 {1} 个应用备份失败。是否忽略并继续备份其他数据？',
    CHOOSE_APP_TYPE_TITLE : '请选择备份应用数据的方式',
    RETRYING : '正在重试，请稍候...',
    BACKUP_CONNECTION_LOST : '您的电脑和手机的连接中断。无法完成备份。',
    RESTORE_CONNECTION_LOST : '您的电脑和手机的连接中断。无法完成恢复。',
    SD_CARD_ERROR : 'SD 卡无法写入。请检查您的 SD 卡是否有足够的存储空间, 或者是否处于写保护状态。',
    FILE_DOWNLOAD_ERROR : '数据传输失败',
    PC_ZIP_ERROR : '压缩临时文件时出错。',
    CANCELED : '已取消操作。',
    FILE_PATH_ERROR : '文件路径设置不正确。',
    FILE_CANT_READ : '很抱歉，您选择的文件 {1} 不可用，请检查后重试。',
    BACKUP_RUNING : '设备上已有备份任务在进行中。',
    UNKNOW_ERROR : '很抱歉，出现未知错误：',
    BACKUP_STEP_1_TITLE : '请选择您要备份的数据',
    BACKUP_STEP_2_TITLE : '请命名备份文件',
    TYPE : '数据类型',
    QUANTITY : '数量',
    FILE_TYPE : '备份方式',
    SAVE_LOCATION : '设置保存位置',
    SAVE_LOCATION_LABEL : '备份保存位置：',
    OPEN_BACKUP_FILE : '查看备份文件',
    FINISH_ALL : '全部完成。',
    PRIVACY_TIP : '豌豆荚未对备份数据进行加密，备份的数据是您的私人数据，请妥善保管。',
    MOBILE_TIP : '您可以在电脑或手机上恢复这些数据。',
    BACKUPING : '正在备份，请勿断开手机连接',
    BACKUP_FINISH_LABEL : '备份完成',
    RESTORE_FINISH_LABEL : '恢复完成',
    BACKUP_COMPRESSING : '正在为您压缩备份文件，请稍候...',
    FILE_TYPE_APK : '普通备份',
    FILE_TYPE_WDAPK : '快速备份 (beta)',
    WDAPK_INTRO_TIP : '• 快速备份：（推荐）<br />豌豆荚会备份您应用的名称，恢复时豌豆荚会根据应用名称即时下载最新版本恢复到您的手机上。备份速度飞快，但恢复时需要联网。<br />• 普通备份：<br />豌豆荚会将您的应用完整复制到电脑上保存。备份速度一般，但恢复时不需联网。',
    INSTALL_APK_TIP1 : '豌豆荚会下载和安装备份的应用的最新版本，请点击继续。',
    INSTALL_APK_TIP2 : '',
    RESTORE_APP_TIP : '豌豆荚已将要恢复的应用添加到任务管理器，您可以在下载管理界面中查看应用安装的情况。',
    RESTORE_PERMISSSION_TIP1 : '很抱歉，{1}恢复失败。',
    RESTORE_PERMISSSION_TIP2 : '您可能使用了控制手机数据读写权限的系统或者程序。例如MIUI系统、Flyme系统、LBE、腾讯手机管家等。请您授予豌豆荚读写{1}的权限后再继续恢复数据。<a target="_default" href="http://help.wandoujia.com/entries/22017678?utm_campaign=tips&utm_medium=client&utm_source=backup">帮助</a>',
    RESTORE_PERMISSSION_TIP3 : '是否忽略并继续恢复其他数据？',
    RESTORE_PERMISSSION_PART_TIP1 : '很抱歉，{1} 个{2}恢复失败。',
    SELECT_FILE_FOLDER_TIP : '抱歉，豌豆荚没有找到您备份的文件，您是否把备份文件移动到了其他位置？',

    APP_TYPE_WDAPK_TITLE : '备份应用列表（推荐）',
    APP_TYPE_WDAPK_CONTENT : '备份应用的名称。恢复时会根据应用名称即时下载最新版本恢复到您的手机上。备份速度飞快，但<em>恢复时需要联网</em>。',
    APP_TYPE_APK_TITLE : '备份完整应用文件',
    APP_TYPE_APK_CONTENT : '豌豆荚会将您的应用完整复制到电脑上保存。备份速度一般，但恢复时不需联网。',
    APP_TYPE_APK_CONTENT_WIFI : '您处于Wi-Fi连接状态，备份完整应用功能不可用。请使用 USB 数据线连接。',

    BACKUP_WIFI_TIP : '您已经可以使用 Wi-Fi 连接豌豆荚进行数据备份！<br />在 Wi-Fi 连接状态下您的备份过程需要的时间会稍长，请勿断开 Wi-Fi 连接。',
    RESTORE_WIFI_TIP : '您已经可以使用 Wi-Fi 连接豌豆荚进行数据恢复！<br />在 Wi-Fi 连接状态下您的恢复过程需要的时间会稍长，请勿断开 Wi-Fi 连接。',

    CHOOSE_BACKUP_TYPE_TITLE : '请选择备份方式',
    BACKUP_TYPE_LOCAL_TITLE : '备份到电脑',
    BACKUP_TYPE_LOCAL_CONTENT : '将您手机上的数据备份到电脑上，方便恢复',
    BACKUP_TYPE_REMOTE_TITLE : '备份到云端',
    BACKUP_TYPE_REMOTE_CONTENT : '将您的数据备份到云端的私人豌豆荚账号中，数据不会丢失。可以恢复到任意历史时间点，还可以直接从手机恢复',

    CHOOSE_BACKUP_DATA_TIP : '请选择要备份的数据',
    CHOOSE_RESTORE_DATA_TIP : '请选择要恢复的数据',
    LOGIN_FAILED_TIP : '很抱歉，登录失败。请检查您的网络后重试登录，或选择本地备份',
    PERMISSION_TIP : '读取手机数据失败。<br />可能是手机上的安全软件阻止了豌豆荚读取联系人或信息的权限，请在手机上「权限管理」中授权。<a target="_default" href="http://help.wandoujia.com/entries/22017678?utm_campaign=tips&utm_medium=client&utm_source=sms">帮助</a>',

    SET_FILE_NAME : '请命名备份文件',
    DEFAULT_FILE_NAME : '豌豆荚的备份文件',
    FILE_NAME_UNLEGAL :　'您指定的文件名无效，可能其中包含非法字符，请重新指定',
    GET_FILE_PATH_FAILED : '很抱歉，获取备份路径名失败，请手工指定',
    GET_FILE_NAME_FAILED : '很抱歉，获取备份文件失败，请手工指定',
    SET_FILE_PATH_FAILED : '很抱歉，设置备份路径失败',
    SET_FILE_PATH_LINK_BUTTON : '修改保存位置',
    SET_RESTORE_FILE_FAILED : '很抱歉，选择备份文件失败',

    CONNECT_LOST : '您的电脑和手机的连接中断。',
    FILE_PATH_INVALID : '很抱歉，您设置的备份文件名或者目录不可用，请重新设置。',
    OVERWIRTE_EXISTS_FILE_TIP : '是否覆盖已有的备份文件？',
    BACKUP_FAILED_TIP : '很抱歉，备份失败：',
    RESTORE_FAILED_TIP : '很抱歉，恢复失败：',
    RESTORE_DOWNLOAD_FAILED_TIP : '很抱歉，恢复失败：',
    BACKUP_ABORT_TIP : '很抱歉，备份终止',
    RESTORE_ABORT_TIP : '您的电脑和手机的连接中断。<br />豌豆荚会在手机上继续恢复，请到手机上查看恢复进度。',
    APP_ERROR_LIST_TITLE : '以下 {1} 个应用备份失败。是否忽略并继续备份其他数据？',
    APP_DATA_ERROR_LIST_TITLE : '以下 {1} 个应用的应用数据备份失败。是否忽略？',
    LOGIN_LINK_BUTTON : '请登录豌豆荚账号',

    CHOOSE_RESTORE_TYPE_TITLE : '请选择恢复方式',
    RESTORE_TYPE_LOCAL_TITLE : '从电脑恢复',
    RESTORE_TYPE_LOCAL_CONTENT : '从您电脑上的本地备份文件中进行恢复',
    RESTORE_TYPE_REMOTE_TITLE : '从云端恢复',
    RESTORE_TYPE_REMOTE_CONTENT : '从云端的备份数据进行恢复，可以恢复到任意历史时间点',
    RESTORE_LIST_SNAPHOST_FAILED : '很抱歉，加载数据列表失败。',

    CHOOSE_RESTORE_FILE_TITLE : '请选择您要恢复的备份文件',
    CHOOSE_RESTORE_DATE_TITLE : '请选择您要恢复到的日期',
    RESTORE_DATE : '日期',
    RESTORE_DEVICE : '设备',
    CHOOSE_RESTORE_FILE_TIP_BEFORE : '您也可以 ',
    CHOOSE_RESTORE_FILE_TIP_LINK : '指定备份文件',
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
    RESTORE_DOWNLOAD_PROGRESSING : '正在从云端下载备份数据，请稍后...',
    RESTORE_DOWNLOAD_FINISH : '下载备份数据完成。',

    AUTO_BACKUP_TIP_TITLE : '还在手动备份？试试自动备份吧！',
    AUTO_BACKUP_TIP_DESC : '绑定手机后，备份手机再也不需要您亲自动手了！您是否要绑定手机并开启自动备份？',
    AUTO_BACKUP_YES : '开启自动备份',
    AUTO_BACKUP_NO : '暂不开启',

    AUTO_BACKUP_REMOTE_TIP_TITLE : '电脑数据容易丢，试试自动云备份吧！',
    AUTO_BACKUP_REMOTE_TIP_DESC : '自动将您的 <em>联系人/短信/应用</em> 备份到云端，不需要再手动备份。开启后同时也会在手机上生效。您是否要开启云备份？',
    AUTO_BACKUP_REMOTE_YES : '开启云备份',

    BACKUP_APP_DATA_TIP : '豌豆荚可以帮助您备份应用的数据。<br />例如游戏进度、聊天记录、离线地图等。在恢复应用时就能恢复之前应用的使用状态。<br />此功能仅在 USB 连接下提供。',
    BACKUP_APP_DATA_TIP_TITLE : '请确认备份应用数据',
    BACKUP_APP_DATA_TIP_CONTENT : '备份应用数据时，您手机会弹出提示让您确认是否要备份数据。请点击「备份我的数据」进行备份。<br /><em>为方便数据恢复，请勿设置备份密码。</em>',
    RESTORE_APP_DATA_TIP_TITLE : '恢复应用数据时需要手动确认',
    BACKUP_APP_DATA_WAITING : '正在等待您在手机上确认备份应用数据',
    RESTORE_APP_DATA_WAITING : '正在等待您在手机上确认恢复应用数据',
    RESTORE_APP_DATA_TIP_CONTENT : '恢复应用数据时，您的手机会弹出提示让您确认是否要恢复数据。请点击「恢复我的数据」进行恢复。',

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
    SYNC_PHOTO_OPEN : '开启云相册同步'
});
