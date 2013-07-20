<templates>
<script type="text/x-ui-template" id="photo-item">
    <img class="thumb" src="">
    <div class="control hbox">
        <input type="checkbox" class="check-item dark">
        <div class="placeholder"></div>
        <div class="button-info"></div>
    </div>
    <div class="error text-thirdly">
        {{= i18n.photo.GET_PHOTOS_ERROR }}
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
    {{= TemplateFactory.get('ui', 'loading') }}
    <div class="empty-tip text-secondary"></div>
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

<script type="text/x-ui-template" id="video-item">
    <label class="input item-checker-wrap hbox"><input class="item-checker" type="checkbox" value="{{= it.id }}"></label>
    <div class="title wc" title="{{! it.name }}">{{! it.name }}</div>
    <div class="format">{{= it.type }}</div>
    <div class="size">{{= StringUtil.readableSize(it.size) }}</div>
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn primary button-import min">
        <span class="icon add"></span>{{= i18n.video.ADD_LOCAL_VIDEO_TEXT }}
    </button>
    <button class="w-icon-btn button-delete min">
        <span class="icon delete"></span>{{= i18n.misc.DELETE }}
    </button>
    <button class="w-icon-btn button-export min">
        <span class="icon export"></span>{{= i18n.misc.EXPORT }}
    </button>
    <div class="split"></div>
    <button class="w-icon-btn button-refresh min">
        <span class="icon refresh"></span>{{= i18n.misc.REFRESH }}
    </button>
</script>
</templates>
