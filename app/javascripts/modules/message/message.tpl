<templates>
<script type="text/x-ui-template" id="message-main">
    <div class="w-message-ctn"></div>
</script>
<script type="text/x-ui-template" id="message-panel">
    <div class="empty-info vbox">
        <div class="bg"></div>
        <div class="text-thirdly tip">{{= i18n.message.SEND_A_SMS }}</div>
    </div>
</script>

<script type="text/x-ui-template" id="conversation-list-ctn">
    <button class="w-icon-btn transparent button-return">
        <span class="icon return"></span>{{= i18n.message.RETURN_ALL }}
    </button>
    <header class="count-tip text-secondary"></header>
</script>

<script type="text/x-ui-template" id="conversation-list-item">
    <label class="input item-checker-wrap">
        <input class="item-checker" type="checkbox" value="{{= it.id }}">
    </label>
    <div class="avatar">
        <img src="{{= it.contactIcon }}" alt="{{! it.contactName }}" />
    </div>
    <div class="content">
        <div class="hbox">
            <div class="nameplate">
                {{? it.address.length > 1 }}
                    <span class="name wc">
                    {{!
                        _.map(it.address.slice(0, 2), function(add) {
                            return (add.contact_id === '-1' ? add.phone_number : add.contact_name)
                                    || i18n.contact.UNNAMED_CONTACT;
                        }).join(i18n.misc.CAESURA_SIGN)
                    }}
                    {{? it.address.length > 2 }}
                        {{= StringUtil.format(i18n.message.BATCH_SEND_TIP, it.address.length) }}
                    {{?}}
                    </span>
                {{??}}
                    <span class="name wc">
                    {{! it.contactName }}
                    </span>
                    <div class="count total">{{= it.total_number }}</div>
                {{?}}
            </div>
            <div class="notifier">
                {{? it.unread_number > 0 }}
                <div class="count unread">
                    {{= it.unread_number }}
                </div>
                {{?}}
                {{? it.sending_sms > 0 }}
                <div class="icon sending" title="{{= i18n.message.SENDING }}"></div>
                {{?}}
                {{? it.failed_sms > 0 }}
                <div class="icon faild" title="{{= StringUtil.format(i18n.message.SEND_FAILED_TIP, it.failed_sms) }}"></div>
                {{?}}
            </div>
        </div>
        <div class="text-thirdly hbox">
            <div class="summary wc">
                {{? it.is_summary_mms }}
                [{{= i18n.misc.MMS }}] {{! it.summary || i18n.message.NONE_SUBJECT }}({{= StringUtil.format(i18n.message.CONTAIN_MULTIMEDIA, it.summary_media_count) }})
                {{??}}
                {{! it.summary }}
                {{?}}
            </div>
            <date class="date">
                {{= StringUtil.smartDate(it.last_date) }}
            </date>
        </div>
    </div>
    <div class="button-close" data-id="{{= it.id }}" title="{{= i18n.misc.DESELECT }}"></div>
</script>

<script type="text/x-ui-template" id="threads-header">
    {{? it.isBatch }}
    <div class="contact-info wc batch">
        [{{= i18n.message.BATCH_SEND }}]
        {{=
            _.map(it.contactName.reverse().slice(0, 2), function(contact) {
                return (contact.contact_id === '-1' ? contact.phone_number : contact.contact_name)
                        || i18n.contact.UNNAMED_CONTACT;
            }).join(i18n.misc.CAESURA_SIGN)
        }}
        {{? it.contactName.length > 2 }}
            {{= StringUtil.format(i18n.message.NAMEPLATE_BATCH_SEND_TIP, it.contactName.length) }}
        {{?}}
    </div>
    {{? it.failedCount > 0 }}
    <div class="text-warning failed-count">{{= StringUtil.format(i18n.message.SEND_FAILED_TIP, it.failedCount) }}</div>
    <button class="button-resend-all">{{= i18n.message.RESEND_ALL }}</button>
    {{?}}
    {{??}}
    <img src="{{= it.contactIcon }}" alt="{{! it.contactName }}" />
    <div class="contact-info enable-select hbox">
        {{? it.contactId !== '-1' }}
        <span class="name wc">{{! it.contactName }}</span>
        <span class="number text-thirdly wc">&nbsp;{{= it.phoneNumber }}</span>
        {{??}}
        <span class="name wc">{{! it.contactName }}</span>
        {{?}}
    </div>
    {{? it.contactId === '-1' }}
    <button class="button-addToContact">{{= i18n.message.ADD_TO_CONTACT }}</button>
    {{??}}
    <button class="button-navigateToContact">{{= i18n.message.LOOK_UP_CONTACT }}</button>
    {{?}}
    {{?}}
</script>

<script type="text/x-ui-template" id="message-sender-threads-panel">
    <div class="selector-ctn hbox">
        <span class="text-secondary">{{= i18n.message.SEND_MESSAGE_TO }}</span>
        <div class="number-selector"></div>
    </div>
    <div class="sender-ctn hbox">
        <textarea class="input-content" autofocus="true"></textarea>
        <div class="count-ctn">
            <div class="count-down-container">
                <div class="count-down text-thirdly"></div>
                <div class="duoqu"></div>
            </div>
            <button class="button-send primary">{{= i18n.message.SEND_SMS }}</button>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="threads-panel">
    <ul class="w-message-threads-list-ctn"></ul>
    <div class="empty-tip text-secondary"></div>
</script>

<script type="text/x-ui-template" id="message-sender">
    <div class="header hbox">
        <label class="cf" for="address">{{= i18n.message.RECEIVER }}</label>
        <div class="address">
            <input id="address" type="text" class="input-contact searchbox" autofocus="true" />
        </div>
        <button class="w-icon-btn button-add-contact">
            <span class="icon add-grey"></span>{{= i18n.message.ADD_CONTACT }}
        </button>
    </div>
    <div class="body hbox">
        <label class="cf" for="content">{{= i18n.message.CONTENT }}</label>
        <textarea id="content" class="input-content"></textarea>
    </div>
    <div class="monitor text-secondary">
        <span class="content-count"></span><span class="contacts-count"></span>
    </div>
    <div class="help hbox">
        <div class="batch-send-tip hbox">
            <span class="link button-add-placeholder">{{= i18n.message.ADD_BATCH_RECEIVER }}</span>
            <div class="tip"></div>
        </div>
        <div class="multi-sim-tip hbox">
            <span class="link button-feedback">{{= i18n.message.PROBLEM_WITH_DUAL_SIM_PHONE }}</span>
            <div class="tip"></div>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="threads-item">
    {{? it.last_in_day }}
    <div class="date-ctn text-thirdly hbox">
        <hr />
        <date>
            {{=
                (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT
                    || Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) ?
                        this.smartDate(it.day) : StringUtil.formatDate('MM / dd / yyyy', it.day * 24 * 60 * 60 * 1000)
            }}
        </date>
        <hr />
    </div>
    {{?}}
    <ul class="w-message-item-ctn"></ul>
</script>

<script type="text/x-ui-template" id="threads-item-message">
    <div class="content-wrap text-secondary">
        <span class="content enable-select">
        <div class="receiver">{{! StringUtil.format(i18n.message.SEND_TO, it.contact_name) }}</div>
        {{? it.id < 0 }}
        [{{= i18n.misc.MMS }}] {{! it.subject || i18n.message.NONE_SUBJECT }}（{{= StringUtil.format(i18n.message.CONTAIN_MULTIMEDIA, it.mms_media_count) }}，<span class="link button-open-on-device">{{= i18n.message.OPEN_ON_DEIVE }}</span>）<br />
            <span class="mms-content{{ if(it.body.length > 140) { }} wc{{ } }}">{{= it.body }}</span>
            {{? it.body.length > 140 }}
            <span class="button-toggle link">{{= i18n.message.EXPEND }}</span>
            {{?}}
        {{??}}
        {{= it.body }}
        {{?}}
        </span>
        <div class="arrow">
            <div class="side"></div>
        </div>
        <div class="actions">
            {{? it.type === CONFIG.enums.SMS_TYPE_RECEIVE }}
            <button class="button-reply transparent" title="{{= i18n.message.FORWARD }}"></button>
            <button class="button-copy transparent" title="{{= i18n.message.COPY }}"></button>
            <button class="button-delete transparent" title="{{= i18n.misc.DELETE }}"></button>
            {{??}}
            <button class="button-delete transparent" title="{{= i18n.misc.DELETE }}"></button>
            <button class="button-copy transparent" title="{{= i18n.message.COPY }}"></button>
            <button class="button-reply transparent" title="{{= i18n.message.FORWARD }}"></button>
            {{?}}
        </div>
    </div>
    <div class="info text-thirdly">
        {{
            switch(it.type) {
            case CONFIG.enums.SMS_TYPE_SENT_FAILD :
                if(it.id >= 0) {
        }}
        <div class="icon faild"></div>{{= i18n.message.SEND_FAILED }}<span class="button-resend link">{{= i18n.message.RESEND }}</span>
        {{
                    }
                break;
            case CONFIG.enums.SMS_TYPE_SENDING :
        }}
        <div class="icon sending" title="{{= i18n.message.SENDING }}">
        {{
                break;
            case CONFIG.enums.SMS_TYPE_QUEUE:
        }}
        <div class="icon sending" title="{{= i18n.message.SENDING }}">
        {{
                break;
            default:
        }}
        <date>{{= StringUtil.formatDate('HH:mm' , it.date) }}</date>
        {{
            }
        }}
    </div>
</script>

<script type="text/x-ui-template" id="message-notification">
    <div class="w-sms-notification-container hbox">
        <div class="w-sms-notification-avatar">
            <img src="{{= it.contact_icon }}" alt="{{! it.contact_name }}" />
        </div>
        <div class="w-sms-notification-content">
            <span class="w-sms-notification-body enable-select">
                <span class="body">{{! it.body }}</span>
                <date class="date text-secondary">{{= StringUtil.formatDate(' - HH:mm' , it.date) }}</date>
            </span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="search-result-item">
    <img class="avatar" src="{{= it.avatar }}" alt="{{= it.displayTitle }}" />
    <div class="title wc">{{= it.displayTitle }}</div>
    <div class="text-secondary number wc">{{= it.displayNumber }}</div>
</script>

<script type="text/x-ui-template" id="message-notification-sender">
    <textarea class="input-content" placeholder="{{= i18n.message.SENDER_PLACEHOLDER }}"></textarea>
    <div class="hbox notification-sender">
        <button class="button-send primary">{{= i18n.message.REPLY_MESSAGE }}</button>
        <div class="navigate">
            <span class="button-delete link">{{= i18n.misc.DELETE }}</span>
            <span class="button-prev link">{{= i18n.message.PREV_MESSAGE }}</span>
            <span class="button-next link">{{= i18n.message.NEXT_MESSAGE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="contact-seletor-body">
    <input class="searchbox" type="text" placeholder="{{= i18n.message.SEARCH_CONTACT }}" />
    <div class="selector-ctrl hbox">
        <div class="selector-ctn"></div>
        <div class="link button-select-all">{{= i18n.ui.SELECT_ALL }}</div>
    </div>
    <div class="list-ctn hbox"></div>
    <div class="selector-monitor"></div>
</script>

<script type="text/x-ui-template" id="contact-selector-footer">
    <span class="text-secondary count">{{= StringUtil.format(i18n.message.CONTACT_SELECT, 0) }}</span>
    <span class="link button-clear-all">{{= i18n.message.CLEAR_ALL }}</span>
</script>

<script type="text/x-ui-template" id="contact-list-item">
    <label class="input item-checker-wrap hbox"><input class="item-checker" type="checkbox" value="{{= it.id }}"></label>
    <img class="avatar" src="{{= it.avatarSmall }}" alt="{{= it.title }}"/>
    <div class="title wc">{{= it.title }}</div>
    <div class="phone-number text-secondary wc">{{= it.phoneNumber }}</div>
    <div class="state hbox">
        <div class="tip text-primary">{{= i18n.misc.SELECT }}</div>
        <div class="check"></div>
    </div>
</script>

<script type="text/x-ui-template" id="monitor-item-sender">
    <span title="{{! it.phoneNumber }}">{{! it.title || it.phoneNumber }}</span>
    <div class="button-delete"></div>
</script>

<script type="text/x-ui-template" id="batch-conversations">
    <div class="title">
        <span class="count"></span>
        <span class="button-deselect link">{{= i18n.misc.DESELECT }}</span>
    </div>
    <div class="w-message-batch-conversations-list-ctn vbox"></div>
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn primary button-send min">
        <span class="icon add"></span>{{= i18n.message.SEND_SMS }}
    </button>
    <button class="w-icon-btn button-delete min">
        <span class="icon delete"></span>{{= i18n.misc.DELETE }}
    </button>
    <button class="w-icon-btn button-mark-as-read min">
        <span class="icon mark-as-read"></span>{{= i18n.message.MARK_AS_READ }}
    </button>
    <div class="split"></div>
    <button class="w-icon-btn button-import min">
        <span class="icon import"></span>{{= i18n.misc.IMPORT }}
    </button>
    <button class="w-icon-btn button-export min">
        <span class="icon export"></span>{{= i18n.misc.EXPORT }}
    </button>
</script>

<script type="text/x-ui-template" id="import-backup">
    <div class="tip">
        <label class="select-file" >{{= i18n.message.SELECT_BACKUP_FILE }}</label>
    </div>
    <div class="header hbox">
        <div class="backup-record" >{{= i18n.misc.BACKUP_RECORD }}</div>
        <div class="message-number" >{{= i18n.message.BACKUP_MESSAGE_NUMBER }}</div>
    </div>
    <div class="list-ctn">
        <div class="loading">{{= i18n.misc.LOADING }}</div>
        <ul class="list">
            {{~ it.list : item }}
            <li>
                <label class="item-wrap hbox">
                    <input class="file-radio" type="radio" name="backup" value="{{= item.file_path }}" />
                    <div class="date">{{= StringUtil.formatDate("yyyy-MM-dd", item.date) }}</div>
                    <div class="title" title="{{= item.file_path }}">{{= item.device_title }}</div>
                    <div class="count">{{= item.number }}</div>
                </label>
            </li>
            {{~}}
        </ul>
    </div>
</script>

<script type="text/template" id="import-file-select">
    <p class="title">{{= i18n.message.IMPORT_SELECT_FILE }}</p>
    <div>
        <input name="file" type="text" class="file"></input>
        <span class="browser"></span>
    </div>
    <p class="invalid" style="display:none">{{= i18n.message.INVALID_FILE }}</p>
</script>

<script type="text/template" id="import-progress">
    <div class="hbox">
        <div class="progress-desc">{{= i18n.message.IMPORTING_SMS }}</div>
        <div class="progress-num">0 / 0</div>
    </div>
    <div class="progress-ctn hbox">
        <progress class="tiny running" max="100" value="0"></progress>
    </div>
    <div class="duplicate-ctn">
        <span class="duplicate text-thirdly"></span>
    </div>
</script>

<script type="text/template" id="export-select">
    <div class="w-contact-export">
        <p class="title">{{= i18n.message.SELECT_MESSAGE }}</p>
        <ul class="type">
            <li>
                <label>
                    <input type="radio" name="sms_export" value="1" checked/>
                        {{= i18n.message.COUNT_TIP }}
                </label>
            </li>
            <li>
                <label>
                    <input type="radio" name="sms_export" value="2"/>
                    {{= i18n.misc.NAV_SMS_ALL }}<span class="count"></span>
                </label>
            </li>
        </ul>
    </div>
</script>

<script type="text/template" id="export-progress">
    <div class="hbox">
        <div class="progress-desc">{{= i18n.message.EXPORTING_SMS }}</div>
        <div class="progress-num">0 / 0</div>
    </div>
    <div class="progress-ctn hbox">
        <progress class="tiny running" max="100" value="0"></progress>
    </div>
</script>
</templates>
