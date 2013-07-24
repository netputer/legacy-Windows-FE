<templates>
<script type="text/x-ui-template" id="main">
    <div class="ctn vbox">
        <div class="w-task-mask"></div>
    </div>
</script>

<script type="text/x-ui-template" id="task-list">
    <header class="w-smart-list-header text-secondary hbox">
        <div class="name">{{= i18n.taskManager.TASK_NAME }}</div>
        <div class="size">{{= i18n.misc.SIZE }}</div>
        <div class="progress">{{= i18n.taskManager.PROGRESS }}</div>
        <div class="action"></div>
    </header>
</script>

<script type="text/x-ui-template" id="toolbar">
    <input type="checkbox" class="check-select-all" />
    <button class="w-icon-btn button-pause min">
        <span class="icon pause"></span>{{= i18n.misc.PAUSE }}
    </button>
    <button class="w-icon-btn button-continue min">
        <span class="icon start"></span>{{= i18n.ui.CONTINUE }}
    </button>
    <button class="w-icon-btn button-delete min">
        <span class="icon delete"></span>{{= i18n.misc.DELETE }}
    </button>
    <div class="split"></div>
    <button class="w-icon-btn button-open-folder min">
        <span class="icon open-folder"></span>{{= i18n.taskManager.OPEN_DOWNLOAD_FOLDER }}
    </button>
    <div class="button-close"></div>
</script>

<script type="text/x-ui-template" id="list-item">
    <label class="input item-checker-wrap">
        <input class="item-checker" type="checkbox" value="{{= it.id }}">
    </label>
    <div class="icon" title="{{! it.more_info || '' }}">
        <img src="{{= it.icon }}" alt="{{! it.title }}" />
    </div>
    <div class="title" title="{{! it.more_info || '' }}">{{= it.title }}</div>
    <div class="size text-secondary">{{= (it.size && Number(it.size) !== 0) ? StringUtil.readableSize(it.size) : i18n.taskManager.UNKNOWN }}</div>
    <div class="status vbox text-thirdly">
        {{
            switch (it.type) {
                case CONFIG.enums.TASK_TYPE_DOWNLOAD :
                    switch (it.state) {
                        case CONFIG.enums.TASK_STATE_ADDED :
        }}
        <div class="progress hbox">
            <progress class="tiny disabled" max="100" value="{{= it.processing }}" />
        </div>
        <div>
            {{= StringUtil.format(i18n.taskManager.PAUSE_STATUS, StringUtil.readableSize(it.size * (it.processing / 100))) }}
        </div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_WAITING :
        }}
        <div class="progress hbox">
            <progress class="tiny disabled" max="100" value="{{= it.processing }}" />
        </div>
        <div>{{= i18n.taskManager.WAITING_DOWNLOAD }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_PROCESSING :
        }}
        <div class="progress hbox">
            <progress class="tiny" max="100" value="{{= it.processing }}" />
        </div>
        <div>
            {{= StringUtil.format(i18n.taskManager.RUNNING_STATUS, StringUtil.readableSize(it.received_size), StringUtil.readableSize(it.speed)) }}
        </div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_FAILD :
                            if (it.message === 'NO_SPACE' ) {
        }}
        <div class="text-warning">{{= i18n.taskManager.NO_SPACE }}</div>
        {{
                            } else {
        }}
        <div class="text-warning">{{= i18n.taskManager.DOWNLOAD_FAILED }}</div>
        {{
                            }
                            break;
                    }
                    break;
                case CONFIG.enums.TASK_TYPE_INSTALL :
                    switch (it.state) {
                        case CONFIG.enums.TASK_STATE_ADDED :
        }}
        <div>{{= i18n.taskManager.STOPPED }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_WAITING :
        }}
        <div class="progress hbox"><progress class="tiny" max="100" value="100" /></div>
        <div>{{= i18n.taskManager.WAITING_INSTALL }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_PROCESSING :
                            if(it.message === 'SCAN_VIRUS') {
        }}
        <div class="progress hbox"><progress class="tiny running" max="100" value="100" /></div>
        <div>{{= i18n.taskManager.SCANNING }}</div>
        {{
                            } else {
        }}
        <div class="progress hbox"><progress class="tiny running" max="100" value="100" /></div>
        <div>
            {{= i18n.taskManager.INSTALLING }}
            {{? it.message === 'INSTALLING_PASS_VIRUS_SCAN' }}
            &nbsp;-&nbsp;<span class="text-primary">{{= i18n.taskManager.SCAN_PASS }}</span>
            {{?? it.message === 'INSTALLING_VIRUS_SCAN_FAILED' }}
            &nbsp;-&nbsp;<span class="text-warning">{{= i18n.taskManager.SCAN_FAILED }}</span>
            {{?}}
        </div>
        {{
                            }
                            break;
                        case CONFIG.enums.TASK_STATE_SUCCESS :
        }}
        <div>
            {{? it.message === 'NEED_CONFIRM' }}
            {{= i18n.taskManager.CONFIRM_ON_DEVICE }}
            {{??}}
            {{= i18n.ui.FINISH }}
            {{?}}
        </div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_FAILD :
        }}
        <div class="text-warning">{{= i18n.taskManager[it.message] || i18n.taskManager.UNKNOWN_ERROR }}</div>
        {{              break;
                    }
                    break;
                case CONFIG.enums.TASK_TYPE_PARSING_VIDEO_URL:
                    switch (it.state) {
                        case CONFIG.enums.TASK_STATE_PROCESSING :
        }}
        <div class="progress hbox"><progress class="tiny running" max="100" value="100" /></div>
        <div>{{= i18n.taskManager.PARSING_VIDEO_URL }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_SUCCESS :
        }}
        <div>{{= i18n.taskManager.PARSING_VIDEO_URL_SUCCESS }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_FAILD :
        }}
        <div class="text-warning">{{= i18n.taskManager[it.message] || i18n.taskManager.UNKNOWN_ERROR }}</div>
        {{
                            break;
                        default:
        }}
        <div>{{= i18n.taskManager.WAITING_DOWNLOAD }}</div>
        {{
                    }
                    break;
                case CONFIG.enums.TASK_TYPE_MERGE_VIDEO:
                    switch (it.state) {
                        case CONFIG.enums.TASK_STATE_PROCESSING :
        }}
        <div class="progress hbox"><progress class="tiny running" max="100" value="100" /></div>
        <div>{{= i18n.taskManager.MERGE_VIDEO }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_SUCCESS :
        }}
        <div>{{= i18n.taskManager.MERGE_VIDEO_SUCCESS }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_FAILD :
        }}
        <div class="text-warning">{{= i18n.taskManager[it.message] || i18n.taskManager.UNKNOWN_ERROR }}</div>
        {{
                            break;
                    }
                    break;
                case CONFIG.enums.TASK_TYPE_PUSH :
                    switch (it.state) {
                        case CONFIG.enums.TASK_STATE_ADDED :
        }}
        <div class="progress hbox">
            <progress class="tiny disabled" max="100" value="{{= it.processing }}" />
        </div>
        <div>
            {{= StringUtil.format(i18n.taskManager.PUSH_PAUSE_STATUS, StringUtil.readableSize(it.size * (it.processing / 100))) }}
        </div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_WAITING :
        }}
        <div>{{= i18n.taskManager.WAITING_PUSHING }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_PROCESSING :
                            if(it.message === 'START_UNZIPPING') {
        }}
        <div class="progress hbox"><progress class="tiny running" max="100" value="100" /></div>
        <div>
            {{= i18n.taskManager.START_UNZIPPING }}
        </div>
        {{
                            } else if(it.message === 'UNZIP_COMPLETE') {
        }}
        <div class="progress hbox"><progress class="tiny running" max="100" value="100" /></div>
        <div>
            {{= i18n.taskManager.UNZIP_COMPLETE }}
        </div>
        {{
                            } else {
        }}
        <div class="progress hbox">
            <progress class="tiny running" max="100" value="{{= it.processing }}" />
        </div>
        <div>
            {{= i18n.taskManager.PUSHING }}
            {{? it.received_size }}
            {{= StringUtil.format(i18n.taskManager.PUSHING_STATUS, StringUtil.readableSize(it.received_size), StringUtil.readableSize(it.speed)) }}
            {{?}}
        </div>
        {{
                            }
                            break;
                        case CONFIG.enums.TASK_STATE_SUCCESS :
        }}
        <div>{{= i18n.ui.FINISH }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_FAILD :
        }}
        <div class="text-warning">{{= i18n.taskManager[it.message] || i18n.taskManager.UNKNOWN_ERROR }}</div>
        {{
                            break;
                            break;
                        case CONFIG.enums.TASK_STATE_STOPPED :
        }}
        <div>{{= i18n.taskManager.WAITING_PUSHING }}</div>
        {{
                            break;
                    }
                    break;
                case CONFIG.enums.TASK_TYPE_RESTORE_APP_DATA :
                    switch (it.state) {
                        case CONFIG.enums.TASK_STATE_ADDED :
        }}
        <div>{{= i18n.taskManager.STOPPED }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_WAITING :
        }}
        <div>{{= i18n.taskManager.WAITING_RESTORE_APP_DATA }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_PROCESSING :
                            if (it.message === CONFIG.enums.BACKUP_APP_DATA_MESSAGE_NEED_USER_RESTORE) {
        }}
        <div class="text-warning">{{= i18n.backup_restore.RESTORE_APP_DATA_WAITING }}</div>
        {{
                            } else {
        }}
        <div class="progress hbox"><progress class="tiny running" max="100" value="100" /></div>
        <div>{{= i18n.taskManager.PROCESSING_RESTORE_APP_DATA }}</div>
        {{
                            }
                            break;
                        case CONFIG.enums.TASK_STATE_SUCCESS :
        }}
        <div>
            {{= i18n.ui.FINISH }}
        </div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_FAILD :
        }}
        <div>
            {{= i18n.backup_restore.RESTORE_APP_DATA_ERROR }}
        </div>
        {{
                        break;
                    }
                    break;
            case CONFIG.enums.TASK_TYPE_UNZIP :
                switch (it.state) {
                        case CONFIG.enums.TASK_STATE_PROCESSING :
        }}
        <div>{{= i18n.taskManager.UNZIPING }}</div>
        {{
                            break;
                        case CONFIG.enums.TASK_STATE_FAILD :
        }}
        <div class="text-warning">{{= i18n.taskManager.UNZIP_FAILED }}</div>
        {{
                            break;
                }
                break;
            }
        }}
    </div>
</script>

<script type="text/x-ui-template" id="task-action">
    {{
        switch (it.type) {
            case CONFIG.enums.TASK_TYPE_DOWNLOAD :
                switch (it.state) {
                    case CONFIG.enums.TASK_STATE_ADDED :
    }}
    <button class="button-start">{{= i18n.ui.CONTINUE }}</button>
    {{
                        break;
                    case CONFIG.enums.TASK_STATE_PROCESSING :
    }}
    <button class="button-pause">{{= i18n.misc.PAUSE }}</button>
    {{
                        break;
                    case CONFIG.enums.TASK_STATE_FAILD :
                        if (it.message === 'NO_SPACE') {
    }}
    <button class="button-change-path">{{= i18n.ui.CHANGE_DOWN_PATH }}</button>
    {{
                        } else {
    }}
    <button class="button-retry">{{= i18n.ui.RETRY }}</button>
    {{
                        }
                        break;
                }
                break;
            case CONFIG.enums.TASK_TYPE_INSTALL :
                switch (it.state) {
                    case CONFIG.enums.TASK_STATE_ADDED :
    }}
    <button class="button-start">{{= i18n.ui.CONTINUE }}</button>
    {{
                        break;
                    case CONFIG.enums.TASK_STATE_FAILD :
                        if(it.forceRestart) {
    }}
    <button class="button-force-restart secondary">{{= i18n.taskManager.UNINSTALL_THEN_INSTALL }}</button>
    <span class="button-delete link">{{= i18n.misc.DELETE }}</span>
    {{
                        } else if (it.message === 'NO_MORE_MEMORY') {
                            if (it.category === CONFIG.enums.MODEL_TYPE_APPLICATION) {
    }}
    <button class="button-change-location primary">{{= i18n.taskManager.CHANGE_INSTALL_LOCATION }}</button>
    <span class="button-manage-app link">{{= i18n.taskManager.MANAGE_APP }}</span>
    {{
                            }
    }}
    <span class="button-delete link">{{= i18n.misc.DELETE }}</span>
    {{
                        } else if (it.message === 'NO_MORE_SDCARD') {
                            if (it.category === CONFIG.enums.MODEL_TYPE_APPLICATION) {
    }}
    <button class="button-install-to-device secondary">{{= i18n.taskManager.INSTALL_TO_DEVICE }}</button>
    {{
                            }
    }}
    <span class="button-manage-sd link">{{= i18n.taskManager.MANAGE_SD }}</span>
    <span class="button-delete link">{{= i18n.misc.DELETE }}</span>
    {{
                        } else if (it.message === 'INSTALL_FAILED_MALICIOUS_APK') {
    }}
    <button class="button-delete secondary">{{= i18n.taskManager.DELETE_TASK }}</button>
    <span class="button-continue-install link">{{= i18n.taskManager.CONTINUE_INSTALL }}</span>
    {{
                        } else if (it.message === 'INSTALL_FAILED_DEVICE_NOT_FOUND' ||
                                it.message === 'CONNECTION_LOST' ||
                                it.message === 'DEVICE_NOT_FOUND') {
    }}
    <button class="button-connect primary">{{= i18n.welcome.CONNECT_PHONE }}</button>
    {{
                        } else {
                            if(!it.blockAction) {
    }}
    <button class="button-retry">{{= i18n.ui.RETRY }}</button>
    {{
                            }
                        }
                        break;
                }
                break;
            case CONFIG.enums.TASK_TYPE_PUSH :
                switch (it.state) {
                    case CONFIG.enums.TASK_STATE_ADDED :
    }}
    <button class="button-start">{{= i18n.ui.CONTINUE }}</button>
    {{
                        break;
                    case CONFIG.enums.TASK_STATE_SUCCESS :
                        switch(it.category) {
                            case CONFIG.enums.MODEL_TYPE_BOOK :
    }}
    <button class="button-open-on-device primary">{{= i18n.misc.VIEW }}</button>
    {{

                                break;
                            case CONFIG.enums.MODEL_TYPE_PHOTO :
    }}
    <button class="button-set-as-wallpaper primary">{{= i18n.taskManager.SET_AS_WALL_PAPER }}</button>
    {{
                                break;
                             case CONFIG.enums.MODEL_TYPE_MUSIC :
    }}
    <button class="button-set-as-ringtong primary">{{= i18n.taskManager.SET_AS_RINGTONE }}</button>
    {{
                            break;
                        }
                        break;
                    case CONFIG.enums.TASK_STATE_FAILD :
    }}
    <button class="button-retry">{{= i18n.ui.RETRY }}</button>
    {{
                        break;
                }
                break;
            case CONFIG.enums.TASK_TYPE_PARSING_VIDEO_URL:
                switch (it.state) {
                    case CONFIG.enums.TASK_STATE_FAILD :
    }}
    <button class="button-retry">{{= i18n.ui.RETRY }}</button>
    {{
                        break;
                }
                break;
            case CONFIG.enums.TASK_TYPE_MERGE_VIDEO:
                switch (it.state) {
                    case CONFIG.enums.TASK_STATE_FAILD :
    }}
    <button class="button-retry">{{= i18n.ui.RETRY }}</button>
    {{
                        break;
                }
                break;
        }
    }}
</script>

<script type="text/x-ui-template" id="monitor-item">
    <div class="content hbox">
        <div class="icon {{= it.icon }}"></div>
        <div class="desc text-secondary">{{= it.desc }}</div>
    </div>
</script>

<script type="text/x-ui-template" id="task-ctn">
    <div class="active item">
        <div class="content hbox">
            <div class="active-wrap">
                <div class="icon"></div>
            </div>
            <div class="desc text-secondary"></div>
        </div>
    </div>
    <div class="push item">
        <div class="content hbox">
            <div class="icon"></div>
            <div class="desc text-secondary"></div>
        </div>
    </div>
    <div class="error item">
        <div class="content hbox">
            <div class="icon"></div>
            <div class="desc text-warning"></div>
        </div>
    </div>
    <div class="cache item">
        <div class="content hbox">
            <div class="icon"></div>
            <div class="desc text-secondary">{{= i18n.taskManager.NO_TASK_RUNNING }}</div>
        </div>
    </div>
</script>

<script type="text/x-ui-template" id="disconnect-tip">
    <div class="w-task-popup-tip">
        <h2>{{= i18n.taskManager.DEVICE_NOT_CONNECT }}</h2>
        <p>{{= i18n.taskManager.DEVICE_NOT_CONNECT_TIP }}</p>
        <div class="cf">
            <button class="button-connect primary">{{= i18n.welcome.CONNECT_PHONE }}</button>
        </div>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="confirm-tip">
    <div class="w-task-popup-tip">
        <h2>{{= i18n.taskManager.CONFIRM_ON_DEVICE }}</h2>
        <p>{{= i18n.taskManager.CONFIRM_ON_DEVICE_TIP }}</p>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="confirm-miui-v5-tip">
    <div class="w-task-popup-tip">
        <h2>{{= i18n.taskManager.CONFIRM_ON_DEVICE }}</h2>
        <p>{{= i18n.taskManager.CONFIRM_ON_DEVICE_MIUI_V5_TIP }}</p>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="disconnect-running-tip">
    <div class="w-task-popup-tip">
        <h2>{{= i18n.taskManager.DEVICE_DISCONNECT }}</h2>
        <p>{{= i18n.taskManager.DEVICE_DISCONNECT_TIP }}</p>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="offline-task-added">
    <div class="w-task-popup-tip">
        <p>{{= StringUtil.format(i18n.taskManager.OFFLINE_TASK_TIP, it.count) }}</p>
    </div>
</script>

<script type="text/x-ui-template" id="delete-monitor">
    <input type="checkbox" class="check-delete-apk" checked />
    {{= i18n.taskManager.DELET_APK_ALSO }}
</script>

<script type="x-ui-template" id="task-dashboard">
    <li class="hbox">
        <div class="icon speed"></div>
        <div class="desc">{{= StringUtil.readableSize(it.speed) }}/s</div>
    </li>
    {{? it.active !== 0 }}
    <li class="hbox">
        <div class="icon active"></div>
        <div class="desc">{{= StringUtil.format(i18n.taskManager.RUNNING_COUNT_TIP, it.active) }}</div>
    </li>
    {{?}}
    {{? it.complete !== 0 }}
    <li class="hbox">
        <div class="icon complete"></div>
        <div class="desc">{{= StringUtil.format(i18n.taskManager.COMPLETE_COUNT_TIP, it.complete) }}</div>
    </li>
    {{?}}
    {{? it.error !== 0 }}
    <li class="hbox">
        <div class="icon error"></div>
        <div class="desc">{{= StringUtil.format(i18n.taskManager.ERROR_COUNT_TIP, it.error) }}</div>
    </li>
    {{?}}
</script>

<script type="text/x-ui-template" id="out-of-space">
    <div class="w-task-popup-tip">
        <h2>{{= i18n.taskManager.OUT_OF_SPACE_WARN }}</h2>
        <p>{{= i18n.taskManager.OUT_OF_SPACE_TIP }}</p>
        <div class="cf">
            <button class="button-change-disk primary">{{= i18n.taskManager.MODIFY_STORAGE_DISK }}</button>
        </div>
        <div class="button-close"></div>
    </div>
</script>

<script type="text/x-ui-template" id="not-enough-space">
    <div class="w-task-popup-tip">
        <h2>{{= i18n.taskManager.NOT_ENOUGH_SPACE_WARN }}</h2>
        <p>{{= i18n.taskManager.NOT_ENOUGH_SPACE_TIP }}</p>
        <div class="cf">
            <button class="button-change-disk primary">{{= i18n.taskManager.MODIFY_STORAGE_DISK }}</button>
        </div>
        <div class="button-close"></div>
    </div>
</script>
</templates>
