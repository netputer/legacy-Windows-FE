<templates>

<script type="text/template" id="choose-restore-type">
    <div class="content">
        <div class="button hbox button-local">
            <div class="icon local-icon"></div>
            <h2 class="title">{{= i18n.backup_restore.RESTORE_TITLE_LOCAL }}</h2>
        </div>
        <div class="text-secondary desc">{{= i18n.backup_restore.RESTORE_TYPE_LOCAL_CONTENT }}</div>
    </div>
    <div class="content">
        <div class="button hbox button-remote">
            <div class="icon remote-icon"></div>
            <h2 class="title">{{= i18n.backup_restore.RESTORE_TITLE_REMOTE }}</h2>
        </div>
        <div class="text-secondary desc">{{= i18n.backup_restore.RESTORE_TYPE_REMOTE_CONTENT }}</div>
    </div>
</script>

<script type="text/template" id="select-file-folder">
    <p>{{= i18n.backup_restore.SELECT_FILE_FOLDER_TIP }}</p>
</script>

<script type="text/template" id="choose-restore-file">
    <p class="title">{{= i18n.backup_restore.CHOOSE_RESTORE_FILE_TITLE }}</p>
    <div class="header hbox">
        <div class="file-name" >{{= i18n.backup_restore.BACKUP_FILE }}</div>
        <div class="count-wrap">
            <div class="contact-number"></div>
        </div>
        <div class="count-wrap">
            <div class="sms-number"></div>
        </div>
        <div class="count-wrap">
            <div class="app-number"></div>
        </div>
    </div>
    <div class="list-ctn">
        <ul class="list">
            {{~ it.list : item }}
            <li>
                <label class="item-wrap hbox">
                    <input class="file-radio" type="radio" name="file" value="{{= item.file_name }}" />
                    <div class="file-name wc" title="{{= item.file_name }}">{{= item.short_file_name }}</div>
                    <div class="contact-number" title="{{= i18n.backup_restore.CONTACT }}"></div>
                    <div class="sms-number" title="{{= i18n.backup_restore.SMS }}"><div class="loading"></div></div>
                    <div class="app-number" title="{{= i18n.backup_restore.APP }}"></div>
                </label>
            </li>
            {{~}}
        </ul>
    </div>
    <div class="tip-link">
        {{= i18n.backup_restore.CHOOSE_RESTORE_FILE_TIP_BEFORE }}
        <span class="link button-select-file">{{= i18n.backup_restore.SELECT_BACKUP_FILE }}</span>
        {{= i18n.backup_restore.CHOOSE_RESTORE_FILE_TIP_AFTER }}
        {{? FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE }}
        <div class="old-version-tip" title=""></div>
        {{??}}
        <div class="old-version-tip locale-patch" title=""></div>
        {{?}}
    </div>
</script>

<script type="text/x-ui-template" id="old-version-tip">
    <div class="old-version-tip">
        {{= i18n.backup_restore.RESOTRE_OLD_VERSION_TIP_BEFORE }}
        <a href="{{= i18n.backup_restore.RESTORE_OLD_VERSION_DL_LINK }}" target="_default">
            {{= i18n.backup_restore.RESOTRE_OLD_VERSION_TIP_LINK }}
        </a>
        {{= i18n.backup_restore.RESOTRE_OLD_VERSION_TIP_AFTER }}
    </div>
</script>

<script type="text/x-ui-template" id="choose-account">
    <p>{{= i18n.backup_restore.RESTORE_CHOOSE_ACCOUNT_TIP }}</p>
    <div class="account-ctn"></div>
</script>

<script type="text/template" id="resotre-progress">
    <p class="title">{{= i18n.backup_restore.RESTORING_TIP }}</p>

    <div class="progress-ctn"></div>
</script>

<script type="text/template" id="restore-app-tip">
    <div class="image-ctn"></div>
    <div class="content-ctn">
        <p>{{= i18n.backup_restore.RESTORE_APP_TIP }}</p>
    </div>
</script>

<script type="text/template" id="restore-delete-data">
    <p>{{= i18n.backup_restore.RESTORE_DELETE_DATA_TIP }}</p>
    <ul class="list">
        <li>
            <label>
                <input class="radio-item yes" type="radio" value="1" name="delete_data" checked="true">
                <span class="desc">{{= i18n.backup_restore.RESTORE_DELETE_DATA_TIP_YES }}</span>
            </label>
        </li>
        <li>
            <label>
                <input class="radio-item no" type="radio" value="0" name="delete_data">
                <span class="desc">{{= i18n.backup_restore.RESTORE_DELETE_DATA_TIP_NO }}</span>
            </label>
        </li>
    </ul>
</script>

<script type="text/template" id="choose-restore-date-item">
    <label class="item-wrap hbox" data-version="{{= it.item.version }}">
        <input class="date-radio" type="radio" name="date" value="{{= it.item.version }}" data-udid="{{= it.item.udid }}" />
        <div class="date">{{= it.item.timestamp }}</div>
        <div class="device wc" title="{{= it.item.deviceName }}">{{= it.item.deviceName }}</div>
        <div class="contact-number" title="{{= i18n.backup_restore.CONTACT }}"></div>
        <div class="sms-number" title="{{= i18n.backup_restore.SMS }}">
            <div class="w-ui-loading-small info_loading" style="display: block; ">
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
        <div class="app-number" title="{{= i18n.backup_restore.APP }}"></div>
    </label>
</script>

<script type="text/template" id="choose-restore-date">
    <p class="title">{{= i18n.backup_restore.CHOOSE_RESTORE_DATE_TITLE }}</p>
    <div class="header hbox">
        <div class="date" >{{= i18n.backup_restore.RESTORE_DATE }}</div>
        <div class="device" >{{= i18n.backup_restore.RESTORE_DEVICE }}</div>
        <div class="count-wrap">
            <div class="contact-number"></div>
        </div>
        <div class="count-wrap">
            <div class="sms-number"></div>
        </div>
        <div class="count-wrap">
            <div class="app-number"></div>
        </div>
    </div>
    <div class="list-ctn">
        <div class="loading">{{= i18n.misc.LOADING }}</div>
        <ul class="list">
            <li class="load-more-ctn">
                <span class="button-load-more link">{{= i18n.misc.LOAD_MORE }}</span>
            </li>
        </ul>
    </div>
</script>

</templates>
