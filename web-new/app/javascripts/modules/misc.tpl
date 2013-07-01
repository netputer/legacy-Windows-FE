<templates>
<script type="text/x-ui-template" id="sd-mount">
    <div class="w-misc-sd-mount-ctn">
        <h1>{{= i18n.misc.PLEASE_UNMOUNT_SD_CARD }}</h1>
        <p>{{= i18n.misc.PLEASE_UNMOUNT_SD_CARD_DES }}</p>
        <div class="mount-sd-tip"></div>
    </div>
</script>

<script type="text/x-ui-template" id="main">
    <div class="sidebar vbox"></div>
    <div class="module-ctn"></div>
</script>

<script type="text/x-ui-template" id="menu-item">
    <div class="icon {{= it.icon }}"></div>
    <div class="label">{{= it.label }}</div>
    {{? it.count !== -1 }}
        {{? it.id === 3 }}
            <div class="count" data-title="{{= StringUtil.format(i18n.app.UPDATE_DES, it.count) }}">{{= it.count }}</div>
        {{??}}
            <div class="count">{{= it.count }}</div>
        {{?}}
    {{?}}
</script>

<script type="text/x-ui-template" id="menu-child-item">
    <div class="sub-title">{{= it.label }}</div>
    <div class="count">{{= it.count }}</div>
</script>

<script type="text/x-ui-template" id="binding-devie">
    <div class="w-misc-device-binding">
        <h1>{{= i18n.misc.BINDING_TITLE }}</h1>
        <p class="text-secondary">{{= i18n.misc.BINDING_DES }}</p>
        <ul>
            <li class="hbox">
                <div class="icon backup"></div>
                <div class="des">
                    <h2>{{= i18n.misc.BINDING_AUTOBACKUP }}</h2>
                    <div class="text-thirdly">{{= i18n.misc.BINDING_AUTOBACKUP_DES }}</div>
                </div>
            </li>
            <li class="hbox">
                <div class="icon account"></div>
                <div class="des">
                    <h2>{{= i18n.misc.BINDING_ACCOUNT }}</h2>
                    <div class="text-thirdly">{{= i18n.misc.BINDING_ACCOUNT_DES }}</div>
                </div>
            </li>
            <li class="hbox">
                <div class="icon connect"></div>
                <div class="des">
                    <h2>{{= i18n.misc.BINDING_CONNECT }}</h2>
                    <div class="text-thirdly">{{= i18n.misc.BINDING_CONNECT_DES }}</div>
                </div>
            </li>
            <li class="hbox">
                <div class="icon update"></div>
                <div class="des">
                    <h2>{{= i18n.misc.BINDING_UPDATE }}</h2>
                    <div class="text-thirdly">{{= i18n.misc.BINDING_UPDATE_DES }}</div>
                </div>
            </li>
        </ul>
    </div>
</script>

<script type="text/x-ui-template" id="binding-devie-i18n">
    <div class="w-misc-device-binding">
        <h1>{{= i18n.misc.BINDING_TITLE }}</h1>
        <p class="text-secondary">{{= i18n.misc.BINDING_DES }}</p>
        <ul>
            <li class="hbox">
                <div class="des">
                    <h2>{{= i18n.misc.BINDING_AUTOBACKUP }}</h2>
                    <div class="text-thirdly">{{= i18n.misc.BINDING_AUTOBACKUP_DES }}</div>
                </div>
            </li>
            <li class="hbox">
                <div class="des">
                    <h2>{{= i18n.misc.BINDING_CONNECT }}</h2>
                    <div class="text-thirdly">{{= i18n.misc.BINDING_CONNECT_DES }}</div>
                </div>
            </li>
        </ul>
    </div>
</script>

<script type="text/x-ui-template" id="notify-setting">
    <div class="w-notify-setting hbox">
        <div class="setting-icon"></div>
        <span class="button-setting text-thirdly link">{{= i18n.misc.NOTIFY_SETTING }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="notify-disable">
    <div class="w-notify-setting hbox">
        <span class="button-disable text-thirdly link">{{= i18n.misc.DONT_SHOW_AGAIN }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="adb-notif">
    <div class="hbox ctn">
        <div class="icon"></div>
        <div class="text-secondary tip">{{= i18n.misc.USB_LOADING_INFO }}</div>
        <div class="loading">
            {{= TemplateFactory.get('ui', 'loading-horizental-transparent') }}
        </div>
        <button class="min button-retry">{{= i18n.ui.RETRY }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="shadow">
    <div class="w-menu-shadow">
        <div class="shadow"></div>
    </div>
</script>

<script type="text/x-ui-template" id="batch-error-window">
    <div>{{= it.tip }}</div>
    {{? it.errorInfo }}
    <div>{{= i18n.misc.POSIBLE_REASON }}{{= i18n.taskManager[it.errorInfo] || i18n.taskManager.UNKNOWN_ERROR }}</div>
    {{?}}
    <ul class="list-ctn">
        {{~ it.items : item }}
        <li class="item wc">- {{= item }}</li>
        {{~}}
    </ul>
</script>

<script type="text/x-ui-template" id="close-auto-start">
    <div class="tip">{{= i18n.welcome.CLOSE_AUTO_START }}</div>
    <div class="button-close"></div>
</script>

<script type="text/x-ui-template" id="new_ia">
    <div class="tip">{{= i18n.welcome.NEW_IA_QUESTIONNAIRE }}</div>
    <div class="button-close"></div>
</script>
</templates>
