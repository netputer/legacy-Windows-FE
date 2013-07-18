<templates>
<script type="text/x-ui-template" id="select-library-content">
    <h3>{{= i18n.music.SELECT_LIBRARY_TITLE }}</h3>
    <ul class="select-library-list">
        {{
            _.each(it, function(item, index) {
        }}
                <li class="library-item">
                    <label>
                        <input type="radio" name="libraryItem" value="{{= index }}" class="w-ui-radio" {{? index === 0 }}checked="true"{{?}}>
                        <span class="library-name">{{! item.name }}</span>
                        <span class="library-time">({{= i18n.music.CREATE_TIME }}{{= item.time }})</span>
                    </label>
                </li>
        {{
            });
        }}
    </ul>
</script>

<script type="text/x-ui-template" id="select-source-content">
    <h3>{{= i18n.music.SELECT_SOURCE_TITLE }}</h3>
    <ul>
        {{
            _.each(it, function(item, index){
        }}
                <li>
                    <label>
                        <input type="radio" name="sourceType" value = "{{= index }}" class="w-ui-radio" {{? index === 0 }}checked="true"{{?}}>
                        <span>{{= item.label }}</span>
                    </label>
                    {{? index === 0 }}
                        <p class="source-tip">{{= i18n.music.SCANNING_TIP }}</p>
                        <p class="less-capacity">{{= i18n.music.LESS_CAPACITY }}</p>
                    {{?}}
                </li>
        {{
            });
        }}
    </ul>
</script>

<script type="text/x-ui-template" id="iTunes-source-info">
    {{? it.isSelected }}
    {{= i18n.musci.ALREADY_SELECT }}
    {{?}}
    {{= StringUtil.format(i18n.music.SELECT_TIP, it.playlistCount, it.audiosCount, it.capacitySize) }}
</script>

<script type="text/x-ui-template" id="iTunes-import">
    <h3>{{= it.title }}</h3>
    <div class="progress-wrap"></div>
</script>

<script type="text/x-ui-template" id="import-progress">
    <p class="{{= it.className }}{{? it.isFaild }} w-iTunes-error-tip{{?}}">
        <span class="progress-tip">{{= it.tip }} </span>
        <span class="progress-value">
            <span class="current">{{= it.current }}</span>&nbsp;/&nbsp;<span class="total">{{= it.total }}</span>
        </span>
    </p>
</script>

<script type="text/x-ui-template" id="play-list">
    <h3>{{= i18n.music.SELECT_PLAYLIST_FOR_IMPORT }}</h3>
</script>

<script type="text/x-ui-template" id="itunes-play-list">
    <header class="w-smart-list-header w-itunes-play-list-header text-secondary hbox">
        <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
        <div class="cell list-name smart-list-sortable desc" data-smart-list-sortby="name" data-smart-list-sort-type="string">{{= i18n.music.PLAYLIST_NAME }}</div>
        <div class="cell list-songs smart-list-sortable desc" data-smart-list-sortby="tracks_count" data-smart-list-sort-type="number">{{= i18n.music.AUDIOS_COUNT }}</div>
    </header>
</script>

<script type="text/x-ui-temlate" id="itunes-play-list-item">
   <div class="list-name"><input type="checkbox" class="item-checker" value="{{= it.id }}" />{{= it.name }}</div>
   <div class="cell list-songs">{{= it.tracks_count }}</div>
</script>

<script type="text/x-ui-template" id="audio-list">
    <h3>{{= i18n.music.SELECT_FILES }}</h3>
</script>

<script type="text/x-ui-template" id="itunes-audio-list">
    <header class="w-smart-list-header w-itunes-audio-list-header text-secondary hbox">
        <label class="check-select-all-wrap"><input class="check-select-all" type="checkbox" /></label>
        <div class="cell audio-name smart-list-sortable desc" data-smart-list-sortby="title" data-smart-list-sort-type="string">{{= i18n.music.SING_NAME_TEXT }}</div>
        <div class="cell audio-artist smart-list-sortable desc" data-smart-list-sortby="artist" data-smart-list-sort-type="string">{{= i18n.music.ARTIST_TEXT }}</div>
        <div class="cell audio-album">{{= i18n.music.ALBUM_TEXT }}</div>
        <div class="cell audio-size smart-list-sortable desc" data-smart-list-sortby="sizeText" data-smart-list-sort-type="string" >{{= i18n.music.SING_SIZE_TEXT }}</div>
    </header>
</script>

<script type="text/x-ui-temlate" id="itunes-audio-list-item">
   <div class="audio-name"><input type="checkbox" class="item-checker" value="{{= it.id }}" />{{= it.title }}</div>
   <div class="cell audio-artist">{{= it.artist }}</div>
   <div class="cell audio-album">{{= it.album }}</div>
   <div class="cell audio-size">{{= it.sizeText }}</div>
</script>
</templates>
