<templates>
<script type="text/x-ui-template" id="main">
    <div class="content vbox"></div>
    <ul class="step-counter-ctn hbox"></ul>
</script>

<script type="text/x-ui-template" id="bind">
    <div class="stage">
        <div class="bg"></div>
        <h1 class="text-secondary">{{= i18n.misc.BINDING_DEVICE }}</h1>
        <p class="text-secondary desc">{{= i18n.welcome.GUIDE_BIND_DESC }}</p>
        <div class="hbox success">
            <div class="icon-pass"></div>
            <p class="text-secondary">
                {{= StringUtil.format(i18n.welcome.GUIDE_BIND_SUCCESS, Device.get('deviceName')) }}
            </p>
        </div>
    </div>
    <nav class="control hbox">
        <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
        <button class="primary button-action">{{= it.action }}</button>
    </nav>
</script>

<script type="text/x-ui-template" id="cloud-backup">
    <section class="section vbox">
        <div class="stage vbox">
            <h1 class="text-secondary">{{= i18n.misc.CLOUD_BACKUP }}</h1>
            <p class="text-secondary desc">{{= i18n.welcome.GUIDE_BIND_DESC }}</p>
            <div class="bg"></div>
        </div>
        <nav class="control hbox">
            <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
            <button class="primary button-action">{{= it.action }}</button>
        </nav>
    </section>
    <section class="section vbox">
        <div class="stage vbox">
            <h1 class="text-secondary">{{= i18n.welcome.GUIDE_REG }}</h1>
            <p class="text-secondary desc">{{= i18n.welcome.GUIDE_REG_DESC }}</p>
            <form class="text-secondary">
                <label>
                    <div class="label">{{= i18n.misc.ACCOUNT }}</div>
                    <input type="text" class="username" placeholder="{{= i18n.welcome.GUIDE_REG_ACCOUNT_PLACEHOLDER }}" />
                    <div class="text-warning">{{= i18n.welcome.GUIDE_REG_ACCOUNT_WARN }}</div>
                </label>
                <label>
                    <div class="label">{{= i18n.welcome.GUIDE_REG_PASSWORD }}</div>
                    <input type="password" class="password" placeholder="{{= i18n.welcome.GUIDE_REG_PASSWORD_PLACEHOLDER }}" />
                    <div class="text-warning">{{= i18n.welcome.GUIDE_REG_PASSWORD_WARN }}</div>
                </label>
                <label>
                    <input type="password" class="password-verify" placeholder="{{= i18n.welcome.GUIDE_REG_PSW_VERIFY_PLACEHOLDER }}" />
                    <div class="text-warning">{{= i18n.welcome.GUIDE_REG_PSW_VERIFY_WARN }}</div>
                </label>
                <label>
                    <div class="label">{{= i18n.misc.NICKNAME }}</div>
                    <input type="text" class="nickname" placeholder="{{= i18n.misc.NICKNAME }}" />
                    <div class="text-warning">{{= i18n.welcome.GUIDE_REG_NICKNAME_WARN }}</div>
                </label>
                <label>
                    <div class="label">{{= i18n.welcome.GUIDE_REG_CAPTCHA }}</div>
                    <input type="text" class="captcha" />
                    <img src="https://account.wandoujia.com/v1/seccode/" class="captcha-image" title="点击更换" />
                </label>
                <label>
                    <input type="checkbox" class="pravicy" checked />{{= i18n.welcome.GUIDE_REG_PRAVICY }}
                </label>
            </form>
            <hr />
            <div class="login-ctn hbox">
                <span class="link button-login">{{= i18n.welcome.GUIDE_REG_LOGIN_WITH_ACCOUNT }}</span>
                <span>{{= i18n.welcome.GUIDE_REG_LOGIN_WITH_SNS }}</span>
                <ul class="sns-login">
                    <li class="button-weibo"></li>
                    <li class="button-qq"></li>
                    <li class="button-renren"></li>
                </ul>
            </div>
        </div>
        <nav class="control hbox">
            <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
            <button class="primary button-reg">{{= i18n.welcome.GUIDE_REG_NOW }}</button>
        </nav>
    </section>
    <section class="section vbox">
        <div class="stage">
            <div class="hbox">
                <hr />
                <div class="log"></div>
                <hr />
            </div>
            <div class="hbox success">
                <div class="icon-pass"></div>
                <p class="text-secondary">
                    {{= i18n.welcome.GUIDE_CLOUD_BACKUP_SUCCESS }}
                </p>
            </div>
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
        <span class="link button-skip">{{= i18n.ui.SKIP }}</span>
        <button class="primary button-action">{{= it.action }}</button>
    </nav>
</script>

<script type="text/x-ui-template" id="starter">
    <div class="stage">
        {{? it.type === 0 }}
        <h1 class="text-secondary">{{= i18n.welcome.GUIDE_STARTER_TITLE }}</h1>
        <p class="text-secondary">{{= i18n.welcome.GUIDE_STARTER_TIP }}</p>
        {{??}}
        <h1 class="text-secondary">{{= i18n.welcome.GUIDE_STARTER_GAME_TITLE }}</h1>
        <p class="text-secondary">{{= i18n.welcome.GUIDE_STARTER_GAME_TIP }}</p>
        {{?}}
        <ul class="app-ctn">
        {{~ it.apps : app }}
        <li class="app cf" data-title="{{= StringUtil.format(i18n.welcome.GUIDE_STARTER_APP_TIP, StringUtil.shortenQuantity(app.downloadCount), app.likesRate, app.tagline)}}">
            <img class="icon" alt="{{! app.title }}" src="{{= app.icons.px68 }}" />
            {{? app.ad }}
            <div class="ad"></div>
            {{?}}
            <div class="title wc">{{! app.title }}</div>
            <button data-url="{{= window.encodeURIComponent(app.apks[0].downloadUrl.url) }}" class="button-install min" data-name="{{! app.title }}" data-icon="{{= app.icons.px68 }}">{{= i18n.app.INSTALL }}</button>
        </li>
        {{~}}
        </ul>
    </div>
    <nav class="control hbox">
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
            <img class="icon" alt="{{! tip.desc }}" src="{{= tip.icon }}" />
            <div class="desc">{{! tip.desc }}</div>
            <a class="link button-open" target="_default" href="{{= tip.url }}">{{= i18n.misc.VIEW }}</a>
        </li>
        {{~}}
        </ul>
    </div>
    <nav class="control hbox">
        <button class="primary button-action">{{= it.action }}</button>
    </nav>
</script>

<script type="text/x-ui-template" id="suggestion">
    <div class="stage text-secondary vbox">
        <h1>{{= i18n.welcome.GUIDE_SUGGESTION }}</h1>
        <p>{{= i18n.welcome.GUIDE_SUGGESTION_TIP }}</p>
        <ul class="item-ctn">
        {{~ it.items : item}}
        <li class="item button-open" data-id="{{= item.extensionId }}">
            <img src="{{= item.banner }}" />
        </li>
        {{~}}
        </ul>
    </div>
    <nav class="control hbox">
        <button class="primary button-skip">{{= it.action }}</button>
    </nav>
</script>
</templates>
