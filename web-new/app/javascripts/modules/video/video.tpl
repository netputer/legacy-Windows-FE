<templates>
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

<script type="text/x-ui-template" id="video-item">
    <label class="input item-checker-wrap hbox"><input class="item-checker" type="checkbox" value="{{= it.id }}"></label>
    <div class="title wc" title="{{! it.name }}">{{! it.name }}</div>
    <div class="format">{{= it.type }}</div>
    <div class="size">{{= StringUtil.readableSize(it.size) }}</div>
</script>
</templates>