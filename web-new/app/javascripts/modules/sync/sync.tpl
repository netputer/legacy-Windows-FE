<templates>
<script type="text/x-ui-template" id="photo-sync">
    <span class="text-tip"></span>
    <div class="split"></div>
    <span class="link button-open-url">{{= i18n.common.VIEW }}</span>
    <span class="link button-open-photosync">{{= i18n.common.OPEN }}</span>
    <span class="link button-close-photosync">{{= i18n.photo.CLOSE_PHOTO_SYNC }}</span>
</script>

<script type="text/x-ui-template" id="tip">
    <p class="tip1"></p>
</script>

<script type="text/x-ui-template" id="auto-backup-complete-notify">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= i18n.backup_restore.AUTO_BACKUP_COMPLETE_FINISH }}</h2>
            <p class="content text-secondary">{{= it.content }}</p>
            <p class="text-secondary">{{= i18n.backup_restore.AUTO_BACKUP_COMPLETE_FINISH_TIP }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <button class="primary button-open">{{= i18n.welcome.SHOW_FILE }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="download-photo-notify">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= StringUtil.format(i18n.backup_restore.PHOTO_DOWNLOAD_NOTIFY_TITLE, it.num) }}</h2>
            <p class="content text-secondary">{{= i18n.backup_restore.PHOTO_DOWNLOAD_NOTIFY_CONTENT }}</p>
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
            <h2 class="header-text">{{= i18n.backup_restore.SYNC_PHOTO_PUSH_NOTIFY_TITLE }}</h2>
            <p class="content text-secondary">{{= StringUtil.format(i18n.backup_restore.SYNC_PHOTO_PUSH_NOTIFY_CONTENT, it.num) }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <button class="primary button-open">{{= i18n.backup_restore.SYNC_PHOTO_OPEN }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="backup-guide">
    <div class="hbox wrap cf">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="header-text">{{= it.content }}</h2>
            <p class="text-secondary">{{= i18n.backup_restore.BACKUP_GUIDE_CONTENT }}</p>
        </div>
    </div>
    <div class="hbox footer-ctn">
        <button class="primary button-open">{{= i18n.backup_restore.BACKUP_GUIDE_NOW }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="account-guide-body">
    <div class="guide-header hbox"></div>
    <div class="guide-split"><div class="icon"></div></div>
    <div class="guide-content hbox"></div>
</script>

<script type="text/x-ui-template" id="account-guide-header">
    <div class="item hbox cloud-backup">
        <div class="icon icon-cloud-backup"></div>
        <div class="title">{{= i18n.sync.CLOUD_BACKUP }}</div>
    </div>
    <div class="item hbox cloud-photo">
        <div class="icon icon-cloud-photo"></div>
        <div class="title">{{= i18n.sync.CLOUD_PHOTO }}</div>
    </div>
    <div class="item hbox social-platform">
        <div class="icon icon-social-platform"></div>
        <div class="title">{{= i18n.sync.SOCIAL_PLATFORM }}</div>
    </div>
</script>

<script type="text/template" id="account-guide-content-backup">
    <div class="pic-ctn pic-content-backup"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.sync.CLOUD_BACKUP_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.sync.CLOUD_BACKUP_DESC }}</p>
        <label class="guide-option"><input type="checkbox" checked="true" />{{= i18n.sync.CLOUD_BACKUP_OPTION }}</label>
    </div>
</script>

<script type="text/template" id="account-guide-content-photo">
    <div class="pic-ctn pic-content-photo"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.sync.CLOUD_PHOTO_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.sync.CLOUD_PHOTO_DESC }}</p>
        <label class="guide-option"><input type="checkbox" checked="true" />{{= i18n.sync.CLOUD_PHOTO_OPTION }}</label>
    </div>
</script>

<script type="text/template" id="account-guide-content-social">
    <div class="pic-ctn pic-content-social"></div>
    <div class="content-ctn">
        <p class="title">{{= i18n.sync.SOCIAL_PLATFORM_TITLE }}</p>
        <p class="desc text-secondary">{{= i18n.sync.SOCIAL_PLATFORM_DESC }}</p>
        <div class="social-ctn"></div>
        <label class="guide-option"><input type="checkbox" checked="true" disabled />{{= i18n.sync.SOCIAL_PLATFORM_OPTION }}</label>
    </div>
</script>
</templates>
