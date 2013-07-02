<templates>
<script type="text/x-ui-template" id="share">
<div class="w-social-share-share">
    <div class="header">
        <span class="text-secondary">{{= i18n.common.SHARE_WIDGET_SHARE_TIP }}</span>
        <span class="share-tip text-thirdly"></span>
        <div class="w-ui-loading-small info_loading send-loading" >
            <div class="anima">
                <div class="rotor rotor1"></div>
                <div class="rotor rotor2"></div>
                <div class="rotor rotor3"></div>
                <div class="rotor rotor4"></div>
                <div class="rotor rotor5"></div>
                <div class="rotor rotor6"></div>
                <div class="rotor rotor7"></div>
                <div class="rotor rotor8"></div>
            </div>
        </div>
    </div>
    <textarea class="input-content" placeholder="{{= i18n.common.SHARE_WIDGET_CONTENT_TIP_TEXT }}"></textarea>
    <p class="pic-size-tip"></p>
</div>
</script>

<script type="text/x-ui-template" id="facebook-share">
<div class="w-social-share-share">
    <p class="header">
        <span>{{= i18n.common.SHARE_WIDGET_SHARE_TIP }}</span>
        <a href="###" class="exit-oauth">{{= i18n.common.SHARE_WIDGET_EXIT_TEXT }}</a>
        <span class="nickname"></span>
    </p>

    <textarea placeholder="{{= i18n.common.SHARE_WIDGET_CONTENT_TIP_TEXT }}"></textarea>
    <p class="share-tip"></p>
    <div class="w-ui-loading-small info_loading send-loading" >
        <div class="anima">
            <div class="rotor rotor1"></div>
            <div class="rotor rotor2"></div>
            <div class="rotor rotor3"></div>
            <div class="rotor rotor4"></div>
            <div class="rotor rotor5"></div>
            <div class="rotor rotor6"></div>
            <div class="rotor rotor7"></div>
            <div class="rotor rotor8"></div>
        </div>
    </div>
    <p class="pic-size-tip"></p>
</div>
</script>

<script type="text/x-ui-template" id="social-platform-selector">
    <span class="text-thirdly"{{= i18n.common.SHARE_TO }}</span>
    <input type="checkbox" class="social-platform" data-type="sina" />
    <input type="checkbox" class="social-platform" data-type="qzone" />
    <input type="checkbox" class="social-platform" data-type="tqq" />
    <input type="checkbox" class="social-platform" data-type="renren" />
</script>

<script type="text/x-ui-template" id="social-platform-selector-big">
    <div class="big-ctn hbox">
        <input type="checkbox" class="social-platform-big" data-type="sina" />
        <span data-type="sina">{{= i18n.common.SHARE_TO_SINA }}</span>

        <input type="checkbox" class="social-platform-big" data-type="qzone" />
        <span data-type="qzone">{{= i18n.common.SHARE_TO_QQ }}</span>
    </div>

    <div class="big-ctn hbox">
        <input type="checkbox" class="social-platform-big" data-type="tqq" />
        <span data-type="tqq">{{= i18n.common.SHARE_TO_QZONE }}</span>

        <input type="checkbox" class="social-platform-big" data-type="renren" />
        <span data-type="renren">{{= i18n.common.SHARE_TO_RENREN }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="preview">
    <div class="share-preview">
        <h3 class="share-preview-header">{{= i18n.common.SHARE_WIDGET_PREVIEW_PIC }}</h3>
        <a href="###" class="view-from-pc">{{= i18n.common.VIEW_PIC }}</a>
        <div class="share-preview-content"></div>
        <div class="w-ui-loading info_loading" >
            <div class="anima">
                <div class="rotor rotor1"></div>
                <div class="rotor rotor2"></div>
                <div class="rotor rotor3"></div>
                <div class="rotor rotor4"></div>
                <div class="rotor rotor5"></div>
                <div class="rotor rotor6"></div>
                <div class="rotor rotor7"></div>
                <div class="rotor rotor8"></div>
            </div>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="uninstall-share">
    <div class="icon"></div>
    <div>{{= i18n.misc.REVIEW_FOR_UNINSTALL_TIPS }}</div>
    <ul class="item-ctn cf">
        {{~ it.items : item }}
        <li class="hbox" data-id="{{= item.id }}" data-name="{{= item.name }}">{{= item.name }}
        </li>
        {{~}}
    </ul>
</script>
</templates>
