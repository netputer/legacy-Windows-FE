<templates>
<script type="text/x-ui-template" id="video">
    <div class="w-video-list-loading hbox">
        {{= TemplateFactory.get('ui', 'loading') }}
    </div>
    <div class="w-video-loading hbox">
        <div class="w-video-loading-icon">
            {{= TemplateFactory.get('ui', 'loading-white') }}
        </div>
        <div class="w-video-loading-text">{{= i18n.video.PLAY_VIDEO_TEXT }}</div>
        <div class="w-video-loading-percent"></div>
    </div>
</script>
<script type="text/x-ui-template" id="video-item">
    <img class="thumb" src="">
    <div class="w-video-item-mask hbox">
        <div class="w-video-item-button"></div>
    </div>
    <div class="control hbox">
        <input type="checkbox" class="check-item dark">
        <div class="placeholder"></div>
        <div class="button-info"></div>
    </div>
    <div class="error text-thirdly">
        {{= i18n.video.GET_VIDEO_ERROR }}
        <div class="button-retry" title="{{= i18n.ui.RETRY }}"></div>
    </div>
</script>

<script type="text/x-ui-template" id="local-import-body">
    <div class="btn-ctn hbox">
        <button class="button-add-file">{{= i18n.misc.ADD_FILE }}</button>
        <button class="button-add-folder">{{= i18n.misc.ADD_FOLDER }}</button>
        <div class="tip">{{= i18n.video.FILE_SELECTOR_DESCRIPTION }}</div>
    </div>
    <div class="support-tip">{{= i18n.video.VIDEO_SUPPORT_TIP }}</div>
    <div class="w-video-local-import-list vbox">
        <header class="w-smart-list-header w-video-list-header text-secondary hbox">
            <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
            <div class="title smart-list-sortable" data-smart-list-sortby="name" data-smart-list-sort-type="string">{{= i18n.video.VIDEO_NAME }}</div>
            <div class="format smart-list-sortable" data-smart-list-sortby="type" data-smart-list-sort-type="string">{{= i18n.video.VIDEO_FORMAT }}</div>
            <div class="size smart-list-sortable" data-smart-list-sortby="size" data-smart-list-sort-type="number">{{= i18n.video.VIDEO_SIZE }}</div>
        </header>
    </div>
</script>

<script type="text/x-ui-template" id="video-list">
    <div class="spy"></div>
    <div class="empty-tip text-secondary center fix-text"></div>
    <div class="mask"></div>
</script>

<script type="text/x-ui-template" id="video-thread">
    <header class="header">
        <label class="label">
            <input type="checkbox" class="checker" />
            <span class="text-secondary" title="{{! it.key }}">{{! it.key }}</span>
            <div class="count">{{= it.count }}</div>
        </label>
    </header>
    <ul class="media-ctn"></ul>
</script>

<script type="text/x-ui-template" id="video-list-item">
    <label class="input item-checker-wrap hbox"><input class="item-checker" type="checkbox" value="{{= it.id }}"></label>
    <div class="title wc" title="{{! it.name }}">{{! it.name }}</div>
    <div class="format">{{= it.type }}</div>
    <div class="size">{{= StringUtil.readableSize(it.size) }}</div>
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn primary button-import min">
        <span class="icomoon icomoon-add-circle"></span>{{= i18n.video.ADD_LOCAL_VIDEO_TEXT }}
    </button>
    <button class="w-icon-btn button-delete min">
        <span class="icomoon icomoon-delete"></span>{{= i18n.misc.DELETE }}
    </button>
    <button class="w-icon-btn button-export min">
        <span class="icomoon icomoon-export"></span>{{= i18n.misc.EXPORT }}
    </button>
</script>
</templates>
