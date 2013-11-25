<templates>
<script type="text/x-ui-template" id="menu-item">
    {{? it.inWhiteList }}
    <div class="icon category dor-{{= it.id }}"></div>
    {{??}}
    <div class="icon category">
        <img class="img" src="{{= CONFIG.enums.DEFAULT_30X30 }}"/>
    </div>
    {{?}}
    {{= it.name }}
</script>

<script type="text/x-ui-template" id="gallery-switch">
    <div class="icon category"></div>
    <div class="label">{{= it.name }}</div>
    <div class="button-management" data-title="{{= i18n.misc.MANGEMENT }}"></div>
</script>

<script type="text/x-ui-template" id="gallery-optimize">
    <div class="icon nav-optimize"></div>
    {{= it.label }}
</script>

<script type="text/x-ui-template" id="extension-item">
    <label class="input item-checker-wrap">
        <input class="item-checker" type="checkbox" value="{{= it.id }}">
    </label>
    <div class="icon"><img src="images/icon_default_extention.png" alt="{{! it.name }}" /></div>
    <div class="name">{{! it.name }}</div>
    {{? it.dev_mode }}
    <div class="dev-mode">
        <span>{{= i18n.misc.LOCALE_EXTENTION }}</span>
        <span class="link button-zip">{{= i18n.misc.ZIP_EXTENTION }}</span>
        <span class="link button-reload">{{= i18n.misc.RELOAD_EXTENTION }}</span>
        <span class="link button-publish">{{= i18n.misc.PUBLISH }}</span>
    </div>
    {{??}}
    <div class="developer wc">{{! it.developer }}</div>
    <div class="category" wc>{{! it.catetitle }}</div>
    <div class="fav">{{= it.fav }}</div>
    {{?}}
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn button-gallery primary min">
        <span class="icon add"></span>{{= i18n.misc.ADD_COLLECT }}
    </button>
    <button class="w-icon-btn button-up min">
        <span class="icon up"></span>{{= i18n.misc.MOVE_UP }}
    </button>
    <button class="w-icon-btn button-down min">
        <span class="icon move-down"></span>{{= i18n.misc.MOVE_DOWN }}
    </button>
    <div class="split"></div>
    <button class="w-icon-btn button-unstar min">
        <span class="icon delete"></span>{{= i18n.misc.REMOVE_COLLECT }}
    </button>
    <div class="flex-right hbox">
        <div class="debug-wrap hbox">
            <div class="text-secondary">{{= i18n.misc.DEVELOPER_LABEL }}</div>
            <button class="button-load-extention min">{{= i18n.misc.LOAD_EXTENTION }}</button>
        </div>
        <div class="split"></div>
        <button class="w-icon-btn button-reset min">
            <span class="icon reset"></span>
            {{= i18n.misc.REST_EXTENTION }}
        </button>
    </div>
</script>

<script type="text/x-ui-template" id="extension-list">
    <header class="w-smart-list-header text-secondary hbox">
        <div class="name">{{= i18n.misc.SITE_NAME }}</div>
        <div class="developer">{{= i18n.misc.DEVELOPER }}</div>
        <div class="category">{{= i18n.misc.CATEGORY }}</div>
        <div class="fav">{{= i18n.misc.POPULARITY }}</div>
    </header>
</script>

<script type="text/x-ui-template" id="report">
    <p class="text-secondary">{{= i18n.misc.REPORT_TIP }}</p>
    <form method="post" name="report" class="form-report" action="{{= CONFIG.enums.REPORT_URL }}" onsubmit="return false;">
        <p class="hbox">
            <span class="label text-secondary">{{= i18n.misc.REPORT_SITE_NAME }}</span>
            {{= it.name }}
        </p>
        <p>
            <label class="email-label hbox">
                <span class="label text-secondary">{{= i18n.misc.EMAIL_LABEL }}</span>
                <input type="text" name="email" class="input-email" pattern="^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$" />
            </label>
        </p>
        <label class="content-label hbox text-secondary" >
            <div class="label">{{= i18n.misc.PROBLEM_DES }}</div>
            <textarea name="content" class="input-content"></textarea>
        </label>
        <input type="hidden" name="id" class="input-id" value="{{= it.id }}" />
    </form>
</script>

<script type="text/x-ui-template" id="info-panel">
    <div class="icon">
        <img src="{{= it.icon }}" alt="{{= it.name }}" />
    </div>
    <div class="content vbox">
        <div class="title">{{= it.name }}</div>
        <div class="des wc text-secondary">{{= it.desc }}</div>
        <div>
            <button class="button-star primary">{{= i18n.misc.ADD_TO_COLLECT }}</button>
            <span class="tip text-thirdly">{{= StringUtil.format(i18n.misc.STARRED_COUNT, it.fav) }}</span>
        </div>
    </div>
    <div class="button-close"></div>
    <div class="arrow"></div>
</script>

<script type="text/x-ui-template" id="browser">
    <div class="browser-ctn">
        <iframe class="browser" id="{{= _.uniqueId('wdj_extention_window_') }}" branch="{{= _.uniqueId('wdj_extention_window_branch_') }}"></iframe>
        <div class="flash-notifier hbox">
            <div class="des">{{= i18n.misc.FLASH_NOTIFIER }}</div>
            <button class="button-install-flash">{{= i18n.misc.DOWNLOAD_FLASH }}</button>
            <div class="button-close-flash-notifier"></div>
        </div>
        <div class="progress">
            <div class="value">
                <div class="shinning"></div>
            </div>
        </div>
    </div>
</script>

<script type="text/c-ui-template" id="app-dependency">
    <div class="ctn hbox">
        <span class="text-secondary">{{= StringUtil.format(i18n.misc.APP_DEPENDENCY_TIP, it.title) }}</span>
        <div class="icon">
            <img src="{{= CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP }}" alt="{{= it.title }}" />
        </div>
        <div class="info">
            <span>{{= it.title }}</span>
            <span class="tip text-secondary">{{= StringUtil.readableSize(it.apks[0].bytes) }}</span>
            <span class="tip text-secondary">{{= StringUtil.format(i18n.app.DOWNLOAD_COUNT_TIP, StringUtil.shortenQuantity(it.downloadCount)) }}</span>
            <button class="primary button-install">{{= i18n.app.INSTALL }}</button>
        </div>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="browser-toolbar">
    {{? it.id.toString() !== '305' }}
    <button class="w-icon-btn browser-nav button-star min">
        <span class="icon star"></span>
    </button>
    <span class="developer-wrap hbox">
        <div class="split"></div>
        <div class="label text-secondary">{{= i18n.misc.DEVELOPER_LABEL }}</div>
        <button class="w-icon-btn browser-nav button-reload" title="{{= i18n.misc.RELOAD_EXTENTION }}">
            <span class="icon reload"></span>
        </button>
    </span>
    {{?}}
</script>

<script type="text/x-ui-template" id="browser-menu">
    {{? it.extension }}
        <li class="root-item selected" data="{{= it.extension.app.launch.web_url }}">
            {{= it.extension.app.label ? it.extension.app.label : i18n.misc.HOME_PAGE }}
        </li>
        {{~ it.extension.app.navigation : item }}
        <li class="root-item" data="{{= item.web_url }}">
            {{= item.label }}
        </li>
        {{~}}
    {{?}}
</script>
</templates>
