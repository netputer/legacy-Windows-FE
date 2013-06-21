<templates>
<script type="text/x-ui-tempate" id="select-library-content">
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

<script type="text/x-ui-tempate" id="select-source-content">
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

<script type="text/x-ui-tempate" id="iTunes-source-info">
    {{? it.isSelected }}
    {{= i18n.musci.ALREADY_SELECT }}
    {{?}}
    {{= StringUtil.format(i18n.music.SELECT_TIP, it.playlistCount, it.audiosCount, it.capacitySize) }}
</script>

<script type="text/x-ui-tempate" id="iTunes-import">
    <h3>{{= it.title }}</h3>
    <div class="progress-wrap"></div>
</script>

<script type="text/x-ui-tempate" id="import-progress">
    <p class="{{= it.className }}{{? it.isFaild }} w-iTunes-error-tip{{?}}">
        <span class="progress-tip">{{= it.tip }} </span>
        <span class="progress-value">
            <span class="current">{{= it.current }}</span>&nbsp;/&nbsp;<span class="total">{{= it.total }}</span>
        </span>
    </p>
</script>

<script type="text/x-ui-tempate" id="playlist">
    <h3>{{= i18n.music.SELECT_PLAYLIST_FOR_IMPORT }}</h3>
    <div class="playlist-content"></div>
    <!--
    <table class="playlist-content">
        <thead>
            <tr>
                <th class="name"><input type="checkbox" class="total-checkbox">{{= i18n.music.PLAYLIST_NAME }}</th>
                <th class="count">{{= i18n.music.AUDIOS_COUNT }}</th>
            </tr>
        </thead>
        <tbody class="playlists">

        </tbody>
    </table>
    -->
</script>

<script type="text/x-ui-tempate" id="playlist-item">
    <tr>
        <td class="name"><label><input type="checkbox" value="{{= it.id }}">{{= it.name }}</label></td>
        <td class="count">{{= it.count }}</td>
    </tr>
</script>

<script type="text/x-ui-tempate" id="audio-list">
    <h3>{{= i18n.music.SELECT_FILES }}</h3>
    <div class="audio-list-content"></div>
</script>

<script type="text/x-ui-tempate" id="audio-list-item">
    <tr>
        <td class="name"><label><input type="checkbox" value="{{= it.id }}">{{= it.title }}</label></td>
        <td class="artist">{{= it.artist }}</td>
        <td class="album">{{= it.album }}</td>
        <td class="size">{{= it.size }}</td>
    </tr>
</script>
</templates>
