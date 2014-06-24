<templates>

<script type="text/x-ui-template" id="tools-main">
    <div class="w-tools-banner">
        <div class="center hbox">
            <div class="desc-ctn">
                <div class="title">{{= i18n.tools.TITLE }}</div>
                <div class="desc">{{= i18n.tools.DESC }}</div>
            </div>
            <div class="icon"></div>
        </div>
    </div>
    <div class="w-tools-ctn"></div>
</script>

<script type="text/x-ui-template" id="tools-sd-card">
    <div class="icon"></div>
    <div class="info-ctn vbox">
        <div class="top-ctn hbox">
            <h1 class="title">{{= i18n.tools.MANAGE_SD_CARD_TITLE }}</h1>
            <button class="action button-action">{{= i18n.tools.MANAGE_SD_CARD }}</button>
        </div>
        <div class="desc text-thirdly">{{= i18n.tools.MANAGE_SD_CARD_DESC }}</div>
    </div>
</script>

<script type="text/x-ui-template" id="tools-feature-card">
    <div class="icon"></div>
    <div class="desc text-thirdly">{{= i18n.tools.FEATURE_DESC }}</div>
</script>

<script type="text/x-ui-template" id="tools-flash-card">
    <div class="icon"></div>
    <div class="info-ctn vbox">
        <div class="top-ctn hbox">
            <h1 class="title">{{= i18n.tools.FLASH_TITLE }}</h1>
            <button class="action button-action">{{= i18n.tools.FLASH_DEVICE }}</button>
            <button class="normal button-cancel">{{= i18n.tools.FLASH_CANCEL }}</button>
        </div>
        <div class="desc text-thirdly">{{= i18n.tools.FLASH_DEVICE_DESC }}</div>
        <progress class="tiny lighter" max="120" value="0"></progress>
    </div>
</script>

<script type="text/x-ui-template" id="tools-flash-confirm">
    <div class="w-tools-flash-confirm hbox">
        <div class="icon"></div>
        <div class="desc-ctn">
            <h1 class="title text-secondary">{{= i18n.tools.CONFIRM_TITLE }}</h1>
            <span class="dsec text-thirdly">{{= i18n.tools["FLASH_ERROR_" + it.error] }}</span>
        </div>
    </div>
</script>

</templates>
