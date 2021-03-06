<templates>
<script type="text/x-ui-template" id="sd-mount">
    <div class="w-misc-sd-mount-ctn">
        <h1>{{= i18n.misc.PLEASE_UNMOUNT_SD_CARD }}</h1>
        <p>{{= i18n.misc.PLEASE_UNMOUNT_SD_CARD_DES }}</p>
        <div class="mount-sd-tip"></div>
    </div>
</script>

<script type="text/x-ui-template" id="main">
    <div class="sidebar vbox">
        <div class="w-misc-agent-host"></div>
    </div>
    <div class="module-ctn"></div>
</script>

<script type="text/x-ui-template" id="menu-item">
    <div class="icon {{= it.icon }}"></div>
    <div class="label">{{= it.label }}</div>
    {{? it.count !== -1 }}
        {{? it.id === 3 }}
            <div class="count" data-title="{{= StringUtil.format(i18n.app.UPDATE_DES, it.count) }}">{{= it.count }}</div>
        {{?? it.id === 2 }}
            <div class="count" data-title="{{= StringUtil.format(i18n.message.UNREAD_DES, it.count) }}">{{= it.count }}</div>
        {{??}}
            <div class="count">{{= it.count }}</div>
        {{?}}
    {{?}}
    {{? it.syncing !== undefined }}
        <div class="w-ui-syncing" data-title="{{= i18n.new_backuprestore.NAV_AUTO_BACKUPING}}"/>
    {{?}}
</script>

<script type="text/x-ui-template" id="menu-child-item">
    <div class="sub-title">{{= it.label }}</div>
    <div class="count">{{= it.count }}</div>
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
    <div class="hbox ctn text-secondary">
        <div class="icomoon icomoon-device"></div>
        <div class="tip">{{= i18n.misc.USB_LOADING_INFO }}</div>
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
    <div>{{= i18n.misc.POSIBLE_REASON }}{{= i18n.taskManager[it.errorInfo.error_message] || i18n.taskManager.UNKNOWN_ERROR }}</div>
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

<script type="text/x-ui-template" id="wanxiaodou">
    {{ var tips = ["apple", "cat", "cry", "doubt", "funny", "hot", "cat2", "sell_his_self", "sleepy", "speechless", "wash", "what", "prick1", 'prick2']; }}
    {{ var i = _.random(0, 13); var tip = tips[i]; }}
    <div class="w-wanxiaodou-img {{= tip }}"></div>
</script>

<script type="text/x-ui-template" id="agent-notifi">
    <div class="w-misc-agent-notifi">
        <div class="bg"></div>
        <div class="tip">{{= i18n.misc.AGENT_NOTIFI }}</div>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="auto-connection-notifi">
    <div class="w-misc-auto-connection-notifi">
        <div class="tip">{{= i18n.misc.AUTO_CONN_NOTIFI_TIP }}</div>
        <div class="button-close"></div>
        <button class="primary button-action">{{= i18n.misc.AUTO_CONN_TRY }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="disconnection-notifi">
    <div class="w-misc-disconnection-notifi">
        <div class="tip">{{= i18n.misc.DISCONN_NOTIFI_TIP }}</div>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="binding-devie-cloud">
    <div class="w-misc-device-binding-cloud cf">
    <div class="main-ctn hbox">
        <div class="pic-ctn icon-device"></div>
        <div class="content-ctn">
            <span class="header-text">{{= i18n.misc.BIND_CLOUD_HEADER }}</span>
            <div class="content-text-first hbox">
                <div class="desc-text">
                    <p>{{= i18n.misc.BIND_CLOUD_TEXT_FIRST_LINE }}</p>
                    <p>{{= i18n.misc.BIND_CLOUD_TEXT_SECOND_LINE }}</p>
                </div>
            </div>
        </div>
    </div>
    <div class="arrow-bg"></div>
</div>
</script>

<script type="text/x-ui-template" id='pim-mask'>
    <div class='w-main-pim-mask-ctn'>
        <div class='icon'></div>
        {{? Device.get('isUSBConnecting') }}
        <h1 class='title'>{{= i18n.misc.CONNECTING_UR_PHONE }}</h1>
        {{?? !Device.get('isConnected')}}
        <h1 class='title'>{{= i18n.welcome.CONNECT_UR_PHONE }}</h1>
        <span class='desc'>{{= i18n.welcome.CONNECTION_TIP }}</span>
        {{??}}
        <h1 class='title'>{{= i18n.misc.CAN_NOT_USE_PIM }}</h1>
        <span class='desc'>{{= i18n.misc.CONNECTION_TIP }}</span>
        {{?}}
        {{? Device.get('isUSBConnecting') }}
            <button class='button-check primary max'>{{= i18n.misc.CHECK_CONNECTION_STATE }}</button>
        {{?}}
    </div>
    {{? Device.get('isConnected') }}
    <div class="ip-ctn">
        <span class="text-thirdly client-ip">{{= StringUtil.format(i18n.misc.CLIENT_IP, it.clientIp) }}</span>
        <span class="text-thirdly device-ip">{{= StringUtil.format(i18n.misc.DEVICE_IP, it.deviceIp) }}</span>
    </div>
    {{?}}
</script>

<script type='text/x-ui-template' id='usb-tip'>
    <div class='top'>
        <div class='logo'></div>
        <div class='button-close'></div>
        <img src='{{= CONFIG.enums.IMAGE_PATH + "/connecting.gif" }}' class='connecting'/>
        <div class='icon'></div>
    </div>
    <div class='container vbox'>
        <div class='title'>{{= it.title }}</div>
        <div class='tips'>
            {{? !it.showDefault}}
            <div class='tip'>{{= i18n.misc.USB_TIP_1 }}</div>
            <div class='tip'>{{= i18n.misc.USB_TIP_2 }}</div>
            {{??}}
            <div class='tip'>{{= i18n.misc.USB_DEFAULT_TIP_1 }}</div>
            <div class='tip'>{{= i18n.misc.USB_DEFAULT_TIP_2 }}</div>
            {{?}}
        </div>
        <button class='button-action use-usb max primary'>{{= i18n.misc.ALREADY_USE_USB }}</button>
    </div>
    <div class='feedback'>
        <a class='button-help' target='_default' href='http://www.wandoujia.com/help/?do=topic&id=87262553'>{{= i18n.misc.HELP }}</a>
    </div>
</script>

<script type='text/x-ui-template' id='usb-error-tip'>
    <div class='top'>
        <div class='logo'></div>
        <div class='button-close'></div>
        <div class='icon'></div>
    </div>
    <div class='container vbox'>
        <div class='title'>{{= i18n.misc.NO_RESPONSE_WITH_USB }}</div>
        <div class='tips'>
            {{~ [1, 2, 3]: index }}
            <div class='tip'>
                <span class='num'>{{= index }}</span>
                <span class='content'>{{= i18n.misc['USB_ERROR_TIP_' + index] }}</span>
            </div>
            {{~}}
        </div>
    </div>
    <div class='feedback'>
        {{= i18n.misc.STILL_CAN_NOT_CONNECTION }}
        <a class='button-feedback' href='http://www.wandoujia.com/help/?do=add_ticket' target='_default'>{{= i18n.misc.ASK_HELP }}</a>
    </div>
</script>

<script type='text/x-ui-template' id='usb-app-tip'>
    <div class='top'>
        <div class='logo'></div>
        <div class='button-close'></div>
        <img src='{{= CONFIG.enums.IMAGE_PATH + "/connecting.gif" }}' class='connecting'/>
        <div class='icon'></div>
    </div>
    <div class='container vbox'>
        <div class='title'>{{= it.title }}</div>
        <div class='tips'>
            <div class='tip'>{{= StringUtil.format(i18n.misc.USB_TIP_APP_1, it.name) }}</div>
            <div class='tip'>{{= i18n.misc.USB_TIP_APP_2 }}</div>
        </div>
        <button class='button-action use-usb max primary'>{{= i18n.misc.ALREADY_USE_USB }}</button>
    </div>
    <div class='feedback'>
        <a class='button-help' target='_default' href='http://www.wandoujia.com/help/?do=topic&id=87262553'>{{= i18n.misc.HELP }}</a>
    </div>
</script>

<script type="text/x-ui-template" id="not-in-same-wifi">
    <div class="w-misc-not-in-same-wifi hbox">
        <div class="pic-ctn {{= it.type }}"></div>
        <div class="content-ctn">
            <span class="header-text">{{= i18n.misc['CAN_NOT_USE_' + it.type.toUpperCase()] }}</span>
            <span class="content-text hbox">{{= i18n.misc.NOT_IN_SAME_WIFI }}</span>
        </div>
        <div class="ip-ctn">
            <span class="text-thirdly client-ip">{{= StringUtil.format(i18n.misc.CLIENT_IP, it.clientIp) }}</span>
            <span class="text-thirdly device-ip">{{= StringUtil.format(i18n.misc.DEVICE_IP, it.deviceIp) }}</span>
        </div>
    </div>
</script>

</templates>
