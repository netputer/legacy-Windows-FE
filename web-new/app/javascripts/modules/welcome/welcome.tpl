<templates>
<script type="text/x-ui-template" id="welcome">
    <div class="content hbox"></div>
    <footer class="hbox"></footer>
</script>

<script type="text/x-ui-template" id="device">
    <div class="stage-ctn">
        <div class="screen-wrap">
            <div class="screen-ctn vbox">
                <div class="screen">
                    <img alt="" />
                </div>
            </div>
        </div>
        <div class="tip">
            <div class="ctn hbox">
                <div class="icon"></div>
                <div class="des"></div>
            </div>
        </div>
        {{= TemplateFactory.get('ui', 'loading-white') }}
        <button class="w-icon-btn button-set-ring">
            <span class="icon ring"></span>{{= i18n.welcome.EDIT_RING }}
        </button>
    </div>
</script>

<script type="x-ui-template" id="billboard">
    <iframe id="wdj-iframe-billboard" src="{{= it.url }}"></iframe>
    {{= TemplateFactory.get('ui', 'loading') }}
</script>

<script type="x-ui-template" id="device-tools">
    <div class="btns">
        <span class="w-ui-buttongroup screen-shot-setting">
            <button class="w-icon-btn min button-screen-shot" data-title="{{= i18n.welcome.SCREEN_SHOT_TEXT }}">
                {{= i18n.welcome.SCREEN_SHOT_TEXT }}
            </button>
        </span>
        <span class="w-ui-buttongroup">
            <button class="w-icon-btn min img button-play" data-title="{{= i18n.misc.PLAY }}">
                <span class="icon play-black"></span>
            </button>
            <button class="w-icon-btn min img button-refresh" data-title="{{= i18n.misc.REFRESH }}">
                <span class="icon refresh-black"></span>
            </button>
            <button class="w-icon-btn min img button-fullscreen" data-title="{{= i18n.welcome.FULLSCREEN_BTN_TEXT }}">
                <span class="icon fullscreen-black"></span>
            </button>
        </span>
        <button class="w-icon-btn min img button-share" data-title="{{= i18n.misc.SHARE }}">
            <span class="icon share-black"></span>
        </button>
    </div>
    <div class="usb-tip text-secondary">
        <div class="icon info"></div>
        {{= i18n.misc.SCREEN_SHOT_UNDER_USB }}
    </div>
</script>

<script type="text/x-ui-template" id="capacity">
    {{ var percent = parseInt((it.internalCapacity - it.internalFreeCapacity) / it.internalCapacity * 100, 10); }}
    <div class="phone-capacity hbox{{? percent >= 90 }} outofspace{{?}}">
        <div class="icon" data-title="{{= i18n.app.PHONE }}"></div>
        <progress class="progress tiny{{? percent >= 90 }} highlight{{?}}" max="100" value="{{= percent }}" />
        <div class="ratio text-secondary">
            <span class="{{? percent >= 90 }}text-warning{{?}}">{{= StringUtil.readableSize(it.internalCapacity - it.internalFreeCapacity) }}</span> / {{= StringUtil.readableSize(it.internalCapacity) }}
        </div>
    </div>
    {{ var percent =  parseInt((it.externalCapacity - it.externalFreeCapacity) / it.externalCapacity * 100, 10); }}
    <div class="external-capacity hbox{{? percent >= 90 }} outofspace{{?}}">
        <div class="icon" data-title="{{= i18n.app.SD_CARD }}"></div>
        <progress class="progress tiny{{? percent >= 90 }} highlight{{?}}" max="100" value="{{= percent }}" />
        <div class="ratio text-secondary">
            <span class="{{? percent >= 90 }}text-warning{{?}}">{{= StringUtil.readableSize(it.externalCapacity - it.externalFreeCapacity) }}</span> / {{= StringUtil.readableSize(it.externalCapacity) }}
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="file-tools">
    <button class="button-open-sd min">{{= i18n.welcome.TOOL_SD }}</button>
    <button class="button-backup min">{{= i18n.welcome.TOOL_BACKUP }}</button>
    <span class="w-ui-buttongroup auto-backup-ctn">
        <button class="button-group-backup min">{{= i18n.welcome.TOOL_BACKUP }}</button>
        <button class="w-icon-btn img min button-auto-backup">
            <span class="icon open-folder-black"></span>
        </button>
    </span>
    <button class="button-restore min">{{= i18n.welcome.TOOL_RECOVERY }}</button>
</script>

<script type="text/x-ui-template" id="connection-guide">
    <div class="content-ctn">
        <div class="tips-ctn">
            <h1>{{= i18n.welcome.CONNECT_UR_PHONE }}</h1>
            <div class="tips text-secondary">{{= i18n.welcome.CONNECTION_TIP }}</div>
            <button class="primary button-connect max">{{= i18n.welcome.CONNECT_PHONE }}</button>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="one-key-move-tip">
    <div>
        <span class="des">{{= i18n.misc.PHONE_CAPACITY_TIP }}</span>
        <span class="link button-one-key-move">{{= i18n.misc.PHONE_CAPACITY_ACTION }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="open-sd-tip">
    <div>
        <span class="des">{{= i18n.misc.SD_CAPACITY_TIP }}</span>
        <span class="link button-open-sd-card">{{= i18n.misc.SD_CAPACITY_ACTION }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="flash-tip">
    <div class="w-welcome-flash-tip hbox">
        <div class="pic-ctn"></div>
        <div class="content-ctn">
            <h2 class="title">{{= i18n.welcome.FLASH_TIP_TITLE }}</h2>
            <div class="desc">{{= i18n.welcome.FLASH_TIP_DESC }}</div>
        </div>
        <div class="button-close"></div>
    </div>
</script>
</templates>
