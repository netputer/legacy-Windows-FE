/*global define*/
define({
    SENDER_PLACEHOLDER : '填写您的新信息...',
    SEND_A_SMS : '给好友发个短信吧',
    SEND_TO : '发至 {1}：',
    LOAD_MORE : '查看更多短信',
    SEND_MESSAGE : '发送信息',

    RECEIVER : '收信人：',
    CONTENT : '发送内容：',

    CONTENT_COUNT : '已输入 {1} 字，',
    CONTENT_COUNT2 : '{1} 字',
    MESSAGE_COUNT : '可能被拆分为 {1} 条短信发送，',
    CONTACTS_COUNT : '发送给 {1} 位联系人。',
    BIRTHDAY_TIP : '今天是他（她）的生日呦，快送上您的祝福吧',

    ME : '我',
    UNNAMED_CONTACT : '未命名的联系人',
    NONE_SUBJECT : '无主题',
    CONTAIN_MULTIMEDIA : '包含 {1} 个多媒体附件',
    OPEN_ON_DEIVE : '在手机上查看',
    EXPEND : '展开',
    SENDING : '发送中...',
    SEND_FAILED : '发送失败，',
    SEND_FAILED_ALERT : '短信发送失败。',
    RESEND : '重发',
    FORWARD : '转发',
    COPY : '复制',
    ADD_TO_CONTACT : '添加到通讯录',
    BATCH_SEND_TITLE : '请在手机上点击发送按钮',
    BATCH_SEND_TOO_MANY_TIP : '豌豆荚已经把收信人和短信内容填入您手机的短信发送框，请在手机上发送短信。为确保短信可以成功发送，豌豆荚每小时可以为您发送 90 条短信，您现在已经超出了这个限制。',

    DELETE_FAILD : '短信删除失败',

    ADD_BATCH_RECEIVER : '插入群发称呼',
    ADD_BATCH_RECEIVER_TIP : '群发称呼可以自动替换成收信人名字。如，您给「张三」和「李四」群发「$NAME，新年快乐！」，张三和李四会分别收到「张三，新年快乐！」和「李四，新年快乐！」。',
    MESSAGE_TOO_LONG : '您输入的短信将被拆分成多条发送，可能会产生额外的短信费用，确定发送吗？',

    REPLY_MESSAGE : '回复',
    PLEASE_INPUT_CONTENT : '请输入发送内容',
    PREV_MESSAGE : '上一条',
    NEXT_MESSAGE : '下一条',
    MESSAGE_FROM : '来自 {1} 的短信',

    ADD_CONTACT : '添加联系人',
    LOOK_UP_CONTACT : '查看联系人',
    SEARCH_CONTACT : '搜索联系人',
    CONTACT_SELECT : '已选择 {1} 人 ',
    CLEAR_ALL : '清除全部',

    NO_CONTACT_UNDER_THIS_ACCOUNT : '当前账号没有联系人',

    BATCH_SEND : '群发',
    BATCH_SEND_TIP : '...等 {1} 人',
    NAMEPLATE_BATCH_SEND_TIP : '...等 <span class="link list-switch">{1} 人</span>',
    SEND_FAILED_TIP : '{1} 条发送失败',
    RESEND_ALL : '全部重发',

    SEND_SMS : '发短信',
    MARK_AS_READ : '标记为已读',
    SEND_MESSAGE_TO : '发送短信给：',

    EMPTY_TIP_4_CONTACT : '豌豆荚找不到您和他的联系记录哦。',
    COUNT_TIP : '当前选中的会话(<span class="cover-count"></span> 个会话，<span class="sms-count"></span> 条短信)',

    BATCH_CONVERSATION : '群发短信',

    SMS_SUMMARY : '共 {1} 条，{2} 条未读',

    CONFIRM_DELETE_CONVERSATION : '确定要删除选中的 {1} 个会话中的 {2} 条短信吗？',
    CONVERSATION_DELETE_SUCCESS : '成功删除 {1} 条短信。',
    CONFIRM_MARK_AS_READ : '确定要将选中的 {1} 个会话中的短信全部标记为已读吗？',
    CONVERSATION_MARK_AS_READ_PROGRESS : '正在标记已读中，请稍候...',
    CONVERSATION_MARK_AS_READ_SUCCESS : '成功将 {1} 条短信标记为已读。',

    ALERT_TIP_EXPORT_MMS : '您选择的会话中包含彩信，这些彩信不会被导出。',

    SEND : '发送',
    BATCH_CONVERSATION_TITLE : '选择了 {1} 组短信',
    SEND_WITH_SIM1 : '使用默认 SIM 卡发送',
    SEND_WITH_SIM2 : '使用第二张 SIM 卡发送',

    WINDOW_IMPORT_TITLE : '导入短信',
    IMPORT_FAILED : '导入短信失败。',
    IMPORTING_SMS : '正在导入短信，请稍候...',
    DUPLICATE : '已为您忽略了 {1} 条重复短信。',
    IMPORT_SMS_FINISH : '短信导入完成',
    EXPORT_MESSAGE : '导出短信',
    EXPORT_FAILED : '导出短信失败。',
    EXPORTING_SMS : '正在导出短信，请稍候...',
    EXPORT_SMS_FINISH : '短信导出完成',
    IMPORT_SELECT_FILE : '选择包含短信的 .CSV 文件',
    INVALID_FILE : '无效的 .csv 文件',
    SELECT_MESSAGE : '请选择要导出的短信',
    NO_CONVERSATION : '豌豆荚无法显示您的短信，可能是手机上的安全软件阻止了豌豆荚读取信息的权限，请在手机上「权限管理」中授权。<a target="_default" href="http://help.wandoujia.com/entries/22017678?utm_campaign=tips&utm_medium=client&utm_source=sms">帮助</a>',
    PROBLEM_WITH_DUAL_SIM_PHONE : '双卡手机遇到问题',
    PROBLEM_WITH_DUAL_SIM_PHONE_TIP : '<p>如果您使用的是双卡手机，您可以指定使用其中某一张 SIM 卡发送短信。</p><p>由于市面上的双卡手机型号众多，豌豆荚可能不支持全部型号的双卡手机。如果您的双卡手机不能被识别或者是发送短信遇到问题，请 <a href="http://help.wandoujia.com/entries/21550442" target="_default">向我们反馈</a>。',

    SELECT_BACKUP_FILE : '请选择自动备份的短信记录',
    BACKUP_MESSAGE_NUMBER : '短信（条）',

    COPY_SMS : '短信已成功复制到剪切板',

    RETURN_ALL : '全部短消息',
    SEARCH_TIP : '{1} 个包含「{2}」的短消息',
    UNREAD_DES : '{1} 条未读短信',

    IMPORT_MSM_ANDROID_4_4 : '由于安卓系统的限制，为了您短信可以正常导入，请您在手机上把豌豆荚设置为默认的短信应用。'
});
