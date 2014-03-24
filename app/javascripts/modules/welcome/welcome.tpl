<templates>
<script type="text/x-ui-template" id="welcome">
    <div class="bg">
        <div class="mask"></div>
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
    <img class="icon button-navigate" alt="{{! it.title }}" />
    <div class="info-ctn vbox">
        <div class="info-top hbox">
            <div class="info">
                <h1 class="title link button-navigate wc" title="{{! it.title }}">{{! it.title }}</h1>
                <span class="cate text-thirdly">
                    {{= StringUtil.format(i18n.welcome.CARD_APP_TAG_LINE, it.categories[0] ? it.categories[0].name : '', it.installedCountStr) }}
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

<script type="text/x-ui-template" id="tieba">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.CARD_TIEBA_TITLE }}</h1>
        <p class="desc">{{= i18n.welcome.CARD_TIEBA_DESC }}</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="http://tieba.baidu.com/f?ie=utf-8&kw=%E8%B1%8C%E8%B1%86%E8%8D%9A" target="_default">{{= i18n.welcome.CARD_WEIBO_ACTION }}</a>
            <span class="button-ignore">{{= i18n.ui.IGNORE }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="changelog">
    <div class="icon-ctn">
        {{? it.icon }}
        <img class="img" src={{= it.icon }} alt="" />
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

<script type="text/x-ui-template" id="p2p">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.P2PTITLE }}</h1>
        <p class="info text-secondary">{{= i18n.welcome.P2PDESCRIPTION }}</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.welcome.GOTIT }}</button>
            <span class="button-ignore button-setup text-thirdly">{{= i18n.welcome.SETTING }}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-web">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">SnapPea Web</h1>
        <p class="desc">Your photos, messages, contacts and apps from your browser</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="http://www.snappea.com/" target="_default">Try it now</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-feedback">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">How are we doing?</h1>
        <p class="desc">Take our 3-minute.<br />We&rsquo;d love to get your feedback.</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="https://snappea.wufoo.com/forms/snappea-for-windows-user-satisfaction-survey/" target="_default">Take me there</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-photos">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">SnapPea Photos Chrome Extension</h1>
        <p class="desc">All your photos in just one click</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="https://chrome.google.com/webstore/detail/snappea-photos/epindigjbiphgfhnmlpcocaiafjgbabe" target="_default">Get it now</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-facebook">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">SnapPea is on Facebook</h1>
        <p class="desc">Like SnapPea to get tips & news!</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="https://www.facebook.com/SnapPeaInc" target="_default">Go to Facebook</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-itunes">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">iTunes Movies</h1>
        <p class="desc">Download free movie trailers</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.misc.OPEN }}</button>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-youtube">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">YouTube</h1>
        <p class="desc">Download from PC, watch on your phone</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.misc.OPEN }}</button>
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

<script type="text/x-ui-template" id="account">
    {{? FunctionSwitch.IS_CHINESE_VERSION }}
    {{? it.isLogin }}
    <span class="button-user wc">{{= StringUtil.format(i18n.welcome.ACCOUNT_GREETING_FORMAT, it.greeting, it.userName) }}</span>
    {{??}}
    <span class="button-register">{{= i18n.welcome.ACCOUNT_UNLOGIN_TEXT }}</span>
    {{?}}
    {{?}}
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
        <button class="w-icon-btn transparent min button-screen-shot" data-title="{{= i18n.welcome.READING_INFO_WARNING }}">
            <span class="icomoon icomoon-screenshot"></span>{{= i18n.welcome.SCREEN_SHOT_TEXT }}
        </button>
    </span>
    {{? FunctionSwitch.ENABLE_BACKUP_RESTORE }}
    <button class="w-icon-btn button-backup transparent min">
        <span class="icomoon icomoon-backup"></span>{{= i18n.welcome.TOOL_BACKUP }}
    </button>
    <button class="w-icon-btn button-restore transparent min">
        <span class="icomoon icomoon-restore"></span>{{= i18n.welcome.TOOL_RECOVERY }}
    </button>
    {{?}}
    <button class="w-icon-btn button-open-sd transparent min" data-title="{{= i18n.welcome.READING_INFO_WARNING }}">
        <span class="icomoon icomoon-sd"></span>{{= i18n.misc.MANAGE_SD_CARD }}
    </button>
    {{? FunctionSwitch.IS_CHINESE_VERSION }}
    <button class="w-icon-btn button-set-wallpaper transparent min" data-title="{{= i18n.welcome.READING_INFO_WARNING }}">
        <span class="icomoon icomoon-wallpaper"></span>{{= i18n.photo.SET_AS_WALLPAPER }}
    </button>
    {{?}}
    <div class='spliter'></div>
    <button class="button-top transparent min">{{= i18n.welcome.TOP }}</button>
</script>

<script type="text/x-ui-template" id="capacitybar">
    <div class="info hbox">
        <div class="info-device hbox">
            <span class="icomoon icomoon-device"></span>
            {{ var percent = parseInt((it.deviceCapacity - it.deviceFreeCapacity) / it.deviceCapacity * 100, 10); }}
            <progress class="progress{{? percent >= 90 }} highlight{{?}}" max="100" value="{{= percent }}" />
        </div>
        {{? it.internalSDCapacity > 0 }}
        <div class="info-sd-internal hbox" data-path="{{= it.internalSDPath }}">
            <span class="icomoon icomoon-sd{{? it.externalSDCapacity > 0 }}-first{{?}}"></span>
            {{ var percent = parseInt((it.internalSDCapacity - it.internalSDFreeCapacity) / it.internalSDCapacity * 100, 10); }}
            <progress class="progress{{? percent >= 90 }} highlight{{?}}" max="100" value="{{= percent }}" />
        </div>
        {{?}}
        {{? it.externalSDCapacity > 0 }}
        <div class="info-sd-external hbox" data-path="{{= it.externalSDPath }}">
            <span class="icomoon icomoon-sd{{? it.internalSDCapacity > 0 }}-second{{?}}"></span>
            {{ var percent = parseInt((it.externalSDCapacity - it.externalSDFreeCapacity) / it.externalSDCapacity * 100, 10); }}
            <progress class="progress{{? percent >= 90 }} highlight{{?}}" max="100" value="{{= percent }}" />
        </div>
        {{?}}
    </div>
</script>

<script type="text/x-ui-template" id="device-tools">
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-capture">
            <span class="icomoon icomoon-screenshot"></span>
            {{= i18n.welcome.SCREEN_SHOT_TEXT }}
        </button>
    </div>
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-refresh">
            <span class="icomoon icomoon-refresh"></span>
            {{= i18n.misc.REFRESH }}
        </button>
    </div>
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-play">
            <span class="icomoon icomoon-play"></span>
            <span class="label">{{= i18n.misc.PLAY }}</span>
        </button>
    </div>
    <div class="btn-ctn">
        <button class="w-icon-btn transparent min button-fullscreen">
            <span class="icomoon icomoon-fullscreen"></span>
            {{= i18n.welcome.FULLSCREEN_BTN_TEXT }}
        </button>
    </div>
</script>

<script type="text/x-ui-template" id="file-tools">
    <button class="button-open-sd min">{{= i18n.misc.MANAGE_SD_CARD }}</button>
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
