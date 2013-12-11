<templates>
<script type="text/x-ui-template" id="photo-item">
    <img class="thumb" src="">
    <div class="control hbox">
        <input type="checkbox" class="check-item dark">
        <div class="placeholder"></div>
        <div class="button-share icomoon-share"></div>
        <div class="button-info icomoon-info"></div>
    </div>
    <div class="error text-thirdly">
        {{= i18n.photo.GET_PHOTOS_ERROR }}
        <div class="button-retry" title="{{= i18n.ui.RETRY }}"></div>
    </div>
</script>

<script type="text/x-ui-template" id="photo-thread">
    <header class="header">
        <label class="label">
            <input type="checkbox" class="checker" />
            <span class="text-secondary" title="{{! it.key }}">{{! it.key }}</span>
            <div class="count">{{= it.count }}</div>
        </label>
    </header>
    <ul class="media-ctn"></ul>
</script>

<script type="text/x-ui-template" id="photo-list">
    <div class="spy"></div>
    {{= TemplateFactory.get('ui', 'loading') }}
    <div class="empty-tip text-secondary center fix-text"></div>
    <div class="mask"></div>
</script>

<script type="text/x-ui-template" id="slide-show">
    <div class="top-control">
    </div>
    <div class="photo-ctn vbox">
        <img class="photo hide" src="" alt="" />
        <div class="button-previous hbox">
            <div class="button"></div>
        </div>
        <div class="button-next hbox">
            <div class="button"></div>
        </div>
        <div class="error">
            {{= i18n.photo.GET_PHOTOS_ERROR }}
            <div class="button-retry" title="{{= i18n.ui.RETRY }}"></div>
        </div>
    </div>
    <div class="control">
        <div class="tip"></div>
        <div class="buttons hbox">
            <div class="btn-ctn">
                <div class="button button-rotate-left" title="{{= i18n.photo.ROTATE_LEFT }}"></div>
                <div class="button button-rotate-right" title="{{= i18n.photo.ROTATE_RIGHT }}"></div>
                <div class="button button-play" title="{{= i18n.photo.SLIDE_SHOW }}"></div>
                <div class="split"></div>
                <div class="button button-delete" title="{{= i18n.misc.DELETE }}"></div>
                <div class="button button-export" title="{{= i18n.misc.EXPORT }}"></div>
                <div class="button button-wallpaper" title="{{= i18n.photo.SET_AS_WALLPAPER }}" data-title="{{= i18n.photo.WALLPAPER_SETTING_SUCCESS_TEXT }}"></div>
                <div class="button button-share" title="{{= i18n.misc.SHARE }}"></div>
            </div>
        </div>
    </div>
    {{= TemplateFactory.get('ui', 'loading-white') }}
    <div class="button-close"></div>
</script>

<script type="text/x-ui-template" id="local-import-body">
    <div class="btn-ctn hbox">
        <button class="button-add-file">{{= i18n.misc.ADD_FILE }}</button>
        <button class="button-add-folder">{{= i18n.misc.ADD_FOLDER }}</button>
        <div class="tip">{{= i18n.photo.FILE_SELECTOR_DESCRIPTION }}</div>
    </div>
    <div class="w-photo-local-import-list vbox">
        <header class="w-smart-list-header w-photo-list-header text-secondary hbox">
            <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
            <div class="preview">{{= i18n.photo.PREVIEW_TEXT }}</div>
            <div class="title smart-list-sortable" data-smart-list-sortby="name" data-smart-list-sort-type="string">{{= i18n.photo.PICTURE_NAME }}</div>
            <div class="format smart-list-sortable" data-smart-list-sortby="type" data-smart-list-sort-type="string">{{= i18n.photo.PICTURE_FORMAT }}</div>
            <div class="size smart-list-sortable" data-smart-list-sortby="size" data-smart-list-sort-type="number">{{= i18n.photo.PICTURE_SIZE }}</div>
        </header>
    </div>
</script>

<script type="text/x-ui-template" id="photo-list-item">
    <label class="input item-checker-wrap hbox"><input class="item-checker" type="checkbox" value="{{= it.id }}"></label>
    <div class="preview">
        {{? it.thumbnail}}
        <img src="file:///{{= it.thumbnail }}" alt="{{! it.name }}" />
        {{??}}
        <img src="{{= CONFIG.enums.DEFAULT_42X42 }}" alt="{{! it.name }}" />
        {{?}}
    </div>
    <div class="title wc" title="{{! it.name }}">{{! it.name }}</div>
    <div class="format">{{= it.type }}</div>
    <div class="size">{{= StringUtil.readableSize(it.size) }}</div>
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn primary button-import min">
        <span class="icomoon-add-circle"></span>{{= i18n.photo.ADD_LAOCEL_PHOTO_LABEL }}
    </button>
    <button class="w-icon-btn button-delete min">
        <span class="icomoon-delete"></span>{{= i18n.misc.DELETE }}
    </button>
    <button class="w-icon-btn button-export min">
        <span class="icomoon-export"></span>{{= i18n.misc.EXPORT }}
    </button>
    <div class="split"></div>
    <button class="w-icon-btn button-fullscreen min">
        <span class="icomoon-fullscreen"></span>{{= i18n.photo.SLIDE_PLAY_TEXT }}
    </button>
</script>

<script type="text/x-ui-template" id="photo-sync-switch">
    <div class="tip">{{= i18n.misc.NAV_PIC_CLOUD }}</div>
    <div class="w-ui-switch-button button-sync">
        <div class="switcher"></div>
    </div>
</script>

<script type="text/x-ui-template" id="info">
    <div>{{= i18n.misc.NAME }}{{! it.display_name }}</div>
    <div>{{= i18n.misc.DATE }}{{= StringUtil.formatDate('yyyy-MM-dd', it.date) }}</div>
    <div>{{= i18n.misc.FILE_SIZE }}{{= StringUtil.readableSize(it.size) }}</div>
</script>

<script type="text/x-ui-template" id="gallery">
    <header class="w-list-tab-header">
        <menu class="tab hbox">
            <li class="hbox" data-tab="phone">
                <div>{{= i18n.misc.NAV_PIC_PHONE_LIB }}</div>
                <div class="count">{{= it.phone }}</div>
            </li>
            <li class="hbox" data-tab="lib">
                <div>{{= i18n.misc.NAV_PIC_GALLERY }}</div>
                <div class="count">{{= it.lib }}</div>
            </li>
            {{? FunctionSwitch.ENABLE_PHOTO_SYNC }}
            <li class="hbox" data-tab="cloud">
                <div>{{= i18n.misc.NAV_PIC_CLOUD }}</div>
                <div class="count">{{= it.cloud }}</div>
            </li>
            {{?}}
        </menu>
        <div class="pointer"></div>
    </header>
</script>

<script type="text/x-ui-template" id="ios-banner">
    <div class="banner">
        <div class="button-close"></div>
        <a class="button-download" href="{{= CONFIG.enums.IOS_APP_URL}}" target="_default"></a>
        <div class="button-sms"></div>
    </div>
</script>

</templates>
