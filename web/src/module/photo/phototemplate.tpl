<templates>
    <script type="text/template" id="photo_thread">
        <div class="w-photo-thread">
            <h3 class="w-photo-thread-title">
                <input type="checkbox" class="w-photo-thread-checkbox">
                <span class="w-photo-title"></span>
                <a class="w-photo-ignore"></a>
            </h3>
            <div class="w-photo-items cf">
            </div>
        </div>
    </script>

    <script type="text/template" id="photo_item">
        <div class="w-photo-item">
            <img src="">
            <input type="checkbox" class="w-photo-item-checkbox item-hide">
            <button class="w-photo-item-thumbnail-share w-icon-btn" title="<%= i18n.misc.SHARE %>">
                <span class="icon share"></span>
            </button>
        </div>
    </script>

   <script type="text/template" id="toolbar-template">
       <div class="w-photo-player-toolbar">
          <button class="rotate-right-btn" title="<%= i18n.photo.ROTATE_RIGHT %>"></button>
          <button class="rotate-left-btn" title="<%= i18n.photo.ROTATE_LEFT %>"></button>
          <button class="delete-btn" title="<%= i18n.misc.DELETE %>"></button>
          <div class="w-photo-player-control">
             <button class="pre-btn" title="<%= i18n.photo.PREV %>"></button>
             <button class="play-btn" title="<%= i18n.photo.SLIDE_SHOW %>"></button>
             <button class="next-btn" title="<%= i18n.photo.NEXT %>"></button>
          </div>
          <button class="export-btn" title="<%= i18n.misc.EXPORT %>"></button>
          <button class="wallpaper-btn" title="<%= i18n.photo.SET_AS_WALLPAPER %>"></button>
          <button class="share-btn" title="<%= i18n.misc.SHARE %>"></button>
       </div>
   </script>

   <script type="text/template" id="photo_info">
        <div class="w-photo-item-info">
            <p><span class="w-photo-name"></span></p>
            <p><span class="w-photo-size"></span><span class="w-photo-date"></span></p>
        </div>
   </script>
</templates>
