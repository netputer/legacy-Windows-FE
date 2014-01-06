<templates>

<script type="text/x-ui-template" id="start">
    <div class="action-panel hbox">
        <div class="container backup">
            <div class="icon"/>
            <div class="info">
                <span class="title">{{= i18n.new_backuprestore.BACKUP }}</span>
                <span class="desc text-thirdly">{{= i18n.new_backuprestore.BACKUP_DES }}</span>
            </div>
            <div class="action-container">
                <div class="action-backup-local action-button vbox">
                    <div class="top hbox">
                        <div class="action-icon"/>
                        <span class="title">{{= i18n.new_backuprestore.BACKUP_TO_LOCAL }}</span>
                    </div>
                    <span class="desc">{{= i18n.new_backuprestore.BACKUP_TO_LOCAL_DESC }}</span>
                </div>

                <div class="action-backup-remote action-button vbox">
                    <div class="top hbox">
                        <div class="action-icon"/>
                        <span class="title">{{= i18n.new_backuprestore.BACKUP_TO_CLOUD }}</span>
                    </div>
                    <span class="desc">{{= i18n.new_backuprestore.BACKUP_TO_CLOUD_DESC }}</span>
                </div>
            </div>
        </div>
        <div class="container restore">
            <div class="icon"/>
            <div class="info">
                <span class="title">{{= i18n.new_backuprestore.RESTORE }}</span>
                <span class="desc text-thirdly">{{= i18n.new_backuprestore.RESTORE_DES }}</span>
            </div>
            <div class="action-container">
                <div class="action-restore-local action-button vbox">
                    <div class="top hbox">
                        <div class="action-icon"/>
                        <span class="title">{{= i18n.new_backuprestore.RESTORE_FROM_LOCAL }}</span>
                    </div>
                    <span class="desc">{{= i18n.new_backuprestore.RESTORE_FROM_LOCAL_DESC }}</span>
                </div>

                <div class="action-restore-remote action-button vbox">
                    <div class="top hbox">
                        <div class="action-icon"/>
                        <span class="title">{{= i18n.new_backuprestore.RESTORE_FROM_CLOUD }}</span>
                    </div>
                    <span class="desc">{{= i18n.new_backuprestore.RESTORE_FROM_CLOUD_DESC }}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="info-panel hbox">
        <div class="last-backup-time info-panel hbox">
            <div class="icon"/>
            <div class="info">
                <span class="title">{{= i18n.new_backuprestore.LAST_BACKUP_TIME }}</span>
                <span class="last-time"></span>
            </div>
        </div>
        <div class="auto-backup-local info-panel hbox">
            <div class="icon"/>
            <div class="info">
                <span class="title">{{= i18n.new_backuprestore.AUTO_BACKUP_TO_LOCAL }}</span>
                <span class="is-auto-backup-local"></span>
                <span class="do-action local"></span>
            </div>
        </div>
        <div class="auto-backup-remote info-panel hbox">
            <div class="icon"/>
            <div class="info">
                <span class="title">{{= i18n.new_backuprestore.AUTO_BACKUP_TO_REMOTE }}</span>
                <span class="is-auto-backup-remote"></span>
                <span class="do-action remote"></span>
            </div>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="base">
    <div class="top vbox">
        <span class="big-title"></span>
        <span class="text-thirdly state-title"></span>
    </div>
</script>

<script type="text/x-ui-template" id="backup-restore-progress">
    <div class="content-box contact vbox">
        <div class="title-box hbox">
            <div class="icon"/>
            <span class="title">{{= i18n.new_backuprestore.CONTACT}}</span>
            <br/>
            <span class="count"></span>
        </div>
        <progress class="tiny progress running" max="100" value="0" style="display:none"></progress>
        <span class="status text-thirdly"></span>
    </div>
    <div class="content-box sms vbox">
        <div class="title-box hbox">
            <div class="icon"/>
            <span class="title">{{= i18n.new_backuprestore.SMS}}</span>
            <br/>
            <span class="count"></span>
        </div>
        <progress class="tiny progress running" max="100" value="0" style="display:none"></progress>
        <span class="status text-thirdly"></span>
    </div>
    <div class="content-box app vbox">
        <div class="title-box hbox">
            <div class="icon"/>
            <span class="title app-only">{{= i18n.new_backuprestore.APP}}</span>
            <span class="title app-and-data" style="display:none">{{= i18n.new_backuprestore.APP_AND_DATA}}</span><div class="beta" style="display:none"/>
            <br/>
            <span class="count"></span>
        </div>
        <progress class="tiny progress running" max="100" value="0" style="display:none"></progress>
        <span class="status text-thirdly"></span>
    </div>
</script>

<script type="text/x-ui-template" id="local-backup-advance">
    <dl class="container">
        <dt class="text-bold">{{= i18n.new_backuprestore.DATA_TYPE}}</dt>
        <dd>
            <label><input type="checkbox" name="contact" value='{{= CONFIG.enums.BR_TYPE_CONTACT }}'/>{{=i18n.new_backuprestore.CONTACT}}</label>
            <label><input type="checkbox" name="sms" value='{{= CONFIG.enums.BR_TYPE_SMS }}'/>{{=i18n.new_backuprestore.SMS}}</label>
            <label><input type="checkbox" name="app" value='{{= CONFIG.enums.BR_TYPE_APP }}'/>{{=i18n.new_backuprestore.APP}}</label>
            <label><input type="checkbox" name='appdata' value="{{= CONFIG.enums.BR_TYPE_APP_DATA }}"/>{{=i18n.new_backuprestore.APP_DATA}}</label><div class="beta"/>
        </dd>
        <dt class="text-bold">{{= i18n.new_backuprestore.BACKUP_TYPE}}</dt>
        <dd>
            <div class="backup-app-list">
                <label><input type="radio" name="backup-type" value="2"/>{{= i18n.new_backuprestore.APP_TYPE_WDAPK_TITLE}}</label>
                <span class="text-thirdly desc">{{=i18n.new_backuprestore.APP_TYPE_WDAPK_TITLE_DESC}}</span>
            </div>
            <div class="backup-full-app">
                <label><input type="radio"  name="backup-type" value="0"/>{{= i18n.new_backuprestore.APP_TYPE_APK_TITLE}}</label>
                <span class="text-thirdly desc">{{=i18n.new_backuprestore.APP_TYPE_APK_TITLE_DESC}}</span>
            </div>
        </dd>
        <dt class="text-bold">{{= i18n.new_backuprestore.BACKUP_FILE_PATH}}</dt>
        <dd>
            <span class="file-path">{{= it.filePath }}</span>
            <a class="link change-backup-path">{{=i18n.new_backuprestore.BACKUP_CHANGE_FILE_PATH}}</a>
        </dd>
        <dt class="text-bold">{{= i18n.new_backuprestore.BACKUP_FILE_NAME}}</dt>
        <dd>
            <input type="text" class="file-name" name="file-name" value="{{= it.fileName }}" maxlength="100"/>
        </dd>
    </dl>
</script>

<script type="text/x-ui-template" id="remote-backup-advance">
    <dl class="container">
        <dt class="text-bold">{{= i18n.new_backuprestore.DATA_TYPE}}</dt>
        <dd>
            <label><input type="checkbox" name="contact" value='{{= CONFIG.enums.BR_TYPE_CONTACT }}'/>{{=i18n.new_backuprestore.CONTACT}}</label>
            <label><input type="checkbox" name="sms" value='{{= CONFIG.enums.BR_TYPE_SMS }}'/>{{=i18n.new_backuprestore.SMS}}</label>
            <label><input type="checkbox" name="app" value='{{= CONFIG.enums.BR_TYPE_APP }}'/>{{=i18n.new_backuprestore.APP}}</label>
        </dd>
    </dl>
</script>

<script  type="text/x-ui-template" id="backup-footer">
    <div class="left">
        <span class="link advanced">{{= i18n.new_backuprestore.ADVANCED}}</span>
        <span class="link showfile" style="display:none">{{= i18n.new_backuprestore.OPEN_BACKUP_FILE}}</span>
        <a class="link show-remote-file" style="display:none" target="_default">{{= i18n.new_backuprestore.OPEN_BACKUP_FILE}}</a>
    </div>
    <div class="right hbox">
        <span class="link cancel">{{= i18n.new_backuprestore.CANCEL}}</span>
        <button class="startbackup primary max" disabled>{{= i18n.new_backuprestore.START_BACKUP}}</button>
        <button class="done primary max" style="display:none">{{= i18n.new_backuprestore.DONE}}</button>
    </div>
</script>

<script type="text/template" id="backup-app-data-tip-view">
    <div class="hbox wrap cf">
        <div class="backup-pic-ctn"></div>
        <div class="content-ctn">
            <h2>{{= i18n.new_backuprestore.BACKUP_APP_DATA_TIP_TITLE }}</h2>
            <div class="text-secondary">{{= i18n.new_backuprestore.BACKUP_APP_DATA_TIP_CONTENT }}</div>
        </div>
    </div>
</script>

<script type="text/template" id="error-item-list">
    <p class="title"></p>
    <div class="app-list-ctn">
        <div class="loading">{{= i18n.misc.LOADING }}</div>
        <ul class="list">
            {{~ it.list : item }}
            <li class="hbox item-ctn">
                <div class="icon">
                    <img src="{{= item.base_info.icon ? ('file:///' + item.base_info.icon) : CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP }}" alt="{{! item.base_info.name }}" />
                </div>
                <div class="name wc">
                    {{= item.base_info.name }}
                </div>
                <div class="size text-secondary">
                    <div>{{= StringUtil.readableSize(item.base_info.apk_size) }}</div>
                </div>
            </li>
            {{~}}
        </ul>
    </div>
</script>

<script type="text/template" id="error-item-tip">
    <div class="all-non-app-failed">
        <p>{{= StringUtil.format(i18n.new_backuprestore.RESTORE_PERMISSSION_TIP1, it.type_name) }}</p>
        <p>{{= StringUtil.format(i18n.new_backuprestore.RESTORE_PERMISSSION_TIP2, it.type_name) }}</p>
        <p>{{= i18n.backup_restore.RESTORE_PERMISSSION_TIP3 }}</p>
    </div>
    <div class="part-non-app-failed">
        <p>{{= StringUtil.format(i18n.new_backuprestore.RESTORE_PERMISSSION_PART_TIP1, it.error_number, it.type_name) }}</p>
        <p>{{= i18n.new_backuprestore.RESTORE_PERMISSSION_TIP3 }}</p>
    </div>
</script>

<script type="text/template" id="error-retry">
    <div class="content"></div>
</script>

<script type="text/template" id="backup-remote-error-view">
    <p class="content"></p>
</script>

<script  type="text/x-ui-template" id="restore-footer">
    <div class="left">
        <span class="link advanced">{{= i18n.new_backuprestore.ADVANCED}}</span>
        <span class="link showfile">{{= i18n.new_backuprestore.OPEN_RESTORE_FILE}}</span>
        <span class="link taskmanager">{{= i18n.new_backuprestore.SWITCH_TASK_MODULE}}</span>
        <span class="link showmore" style="display:none">{{= i18n.new_backuprestore.SHOW_MORE}}</span>
    </div>
    <div class="right hbox">
        <span class="link cancel">{{= i18n.new_backuprestore.CANCEL}}</span>
        <button class="startrestore primary max">{{= i18n.new_backuprestore.START_RESTORE}}</button>
        <button class="confirm primary max" disabled>{{= i18n.ui.CONFIRM }}</button>
        <button class="done primary max">{{= i18n.new_backuprestore.DONE}}</button>
    </div>
</script>

<script  type="text/x-ui-template" id="restore-file-list-item">
    <div class="hbox name wc" title="{{= it.path}}">
        <input class="item-checker" type="radio" value="{{= it.id}}"  name="fileList"/>{{= it.name}}
    </div>
    <div class="num-container hbox">
        <div class="contact-icon icon"/>
        <span class="text-thirdly">{{= it[CONFIG.enums.BR_TYPE_CONTACT] }}</span>
    </div>
    <div class="num-container hbox">
        <div class="sms-icon icon"/>
        <span class="text-thirdly">{{= it[CONFIG.enums.BR_TYPE_SMS] }}</span>
    </div>
    <div class="num-container hbox">
        <div class="app-icon icon"/>
        <span class="text-thirdly">{{= it[CONFIG.enums.BR_TYPE_APP] }}</span>
        {{? it[CONFIG.enums.BR_TYPE_APP_DATA] > 0}}
            <div class="app-data-icon" data-title="{{= i18n.new_backuprestore.INCLUDE_APP_DATA}}"/>
        {{?}}
    </div>
</script>

<script  type="text/x-ui-template" id="restore-remote-file-list-item">
    <div class="hbox name wc">
        <input class="item-checker" type="radio" value="{{= it.timestamp}}" name="fileList"/>
        <span class="time">{{= it.time }}</span>
        <span class="device-name wc">{{= it.deviceName }}</span>
    </div>
    <div class="num-container hbox">
        <div class="contact-icon icon"/>
        <span class="text-thirdly">{{= it[CONFIG.enums.BR_TYPE_CONTACT] }}</span>
    </div>
    <div class="num-container hbox">
        <div class="sms-icon icon"/>
        <span class="text-thirdly">{{= it[CONFIG.enums.BR_TYPE_SMS] }}</span>
    </div>
    <div class="num-container hbox">
        <div class="app-icon icon"/>
        <span class="text-thirdly">{{= it[CONFIG.enums.BR_TYPE_APP] }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="local-restore-advance">
    <dl class="container">
        <dt class="text-bold">{{= i18n.new_backuprestore.DATA_TYPE}}</dt>
        <dd>
            <label><input type="checkbox" name="contact" value='{{= CONFIG.enums.BR_TYPE_CONTACT }}'/>{{=i18n.new_backuprestore.CONTACT}}</label>
            <label><input type="checkbox" name="sms" value='{{= CONFIG.enums.BR_TYPE_SMS }}'/>{{=i18n.new_backuprestore.SMS}}</label>
            <label><input type="checkbox" name="app" value='{{= CONFIG.enums.BR_TYPE_APP }}'/>{{=i18n.new_backuprestore.APP}}</label>
            <label><input type="checkbox" name='appdata' value="{{= CONFIG.enums.BR_TYPE_APP_DATA }}"/>{{=i18n.new_backuprestore.APP_DATA}}</label><div class="beta"/>
        </dd>
    </dl>
</script>

<script type="text/x-ui-template" id="remote-restore-advance">
    <dl class="container">
        <dt class="text-bold">{{= i18n.new_backuprestore.DATA_TYPE}}</dt>
        <dd>
            <label><input type="checkbox" name="contact" value='{{= CONFIG.enums.BR_TYPE_CONTACT }}'/>{{=i18n.new_backuprestore.CONTACT}}</label>
            <label><input type="checkbox" name="sms" value='{{= CONFIG.enums.BR_TYPE_SMS }}'/>{{=i18n.new_backuprestore.SMS}}</label>
            <label><input type="checkbox" name="app" value='{{= CONFIG.enums.BR_TYPE_APP }}'/>{{=i18n.new_backuprestore.APP}}</label>
        </dd>
    </dl>
</script>

<script type="text/x-ui-template" id="backup-restore-download">
    <progress class="progress tiny" max="100" value="0"></progress>
</script>

<script type="text/x-ui-template" id="choose-account">
    <p>{{= i18n.new_backuprestore.RESTORE_CHOOSE_ACCOUNT_TIP }}</p>
    <div class="account-ctn"></div>
</script>

<script type="text/template" id="backup-local-auto-tip">
    <div class="pic-local-ctn pic-ctn"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.new_backuprestore.AUTO_BACKUP_TIP_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.new_backuprestore.AUTO_BACKUP_TIP_DESC }}</p>
    </div>
</script>

<script type="text/template" id="backup-remote-auto-tip">
    <div class="pic-remote-ctn pic-ctn"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.new_backuprestore.AUTO_BACKUP_REMOTE_TIP_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.new_backuprestore.AUTO_BACKUP_REMOTE_TIP_DESC }}</p>
    </div>
</script>

</templates>
