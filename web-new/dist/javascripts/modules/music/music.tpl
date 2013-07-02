<templates>
<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn primary button-add-music min">
        <span class="icon add"></span>{{= i18n.music.ADD_LOCAL_MUSIC_TEXT }}
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
    <div class="itunes-wrap">
        <button class="w-icon-btn button-itunes min">
            <span class="icon itunes"></span>{{= i18n.music.ITUNES_IMPORT }}
        </button>
    </div>
</script>

<script type="text/x-ui-template" id="local-import-body">
    <div class="btn-ctn hbox">
        <button class="button-add-file">{{= i18n.misc.ADD_FILE }}</button>
        <button class="button-add-folder">{{= i18n.misc.ADD_FOLDER }}</button>
        <div class="tip">{{= i18n.music.FILE_SELECTOR_DESCRIPTION }}</div>
    </div>
    <div class="w-music-local-import-list vbox">
        <header class="w-smart-list-header w-music-list-header text-secondary hbox">
            <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
            <div class="title smart-list-sortable" data-smart-list-sortby="title" data-smart-list-sort-type="string">{{= i18n.music.SING_NAME_TEXT }}</div>
            <div class="artist smart-list-sortable" data-smart-list-sortby="artist" data-smart-list-sort-type="string">{{= i18n.music.ARTIST_TEXT }}</div>
            <div class="duration smart-list-sortable" data-smart-list-sortby="duration" data-smart-list-sort-type="number">{{= i18n.music.SING_TIME_TEXT }}</div>
            <div class="format smart-list-sortable" data-smart-list-sortby="format" data-smart-list-sort-type="string">{{= i18n.music.SING_FORMAT }}</div>
            <div class="size smart-list-sortable" data-smart-list-sortby="size" data-smart-list-sort-type="number">{{= i18n.music.SING_SIZE_TEXT }}</div>
        </header>
        <footer class="w-smart-list-footer text-secondary"></footer>
    </div>
</script>

<script type="text/x-ui-template" id="music-item">
    <label class="input item-checker-wrap hbox"><input class="item-checker" type="checkbox" value="{{= it.id }}"></label>
    <div class="title wc" title="{{! it.title }}">{{! it.title }}</div>
    <div class="play">
        {{? it.playing }}
        <div class="button-stop" title="{{= i18n.music.STOP_TEXT }}"></div>
        <div class="playing"></div>
        {{?? it.loading }}
        <div class="loading"></div>
        {{?? it.error }}
        <div class="error" title="{{= i18n.music.MUSIC_CANNOT_PLAY_TEXT }}"></div>
        {{??}}
        <div class="button-play" title="{{= i18n.music.PLAY_TEXT }}"></div>
        {{?}}
    </div>
    <div class="artist text-secondary wc" title="{{! it.artist }}">{{! it.artist }}</div>
    <div class="album text-secondary wc" title="{{! it.album }}">{{! it.album }}</div>
    <div class="duration text-secondary">{{= StringUtil.formatDuration(it.duration) }}</div>
    <div class="format text-secondary wc" title="{{= it.format }}">{{= it.format }}</div>
    <div class="size text-secondary">{{= StringUtil.readableSize(it.size) }}</div>
    <div class="type">
        {{? it.collection !== undefined && it.collection.settings !== undefined }}
            {{? it.collection.settings.ringtone === it.id }}
            <div class="ring-icon ringtone"></div>
            {{?}}
            {{? it.collection.settings.notification === it.id }}
            <div class="ring-icon notification"></div>
            {{?}}
            {{? it.collection.settings.alarm === it.id }}
            <div class="ring-icon alarm"></div>
            {{?}}
        {{?}}
    </div>
</script>

<script type="text/x-ui-template" id="music-list">
<header class="w-smart-list-header w-music-list-header text-secondary hbox">
    <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
    <div class="title smart-list-sortable" data-smart-list-sortby="title" data-smart-list-sort-type="string">{{= i18n.music.SING_NAME_TEXT }}</div>
    <div class="play"></div>
    <div class="artist smart-list-sortable" data-smart-list-sortby="artist" data-smart-list-sort-type="string">{{= i18n.music.ARTIST_TEXT }}</div>
    <div class="album smart-list-sortable" data-smart-list-sortby="album" data-smart-list-sort-type="string">{{= i18n.music.ALBUM_TEXT }}</div>
    <div class="duration smart-list-sortable" data-smart-list-sortby="duration" data-smart-list-sort-type="number">{{= i18n.music.SING_TIME_TEXT }}</div>
    <div class="format smart-list-sortable" data-smart-list-sortby="format" data-smart-list-sort-type="string">{{= i18n.music.SING_FORMAT }}</div>
    <div class="size smart-list-sortable" data-smart-list-sortby="size" data-smart-list-sort-type="number">{{= i18n.music.SING_SIZE_TEXT }}</div>
    <div class="type"></div>
</header>
</script>

<script type="text/x-ui-template" id="set-ring-list">
<header class="w-smart-list-header w-music-list-header text-secondary hbox">
    <div class="title smart-list-sortable" data-smart-list-sortby="title" data-smart-list-sort-type="string">{{= i18n.music.SING_NAME_TEXT }}</div>
    <div class="type"></div>
</header>
</script>
</templates>
