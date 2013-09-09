<templates>
<script type="text/x-ui-template" id="default-panel">
    <div class="notifier-ctn">
        <div class="update-all">
            <button class="w-icon-btn button-update-all">
                <span class="icon update"></span>
                <span class="label"></span>
            </button>
            <div class="des text-thirdly"></div>
        </div>
        <div class="transfer-all">
            <button class="button-transfer-all"></button>
            <div class="des text-thirdly">
                {{= i18n.app.ONE_KEY_TRANSFER_DES }}
            </div>
        </div>
        <div class="wash">
            <button class="button-wash">{{= i18n.app.APP_WASH }}</button>
            <div class="des text-thirdly">
                {{= i18n.app.APP_WASH_DES }}
            </div>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="app-recommend-list">
    <h3 class="text-secondary"></h3>
    <ul class="list"></ul>
    <div class="tip text-thirdly"></div>
</script>

<script type="text/x-ui-template" id="app-recommend-item">
    <img class="icon button-navigate-to-detail" src="{{= CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP }}" alt="{{= it.app.title }}" />
    <div class="body vbox">
        <div class="title button-navigate-to-detail wc">{{= it.app.title }}</div>
        <div class="text-thirdly wc">
            {{? it.isDefaultPanel && it.recReason.reasonContent }}
            {{= StringUtil.format(i18n.app.SUGGESTION_REF, it.recReason.reasonContent) }}
            {{??}}
            {{= i18n.app.DOWNLOAD_COUNT }}
            {{= StringUtil.format(i18n.app.DOWNLOAD_COUNT_TIP, StringUtil.shortenQuantity(it.app.downloadCount)) }}
            {{?}}
        </div>
    </div>
    <button class="button-install primary min">{{= i18n.app.INSTALL }}</button>
    <div class="button-dislike" data-title="{{= i18n.app.DISLIKE }}"></div>
</script>

<script type="text/x-ui-template" id="application-commentary">
    {{
        var enjoyInfo = it.web_info || {};
    }}
    <div class="count-ctn hbox">
        <div class="rate vbox">
            <div class="title text-thirdly">{{= i18n.app.LIKE }}</div>
            <div class="like-count percent text-secondary button-navigate-to-detail">{{= enjoyInfo.likesCount || 0 }}</div>
        </div>
        <div class="split"></div>
        <div class="rate vbox">
            <div class="title text-thirdly">{{= i18n.app.COL_RATE_LABEL }}</div>
            <div class="percent text-secondary button-navigate-to-detail">{{= enjoyInfo.likesRate || 0 }}%</div>
        </div>
    </div>
    <div class="btn-ctn">
        <span class="w-ui-buttongroup">
            <button class="w-icon-btn button-like min" data-title="{{= i18n.app.LIKE }}"><span class="icon like"></span></button>
            <button class="w-icon-btn button-dislike min" data-title="{{= i18n.app.UNLIKE }}"><span class="icon dislike"></span></button>
        </span>
        <button class="w-icon-btn button-comment min"><span class="icon comment"></span>{{= i18n.app.COMMENTARY }}</button>
        <button class="w-icon-btn button-share min"><span class="icon share"></span>{{= i18n.misc.SHARE}}</button>
    </div>
    <div class="input-ctn">
        <textarea placeholder="{{= StringUtil.format(i18n.app.COMMENTARY_PLACEHOLDER, it.base_info.name) }}" class="input-content"></textarea>
        <div class="code-ctn">
            <div class="ctn hbox">
                <div class="text-secondary">验证码：</div>
                <input class="input-code" type="text" />
                <img class="code" title="点击更换" />
            </div>
        </div>
        <div class="hbox comment-actions">
            <div class="monitor text-secondary"></div>
            <button class="button-send primary min">{{= i18n.app.COMMENTARY }}</button>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="update-notification">
    <ul class="list-ctn"></ul>
    <div class="manage-ctn hbox">
        <div class="mid-ctn">
            <span class="button-manage-app link">{{= i18n.app.MANAGE_MY_APPS }}</span>
        </div>
        <button class="primary button-update-all">{{= i18n.app.UPDATE_ALL }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="update-notification-list-item">
    <div class="icon"><img src="{{= it.base_info.icon }}" alt="{{= it.base_info.name }}" /></div>
    <div class="base-info vbox">
        <div>{{= it.base_info.name }}</div>
        <div class="hbox" title="{{= i18n.app.COULD_UPDATE_TO }}v{{= it.upgrade_info.versionName }}(v{{= it.upgrade_info.versionCode }})">
            <span class="text-secondary version-name">
                v{{= it.base_info.version_name }}
                {{? it.upgrade_info.versionName !== it.base_info.version_name }}
                (v{{= it.base_info.version_code }})
                {{?}}
            </span>
            <span class="update-info text-primary wc">
                {{= i18n.app.COULD_UPDATE_TO }}v{{= it.upgrade_info.versionName }}
                {{? it.upgrade_info.versionName !== it.base_info.version_name }}
                (v{{= it.upgrade_info.versionCode }})
                {{?}}
            </span>
        </div>
    </div>
    <button class="primary button-update min">{{= i18n.app.UPDATE }}</button>
</script>

<script type="text/x-ui-template" id="detail-panel">
    <div class="app-info hbox">
        {{? /^file:\/\/\//.test(it.base_info.icon) }}
        <img title="{{= it.detail_page_info ? i18n.app.LOOK_FOR_DETAIL : i18n.app.APP_NOT_INDEXED }}" src="{{= it.base_info.icon }}" alt="{{! it.base_info.name }}" class="icon{{? it.detail_page_info && FunctionSwitch.IS_CHINESE_VERSION }} button-navigate-to-detail{{?}}" />
        {{??}}
        <img title="{{= it.detail_page_info ? i18n.app.LOOK_FOR_DETAIL : i18n.app.APP_NOT_INDEXED }}" src="{{= CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP }}" alt="{{! it.base_info.name }}" class="icon{{? it.detail_page_info && FunctionSwitch.IS_CHINESE_VERSION }} button-navigate-to-detail{{?}}" />
        {{?}}
        <div class="title vbox">
            {{? FunctionSwitch.ENABLE_APP_UPGRADE }}
            <div class="name wc{{? it.detail_page_info }} link button-navigate-to-detail{{?}}" title="{{= it.detail_page_info ? i18n.app.LOOK_FOR_DETAIL : i18n.app.APP_NOT_INDEXED }}">
                {{! it.base_info.name }}
            </div>
            {{??}}
            <div class="name wc">
                {{! it.base_info.name }}
            </div>
            {{?}}
            <div class="actions">
                {{? !it.isWeb }}
                {{? StringUtil.isURL(it.upgrade_info.downloadUrl) }}
                <button class="button-update min">{{= i18n.app.UPDATE }}</button>
                {{?}}
                {{? !it.base_info.is_system || (it.base_info.is_system && Device.get('isRoot')) }}
                <button class="button-uninstall min">{{= i18n.app.UNINSTALL }}</button>
                {{?}}
                {{??}}
                <button class="button-install min">{{= i18n.app.INSTALL }}</button>
                {{?}}
            </div>
        </div>
    </div>
    <dl class="cf">
        <dt class="text-thirdly">{{= i18n.app.VERSION }}</dt>
        {{
            var originVersion = it.base_info.version_name.replace(/^version|v|V/, '');
        }}
        {{? StringUtil.isURL(it.upgrade_info.downloadUrl) }}
        <dd class="hbox">
            <div class="version wc">
                v{{= originVersion }}
                {{

                    var targetVersion = it.upgrade_info.versionName.replace(/^version|v|V/, '');
                    var flag = (originVersion === targetVersion)
                                || (targetVersion.localeCompare(originVersion) === (-1));
                    if (flag) {
                        targetVersion += '(v' + it.upgrade_info.versionCode + ')';
                    }
                }}
                {{? flag }}
                    (v{{= it.base_info.version_code }})
                {{?}}
            </div>
            {{? it.detail_page_info }}
            <div class="link button-navigate-to-version">{{= i18n.app.VERSION_HISTORY }}</div>
            {{?}}
        </dd>
        <dt class="text-thirdly latest-version">{{= i18n.app.LATEST_VERSION }}</dt>
        <dd title="v{{= targetVersion }}" class="wc">v{{= targetVersion }}</dd>
        {{??}}
        <dd class="hbox">
            <div class="version wc">v{{= originVersion }}</div>
            {{? it.detail_page_info }}
            <div class="link button-navigate-to-version">{{= i18n.app.VERSION_HISTORY }}</div>
            {{?}}
        </dd>
        {{?}}
        {{? !it.isWeb }}
        <dt class="text-thirdly">{{= i18n.app.INSTALL_POSITION_LABEL }}</dt>
        <dd>
            {{? it.base_info.installed_location === CONFIG.enums.INSTALL_LOCATION_EXTENTION }}
            {{= i18n.misc.SD_CARD }}
            <span class="link button-move-to-device">{{= i18n.app.MOVE }}</span>
            {{??}}
            {{= i18n.misc.PHONE }}
            <span class="link button-move-to-sd-card">{{= i18n.app.MOVE }}</span>
            {{?}}
        </dd>
        {{?}}
        <dt class="text-thirdly">{{= i18n.app.SIZE }}</dt>
        <dd>{{= StringUtil.readableSize(it.base_info.apk_size) }}</dd>
        {{? FunctionSwitch.ENABLE_APP_UPGRADE }}
        {{? it.web_info && it.web_info.categories && it.web_info.categories.length > 0}}
        <dt class="text-thirdly">{{= i18n.app.CATEGORY }}</dt>
        <dd>
            {{~ it.web_info.categories : cate }}
            <span class="link button-navigate-to-category" data-cate="{{= cate.alias }}">{{= cate.name }}</span>
            {{~}}
        </dd>
        {{?}}
        {{?}}
        {{? FunctionSwitch.ENABLE_APP_PERMISSION }}
        <dt class="text-thirdly permission">{{= i18n.app.PERMISSON }}</dt>
        <dd class="permission">
            {{
                var important = [];
                var unimportant = [];
                _.map(it.base_info.permission_info, function(permission) {
                    if (permission.protection_level >= 1) {
                        important.push(permission);
                    } else {
                        unimportant.push(permission);
                    }
                });
            }}
            <ul class="permission-list">
                {{? important.length === 0 }}
                <li>{{= i18n.app.NO_SPECIAL_PERMISSION }}</li>
                {{?}}
                {{~ important : permission }}
                <li class="wc" title="{{= permission.name }}">{{= permission.name }}</li>
                {{~}}
            </ul>
            <ul class="permission-list unimportant">
                {{~ unimportant : permission }}
                <li class="wc" title="{{= permission.name }}">{{= permission.name }}</li>
                {{~}}
            </ul>
            {{? unimportant.length > 0 }}
            <span class="button-toggle-permission cf">
                <span class="link">{{= i18n.app.MORE }}</span>
                <span class="arrow">&raquo;</span>
            </span>
            {{?}}
        </dd>
        {{?}}
    </dl>
</script>

<script type="text/x-ui-template" id="batch-apps">
    <div class="title">
        <span class="count"></span>
        <span class="button-deselect link">{{= i18n.misc.DESELECT }}</span>
    </div>
    <div class="w-app-batch-list-ctn vbox"></div>
</script>

<script type="text/x-ui-template" id="app-list-item">
    {{? !!it.updateCategory }}
    {{? it.updateCategory === 'recommended' }}
    <div class="info hbox">
        <strong>{{= i18n.app.UPDATE_CATEGORY_RECOMMENDED }}</strong>
    </div>
    <div class="update hbox">
        <button class="button-update min" data-type="{{= it.updateCategory }}">{{= i18n.app.UPDATE_RECOMMENDED }}</button>
    </div>
    {{?? it.updateCategory === 'warning' }}
    <div class="info hbox">
        <strong>{{= i18n.app.UPDATE_CATEGORY_WARNING }}</strong>
    </div>
    {{??}}
    <div class="info hbox">
        <strong>{{= i18n.app.UPDATE_CATEGORY_NOT_RECOMMENDED }}</strong>
    </div>
    {{?}}
    {{??}}
    <label class="input item-checker-wrap hbox"><input class="item-checker" type="checkbox" value="{{= it.id }}"></label>
    <div class="info hbox">
        {{? /^file:\/\/\//.test(it.base_info.icon) }}
        <img class="icon" src="{{= it.base_info.icon }}" alt="{{! it.base_info.name }}" />
        {{??}}
        <img class="icon" src="{{= CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP }}" alt="{{! it.base_info.name }}" />
        {{?}}
        <div class="name wc">
            {{= it.base_info.name }}
            {{? StringUtil.isURL(it.upgrade_info.downloadUrl) }}
            <span class="version-tip text-secondary">
            {{
                var originVersion = it.base_info.version_name.replace(/^version|v|V/, '');
                var targetVersion = it.upgrade_info.versionName.replace(/^version|v|V/, '');
                var flag = (originVersion === targetVersion)
                            || (targetVersion.localeCompare(originVersion) === (-1));
                if (flag) {
                    originVersion += '(v' + it.base_info.version_code + ')';
                    targetVersion += '(v' + it.upgrade_info.versionCode + ')';
                }
            }}
            v{{= originVersion }}
            </span>
            {{?}}
        </div>
    </div>
    {{? StringUtil.isURL(it.upgrade_info.downloadUrl) }}
    <div class="current-version text-secondary wc" title="v{{= originVersion }}">v{{= originVersion }}</div>
    <div class="target-version text-secondary wc" title="v{{= targetVersion }}">
        <span class="latest-tip">{{= i18n.app.LATEST_LABEL }}</span>v{{= targetVersion }}
    </div>
    {{??}}
    <div class="current-version text-secondary wc" title="v{{= it.base_info.version_name.replace(/^version|v|V/, '') }}">
        v{{= it.base_info.version_name.replace(/^version|v|V/, '') }}
    </div>
    <div class="target-version wc"></div>
    {{?}}
    <div class="size text-secondary">
        {{= StringUtil.readableSize(it.base_info.apk_size) }}
    </div>
    {{? !it.isWeb }}
    <div class="location text-secondary">
        {{? it.base_info.installed_location === CONFIG.enums.INSTALL_LOCATION_EXTENTION }}
        {{= i18n.misc.SD_CARD }}
        {{??}}
        {{= i18n.misc.PHONE }}
        {{?}}
    </div>
    {{?}}
    {{? FunctionSwitch.ENABLE_APP_UPGRADE }}
    <div class="update hbox">
        {{? StringUtil.isURL(it.upgrade_info.downloadUrl) && !it.is_blocked }}
            {{? it.isUpdating }}
                <progress class="tiny" max="100" value="{{= it.progress }}"></progress>
                <span class="button-cancel link">{{= i18n.ui.CANCEL }}</span>
            {{??}}
                <button class="button-update min">{{= i18n.app.UPDATE }}</button>
                {{? !it.is_blocked }}
                    <span class="button-ignore link">{{= i18n.ui.IGNORE }}</span>
                {{?}}
            {{?}}
        {{?}}
    </div>
    {{?}}
    <div class="web-update hbox">
        {{? it.installed }}
            <span class="text-secondary" >{{= i18n.misc.NAV_APP_INSTALLED }}</span>
        {{??}}
            {{? it.isUpdating }}
                <progress class="tiny" max="100" value="{{= it.progress }}"></progress>
                <span class="button-cancel link">{{= i18n.ui.CANCEL }}</span>
            {{??}}
                <button class="button-install min">{{= i18n.app.INSTALL }}</button>
            {{?}}
        {{?}}
        <span class="button-hide link">{{= i18n.misc.DELETE }}</span>
    </div>
    <div class="button-close" data-id="{{= it.id }}" title="{{= i18n.misc.DESELECT }}"></div>
    {{?}}
</script>

<script type="text/x-ui-template" id="one-key-update-body">
<header class="w-smart-list-header w-app-list-header text-secondary hbox">
    <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
    <div class="info smart-list-sortable desc" data-smart-list-sortby="base_info.name" data-smart-list-sort-type="string">{{= i18n.app.COL_NAME_LABEL }}</div>
    <div class="current-version">{{= i18n.app.APP_INSTALL_VERSION_LABEL }}</div>
    <div class="target-version">{{= i18n.app.APP_LATEST_VERSION_LABEL }}</div>
    <div class="size smart-list-sortable" data-smart-list-sortby="base_info.apk_size" data-smart-list-sort-type="number">{{= i18n.misc.SIZE }}</div>
</header>
<footer class="w-smart-list-footer text-secondary"></footer>
</script>

<script type="text/x-ui-template" id="web-app-empty-tip">
    {{= i18n.app.WEB_APPS_EMPTY_TIP_PRE }}
    <span class="button-find-app link">{{= i18n.app.WEB_APPS_EMPTY_TIP_LINK }}</span>
    {{= i18n.app.WEB_APPS_EMPTY_TIP_POST }}
</script>

<script type="text/x-ui-template" id="one-key-move-body">
<header class="w-smart-list-header w-app-list-header text-secondary hbox">
    <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
    <div class="info smart-list-sortable desc" data-smart-list-sortby="base_info.name" data-smart-list-sort-type="string">{{= i18n.app.COL_NAME_LABEL }}</div>
    <div class="current-version">{{= i18n.app.APP_INSTALL_VERSION_LABEL }}</div>
    <div class="size smart-list-sortable" data-smart-list-sortby="base_info.apk_size" data-smart-list-sort-type="number">{{= i18n.misc.SIZE }}</div>
</header>
<footer class="w-smart-list-footer text-secondary"></footer>
</script>

<script type="text/x-ui-template" id="retry-window">
    <p class="tip">{{= it.tip }}</p>
    <ul class="list">
        {{~ it.failedApps : app }}
        <li class="wc">- {{= app }}</li>
        {{~}}
    </ul>
</script>

<script type="text/x-ui-template" id="local-install-body">
    <div class="btn-ctn hbox">
        <button class="button-add-file">{{= i18n.misc.ADD_FILE }}</button>
        <button class="button-add-folder">{{= i18n.misc.ADD_FOLDER }}</button>
        <div class="tip">{{= i18n.app.APK_SELECTOR_DISCRIPTION_TEXT }}</div>
    </div>
    <div class="w-app-local-install-list vbox">
        <header class="w-smart-list-header w-app-list-header text-secondary hbox">
            <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
            <div class="info smart-list-sortable desc" data-smart-list-sortby="base_info.name" data-smart-list-sort-type="string">{{= i18n.app.COL_NAME_LABEL }}</div>
            <div class="current-version">{{= i18n.app.COL_VERSION_LABEL }}</div>
            <div class="size smart-list-sortable" data-smart-list-sortby="base_info.apk_size" data-smart-list-sort-type="number">{{= i18n.misc.SIZE }}</div>
        </header>
        <footer class="w-smart-list-footer text-secondary"></footer>
    </div>
</script>

<script type="text/x-ui-template" id="local-install-monitor">
    <input type="checkbox" class="check-delete-when-finish" />
    {{= i18n.app.DELETE_APK_WHEN_FINISH }}
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn primary button-install min">
        <span class="icon add"></span>{{= i18n.app.BUTTON_ADD_APP_LABEL }}
    </button>
    <button class="w-icon-btn button-update min">
        <span class="icon update"></span>{{= i18n.app.UPDATE }}
    </button>
    <button class="w-icon-btn button-uninstall min">
        <span class="icon delete"></span>{{= i18n.app.UNINSTALL }}
    </button>
    <button class="w-icon-btn button-export min">
        <span class="icon export"></span>{{= i18n.misc.EXPORT }}
    </button>
    <div class="split"></div>
    <button class="w-icon-btn button-move-to-sd-card min">
        <span class="icon sd"></span>{{= i18n.app.BUTTON_TRANSFER_LABEL }}
    </button>
    <button class="w-icon-btn button-move-to-device min">
        <span class="icon device"></span>{{= i18n.app.BUTTON_MOVE_TO_DEVICE_LABEL }}
    </button>
</script>

<script type="text/x-ui-template" id="app-list">
    <header class="w-list-tab-header">
        <button class="w-icon-btn transparent button-return">
            <span class="icon return"></span>{{= i18n.app.RETURN_ALL }}
        </button>
        <span class="search-tip hbox"></span>
        <menu class="tab hbox">
            <li class="hbox" data-tab="normal">
                <div>{{= i18n.misc.NAV_APP_INSTALLED }}</div>
                <div class="count">{{= it.normal }}</div>
            </li>
            <li class="hbox" data-tab="sys">
                <div>{{= i18n.misc.NAV_APP_SYS }}</div>
                <div class="count">{{= it.sys }}</div>
            </li>
            {{? FunctionSwitch.IS_CHINESE_VERSION }}
            <li class="hbox" data-tab="update">
                <div>{{= i18n.misc.NAV_APP_UPDATABLE }}</div>
                <div class="count">{{= it.update }}</div>
            </li>
            {{?}}
            {{? FunctionSwitch.ENABLE_MY_APPS }}
            <li class="hbox" data-tab="web">
                <div>{{= i18n.app.WEB_APPS_EMPTY }}</div>
                <div class="count">{{= it.web }}</div>
            </li>
            {{?}}
        </menu>
        <div class="pointer"></div>
        <div class="sort"></div>
    </header>
    <div class="sd-mount header-tip">
        <div class="hbox content-ctn">
            <div class="tip text-secondary">{{= i18n.app.SD_MOUNT_TIP2 }}</div>
            <div class="button-close-sd button-close"></div>
        </div>
    </div>
    <div class="flash header-tip">
        <div class="hbox content-ctn">
            <div class="tip text-secondary">{{= i18n.app.FLASH_TIP_TIP }}</div>
            <div class="button-close-flash button-close"></div>
        </div>
    </div>
    <div class="ignore-tip">
        <div class="content hbox">
            <div class="count text-secondary"></div>
            <button class="button-open-ignore min">查看</button>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="app-main">
    <div class="w-app-ctn hbox"></div>
</script>

<script type="text/x-ui-template" id="mount-sd">
    <div class="w-misc-sd-mount-ctn">
        <h1>{{= i18n.misc.PLEASE_UNMOUNT_SD_CARD }}</h1>
        <p>{{= i18n.app.APPS_USB_TEXT }}</p>
        <div class="mount-sd-tip"></div>
    </div>
</script>

<script type="text/x-ui-template" id="changelog">
    {{
        var originVersion = it.base_info.version_name.replace(/^version|v|V/, '');
        var targetVersion = it.upgrade_info.versionName.replace(/^version|v|V/, '');
        var flag = (originVersion === targetVersion)
                    || (targetVersion.localeCompare(originVersion) === (-1));
        if (flag) {
            originVersion += '(v' + it.base_info.version_code + ')';
            targetVersion += '(v' + it.upgrade_info.versionCode + ')';
        }
    }}
    <div class="version text-secondary">
        <div>{{= i18n.app.VERSION }}v{{= originVersion }}</div>
        <div>{{= i18n.app.LATEST_VERSION }}v{{= targetVersion }}</div>
    </div>
    <div class="latest text-secondary">
        <div>{{= i18n.app.LATEST_VERSION_SIZE }}{{= StringUtil.readableSize(it.upgrade_info.size) }}</div>
        {{? it.upgrade_info.recommendedType === 'STRONG_RECOMMEND' }}
        <div>{{= i18n.app.UPDATE_CATEGORY_RECOMMENDED }}</div>
        {{?? it.upgrade_info.recommendedType === 'WARNNING' }}
        <div>{{= i18n.app.UPDATE_CATEGORY_WARNING }}</div>
        {{??}}
        <div>{{= i18n.app.NOT_RECOMMENDED_REASON + it.upgrade_info.notRecommendReason.description }}</div>
        {{?}}
    </div>
    {{? it.upgrade_info.changeLog.trim() }}
    <div class="content text-secondary">{{= it.upgrade_info.changeLog }}</div>
    {{?}}
</script>

<script type="text/x-ui-template" id="sd-mount">
    <div class="w-app-mount-sd-tip">
        <div class="tip">{{= i18n.app.SD_MOUNT_TIP }}</div>
        <hr />
        <div class="tip-ctn">
            <div class="tip">
                <span></span>
            </div>
        </div>
        <div class="mount-sd"></div>
    </div>
</script>

<script type="text/x-ui-template" id="hot-cate">
    <h3 class="text-secondary">您喜欢的应用类型</h3>
    <ul class="tags-ctn"></ul>
    <h3 class="text-secondary">最新应用专题</h3>
    <div class="banner-ctn">
        <img class="banner" alt="" />
    </div>
</script>
</templates>
