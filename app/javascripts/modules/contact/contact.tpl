<templates>
<script type="tetx/x-ui-template" id="detail-panel">
    <div class="contact-info">
        <div class="header-ctn hbox">
            <div class="avatar">
                <img src="{{= it.contact.avatar }}" alt="{{! it.contact.name ? (it.contact.name.display_name || '') : '' }}" />
            </div>
            <div class="infos vbox">
                <div class="name">
                    <span class='wc'>{{! it.contact.displayName || '' }}</span>
                </div>
                <div class="nickname">
                    <span class="text-secondary wc">
                        {{! (it.contact.nickname && it.contact.nickname[0] && it.contact.nickname[0].name) || '' }}
                    </span>
                </div>
                <div class="switch text-secondary">
                    <button class="button-edit">{{= i18n.contact.EDIT }}</button>
                </div>
            </div>
        </div>
        <h1 class="text-primary">{{= i18n.contact.CONTACT_INFO }}</h1>
        <dl class="info-ctn cf">
        {{? it.contact.phone }}
            {{~ it.contact.phone : phone }}
            {{
                var targetCate = _.find(it.config.PHONE_OPTION, function(item) {
                    return item.value === phone.type;
                });
                var label = _.isEqual(targetCate, it.config.PHONE_OPTION[it.config.PHONE_OPTION.length - 1]) ? phone.label : targetCate.name;
            }}
            <dt class="wc type text-thirdly">{{= label || '' }}</dt>
            <dd class="wc enable-select">
                {{! phone.number || '' }}
                {{? phone.number }}
                <span class="button-dial" data-title="{{= i18n.contact.DIAL }}" class="dial" data-phone-number="{{= phone.number }}">
                </span>
                {{?}}
            </dd>
            {{~}}
        {{?}}
        {{? it.contact.email }}
            {{~ it.contact.email : email }}
            {{
                var targetCate = _.find(it.config.EMAIL_OPTION, function(item) {
                    return item.value === email.type;
                });
                var label = _.isEqual(targetCate, it.config.EMAIL_OPTION[it.config.EMAIL_OPTION.length - 1]) ? email.label : targetCate.name;
            }}
            <dt class="wc type text-thirdly">{{= label || '' }}</dt>
            <dd class="wc enable-select">
                {{! email.address  || '' }}
                {{? email.address }}
                <span class="button-email" data-title="{{= i18n.contact.SEND_MAIL }}" class="send-email" data-email-id="{{= email.id }}">
                </span>
                {{?}}
            </dd>
            {{~}}
        {{?}}
        {{? it.contact.IM }}
            {{~ it.contact.IM : im }}
            {{
                var label = im.protocol >= 0 ? it.config.IM_OPTION[im.protocol].name : im.label;
            }}
            <dt class="wc type text-thirdly">{{= label || '' }}</dt>
            <dd class="wc enable-select">{{! im.data  || '' }}</dd>
            {{~}}
        {{?}}
        {{? it.contact.address }}
            {{~ it.contact.address : address }}
            {{
                var targetCate = _.find(it.config.ADDRESS_OPTION, function(item) {
                    return item.value === address.type;
                });
                var label = _.isEqual(targetCate, it.config.ADDRESS_OPTION[it.config.ADDRESS_OPTION.length - 1]) ? address.label : targetCate.name;
            }}
            <dt class="wc type text-thirdly">{{= label || '' }}</dt>
            <dd class="wc enable-select">{{! address.formatted_address  || '' }}</dd>
            {{~}}
        {{?}}
        {{? it.contact.organization }}
            {{~ it.contact.organization : organization }}
            {{
                var targetCate = _.find(it.config.ORGANIZATION_OPTION, function(item) {
                    return item.value === organization.type;
                });
                var label = _.isEqual(targetCate, it.config.ORGANIZATION_OPTION[it.config.ORGANIZATION_OPTION.length - 1]) ? organization.label : targetCate.name;
            }}
            <dt class="wc type text-thirdly">{{= label || '' }}</dt>
            <dd class="wc enable-select">{{! organization.company  || '' }}</dd>
            {{~}}
        {{?}}
        {{? it.contact.note }}
            {{~ it.contact.note : note }}
            <dt class="wc type text-thirdly">{{= i18n.contact.REMARK }}</dt>
            <dd class="note enable-select">{{! note.note || '' }}</dd>
            {{~}}
        {{?}}
        </dl>
        <div class="sms-ctn">
            <h1 class="text-primary">{{= i18n.contact.CONTACT_RECORD }}</h1>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="detail-panel-edit">
    <div class="contact-info">
        <div class="header-ctn hbox">
            <div class="avatar button-avatar">
                <img src="{{= it.contact.avatar }}" alt="{{! it.contact.name ? (it.contact.name.display_name || '') : '' }}" />
                <div class="mask">
                    <div class="tip">{{= i18n.contact.CHANGE_AVATAR }}</div>
                </div>
            </div>
            <div class="infos vbox">
                <div class="name">
                    <input data-id="{{= it.contact.name ? it.contact.name.id : '' }}" class="input-name" type="text" value="{{! it.contact.displayName || '' }}" placeholder="{{= i18n.contact.NAME }}" />
                </div>
                <div class="nickname">
                     <input data-id="{{= (it.contact.nickname && it.contact.nickname[0] && it.contact.nickname[0].id) || '' }}" class="input-nickname" type="text" value="{{! (it.contact.nickname && it.contact.nickname[0] && it.contact.nickname[0].name) || '' }}" placeholder="{{= i18n.misc.NICKNAME }}" />

                </div>
                <div class="switch text-secondary"></div>
            </div>
        </div>
        <h1 class="text-primary">{{= i18n.contact.CONTACT_INFO }}</h1>
        <ul class="info-ctn cf">
            <li class="phone">
                <dl>
                    {{? it.contact.phone }}
                        {{~ it.contact.phone : phone }}
                        <dt class="type text-secondary" data-cate="phone" data-type="{{= phone.type }}" data-label="{{= phone.label }}"></dt>
                        <dd class="wc enable-select">
                            <input data-id="{{= phone.id }}" data-type="{{= phone.type }}" data-label="{{= phone.label }}" class="input-phone" type="text" value="{{! phone.number || '' }}" />
                            <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
                        </dd>
                        {{~}}
                    {{??}}
                        <dt class="type text-secondary" data-cate="phone"></dt>
                        <dd class="wc enable-select">
                            <input data-type="1" class="input-phone" type="text" />
                        </dd>
                    {{?}}
                </dl>
            </li>
            <li class="email">
                <dl>
                    {{? it.contact.email }}
                        {{~ it.contact.email : email }}
                        <dt class="type text-secondary" data-cate="email" data-type="{{= email.type }}" data-label="{{= email.label }}"></dt>
                        <dd class="wc enable-select">
                            <input data-id="{{= email.id }}" data-type="{{= email.type }}" data-label="{{= email.label }}" class="input-email" type="email" value="{{! email.address || '' }}" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" />
                            <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
                        </dd>
                        {{~}}
                    {{??}}
                        <dt class="type text-secondary" data-cate="email"></dt>
                        <dd class="wc enable-select">
                            <input data-type="1" class="input-email" type="email" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" />
                        </dd>
                    {{?}}
                </dl>
            </li>
            <li class="im">
                <dl>
                    {{? it.contact.IM }}
                        {{~ it.contact.IM : im }}
                        <dt class="type text-secondary" data-cate="im" data-type="{{= im.protocol }}" data-label="{{= im.label }}"></dt>
                        <dd class="wc enable-select">
                            <input data-type="{{= im.protocol }}" data-id="{{= im.id }}" data-label="{{= im.label }}" class="input-im" type="text" value="{{! im.data || '' }}"/>
                            <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
                        </dd>
                        {{~}}
                    {{?}}
                </dl>
            </li>
            <li class="address">
                <dl>
                    {{? it.contact.address }}
                        {{~ it.contact.address : address }}
                        <dt class="type text-secondary" data-cate="address" data-type="{{= address.type }}" data-label="{{= address.label }}"></dt>
                        <dd class="wc enable-select">
                            <input data-type="{{= address.type }}" data-id="{{= address.id }}" data-label="{{= address.label }}" class="input-address" type="text" value="{{! address.formatted_address || '' }}"/>
                            <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
                        </dd>
                        {{~}}
                    {{?}}
                </dl>
            </li>
            <li class="organization">
                <dl>
                    {{? it.contact.organization }}
                        {{~ it.contact.organization : organization }}
                        <dt class="type text-secondary" data-cate="org" data-type="{{= organization.type }}" data-label="{{= organization.label }}"></dt>
                        <dd class="wc enable-select">
                            <input data-type="{{= organization.type }}" data-id="{{= organization.id }}" data-label="{{= organization.label }}" class="input-organization" type="text" value="{{! organization.company || '' }}"/>
                            <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
                        {{~}}
                    {{?}}
                </dl>
            </li>
            <li>
                <dl>
                    {{? it.contact.note }}
                        {{~ it.contact.note : note }}
                        <dt class="type text-secondary" data-cate="note">{{= i18n.contact.REMARK }}</dt>
                        <dd class="wc enable-select">
                            <textarea data-id="{{= note.id }}" class="input-note">{{! note.note || '' }}</textarea>
                            <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
                        </dd>
                        {{~}}
                    {{??}}
                        <dt class="type text-secondary" data-cate="note">{{= i18n.contact.REMARK }}</dt>
                        <dd class="wc enable-select">
                            <textarea data-id="" class="input-note"></textarea>
                        </dd>
                    {{?}}
                </dl>
            </li>
            <li class="account-label">
                <dl>
                    <dt class="type text-secondary">{{= i18n.misc.ACCOUNT }}<dt>
                    <dd class="account-ctn"></dd>
                </dl>
            </li>
        </ul>
        <div class="category-selector"></div>
    </div>
    <div class="btn-ctn">
        <button class="button-save primary">{{= i18n.misc.SAVE }}</button>
        <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
    </div>
</script>

<script type="text/x-ui-tempalte" id="edit-phone">
    <dt class="type text-secondary" data-cate="phone"></dt>
    <dd class="wc enable-select">
        <input data-type="1" class="input-phone" type="text" />
        <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
    </dd>
</script>

<script type="text/x-ui-tempalte" id="edit-email">
    <dt class="type text-secondary" data-cate="email"></dt>
    <dd class="wc enable-select">
        <input data-type="1" class="input-email" type="email" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" />
        <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
    </dd>
</script>

<script type="text/x-ui-tempalte" id="edit-im">
    <dt class="type text-secondary" data-cate="im"></dt>
    <dd class="wc enable-select">
        <input data-type="1" class="input-im" type="text" />
        <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
    </dd>
</script>

<script type="text/x-ui-tempalte" id="edit-address">
    <dt class="type text-secondary" data-cate="address"></dt>
    <dd class="wc enable-select">
        <input data-type="1" class="input-address" type="text" />
        <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
    </dd>
</script>

<script type="text/x-ui-tempalte" id="edit-organization">
    <dt class="type text-secondary" data-cate="org"></dt>
    <dd class="wc enable-select">
        <input data-type="1" class="input-organization" type="text" />
        <span class="icomoon icomoon-delete button-delete" title="{{= i18n.misc.DELETE }}"></span>
    </dd>
</script>

<script type="text/x-ui-template" id="batch-contacts">
    <div class="title">
        <span class="count"></span>
        <span class="button-deselect link">{{= i18n.misc.DESELECT }}</span>
    </div>
    <div class="actions">
        <button class="button-send">{{= i18n.message.SEND_SMS }}</button>
    </div>
    <div class="w-contact-batch-contacts-list-ctn vbox"></div>
</script>

<script type="text/x-ui-template" id="contact-item">
    <label class="input item-checker-wrap">
        <input class="item-checker" type="checkbox" value="{{= it.id }}">
    </label>
    <div class="star hbox{{? it.starred }} starred{{?}}">
        <div class="star-img button-star"></div>
    </div>
    <div class="avatar">
        <img src="{{= it.avatarSmall }}" alt="{{! it.displayName || i18n.contact.UNNAMED_CONTACT }}" />
    </div>
    <div class="body">
        <div class="name wc">{{! it.displayName || i18n.contact.UNNAMED_CONTACT }}</div>
        <div class="wc text-thirdly">
            {{? it.phone && it.phone.length > 0 }}
            {{=
                _.map(it.phone, function(phone) {
                    return phone.number;
                }).join(', ')
            }}
            {{??}}
            {{=
                _.map(it.email, function(email) {
                    return email.address;
                }).join(', ')
            }}
            {{?}}
        </div>
    </div>
    <ul class="group-menu hbox">
        {{
            var TAG_COLORS = ['#f95159', '#f7ef20', '#49a7ee', '#95ab2f', '#f98729', '#5886f4', '#ab74ff'];
            var tagColor;
            var group;
        }}
        {{~ it.group : item }}
        {{
            group = this.getGroup(item.group_row_id);
        }}
        {{? group }}
            {{ tagColor = TAG_COLORS[Math.floor(parseInt(group.id) % TAG_COLORS.length)]; }}
            <li style="background-color: {{= tagColor }}"></li>
        {{?}}
        {{~}}
    </ul>
    <div class="button-close" data-id="{{= it.id }}" title="{{= i18n.misc.DESELECT }}"></div>
</script>

<script type="text/x-ui-template" id="group-list">
    {{
        var TAG_COLORS = ['#f95159', '#f7ef20', '#49a7ee', '#95ab2f', '#f98729', '#5886f4', '#ab74ff'];
        var tagColor;
        var group;
    }}
    <ul class="group-menu hbox">
        {{~ it.group : item }}
        {{
            group = this.getGroup(item.group_row_id);
        }}
        {{? group }}
            {{ tagColor = TAG_COLORS[Math.floor(parseInt(group.id) % TAG_COLORS.length)]; }}
            <li style="background-color: {{= tagColor }}"></li>
        {{?}}
        {{~}}
    </ul>
    <ul class="group-list">
        {{~ it.group : item }}
        {{
            group = this.getGroup(item.group_row_id);
        }}
        {{? group }}
            {{ tagColor = TAG_COLORS[Math.floor(parseInt(group.id) % TAG_COLORS.length)]; }}
            <li class="cf hbox"><div class="squar" style="background-color: {{= tagColor }}"></div>{{= group.get('title') }}</li>
        {{?}}
        {{~}}
    </ul>
</script>

<script type="text/x-ui-temealate" id="add-group-body">
    <label>{{= i18n.contact.GROUP_NAME }}<input class="input-group-name" type="text" autofocus="true" placeholder="{{= i18n.contact.PLEASE_INPUT_GROUP_NAME }}" /></label>
    <span class="tip"></span>
</script>

<script type="text/x-ui-template" id="import-backup">
    <div class="tip">
        <label class="select-file" >{{= i18n.contact.SELECT_BACKUP_FILE }}</label>
    </div>
    <div class="header hbox">
        <div class="backup-record" >{{= i18n.misc.BACKUP_RECORD }}</div>
        <div class="contact-number" >{{= i18n.contact.BACKUP_MESSAGE_NUMBER }}</div>
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

<script type="text/x-ui-template" id="quick-add">
    <h3 class="legend">
        <span class="icomoon icomoon-add" />{{= i18n.contact.QUICK_ADD_CONTACT }}
    </h3>
    <form class="new-contact" onsubmit="javascript: return false;">
        <dl class="cf">
            <dt><label for="w-contact-quick-add-name">{{= i18n.contact.NAME }}</label></dt>
            <dd><input id="w-contact-quick-add-name" name="name" type="text" class="input-name" /></dd>
            <dt><label for="w-contact-quick-add-phone">{{= i18n.contact.CELL_PHONE }}</label></dt>
            <dd><input id="w-contact-quick-add-phone" name="phone" type="text" class="input-phone" /></dd>
            <dt><label for="w-contact-quick-add-email">{{= i18n.contact.EMAIL }}</label></dt>
            <dd><input id="w-contact-quick-add-email" name="email" type="email" class="input-email" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" /></dd>
            <dt><label for="w-contact-quick-add-account">{{= i18n.misc.ACCOUNT }}</label></dt>
            <dd class="account-ctn"></dd>
        </dl>
    </form>
    <div class="btn-ctn hbox">
        <button type="button" class="button-save primary">{{= i18n.misc.SAVE }}</button>
        <div class="running">
        <div class="w-ui-loading-small" style="display: block; ">
            <div class="anima">
                <div class="rotor rotor1"></div>
                <div class="rotor rotor2"></div>
                <div class="rotor rotor3"></div>
                <div class="rotor rotor4"></div>
                <div class="rotor rotor5"></div>
                <div class="rotor rotor6"></div>
                <div class="rotor rotor7"></div>
                <div class="rotor rotor8"></div>
            </div>
        </div>
        </div>
        <span class="hint text-secondary"></span>
    </div>
</script>

<script type="text/x-ui-template" id="contact-main">
    <div class="w-contact-ctn hbox"></div>
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn primary button-new min">
        <span class="icomoon icomoon-add-circle"></span>{{= i18n.contact.BUTTON_ADD_CONTACT_LABEL }}
    </button>
    <button class="w-icon-btn button-delete min">
        <span class="icomoon icomoon-delete"></span>{{= i18n.misc.DELETE }}
    </button>
    <button class="w-icon-btn button-merge min">
        <span class="icomoon icomoon-merge"></span>{{= i18n.contact.MERGE }}
    </button>
    <div class="split"></div>
    <button class="w-icon-btn button-import min">
        <span class="icomoon icomoon-import"></span>{{= i18n.misc.IMPORT }}
    </button>
    <button class="w-icon-btn button-export min">
        <span class="icomoon icomoon-export"></span>{{= i18n.misc.EXPORT }}
    </button>
    <div class="selector-wrap hbox">
        {{? Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN }}
        <div>{{= i18n.misc.DISPLAY }}</div>
        {{?}}
    </div>
</script>

<script type="text/x-ui-template" id="list-ctn">
    <button class="w-icon-btn transparent button-return">
        <span class="icon return"></span>{{= i18n.contact.NAV_CONTACT_ALL }}
    </button>
    <header class="count-tip text-secondary"></header>
</script>

<script type="x-ui-template" id="custom-info">
<label>{{= i18n.misc.NAME }}<input type="text" class="input-label" /></label>
</script>

<script type="text/x-ui-template" id="contact-sim-tip">
    <div class="w-contact-sim-tip">
        <h1>{{= i18n.contact.CONTACT_SIM_SELECT_TEXT_1 }}</h1>
        <p>{{= i18n.contact.CONTACT_SIM_SELECT_TEXT_2 }}</p>
        <div class="sim-tip"></div>
    </div>
</script>

<script type="text/template" id="export-select-type">
    <p class="title">{{= i18n.contact.SELECT_EXPORT_FORMAT }}</p>
    <ul>
        <li>
            <label>
                <input type="radio" name="contact-export-type" value="0" checked />
                {{= i18n.contact.V_CARD }}<span class="text-secondary">{{= i18n.contact.GROUP_TIP }}</span>
            </label>
        </li>
        <li>
            <label>
                <input type="radio" name="contact-export-type" value="1" />
                {{= i18n.contact.OUTLOOK }}
            </label>
        </li>
        <li>
            <label>
                <input type="radio" name="contact-export-type" value="2" />
                {{= i18n.contact.WINDOW_MAIN }}
            </label>
        </li>
        <li>
            <label>
                <input type="radio" name="contact-export-type" value="3" />
                {{= i18n.contact.NOKIA }}
            </label>
        </li>
    </ul>
</div></script>

<script type="text/template" id="export-tip">
    <p class="tip">{{= it.tip }}</p>
    <p>{{= i18n.contact.ALERT_TIP_EXOPRT_VCARD }}</p>
</script>

<script type="text/template" id="export-select-number">
    <p>{{= i18n.contact.SELECT_COUNTACTS_TO_EXPORT }}</p>
    <ul>
        <li>
            <label>
                <input type="radio" name="contact-export" value="1" checked />
                {{= i18n.contact.CURRENT_SELECT }}
                <span class="count">({{= it.selectNumber }})</span>
            </label>
        </li>
        <li>
            <label>
                <input type="radio" name="contact-export" value="2" />
                {{= i18n.contact.NAV_CONTACT_ALL }}
                <span class="count">({{= it.allNumber }})</span>
            </label>
        </li>
        <li>
            <label>
                <input type="radio" name="contact-export" value="3" />
                {{= i18n.contact.CONTACT_HAS_NUMBER }}
                <span class="count">({{= it.hasPhoneNumber }})</span>
            </label>
        </li>
        <li class="hbox">
            <label>
                <input type="radio" name="contact-export" value="4" />
                {{= i18n.contact.GROUP }}
            </label>
            <span class="account"></span>
        </li>
    </ul>
</script>

<script type="text/template" id="export-progress">
    <div class="hbox">
        <div class="progress-desc">{{= i18n.contact.EXPORT_PROGRESS_DESC2 }}</div>
        <div class="progress-num">0 / 0</div>
    </div>
    <div class="progress-ctn hbox">
        <progress class="tiny running" max="100" value="0"></progress>
    </div>
</script>

<script type="text/x-ui-template" id="avatar-editor">
    <div class="ctrl-ctn hbox">
        <div>{{= i18n.contact.EDIT_CONTACT_HEAD_SELECT_SOURCE }}</div>
        <div class="btn-ctn">
            <button class="button-select-from-pc">{{= i18n.contact.EDIT_CONTACT_HEAD_PC_SOURCE }}</button>
        </div>
        <div class="link icomoon icomoon-delete button-delete">{{= i18n.contact.EDIT_CONTACT_HEAD_DEL_TEXT }}</div>
    </div>
</script>

<script type="text/x-ui-template" id="avatar-list">
    <div class="spy"></div>
    {{= TemplateFactory.get('ui', 'loading') }}
    <div class="empty-tip text-secondary"></div>
</script>

<script type="text/x-ui-template" id="avatar-list-item">
    <img class="thumb" src="">
    <div class="error text-thirdly">
        {{= i18n.photo.GET_PHOTOS_ERROR }}
        <div class="button-retry" title="{{= i18n.ui.RETRY }}"></div>
    </div>
    <!--<div class="w-ui-loading"></div>-->
</script>

<script type="text/x-ui-template" id="avatar-list-thread">
    <header class="header">
        <span class="text-secondary" title="{{! it.key }}">{{! it.key }}</span>
        <div class="count">{{= it.count }}</div>
    </header>
    <ul class="media-ctn"></ul>
</script>

<script type="text/template" id="import-file-select">
    <p class="title">{{= i18n.contact.SELECT_CONATCTS_BAKCUP_FILE }}</p>
    <div>
          <input name="file" type="text" class="file" readonly></input>
          <span class="browser"></span>
    </div>
    <p class="invalid" style="display:none">{{= i18n.contact.INVALID_BAKCUP_FILE }}</p>
</script>

<script type="text/template" id="import-account-select">
   <p class="title">{{= i18n.contact.SELECT_ACCOUNT_TO_IMPORT }}</p>
</script>

<script type="text/template" id="import-progress">
    <div class="hbox">
        <div class="progress-desc">{{= i18n.contact.IMPORTING_CONTACT }}</div>
        <div class="progress-num">0 / 0</div>
    </div>
    <div class="progress-ctn hbox">
        <progress class="tiny running" max="100" value="0"></progress>
    </div>
    <div class="duplicate-ctn">
        <span class="duplicate text-thirdly"></span>
    </div>
</script>

<script type="text/template" id="group-manager-body">
    <div class="w-group-manager-header hbox">
        <div class="selector-ctn">
            <label>{{= i18n.contact.CURRENT_ACCOUNT_LABEL }}</label>
        </div>
        <a class="w-contact-group-add">{{= i18n.contact.GROUP_ADD_LABEL}}</a>
    </div>
</script>

<script type="text/template" id="group-manager-list">
    <header class="w-smart-list-header w-group-manager-list-header text-secondary hbox">
        <div class="group-name">{{= i18n.contact.GROUP_NAME_LABEL }}</div>
        <div class="group-action">{{= i18n.contact.GROUP_CD_LABEL }}</div>
    </header>
</script>

<script type="text/template" id="group-manager-item">
    <div class="wc title">{{! it.title }}</div>
    {{? it.system_id }}
    <div class="wc">
    {{= i18n.contact.UNEDITABLE_GROUP_TEXT }}
    </div>
    {{??}}
    <div class="wc delete">
        <span class="link icomoon icomoon-delete button-delete">{{= i18n.misc.DELETE }}</span>
    </div>
    <div class="wc rename">
        <span class="link button-rename">{{= i18n.contact.GROUP_UPDATE_LABEL }}</span>
        <input type="text" class="new-name">
    </div>
    {{?}}
</script>

<script type="text/x-ui-template" id="gallery">
    <header class="w-list-tab-header">
        <menu class="tab hbox">
            <li class="hbox" data-tab="phone">
                <div>{{= i18n.misc.NAV_PIC_PHONE_LIB }}</div>
                <div class="count">{{= it.phone }}</div>
            </li>
            <li class="hbox" data-tab="lib">
                <div>{{= i18n.misc.NAV_PIC_GALLERY }}</div>
                <div class="count">{{= it.lib }}</div>
            </li>
        </menu>
        <div class="pointer"></div>
    </header>
</script>
</templates>
