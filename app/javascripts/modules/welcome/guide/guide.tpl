<templates>
<script type="text/x-ui-template" id="main">
    <div class="content vbox"></div>
</script>

<script type="text/x-ui-template" id="bind">
    <div class="stage">
        <div class="bg"></div>
        <h1 class="text-secondary">{{= i18n.misc.BINDING_DEVICE }}</h1>
        <p class="text-thirdly desc">{{= i18n.welcome.GUIDE_BIND_DESC }}</p>
        <div class="hbox success">
            <div class="icon-pass"></div>
            <p class="text-thirdly">
                {{= StringUtil.format(i18n.welcome.GUIDE_BIND_SUCCESS, Device.get('deviceName')) }}
            </p>
        </div>
    </div>
    <nav class="control hbox">
        <div class="text-counter text-thirdly"></div>
        <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
        <button class="primary button-action">{{= it.action }}</button>
    </nav>
</script>

<script type="text/x-ui-template" id="cloud-backup">
    <section class="section vbox">
        <div class="stage hbox">
            <div class="text">
                <h1 class="text-secondary">{{= i18n.misc.CLOUD_BACKUP }}</h1>
                <p class="text-thirdly desc">{{= i18n.welcome.GUIDE_BIND_DESC }}</p>
            </div>
            <div class="bg"></div>
        </div>
        <nav class="control hbox">
            <div class="text-counter text-thirdly"></div>
            <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
            <button class="primary button-action grand">{{= it.action }}</button>
        </nav>
    </section>
    <section class="section vbox">
        <div class="stage hbox">
            <div class="text">
                <h1 class="text-secondary">{{= i18n.misc.CLOUD_BACKUP }}</h1>
                <p class="text-thirdly desc">
                    <span class="icon-pass"></span>
                    <span class="text-secondary">{{= i18n.welcome.GUIDE_CLOUD_BACKUP_SUCCESS }}</span>
                </p>
            </div>
            <div class="bg"></div>
        </div>
    </section>
</script>

<script type="text/x-ui-template" id="xibaibai">
    <div class="stage text-secondary">
        <h1 class="title">{{= i18n.app.APP_WASH }}</h1>
        <p>{{= i18n.app.SCAN_TIP1 }}</p>
        <p>{{= i18n.welcome.GUIDE_XIBAIBAI_TIP2 }}</p>
        <p>{{= i18n.welcome.GUIDE_XIBAIBAI_TIP3 }}</p>
        <div class="bg"></div>
    </div>
    <nav class="control hbox">
        <div class="text-counter text-thirdly"></div>
        <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
        <button class="primary button-action grand">{{= it.action }}</button>
    </nav>
</script>

<script type="text/x-ui-template" id="starter">
    <div class="stage">
        {{? it.type === 0 }}
        <h1 class="text-secondary">{{= i18n.welcome.GUIDE_STARTER_TITLE }}</h1>
        <p class="text-thirdly">{{= i18n.welcome.GUIDE_STARTER_TIP }}</p>
        {{??}}
        <h1 class="text-secondary">{{= i18n.welcome.GUIDE_STARTER_GAME_TITLE }}</h1>
        <p class="text-thirdly">{{= i18n.welcome.GUIDE_STARTER_GAME_TIP }}</p>
        {{?}}
        <ul class="app-ctn">
        {{~ it.apps : app }}
        <li class="app cf" data-title="{{= StringUtil.format(i18n.welcome.GUIDE_STARTER_APP_TIP, StringUtil.shortenQuantity(app.downloadCount), app.likesRate, app.tagline)}}">
            <img class="icon" alt="{{! app.title }}" src="{{= app.icons.px68 }}" />
            {{? app.ad }}
            <div class="ad"></div>
            {{?}}
            <div class="title wc">{{! app.title }}</div>
            <button data-packagename= "{{= app.apks[0].packageName }}" data-url="{{= window.encodeURIComponent(app.apks[0].downloadUrl.url) }}" class="button-install min" data-name="{{! app.title }}" data-icon="{{= app.icons.px68 }}">{{= i18n.app.INSTALL }}</button>
        </li>
        {{~}}
        </ul>
    </div>
    <nav class="control hbox">
        <div class="text-counter text-thirdly"></div>
        <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
        <button class="primary button-action">{{= it.action }}</button>
    </nav>
</script>

<script type="text/x-ui-template" id="tips">
    <div class="stage text-secondary">
        <h1>{{= i18n.welcome.GUIDE_TIPS }}</h1>
        <p>{{= i18n.welcome.GUIDE_TIPS_TIP }}</p>
        <ul class="tip-ctn">
        {{~ it.tips : tip}}
        <li class="tip hbox">
            <span class="icon icon-{{= tip.icon }}"></span>
            <div class="desc"><span class="link button-open" data-id="{{= tip.id }}">{{! tip.desc }}</span></div>
        </li>
        {{~}}
        </ul>
    </div>
    <nav class="control hbox">
        <div class="text-counter text-thirdly"></div>
        <button class="primary button-action">{{= it.action }}</button>
    </nav>
</script>
</templates>

