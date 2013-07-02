<templates>
<script type="text/x-ui-template" id="window">
    <header class="w-ui-window-header hbox drag-handel">
        <div class="w-ui-window-header-title"></div>
        <div class="w-ui-window-header-x"></div>
    </header>
    <div class="w-ui-window-body vbox"></div>
    <footer class="w-ui-window-footer hbox">
        <div class="w-ui-window-footer-monitor"></div>
        <div class="w-ui-window-footer-button-ctn"></div>
    </footer>
</script>

<script type="text/x-ui-template" id="modal-mask">
    <div class="w-ui-helper"></div>
</script>

<script type="text/x-ui-template" id="button-set-yes">
    <button class="button-yes primary">{{= i18n.ui.CONFIRM }}</button>
</script>

<script type="text/x-ui-template" id="button-set-cancel">
    <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
</script>

<script type="text/x-ui-template" id="button-set-retry">
    <button class="button-retry">{{= i18n.ui.RETRY }}</button>
</script>

<script type="text/x-ui-template" id="button-set-yes-no">
    <button class="button-yes primary">{{= i18n.ui.CONFIRM }}</button>
    <button class="button-no">{{= i18n.ui.CANCEL }}</button>
</script>

<script type="text/x-ui-template" id="button-set-yes-cancel">
    <button class="button-yes primary">{{= i18n.ui.CONFIRM }}</button>
    <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
</script>

<script type="text/x-ui-template" id="button-set-retry-cancel">
    <button class="button-retry primary">{{= i18n.ui.RETRY }}</button>
    <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
</script>

<script type="text/x-ui-template" id="button-set-yes-no-cancel">
    <button class="button-yes primary">{{= i18n.ui.YES }}</button>
    <button class="button-no">{{= i18n.ui.NO }}</button>
    <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
</script>

<script type="text/x-ui-template" id="disposable-tip">
    <label>
        <input type="checkbox" class="check-disposable" />
        {{= i18n.ui.DISPOSABLE_TIP }}
    </label>
</script>

<script type="text/x-ui-template" id="smart-list">
    <ul class="w-ui-smartlist-body-ctn"></ul>
    <div class="w-ui-smartlist-scroll-ctn">
        <div class="w-ui-smartlist-scroll-substitution"></div>
    </div>
    <div class="empty-tip w-layout-hide text-secondary"></div>
    {{= TemplateFactory.get('ui', 'loading') }}
</script>

<script type="text/x-ui-template" id="smart-list-new">
    <ul class="w-ui-smartlist-body-ctn"></ul>
    <div class="empty-tip w-layout-hide text-secondary"></div>
    {{= TemplateFactory.get('ui', 'loading') }}
</script>

<script type="text/x-ui-template" id="button">
    <div class="label"></div>
</script>

<script type="text/x-ui-template" id="icon-button">
    <div class="hbox">
        <div class="icon"></div>
        <div class="label"></div>
    </div>
</script>

<script type="text/x-ui-template" id="menu-button">
    <div class="hbox">
        <div class="label wc"></div>
        <div class="arrow-ctn hbox">
            <div class="arrow"></div>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="menu-item-radio">
    <label class="wc">
        <input type="radio" name="{{= it.name }}" value="{{= it.value }}" />
        <span>{{= it.label }}</span>
    </label>
</script>

<script type="text/x-ui-template" id="menu-item-normal">
    <div class="normal">
        <span>{{= it.label }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="menu-item-group">
    <div class="group text-thirdly">
        <span>{{= it.label }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="menu-item-link">
    <div class="link">
        <span>{{= it.label }}</span>
    </div>
</script>

<script type="text/x-ui-template" id="menu-item-checkbox">
    <label class="wc">
        <input type="checkbox" name="{{= it.name }}" value="{{= it.value }}" />
        <span>{{= it.label }}</span>
    </label>
</script>

<script type="text/x-ui-template" id="batch-action-body">
    <div class="w-batch-action-body">
        <div class="hbox">
            <div class="tip"></div>
            <div class="progress-ctn">
                <span class="progress">0</span> / <span class="total">0</span>
            </div>
        </div>
        <div class="progress-ctn hbox">
            <progress class="tiny running" max="100" value="0"></progress>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="tip">
    <div class="arrow"></div>
</script>

<script type="x-ui-template" id="loading">
    <div class="w-ui-loading">
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
</script>

<script type="x-ui-template" id="loading-white">
    <div class="w-ui-loading white">
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
</script>

<script type="text/x-ui-template" id="loading-horizental">
    <div class="w-ui-loading-horizental-ctn">
        <div class="w-ui-loading-horizental">
            <div class="ball ball1"></div>
            <div class="ball ball2"></div>
            <div class="ball ball3"></div>
            <div class="ball ball4"></div>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="loading-horizental-transparent">
    <div class="w-ui-loading-horizental-ctn transparent">
        <div class="w-ui-loading-horizental">
            <div class="ball ball1"></div>
            <div class="ball ball2"></div>
            <div class="ball ball3"></div>
            <div class="ball ball4"></div>
        </div>
    </div>
</script>
</templates>
