<templates>
<script type="text/x-ui-template" id="scan">
    <div class="progress hbox">
        <div class="pre-scan"></div>
        <div class="title-ctn vbox">
            <div class="title">{{= i18n.optimize.WELCOME }}</div>
            <div class="tip text-secondary"></div>
        </div>
    </div>
    <div class="monitor-ctn vbox">
        <div class="monitor vbox">
            <div class="button-ctn vbox">
                <button class="button-scan"></button>
                <div class="wifi-tip text-secondary">{{= i18n.optimize.WIFI_TIP }}</div>
            </div>
        </div>
        <div class="vendor hbox">
            <div class="logo"></div>
            <span class="text-secondary">{{= i18n.optimize.VENDOR }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="install">
    <div class="scanning"></div>
    <div class="title-ctn vbox">
        <div class="title">{{= i18n.optimize.INSTALLING }}</div>
        <progress class="min" max="100" value="{{= it.progress }}"></progress>
    </div>
    <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
</script>

<script type="text/x-ui-template" id="scan-progress">
    <div class="scanning"></div>
    <div class="title-ctn vbox">
        <div class="title">{{= i18n.optimize.SCANNING }}</div>
        <div class="progress-ctn vbox">
            <div class="progress-inside"></div>
        </div>
        <div class="tip text-secondary wc"></div>
    </div>
    <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
</script>

<script type="text/x-ui-template" id="scan-monitor">
    <h3 class="finish-title">{{= StringUtil.format(i18n.optimize.FINISH_TITLE, 0) }}</h3>
    <ul class="finish">
        <li class="virus hbox">
            <div class="icon icon-done"></div>
            <div class="tip text-secondary"></div>
        </li>
        <li class="cache hbox">
            <div class="icon icon-done"></div>
            <div class="tip text-secondary"></div>
        </li>
        <li class="ram hbox">
            <div class="icon icon-done"></div>
            <div class="tip text-secondary"></div>
        </li>
    </ul>
    <h3 class="optimize-title">{{= StringUtil.format(i18n.optimize.OPTIMIZE_TITLE, 0) }}</h3>
    <ul class="optimize">
        <li class="virus hbox">
            <div class="icon icon-warn"></div>
            <div class="tip text-secondary"></div>
            <div class="button-optimize-virus link">{{= i18n.optimize.OPTIMIZE }}</div>
        </li>
        <li class="cache hbox">
            <div class="icon icon-warn"></div>
            <div class="tip text-secondary"></div>
            <div class="button-optimize-cache link">{{= i18n.optimize.OPTIMIZE }}</div>
        </li>
        <li class="ram hbox">
            <div class="icon icon-warn"></div>
            <div class="tip text-secondary"></div>
            <div class="button-optimize-ram link">{{= i18n.optimize.OPTIMIZE }}</div>
        </li>
    </ul>
    <h3 class="suggestion-title">{{= StringUtil.format(i18n.optimize.SUGGESTION_TITLE, 0) }}</h3>
    <ul class="suggestion">
        <li class="update hbox">
            <div class="icon icon-info"></div>
            <div class="tip text-secondary"></div>
            <div class="button-update-all link">{{= i18n.optimize.UPDATE }}</div>
        </li>
        <li class="backup hbox">
            <div class="icon icon-info"></div>
            <div class="tip text-secondary"></div>
            <div class="button-backup link">{{= i18n.optimize.BACKUP }}</div>
        </li>
    </ul>
</script>
</templates>