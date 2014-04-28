<templates>
<script type="text/x-ui-template" id="welcome">
    <div class="bg">
        <div class="mask"></div>
        <div class="gradient"></div>
    </div>
    <div class="top hbox"></div>
    {{= TemplateFactory.get('ui', 'loading-horizental-transparent') }}
</script>

<script type="text/x-ui-template" id="app-card">
    <img class="icon" alt="{{! it.title }}" src='{{= CONFIG.enums.IMAGE_PATH + "/default-app-100X100.png" }}'/>
    <div class="info-ctn vbox">
        <div class="info-top hbox">
            <div class="info">
                <h1 class="title button-navigate wc link" title="{{! it.title }}">{{! it.title }}</h1>
            </div>
            <button class="button-action action"></button>
        </div>
        <span class="cate text-thirdly">
            {{= StringUtil.format(i18n.welcome.CARD_APP_TAG_LINE, it.installedCountStr, it.readAbleSize) }}
        </span>
        <div class="comment text-secondary">{{! it.editorComment }}</div>
    </div>
    <div class="tag">
        {{? it.appType === 'APP' }}
        {{= i18n.misc.APP }}
        {{??}}
        {{= i18n.misc.GAME }}
        {{?}}
    </div>
    <div class="ad-badge"></div>
</script>

<script type="text/x-ui-template" id="video-card">
    <img class="icon" alt="{{! it.title }}" />
    <div class="info-ctn vbox">
        <div class="info-top hbox">
            <div class="info">
                <h1 class="title button-navigate wc link" title="{{! it.title }}">{{! it.title }}</h1>
            </div>
            <button class="button-action action">{{! i18n.welcome.CARD_VIDEO_OFFLINE }}</button>
        </div>
        <span class="cate text-thirdly">
            {{? it.downloadCount > 10000 }}
            {{= StringUtil.format(i18n.welcome.CARD_VIDEO_TAG_LINE_2, Math.round(it.downloadCount / 10000), it.latestEpisodeNum ? (it.latestEpisodeNum < it.totalEpisodesNum ? StringUtil.format(i18n.welcome.CARD_VIDEO_UPDATE_TO, it.latestEpisodeNum) : StringUtil.format(i18n.welcome.CARD_VIDEO_COMPLATE, it.totalEpisodesNum)) : '') }}
            {{??}}
            {{= StringUtil.format(i18n.welcome.CARD_VIDEO_TAG_LINE_1, it.downloadCount, it.latestEpisodeNum ? (it.latestEpisodeNum < it.totalEpisodesNum ? StringUtil.format(i18n.welcome.CARD_VIDEO_UPDATE_TO, it.latestEpisodeNum) : StringUtil.format(i18n.welcome.CARD_VIDEO_COMPLATE, it.totalEpisodesNum)) : '') }}
            {{?}}
        </span>
        <div class="comment text-secondary">{{! it.description }}</div>
        <div class="tag">
            {{! i18n.misc.VIDEO }}
        </div>
    </div>
    <div class="ad-badge"></div>
</script>

<script type="text/x-ui-template" id="ebook-card">
    <img class="icon" alt="{{! it.title }}" />
    <div class="info-ctn vbox">
        <div class="info-top hbox">
            <div class="info">
                <h1 class="title button-navigate wc link" title="{{! it.title }}">{{! it.title }}</h1>
            </div>
            <button class="button-action action">{{! i18n.welcome.CARD_VIDEO_OFFLINE }}</button>
        </div>
        <span class="cate text-thirdly">
            {{? it.readCount > 10000 }}
            {{= StringUtil.format(i18n.welcome.CARD_EBOOK_TAG_LINE_2, Math.round(it.readCount / 10000), i18n.welcome['CARD_EBOOK_STATUS_' + it.status]) }}
            {{??}}
            {{= StringUtil.format(i18n.welcome.CARD_EBOOK_TAG_LINE_1, it.readCount, i18n.welcome['CARD_EBOOK_STATUS_' + it.status]) }}
            {{?}}
        </span>
        <div class="comment text-secondary">{{! it.description }}</div>
        <div class="tag">
            {{! i18n.misc.EBOOK }}
        </div>
    </div>
    <div class="ad-badge"></div>
</script>

<script type="text/javascript" id="banner-card">
    <img class="icon" alt="{{! it.title }}" />
    <div class="info-ctn hbox">
        <div class="info">
            <h1 class="title button-navigate wc link" title="{{! it.title}}">{{! it.title }}</h1>
        </div>
        <button class="button-action action"></button>
    </div>
</script>

<script type="text/x-ui-template" id="p2p">
    <div class="info-ctn hbox">
        <div class="icon-ctn"></div>
        <div class="top-ctn">
            <h1 class="title">{{= i18n.welcome.P2PTITLE }}</h1>
            <p class="info text-secondary">{{= i18n.welcome.P2PDESCRIPTION }}</p>
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-setup text-thirdly">{{= i18n.welcome.SETTING }}</span>
        <button class="button-ignore link action">{{= i18n.welcome.GOTIT }}</button>
    <div>
</script>

<script type="text/x-ui-template" id="backup">
    <div class="info-ctn hbox">
        <div class="icon-ctn"></div>
        <div class="top-ctn">
            <h1 class="title">{{= i18n.welcome.CARD_BACKUP_TITLE }}</h1>
            <p class="info text-secondary">{{= i18n.welcome.CARD_BACKUP_DESC }}</p>
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.welcome.I_KNOW }}</span>
        <button class="button-action action">{{= i18n.welcome.CARD_BACKUP_ACTION }}</button>
    <div>
</script>

<script type="text/x-ui-template" id="tips">
    <div class="info-ctn hbox">
        <div class="icon-ctn"></div>
        <div class="top-ctn">
            <h1 class="button-navigate title">{{= i18n.welcome.CARD_TIPS_TITLE }}</h1>
            <p class="info text-secondary">{{= i18n.welcome.GUIDE_TIPS_TIP }}</p>
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.welcome.I_KNOW }}</span>
        <button class="button-action action">{{= i18n.misc.VIEW }}</button>
    <div>
</script>

<script type="text/x-ui-template" id="changelog">
    <div class="info-ctn hbox">
        <div class="icon-ctn">
            {{? it.icon }}
            <img class="img" src={{= it.icon }} alt="" />
            {{?}}
        </div>
        <div class="top-ctn">
            <h1 class="title link">{{= i18n.welcome.UPDATED }}</h1>
            <p class="info text-secondary">
                {{? Settings.get('latestVersion') }}
                {{= Settings.get('latestVersion') + ' -> ' + Environment.get('backendVersion') }}
                {{??}}
                {{= Environment.get('backendVersion') }}
                {{?}}
            </p>
            {{? it.subtitle }}
            <p class="info text-secondary">{{= it.subtitle }}</p>
            {{?}}
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.welcome.I_KNOW }}</span>
        <button class="button-action action">{{= i18n.misc.VIEW }}</button>
    <div>
</script>

<script type="text/x-ui-template" id="cloud-photo">
    <div class="info-ctn hbox">
        <div class="icon-ctn"></div>
        <div class="top-ctn">
            <h1 class="title">{{= i18n.welcome.CARD_CLOUD_PHOTO_TITLE }}</h1>
            <p class="info text-secondary">{{= i18n.welcome.CARD_CLOUD_PHOTO_DESC }}</p>
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.welcome.I_KNOW }}</span>
        <button class="button-action action">{{= i18n.welcome.CARD_CLOUD_PHOTO_OPEN }}</button>
    <div>
</script>

<script type="text/x-ui-template" id="weibo">
    <div class="info-ctn hbox">
        <div class="icon-ctn"></div>
        <div class="top-ctn">
            <h1 class="title link">{{= i18n.welcome.CARD_WEIBO_TITLE }}</h1>
            <p class="info text-secondary">{{= i18n.welcome.CARD_WEIBO_DESC }}</p>
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.ui.IGNORE }}</span>
        <button class="button-action action">{{= i18n.welcome.CARD_WEIBO_ACTION }}</button>
    <div>
</script>

<script type="text/x-ui-template" id="tieba">
    <div class="info-ctn hbox">
        <div class="icon-ctn"></div>
        <div class="top-ctn">
            <h1 class="title link">{{= i18n.welcome.CARD_TIEBA_TITLE }}</h1>
            <p class="info text-secondary">{{= i18n.welcome.CARD_TIEBA_DESC }}</p>
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.ui.IGNORE }}</span>
        <button class="button-action action">{{= i18n.welcome.CARD_WEIBO_ACTION }}</button>
    <div>
</script>

<script type="text/javascript" id="update-card">
    <h1 class="title">
    {{? it.length > 1 }}
    {{= StringUtil.format(i18n.welcome.CARD_UPDATE_TITLE, it.length) }}
    {{??}}
    {{= StringUtil.format(i18n.welcome.CARD_UPDATE_ONE_TITLE) }}
    {{?}}
    </h1>
    <ul class="apps-list">
        {{~ it.items : item : index}}
            <li class="item hbox {{? it.items.length === 1 }}no-border{{?}}" title="{{= item.base_info.name }}">
                <img class="icon" src="{{= item.base_info.icon }}" alt="{{= item.base_info.name }}" />
                <div class="info-ctn vbox">
                    <h1 class="info">{{= item.base_info.name }}</h1>
                    <span class="text-thirdly wc">{{= StringUtil.format(i18n.welcome.CARD_UPDATE_INFO, item.upgrade_info.versionName, StringUtil.readableSize(item.upgrade_info.size)) }}</span>
                </div>
                <button class='button-update normal' data-id="{{= item.id}}" >{{= i18n.app.UPDATE }}</button>
            </li>
        {{~}}
    </ul>
    <div class="action-ctn {{? it.items.length < 3 }}no-padding{{?}}">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.welcome.I_KNOW }}</span>
        {{? it.length > 1 }}
        <button class="button-action action">{{= i18n.welcome.CARD_UPDATE_ACTION }}</button>
        {{?}}
    <div>
</script>

<script type="text/x-ui-template" id="xibaibai-card">
    <h1 class="title link">{{= StringUtil.format(i18n.welcome.CARD_XIBAIBAI_TITLE, it.length) }}</h1>
    <div class="info-ctn hbox">
        <div class="icon-ctn">
            {{~ it.items : item : index}}
                <img class="icon" src="{{= item.base_info.icon}}"  alt="{{= item.base_info.name }}"/>
            {{~}}
        </div>
        <div class="top-ctn">
            <p class="info text-secondary">{{= i18n.welcome.CARD_XIBAIBAI_DESC }}</p>
        </div>
    </div>
    <div class="action-ctn">
        <span class="button-ignore link button-setup text-thirdly">{{= i18n.ui.IGNORE }}</span>
        <button class="button-action action">{{= i18n.welcome.CARD_XIBAIBAI_ACTION }}</button>
    <div>
</script>

<script type="text/x-ui-template" id="snappea-web">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.SNAPPEA_WEB }}</h1>
        <p class="desc">{{= i18n.welcome.SNAPPEN_WEB_DES}}</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="http://www.snappea.com/" target="_default">{{= i18n.welcome.SNAPPEA_WEB_ACTION}}</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-feedback">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.SNAPPEA_FEEDBACK }}</h1>
        <p class="desc">{{= i18n.welcome.SNAPPEA_FEEDBACK_DESC }}</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="https://snappea.wufoo.com/forms/snappea-for-windows-user-satisfaction-survey/" target="_default">{{= i18n.welcome.SNAPPEA_FEEDBACK_ACTION }}</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-photos">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.SNAPPEA_PHOTO }}</h1>
        <p class="desc">{{= i18n.welcome.SNAPPEN_PHOTO_DES }}</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="https://chrome.google.com/webstore/detail/snappea-photos/epindigjbiphgfhnmlpcocaiafjgbabe" target="_default">{{= i18n.welcome.SNAPPEA_PHOTO_ACTION }}</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-facebook">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.SNAPPEA_FACEBOOK }}</h1>
        <p class="desc">{{= i18n.welcome.SNAPPEN_FACEBOOK_DES }}</p>
        <div class="btn-ctn hbox">
            <a class="button-action" href="https://www.facebook.com/SnapPeaInc" target="_default">{{= i18n.welcome.SNAPPEA_FACEBOOK_ACTION }}</a>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-itunes">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.SNAPPEA_ITUNES }}</h1>
        <p class="desc">{{= i18n.welcome.SNAPPEN_ITUNES_DES }}</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.misc.OPEN }}</button>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="snappea-youtube">
    <div class="icon-ctn"></div>
    <div class="info-ctn">
        <h1 class="title">{{= i18n.welcome.SNAPPEN_YOUTUBE_DES }}</h1>
        <p class="desc">{{= i18n.welcome.SNAPPEN_YOUTUBE_DES }}</p>
        <div class="btn-ctn hbox">
            <button class="button-action">{{= i18n.misc.OPEN }}</button>
        </div>
    </div>
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
    <img class="shadow" src="{{= CONFIG.enums.IMAGE_PATH }}/shadow.png" alt="" />
    <div class="stage-ctn">
        <img class="shadow" src="{{= CONFIG.enums.IMAGE_PATH }}/shadow.png" alt="" />
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
