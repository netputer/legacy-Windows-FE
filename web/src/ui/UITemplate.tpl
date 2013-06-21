<templates>
    <script type="text/template" id="template-ui-process">
        <div class="w-ui-process">
            <div class="w-ui-process-icon"></div>
        </div>
    </script>
    <script type="text/template" id="template-ui-progressbar">
        <div class="w-ui-progressbar">
            <div class="w-ui-progressbar-inner">
                <span class="w-ui-progressbar-text">
                    <span class="w-ui-progressbar-label"></span>
                    <span class="w-ui-progressbar-meter">
                        <span class="w-ui-progressbar-curr"><%= progress %></span>&nbsp;<span class="w-ui-progressbar-delimiter">/</span>&nbsp;<span class="w-ui-progressbar-max"><%= max %></span></span>
                    </span>
            </div>
        </div>
    </script>
    <script type="text/template" id="template-ui-smartlist">
        <div class="w-ui-smartlist hbox">
            <ul class="w-ui-smartlist-body-ctn"></ul>
            <div class="w-ui-smartlist-scroll-ctn">
                <div class="w-ui-smartlist-scroll-substitution"></div>
            </div>
        </div>
    </script>
</templates>
