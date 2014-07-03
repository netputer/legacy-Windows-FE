<templates>
<script type="text/x-ui-template" id="wash-intro">
    <h1 class="text-primary title">{{= i18n.app.APP_WASH }}</h1>
    <p class="text-secondary">{{= i18n.app.SCAN_TIP1 }}</p>
    <p class="text-secondary">{{= i18n.app.SCAN_TIP2 }}</p>
    <p class="text-secondary">{{= i18n.app.SCAN_TIP3 }}</p>
    <button class="grand button-start primary">{{= i18n.app.START_SCAN }}</button>
    <p class="text-thirdly connect-tip">{{= i18n.app.WASH_CONNECT_TIP }}</p>
    <div class="w-app-wash-report-ctn text-secondary">{{= i18n.app.WASH_INTRO_FEED_BACK }}</div>
</script>

<script type="text/x-ui-template" id="wash-scanning">
    <h1 class="text-primary title">{{= i18n.app.SCANNING }}</h1>
    <p class="text-thirdly desc">{{= i18n.app.SCANNING_TIP }}</p>
    <progress class="min" max="100" value=""></progress>
</script>

<script type="text/x-ui-template" id="wash-scan-result">
    <ul class="result"></ul>
    <div class="summary">
        <ul>
            <li class="pirate">
                <div class="count"></div>
                <div class="des text-secondary">{{= i18n.app.PIRATE_TIP }}</div>
            </li>
            <li class="ads">
                <div class="count"></div>
                <div class="des text-secondary">{{= i18n.app.ADS_TIP }}</div>
            </li>
            <li class="ads-uninstall">
                <div class="count"></div>
                <div class="des text-secondary">{{= i18n.app.ADS_NO_SOLUTION_TIP }}</div>
            </li>
        </ul>
    </div>
    <div class="w-app-wash-report-ctn text-secondary">{{= i18n.app.WASH_WRONG_TRY_AGAIN }}</div>
</script>

<script type="text/x-ui-template" id="summary-pop-ads">
    <div class="summary">
        <h1 class="text-primary title">{{= i18n.app.RESULT_SUMMARY_POP_ADS }}</h1>
        <p class="text-thirdly desc"></p>
        <div class="btn-ctn">
            <button class="button-uninstall-all grand">{{= i18n.app.UNINSTALL_ALL }}</button>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="result-empty">
    <h1 class="text-primary title">{{= i18n.app.RESULT_EMPTY }}</h1>
    <p class="text-secondary desc">{{= i18n.app.RESULT_EMPTY_TIP }}</p>
    <div class="btn-ctn">
        <button class="grand button-restart">{{= i18n.app.TRY_AGAIN }}</button>
    </div>
    <p class="text-thirdly survey">
        {{= i18n.app.WASH_SURVEY }}<span class="link button-feedback">{{= i18n.app.TELL_US }}</span>
    </p>
</script>

<script type="text/x-ui-template" id="result-replace-finish">
    <h1 class="text-primary title">{{= i18n.app.RESULT_FINISH }}</h1>
    <p class="text-secondary desc">{{= i18n.app.RESULT_FINISH_TIP }}</p>
    <div class="btn-ctn">
        <button class="grand button-restart">{{= i18n.app.TRY_AGAIN }}</button>
    </div>
    <p class="text-thirdly survey">
        {{= i18n.app.WASH_SURVEY }}<span class="link button-feedback">{{= i18n.app.TELL_US }}</span>
    </p>
</script>

<script type="text/x-ui-template" id="feedback-card">
    <h2 class="text-primary title">{{= i18n.app.WASH_FEED_BACK_CARD_IGNORE }}</h2>
    <ul>
        {{
            var id = _.uniqueId('ignore-report-');
            var reasons;
        }}
        {{? it.type === 'ADS' }}
        {{
            reasons = _.find(it.text, function (item) {
                return item.type === 'UNINSTALL';
            }).content;
        }}
        {{~ reasons : reason }}
        <li>
            <label>
                <input type="radio" name="{{= id }}" value="{{= reason }}" />{{= reason }}
            </label>
        </li>
        {{~}}
        {{??}}
        {{
            reasons = _.find(it.text, function (item) {
                return item.type === 'REPLACE';
            }).content;
        }}
        {{~ reasons : reason }}
        <li>
            <label>
                <input type="radio" name="{{= id }}" value="{{= reason }}" />{{= reason }}
            </label>
        </li>
        {{~}}
        {{?}}
        <li>
            <label>
                <input type="radio" name="{{= id }}" value="" />{{= i18n.app.OTHERS }}<input disabled="true" type="text" class="input-reason" />
            </label>
        </li>
    </ul>
    <div class="button-ctn">
        <button class="button-send primary">{{= i18n.misc.SEND }}</button>
        <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="result-item">
    {{? it.result.suggestion.action === 'REPLACE' }}
    <div class="back replace-confirm vbox">
        <div class="wording-ctn">
            <p>{{= i18n.app.WASH_RESULT_ITEM_ATTENTION }}</p>
            <p>{{= i18n.app.WASH_RESULT_ITEM_CONFIRM }}</p>
        </div>
        <div class="button-ctn">
            <button class="button-replace primary">{{= i18n.ui.CONFIRM }}</button>
            <button class="button-cancel">{{= i18n.ui.CANCEL }}</button>
        </div>
    </div>
    {{?}}
    <div class="front vbox">
        {{? it.result.function.type === 'PIRATE' }}
        <div class="tag pirate" data-title="{{= i18n.app.WASH_RESULT_ITEM_CHANGE_BY_OTHERS }}">{{= i18n.app.PIRATE }}</div>
        {{??}}
        <div class="tag ads" data-title="{{= i18n.app.WASH_RESULT_ITEM_APP_HAS_ADS }}">{{= i18n.app.ADS }}</div>
        {{?}}
        <div class="hbox app-info">
            <div class="icon"><img src="{{= it.origin.base_info.icon }}" alt="{{= it.origin.base_info.name }}" /></div>
            <div class="title wc">{{= it.origin.base_info.name }}</div>
        </div>
        <div class="content">
        {{! it.result.summary }}{{? it.result.candidateApks }}<div class="info"></div>{{?}}
        </div>
        <div class="button-ctn">
            {{? it.result.suggestion.action === 'CLOSEPOPUP' }}
            <button class="button-close-ads">{{= i18n.app.WASH_RESULT_ITEM_DISABLE_ADS }}</button>
            {{?? it.result.suggestion.action === 'UNINSTALL' }}
            <button class="button-uninstall">{{= i18n.app.UNINSTALL }}</button>
            {{??}}
            <button class="button-confirm">{{= i18n.app.REPLACE }}</button>
            {{?}}
            <span class="link button-ignore">{{= i18n.app.WASH_RESULT_ITEM_IGNORED}}</span>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="wash-error">
    <h1 class="text-primary title">{{= i18n.app.APP_WASH_ERROR }}</h1>
    <p class="text-secondary">{{= i18n.app.WASH_ERROR_TIP }}</p>
    <button class="grand button-retry primary">{{= i18n.app.WASH_RETRY }}</button>
</script>

<script type="text/x-ui-template" id="wash-feedback">
    <div class="step-1 step">
        <label>
            <input type="radio" name="wash-feedback-type" value="1">{{= i18n.app.WASH_FEED_BACK_WRONG }}
        </label>
        <label>
            <input type="radio" name="wash-feedback-type" value="2">{{= i18n.app.WASH_FEED_BACK_LEAP }}
        </label>
        <label>
            <input type="radio" name="wash-feedback-type" value="3">{{= i18n.app.OTHERS }}<input disabled="true" class="input-reason" type="text" />
        </label>
    </div>
</script>

<script type="text/x-ui-template" id="wash-feedback-item">
    <input class="item-checker" type="checkbox" value="{{= it.id }}">
    <label class="wrap hbox">
        <input type="radio" name="wash-feedback-item" value="{{= it.base_info.package_name }}" />
        <div class="icon-ctn">
            <img src="{{= it.base_info.icon }}" alt="{{= it.base_info.name }}" />
        </div>
        {{= it.base_info.name }}
    </lebel>
</script>

<script type="text/x-ui-template" id="wash-feedback-reason">
    <div class="step-3 step">
        {{
            var reasons;
        }}
        {{? it.type === 1 }}
            {{
                reasons = _.find(it.text, function (item) {
                    return item.type === 'WRONG';
                }).content;
            }}
            {{~ reasons : reason }}
            <label>
                <input type="radio" name="wash-feedback-reason" value="{{= reason }}">{{= reason }}
            </label>
            {{~}}
        {{??}}
            {{
                reasons = _.find(it.text, function (item) {
                    return item.type === 'MISSING';
                }).content;
            }}
            {{~ reasons : reason }}
            <label>
                <input type="radio" name="wash-feedback-reason" value="{{= reason }}">{{= reason }}
            </label>
            {{~}}
        {{?}}
        <label>
            <input type="radio" name="wash-feedback-reason" value="">{{= i18n.app.WASH_DO_SOMETHING_BAD }}<input disabled="true" class="input-reason" type="text" />
        </label>
    </div>
</script>

<script type="text/x-ui-template" id="wash-notification">
    <div class="icon-ctn">
        <div class="icon"></div>
    </div>
    <div class="info">
        <h2 class="text-primary">{{= i18n.app.WASH_NOTIFI_PRIMARY_TITLE }}</h2>
        <p class="text-secondary">{{= i18n.app.WASH_NOTIFI_SEC_TITLEO }}</p>
        <button class="primary button-wash">{{= i18n.app.WASH_NOTIFI_DO_WASH }}</button>
    </div>
</script>

<script type="text/x-ui-template" id="result-info">
    <ul class="w-app-wash-info">
        <li class="hbox info">
            <div>{{= i18n.app.WASH_RESULT_INFO_BEFORE_REPLACE }}<div></div></div>
            <ul class="item-ctn">
                {{~ it.candidateApks[0].detailChange : change }}
                {{
                    var warn = change.level === 'BETTER';
                }}
                <li class="item {{? warn }}text-warning{{??}}text-primary{{?}}">
                    <div class="icon {{? warn }}warn{{??}}check{{?}}"></div>
                    {{= change.source }}
                </li>
                {{~}}
            </ul>
        </li>
        <li class="hbox info">
            <div>{{= i18n.app.WASH_RESULT_INFO_AFTER_REPLACE }}<div></div></div>
            <ul class="item-ctn">
                {{~ it.candidateApks[0].detailChange : change }}
                {{
                    var warn = change.level === 'WORTH';
                }}
                <li class="item {{? warn }}text-warning{{??}}text-primary{{?}}">
                    <div class="icon {{? warn }}warn{{??}}check{{?}}"></div>
                    {{= change.candidate }}
                </li>
                {{~}}
            </ul>
        </li>
    </ul>
</script>

<script type="text/x-ui-template" id="close-notification">
    <div class="w-app-wash-close-popup-ctn">
        <h1 class="text-primary">{{= it.title }}</h1>
        <div class="close-popup-tip hbox">
            <div class="tip1"></div>
            <div class="tip2"></div>
        </div>
    </div>
</script>
</templates>
