<templates>
<script type="text/x-ui-template" id="welcome">
    <div class="bg">
        <div class="mask"></div>
    </div>
    <div class="top hbox"></div>
    {{= TemplateFactory.get('ui', 'loading-horizental-transparent') }}
</script>

<script type="text/x-ui-template" id="card-app-set">
    <div class="count-ctn">
        <div class="count">{{= it.items.length }}</div>
        <div class="title">{{= it.title }}</div>
    </div>
    <div class="apps-ctn">
        <ul class="apps-list">
            {{~ it.items : item }}
            <li class="item" title="{{= item.base_info.name }}"><img class="icon" src="{{= item.base_info.icon }}" alt="{{= item.base_info.name }}" /></li>
            {{~}}
        </ul>
        <div class="text-secondary desc">{{= it.desc }}</div>
        <button class="button-action">{{= it.action }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="sigle-card">
    <img class="icon button-navigate" alt="{{! it.title }}" src="images/default-app-100X100.png" />
    <div class="info-ctn vbox">
        <div class="info-top hbox">
            <div class="info">
                <h1 class="title button-navigate wc" title="{{! it.title }}">{{! it.title }}</h1>
                <span class="cate text-thirdly">
                    {{= StringUtil.format(i18n.welcome.CARD_APP_TAG_LINE, it.categories[0].name, it.installedCountStr) }}
                </span>
            </div>
            <button class="button-action">{{= i18n.app.INSTALL }}</button>
        </div>
        <div class="comment text-secondary">{{! it.comment }}</div>
        <footer class="footer text-thirdly">
            {{= StringUtil.format(i18n.welcome.CARD_APP_FOOTER, it.channel, StringUtil.smartDate(it.updateTime)) }}
        </footer>
    </div>
</script>

<script type="text/x-ui-template" id="list-card">
    {{
        var titles = {
            10 : '热门游戏分类',
            11 : '热门应用分类',
            12 : '更多视频分类'
        };
    }}
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= titles[it.type] }}</h1>
        <ul class="list-ctn">
            {{~ it.items : item }}
            <li class="item button-navigate" data-url="{{= item.url }}">{{! item.name }}</li>
            {{~}}
        </ul>
    </div>
</script>

<script type="text/x-ui-template" id="cloud-photo">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.CARD_CLOUD_PHOTO_TITLE }}</h1>
        <p class="desc">{{= i18n.welcome.CARD_CLOUD_PHOTO_DESC }}</p>
        <button class="button-action">{{= i18n.welcome.CARD_CLOUD_PHOTO_OPEN }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="backup">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.CARD_BACKUP_TITLE }}</h1>
        <p class="desc">{{= i18n.welcome.CARD_BACKUP_DESC }}</p>
        <button class="button-action">{{= i18n.welcome.CARD_BACKUP_ACTION }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="item-list-card">
    <div class="icon-ctn">
        <h1 class="text-secondary title">{{! it.title }}</h1>
    </div>
    <ul class="info-ctn">
        {{~ it.items : item }}
        <li class="item hbox">
            <img class="icon button-navigate" src="{{= item.icons.px48 }}" alt="{{! item.title }}" data-key="{{= item.key }}" />
            <div class="info">
                <div class="wc title button-navigate" data-key="{{= item.key }}">{{! item.title }}</div>
                <div class="text-secondary wc">{{! item.tagline }}</div>
            </div>
            <button class="button-action" data-key="{{= item.key }}">{{= i18n.app.INSTALL }}</button>
        </li>
        {{~}}
    </ul>
</script>

<script type="text/x-ui-template" id="clock">
    <div class="time">{{= it.time }}</div>
    <div class="date-ctn">
        <div>{{= it.date }}</div>
        <div>{{= it.day }}</div>
    </div>
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
    </div>
</script>

<script type="text/x-ui-template" id="toolbar">
    <span class="w-ui-buttongroup screen-shot-setting">
        <button class="w-icon-btn min trans button-screen-shot">
            <span class="icon screenshot"></span>{{= i18n.welcome.SCREEN_SHOT_TEXT }}
        </button>
    </span>
    <button class="w-icon-btn button-backup trans min">
        <span class="icon backup"></span>{{= i18n.welcome.TOOL_BACKUP }}
    </button>
    <!--
    <span class="w-ui-buttongroup auto-backup-ctn">
        <button class="button-group-backup min">{{= i18n.welcome.TOOL_BACKUP }}</button>
        <button class="w-icon-btn img min button-auto-backup">
            <span class="icon open-folder-black"></span>
        </button>
    </span>
    -->
    <button class="w-icon-btn button-restore trans min">
        <span class="icon restore"></span>{{= i18n.welcome.TOOL_RECOVERY }}
    </button>
    <button class="w-icon-btn button-open-sd trans min">
        <span class="icon sd-white"></span>{{= i18n.welcome.TOOL_SD }}
    </button>
    <button class="w-icon-btn button-set-wallpaper trans min">
        <span class="icon wallpaper"></span>{{= i18n.photo.SET_AS_WALLPAPER }}
    </button>
</script>

<script type="text/x-ui-template" id="device-tools">
    <button class="w-icon-btn trans min button-refresh">
        <span class="icon refresh"></span>
        {{= i18n.welcome.REFRESH_BTN_TEXT }}
    </button>
    <button class="w-icon-btn trans min button-play">
        <span class="icon play"></span>
        <span class="label">{{= i18n.welcome.PLAY_BTN_TEXT }}</span>
    </button>
    <button class="w-icon-btn trans min button-fullscreen">
        <span class="icon fullscreen"></span>
        {{= i18n.welcome.FULLSCREEN_BTN_TEXT }}
    </button>
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
