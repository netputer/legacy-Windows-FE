<templates>
<script type="text/x-ui-template" id="welcome">
    <div class="bg">
        <div class="gradient"></div>
    </div>
    <div class="top hbox"></div>
    {{= TemplateFactory.get('ui', 'loading-horizental-transparent') }}
</script>

<script type="text/x-ui-template" id="card-app-set">
    <div class="count-ctn">
        <div class="count">{{= it.length }}</div>
        <div class="title">{{= it.title }}</div>
    </div>
    <div class="apps-ctn">
        <ul class="apps-list">
            {{~ it.items : item }}
            <li class="item" title="{{= item.base_info.name }}"><img class="icon" src="{{= item.base_info.icon }}" alt="{{= item.base_info.name }}" /></li>
            {{~}}
        </ul>
        <div class="text-secondary desc">{{= it.desc }}</div>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= it.action }}</button>
            <span class="button-ignore text-secondary">{{= i18n.ui.IGNORE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="sigle-card">
    <img class="icon button-navigate" alt="{{! it.title }}" src="images/default-app-100X100.png" />
    <div class="info-ctn vbox">
        <div class="info-top hbox">
            <div class="info">
                <h1 class="title link button-navigate wc" title="{{! it.title }}">{{! it.title }}</h1>
                <span class="cate text-thirdly">
                    {{= StringUtil.format(i18n.welcome.CARD_APP_TAG_LINE, it.categories[0].name, it.installedCountStr) }}
                </span>
            </div>
            <button class="button-action"></button>
        </div>
        <div class="comment text-secondary">{{! it.comment }}</div>
        <footer class="footer text-thirdly">
            {{= StringUtil.format(i18n.welcome.CARD_APP_FOOTER, it.channel, StringUtil.smartDate(it.updateTime)) }}
        </footer>
    </div>
    <div class="ad-badge"></div>
</script>

<script type="text/x-ui-template" id="list-card">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= it.title }}</h1>
        <ul class="list-ctn">
            {{~ it.items : item }}
            <li class="item button-navigate" data-url="{{= item.url }}" date-name="{{! item.name }}">{{! item.name }}</li>
            {{~}}
        </ul>
    </div>
</script>

<script type="text/x-ui-template" id="cloud-photo">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.CARD_CLOUD_PHOTO_TITLE }}</h1>
        <p class="desc">{{= i18n.welcome.CARD_CLOUD_PHOTO_DESC }}</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.welcome.CARD_CLOUD_PHOTO_OPEN }}</button>
            <span class="button-ignore">{{= i18n.ui.IGNORE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="backup">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.CARD_BACKUP_TITLE }}</h1>
        <p class="desc">{{= i18n.welcome.CARD_BACKUP_DESC }}</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.welcome.CARD_BACKUP_ACTION }}</button>
            <span class="button-ignore">{{= i18n.ui.IGNORE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="tips">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.CARD_TIPS_TITLE }}</h1>
        <p class="desc">{{= i18n.welcome.GUIDE_TIPS_TIP }}</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.misc.VIEW }}</button>
            <span class="button-ignore">{{= i18n.ui.IGNORE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="weibo">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.CARD_WEIBO_TITLE }}</h1>
        <p class="desc">{{= i18n.welcome.CARD_WEIBO_DESC }}</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="http://weibo.com/wandoulabs" target="_default">{{= i18n.welcome.CARD_WEIBO_ACTION }}</a>
            <span class="button-ignore">{{= i18n.ui.IGNORE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="changelog">
    <div class="icon-ctn">
        {{? it.icon }}
        <img src={{= it.icon }} alt="" />
        {{?}}
    </div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.UPDATED }}</h1>
        <p class="desc text-thirdly">
            {{? Settings.get('latestVersion') }}
            {{= Settings.get('latestVersion') + ' -> ' + Environment.get('backendVersion') }}
            {{??}}
            {{= Environment.get('backendVersion') }}
            {{?}}
        </p>
        <p class="info text-secondary">{{= it.subtitle }}
        </p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.misc.VIEW }}</button>
            <span class="button-ignore text-thirdly">{{= i18n.ui.IGNORE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="item-list-card">
    <div class="icon-ctn">
        <div class="text-primary title">{{! it.title }}</div>
    </div>
    <ul class="info-ctn">
        {{~ it.items : item }}
        <li class="item hbox">
            <img class="icon button-navigate" src="{{= CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP }}" alt="{{! item.title }}" data-key="{{= item.key }}" />
            <div class="info">
                <div class="wc title link button-navigate" data-key="{{= item.key }}">{{! item.title }}</div>
                <div class="text-thirdly wc">{{! item.tagline }}</div>
            </div>
            <button class="button-action" data-key="{{= item.key }}">{{= i18n.app.INSTALL }}</button>
        </li>
        {{~}}
    </ul>
    <div class="link button-more">{{= i18n.app.MORE }}</div>
</script>

<script type="text/x-ui-template" id="clock">
    <div class="time">{{= it.time }}</div>
    <div class="date-ctn">
        <div>{{= it.date }}</div>
        <div>{{= it.day }}</div>
    </div>
</script>

<script type="text/x-ui-template" id="device">
    <img class="shadow" src="images/shadow.png" alt="" />
    <div class="stage-ctn">
        <img class="shadow" alt="" src="images/shadow.png" />
        <div class="screen-wrap">
            <div class="screen-ctn vbox">
                <div class="screen">
                    <img class="screenshot" alt="" />
                </div>
            </div>
        </div>
        <div class="tip">
            <div class="icon"></div>
            <div class="des"></div>
        </div>
        <div class="offline-tip vbox">
            <div class="icon"></div>
            <div class="desc">{{= i18n.misc.SCREEN_SHOT_UNDER_USB }}</div>
        </div>
        {{= TemplateFactory.get('ui', 'loading-white') }}
    </div>
</script>

<script type="text/x-ui-template" id="toolbar">
    <span class="w-ui-buttongroup screen-shot-setting">
        <button class="w-icon-btn transparent min button-screen-shot">
            <span class="icon screenshot"></span>{{= i18n.welcome.SCREEN_SHOT_TEXT }}
        </button>
    </span>
    <button class="w-icon-btn button-backup transparent min">
        <span class="icon backup"></span>{{= i18n.welcome.TOOL_BACKUP }}
    </button>
    <button class="w-icon-btn button-restore transparent min">
        <span class="icon restore"></span>{{= i18n.welcome.TOOL_RECOVERY }}
    </button>
    <button class="w-icon-btn button-open-sd transparent min">
        <span class="icon sd-white"></span>{{= i18n.welcome.TOOL_SD }}
    </button>
    <button class="w-icon-btn button-set-wallpaper transparent min">
        <span class="icon wallpaper"></span>{{= i18n.photo.SET_AS_WALLPAPER }}
    </button>
    <div class='spliter'></div>
    <button class="button-top transparent min">{{= i18n.welcome.TOP }}</button>
</script>

<script type="text/x-ui-template" id="device-tools">
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-capture">
            <span class="icon capture"></span>
            {{= i18n.welcome.SCREEN_SHOT_TEXT }}
        </button>
    </div>
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-refresh">
            <span class="icon refresh"></span>
            {{= i18n.misc.REFRESH }}
        </button>
    </div>
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-play">
            <span class="icon play"></span>
            <span class="label">{{= i18n.misc.PLAY }}</span>
        </button>
    </div>
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-fullscreen">
            <span class="icon fullscreen"></span>
            {{= i18n.welcome.FULLSCREEN_BTN_TEXT }}
        </button>
    </div>
</script>

<script type="text/x-ui-template" id="capacity">
    <div class="w-welcome-capacity">
        {{ var percent = parseInt((it.internalCapacity - it.internalFreeCapacity) / it.internalCapacity * 100, 10); }}
        <div class="phone-capacity hbox{{? percent >= 90 }} outofspace{{?}}">
            <div class="title">{{= i18n.misc.PHONE }}</div>
            <progress class="progress{{? percent >= 90 }} highlight{{?}}" max="100" value="{{= percent }}" />
            <div class="ratio">
                <span class="{{? percent >= 90 }}text-warning{{?}}">{{= StringUtil.readableSize(it.internalCapacity - it.internalFreeCapacity) }}</span> / {{= StringUtil.readableSize(it.internalCapacity) }}
            </div>
        </div>
        {{ var percent =  parseInt((it.externalCapacity - it.externalFreeCapacity) / it.externalCapacity * 100, 10); }}
        <div class="external-capacity hbox{{? percent >= 90 }} outofspace{{?}}">
            <div class="title">{{= i18n.misc.SD_CARD }}</div>
            <progress class="progress{{? percent >= 90 }} highlight{{?}}" max="100" value="{{= percent }}" />
            <div class="ratio">
                <span class="{{? percent >= 90 }}text-warning{{?}}">{{= StringUtil.readableSize(it.externalCapacity - it.externalFreeCapacity) }}</span> / {{= StringUtil.readableSize(it.externalCapacity) }}
            </div>
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


<script type="text/x-ui-template" id="autobackup-tip">
    <div class="w-autobackup-tip">
        <span>{{= StringUtil.format(i18n.welcome.AUTO_BACKUP, it.date) }}</span>
        <span class="button-open">{{= i18n.welcome.OPEN_FOLDER }}</span>
    </div>
</script>
</templates>
