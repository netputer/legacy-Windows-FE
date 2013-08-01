/*global define*/
define({
    ACCOUNT_TYPE_GOOGLE : 'Google 账号：',
    ACCOUNT_TYPE_PHONE : '手机账号',
    ACCOUNT_TYPE_SIM : 'SIM 卡账号',
    ACCOUNT_TYPE_OTHER : '其他账号',

    ACCOUNT_LOADING : '读取账号信息...',
    ACCOUNT_ALL : '全部账号',
    UNNAMED_CONTACT : '未命名联系人',

    GROUP_ALL : '全部分组',
    GROUP_LOADING : '读取分组信息...',

    ALERT_TIP_EXOPRT_OUTLOOK : '由于 Outlook 格式只能存储 3 个电话或邮箱，不能存储头像、聊天软件账号，豌豆荚不会导出此部分数据。',
    ALERT_TIP_EXOPRT_WINDOWS_MAIL : '由于 Windows Mail 格式只能存储 2 个电话、1 个传真、1 个邮箱，不能存储群组、聊天软件账号、头像，豌豆荚不会导出此部分数据。',
    ALERT_TIP_EXOPRT_NOKIA : '由于 Nokia 格式只能存储 3 个电话、2 个传真、2 个邮箱，不能存储群组、聊天软件账号、头像，豌豆荚不会导出此部分数据。',
    ALERT_TIP_EXOPRT_VCARD : '由于 csv 文件在恢复时容易出现不可控的意外情况，豌豆荚建议您使用vCard格式导出联系人。',
    ALERT_TIP_MERGE_MANY_CONTACTS : '一次性合并过多联系人需要花费很长时间，确定继续吗？',
    ALERT_TIP_MERGE_CONTACTS : '<p>确定要合并选中的 {1} 个联系人吗？</p><p>合并成功后，原来的 {2} 个联系人都会被删除。</p>',
    ALERT_TIP_DEL_SINGLE_CONTACT : '确定要删除选定的 1 个联系人吗？',

    GROUP_ALREADY_EXSIST : '已存在这个分组',
    PLEASE_INPUT_GROUP_NAME : '请填写分组名称',
    QUICK_ADD_CONTACT : '快速新建联系人',
    NAME : '姓名',
    CELL_PHONE : '移动电话',
    EMAIL : '电子邮箱',
    SAVE_SUCCESS : '保存成功',
    SAVE_FAILED : '保存失败',

    CANNOT_EDIT_CONTACTS_UNDER_READONLY_ACCOUNT : '此联系人属于只读账号，无法编辑',
    EDIT : '编辑',
    ADD_CONTACT_METHOD : '添加其他联系方式',
    CONTACT_INFO : '联系信息',
    CHANGE_AVATAR : '更换头像',
    SEND_MAIL : '发邮件',
    REMARK : '备注',
    MERGE : '合并',
    DIAL : '拨打电话',
    DIAL_SUCCESS : '豌豆荚已经帮您在手机上完成拨号了，拿起手机按下呼叫键吧！',

    SELECT_CONATCTS_BAKCUP_FILE : '选择包含联系人的 .vcf 或者 .csv 文件',
    INVALID_BAKCUP_FILE : '无效的 .vcf 或者 .csv 文件',
    SELECT_ACCOUNT_TO_IMPORT : '您要把联系人导入到哪个账号？请选择：',
    SELECT_EXPORT_FORMAT : '请选择要导出联系人的格式',
    V_CARD : 'vCard 格式（推荐）',
    OUTLOOK : 'Outlook 2003/2007/2010 的 csv 格式',
    NOKIA : 'Nokia 的 csv 格式',
    WINDOW_MAIN : 'Windows Mail 的 csv 格式',
    SELECT_COUNTACTS_TO_EXPORT : '请选择要导出的联系人',
    CURRENT_SELECT : '当前选中的联系人',
    CONTACT_HAS_NUMBER : '有电话号码的联系人',
    GROUP : '分组',

    MANAGE_GROUP : '管理分组...',
    CONTACT_RECORD : '联系记录',
    CUSTOME_CONTACT_INFO : '自定义联系信息',

    HOME_NUMBER : '家庭电话',
    WORK_NUMBER : '工作电话',
    WORK_FAX : '工作传真',
    HOME_FAX : '家庭传真',
    BP_CALL : '传呼机',
    OTHER_NUMBER : '其他电话',
    CALLBACK : '回拨号码',
    CAR : '车载电话',
    COMPANY_MAIN : '工作总机',
    ISDN : 'ISDN',
    MAIN : '总机',
    OTHER_FAX : '其他传真',
    RADIO : '无线装置',
    TELEX : '电报',
    TTY_TDD : 'TTY TDD',
    WORK_MOBILE : '工作移动电话',
    WORK_PAGER : '工作传呼机',
    ASSISTANT : '助理',
    CUSTOME : '自定义...',

    HOME_MAIL : '家庭邮箱',
    WORK_MAIL : '工作邮箱',
    OTHER_MAIL : '其他邮箱',

    HOME_ADDRESS : '家庭地址',
    WORK_ADDRESS : '工作地址',
    OTHER_ADDRESS : '其他地址',

    WORK : '公司',
    OTHER : '其他',

    PHONE : '电话',
    IM : '聊天工具',
    ADDRESS : '地址',
    ORG : '组织',

    IMPORT_PARTIAL_FAILED : ' 个联系人导入失败',
    IMPORTING_CONTACT : '正在导入联系人, 请稍候...',
    IMPORT_CONTACT_FINISH : '联系人导入完成',
    EXPORT_CONTACT_FAILED : '导出联系人失败。',
    ADD_GROUP : '添加分组...',

    /****************/

    BUTTON_ADD_CONTACT_LABEL : '新建联系人',
    WINDOW_IMPORT_TITLE : '导入联系人',
    WINDOW_EXPORT_TITLE : '导出联系人',

    DELETE_TIP_TEXT : '确定要删除选中的 {1} 个联系人？',

    NON_CONTACT_TEXT_PERMISSION : '豌豆荚无法显示您的联系人，可能是手机上的安全软件阻止了豌豆荚读取联系人的权限，请在手机上「权限管理」中授权。<a target="_default" href="http://help.wandoujia.com/entries/22017678?utm_campaign=tips&utm_medium=client&utm_source=contacts">帮助</a>',
    NON_CONTACT_TEXT : '您还没有添加过联系人。',
    NON_PHONE_CONTACT_TEXT : '您没有有电话号码的联系人。',
    NON_STAR_CONTACT_TEXT : '您收藏夹中还没有任何联系人，您可以点击联系人旁边的五角星把他（她）添加到收藏夹。',

    SAVE_TIP_TEXT : '是否保存所做的修改？',


    NO_EMAIL_CLIENT_TIP : '<p>非常抱歉, 不能向联系人发送邮件。</p><p>没有找到邮件客户端, 请先安装并绑定邮件服务软件。</p>',

    GROUP_MANAGER_TITLE : '管理账号与分组',
    CURRENT_ACCOUNT_LABEL : '当前账号：',
    GROUP_NAME_LABEL : '分组名称',
    GROUP_CD_LABEL : '操作',
    GROUP_UPDATE_LABEL : '重命名',
    UNEDITABLE_GROUP_TEXT : '系统分组无法编辑',
    GROUP_DELETED_TEXT : '已删除',
    GROUP_ADD_LABEL : '添加分组',
    UNGROUP_CONTACT_LABEL : '未分组',
    CONTACT_ALL_TEXT : '共 {1} 个联系人 ',
    CONTACT_GROUP_TEXT : '当前分组一共有 {1} 个联系人',
    CONTACT_ACCOUNT_TEXT : '当前账号一共有 {1} 个联系人',
    CONTACT_DELETE_SUCCESS : '成功删除 {1} 个联系人。',
    CONTACT_DELETE_FAILED_TEXT : '对不起，以下联系人删除失败。',
    CONTACT_SIM_SELECT_TEXT_1 : 'SIM 卡上的联系人需要导入到手机上后才能编辑',
    CONTACT_SIM_SELECT_TEXT_2 : 'Android 手机不支持编辑 SIM 卡上的联系人，请按照提示把 SIM 卡上的联系人导入到手机后再编辑。',
    CONTACT_READ_ONLY_TIP : '<p>您选择了只读账号上的联系人，而您的手机不支持编辑只读账号下的联系人。</p><p>是否自动忽略这些联系人并继续操作？</p>',

    /* Import and export */
    DUPLICATE : '已为您忽略了 {1} 条重复联系人。',
    EXPORT_PROGRESS_DESC2 : '正在导出联系人，请稍候...',
    EXPORT_SUCCESS_DESC2 : '联系人导出完成',


    EDIT_CONTACT_HEAD : '编辑联系人头像',
    EDIT_CONTACT_HEAD_SELECT_SOURCE : '选择文件来源：',
    EDIT_CONTACT_HEAD_SOURCE_BY_PHONE : '手机相册',
    EDIT_CONTACT_HEAD_SOURCE_BY_LIBRARY : '图片库',
    EDIT_CONTACT_HEAD_PC_SOURCE : '从电脑上选择文件',
    EDIT_CONTACT_HEAD_DEL_TEXT : '删除当前头像',
    ALERT_DEL_CONTACT_HEAD : '确定删除当前联系人头像？',
    ALERT_PIC_FORMAT_TIP : '提示：目前仅支持 JPG 和 PNG 格式的图片作为头像。',
    ALERT_BATCH_MOVE_GROUP : '<p>{1} 等 {2} 个联系人不在 {3} 账号中。</p><p>分组后，会把联系人从旧账号移动到新账号，确定继续？</p>',
    ALERT_BATCH_MOVE_GROUP_SINGLE : '<p>{1} 不在 {2} 账号中。</p><p>分组后，会把联系人从旧账号移动到新账号，确定继续？</p>',

    BATCH_CONTACT_TITLE : '选择了 {1} 个联系人',
    ALERT_SELECT_MORE_CSV_FILE : '很抱歉，暂时不支持一次导入多个 csv 文件。请重新选择一个 csv 文件。',
    IMPORT_CONTACTS_FAIL : '导入联系人失败',
    CONTACT_BATCH_GROUP_PROGRESS : '正在分组，请稍候...',
    CONTACT_BATCH_GROUP_SUCCESS : '成功为 {1} 个联系人设置分组',
    GROUP_NAME : '分组名称：',
    ADD_GROUP_FAIL : '添加分组出错',
    GROUP_TIP : '- 仅此格式会保留群组信息',

    SELECT_BACKUP_FILE : '请选择自动备份的联系人记录',
    BACKUP_MESSAGE_NUMBER : '联系人（个）',
    IMPORT_FROM_BACKUP : '从自动备份导入',

    EXPORT_USING_VCARD: '使用 vCard 导出',

    CONTACT_TIP_PART : '{1} 个与「{2}」有关的联系人',

    EMPTY_PHONE_LIST : '您的手机相册中还没有图片呢',
    EMPTY_LIBRARY_LIST : '您的图库中还没有图片呢'
});

