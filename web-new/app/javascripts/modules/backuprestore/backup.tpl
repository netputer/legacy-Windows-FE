<templates>

<script type="text/template" id="choose-backup-type">
    <div class="content">
        <div class="button hbox button-local">
            <div class="icon local-icon"></div>
            <h2 class="title">{{= i18n.backup_restore.BACKUP_TITLE_LOCAL }}</h2>
        </div>
        <div class="text-secondary desc">{{= i18n.backup_restore.BACKUP_TYPE_LOCAL_CONTENT }}</div>
    </div>
    <div class="content">
        <div class="button hbox button-remote">
            <div class="icon remote-icon"></div>
            <h2 class="title">{{= i18n.backup_restore.BACKUP_TITLE_REMOTE }}</h2>
        </div>
        <div class="text-secondary desc">{{= i18n.backup_restore.BACKUP_TYPE_REMOTE_CONTENT }}</div>
    </div>
</script>

<script type="text/x-ui-template" id="choose-backup-restore-data">
    <p class="title">{{= it.isBackup ? i18n.backup_restore.CHOOSE_BACKUP_DATA_TIP : i18n.backup_restore.CHOOSE_RESTORE_DATA_TIP }}</p>
    <div class="header hbox">
        <div class="backup-type" >{{= i18n.backup_restore.TYPE }}</div>
        <div class="backup-number" >{{= i18n.backup_restore.QUANTITY }}</div>
    </div>
    <div class="list-ctn">
        {{? it.loading }}
            <div class="loading">{{= i18n.common.LOADING }}</div>
        {{?}}
        <ul class="list">
            {{~ it.list : item }}
            {{? item.type !== 10 || FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE }}
            <li>
                <label class="item-wrap hbox">
                    <input class="file-radio" type="checkbox" name="type" value="{{= item.type }}"
                        {{= (!it.isBackup && item.count === 0) ? 'disabled' : '' }} />
                    <div class="type hbox">
                        {{= i18n.backup_restore.BR_TYPE_WORD_ENUM[item.type] }}
                        {{? item.type === CONFIG.enums.BR_TYPE_APP_DATA}}
                            <div class="beta"></div>
                            <div class="app-data-tip-ctn"></div>
                        {{?}}
                    </div>
                    <div class="count" data-value="{{= item.type }}">{{= item.count }}</div>
                </label>
            </li>
            {{?}}
            {{~}}
        </ul>
    </div>
</script>

<script type="text/template" id="choose-app-type">
    <p class="title">{{= i18n.backup_restore.CHOOSE_APP_TYPE_TITLE }}</p>
    <div class="content">
        <label class="hbox">
            <input class="radio-item wdapk" type="radio" value="2" name="app_type" checked="true">
            <h3>{{= i18n.backup_restore.APP_TYPE_WDAPK_TITLE }}</h3>
        </label>
        <p class="desc desc-middle text-secondary">{{= i18n.backup_restore.APP_TYPE_WDAPK_CONTENT }}</p>
        <label class="hbox">
            <input class="radio-item apk" type="radio" value="0" name="app_type">
            <h3>{{= i18n.backup_restore.APP_TYPE_APK_TITLE }}</h3>
        </label>
        <p class="desc text-secondary apk-desc">{{= i18n.backup_restore.APP_TYPE_APK_CONTENT }}</p>
    </div>
</script>

<script type="text/template" id="choose-backup-location">
    <p class="title">{{= i18n.backup_restore.SET_FILE_NAME }}</p>
    <div class="content">
        <input class="file-name" type="text"></input>
        <div class="file-path-ctn">
            {{= i18n.backup_restore.SAVE_LOCATION_LABEL }}
            <span class="file-path"></span>
            <span class="link button-set-location">{{= i18n.backup_restore.SET_FILE_PATH_LINK_BUTTON }}</span>
        </div>
    </div>
</script>

<script type="text/template" id="backup-progress">
    <p class="title">{{= i18n.backup_restore.BACKUPING }}</p>
    <div class="progress-ctn">
    </div>

    <div class="privacy-tip">
        <p>{{= i18n.backup_restore.PRIVACY_TIP }}</p>
    </div>
</script>

<script type="text/template" id="backup-progress-item">
    <div class="icon-ctn"></div>
    <div class="status">
        <div class="progress-desc"></div>
        <div class="progress hbox">
            <progress class="tiny" max="" value="" />
        </div>
    </div>
    <span class="progress-num"></span>
</script>

<script type="text/template" id="error-item-list">
    <p class="title"></p>
    <div class="app-list-ctn">
        <div class="loading">{{= i18n.common.LOADING }}</div>
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
        <p>{{= StringUtil.format(i18n.backup_restore.RESTORE_PERMISSSION_TIP1, it.type_name) }}</p>
        <p>{{= StringUtil.format(i18n.backup_restore.RESTORE_PERMISSSION_TIP2, it.type_name) }}</p>
        <p>{{= i18n.backup_restore.RESTORE_PERMISSSION_TIP3 }}</p>
    </div>
    <div class="part-non-app-failed">
        <p>{{= StringUtil.format(i18n.backup_restore.RESTORE_PERMISSSION_PART_TIP1, it.error_number, it.type_name) }}</p>
        <p>{{= i18n.backup_restore.RESTORE_PERMISSSION_TIP3 }}</p>
    </div>
</script>

<script type="text/template" id="error-retry">
    <div class="content"></div>
</script>

<script type="text/template" id="backup-remote-progress">
    <p class="title">{{= i18n.backup_restore.BACKUPING }}</p>
    <div class="progress-ctn"></div>

    <div class="mobile-tip">
        <p>{{= i18n.backup_restore.MOBILE_TIP }}</p>
    </div>
</script>

<script type="text/template" id="backup-local-auto-tip">
    <div class="pic-local-ctn pic-ctn"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.backup_restore.AUTO_BACKUP_TIP_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.backup_restore.AUTO_BACKUP_TIP_DESC }}</p>
    </div>
</script>

<script type="text/template" id="backup-remote-auto-tip">
    <div class="pic-remote-ctn pic-ctn"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.backup_restore.AUTO_BACKUP_REMOTE_TIP_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.backup_restore.AUTO_BACKUP_REMOTE_TIP_DESC }}</p>
    </div>
</script>

<script type="text/template" id="backup-remote-error-view">
    <p class="content"></p>
</script>

<script type="text/template" id="backup-app-data-tip-view">
    <div class="hbox wrap cf">
        <div class="backup-pic-ctn"></div>
        <div class="content-ctn">
            <h2>{{= i18n.backup_restore.BACKUP_APP_DATA_TIP_TITLE }}</h2>
            <div class="text-secondary">{{= i18n.backup_restore.BACKUP_APP_DATA_TIP_CONTENT }}</div>
        </div>
    </div>
</script>
</templates>
