<templates>
<script type="text/x-ui-template" id="photo-sync">
    <span class="text-tip"></span>
    <div class="split"></div>
    <span class="link button-open-url">{{= i18n.misc.VIEW }}</span>
    <span class="link button-open-photosync">{{= i18n.misc.OPEN }}</span>
    <span class="link button-close-photosync">{{= i18n.photo.CLOSE_PHOTO_SYNC }}</span>
</script>

<script type="text/x-ui-template" id="tip">
    <p class="tip1"></p>
</script>

<script type="text/x-ui-template" id="auto-backup-complete-notify">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= i18n.new_backuprestore.AUTO_BACKUP_COMPLETE_FINISH }}</h2>
            <p class="content text-secondary">{{= it.content }}</p>
            <p class="text-secondary">{{= i18n.new_backuprestore.AUTO_BACKUP_COMPLETE_FINISH_TIP }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <button class="primary button-open">{{= i18n.welcome.SHOW_FILE }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="server-notify">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= it.title }}</h2>
            <p class="content text-secondary">{{= it.desc }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <span class="link button-open">{{= i18n.misc.LEARN_MORE }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="download-photo-notify">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= StringUtil.format(i18n.new_backuprestore.PHOTO_DOWNLOAD_NOTIFY_TITLE, it.num) }}</h2>
            <p class="content text-secondary">{{= i18n.new_backuprestore.PHOTO_DOWNLOAD_NOTIFY_CONTENT }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <button class="primary button-open">{{= i18n.welcome.SHOW_FILE }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="open-sync">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= i18n.new_backuprestore.SYNC_PHOTO_PUSH_NOTIFY_TITLE }}</h2>
            <p class="content text-secondary">{{= StringUtil.format(i18n.new_backuprestore.SYNC_PHOTO_PUSH_NOTIFY_CONTENT, it.num) }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <button class="primary button-open">{{= i18n.misc.CLOUD_PHOTO_OPEN }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="backup-guide">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= it.content }}</h2>
            <p class="text-secondary">{{= i18n.new_backuprestore.BACKUP_GUIDE_CONTENT }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <button class="primary button-open">{{= i18n.new_backuprestore.BACKUP_GUIDE_NOW }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="account-guide-body">
    <div class="guide-header hbox"></div>
    <div class="guide-split"><div class="icon"></div></div>
    <div class="guide-content hbox"></div>
</script>

<script type="text/template" id="account-guide-content-backup">
    <div class="pic-ctn pic-content-backup"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.sync.CLOUD_BACKUP_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.sync.CLOUD_BACKUP_DESC }}</p>
        <label class="guide-option"><input type="checkbox" checked="true" />{{= i18n.sync.CLOUD_BACKUP_OPTION }}</label>
    </div>
</script>

<script type="text/x-ui-template" id="ios-sms-get-link">
    <div class="icon"></div>
    <div class="container">
        <h2>{{= i18n.sync.IOS_ADVERTISMENT_TITLE}}</h2>
        <span class="desc text-secondary">{{= i18n.sync.IOS_ADVERTISMENT_DESC}}</span>
        <div class="footer">
            <button class="button-getlink primary">{{= i18n.sync.IOS_ADVERTISMENT_GET_LINK}}</button>
            <a class="goto" target="_default" href="{{= CONFIG.enums.IOS_APP_URL}}">{{= i18n.sync.IOS_ADVERTISMENT_GOTO_LINK}}</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="ios-sms-send">
    <span class="desc">{{= i18n.sync.IOS_ADVERTISMENT_SEND_DESC }}</span>
    <input type="text" class="phone-number" placeholder="{{= i18n.sync.IOS_ADVERTISMENT_PLACE_HOLDER }}"/>
    <button class="button-send primary" disabled>{{= i18n.sync.IOS_ADVERTISMENT_SEND }}</button>
</script>
</templates>
