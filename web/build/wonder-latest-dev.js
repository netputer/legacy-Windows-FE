/**
 * Root namespace for wonder application, initialize OO APIs and communication
 * APIs
 *
 * @author jingfeng@wandoujia.com, wangye.zhao@wandoujia.com
 */
(function(host, wonder) {
    var meta = {
        /**
         * Copy all properties from supplier to receiver
         *
         * @param {Object} receiver Receiver object
         * @param {Object} supplier Supplier object
         * @param {Boolean} [override]<true> Whether override if properties are
         * already defined in receiver object
         * @param {Array} [whiltelist]<undefined> Only the properties in white
         * list will be copy to receiver
         * @return {Object} Augmented object with properties from supplier
         */
        mix : function(receiver, supplier, override, whitelist) {
            if (!receiver && !supplier) {
                return receiver;
            }
            override = override === undefined ? true : override;
            var _mix = function(property, receiver, supplier, override) {
                if (override || !( property in receiver)) {
                    receiver[property] = supplier[property];
                }
            };
            // Copy all properties or only those specified in white list
            if (whitelist) {
                _.each(whiteist, function(property) {
                    if ( property in supplier) {
                        _mix(property, receiver, supplier, override);
                    }
                });
            } else {
                var property;
                for (property in supplier) {
                    _mix(property, receiver, supplier, override);
                }
            }
            return receiver;
        }
    };
    //if wonder is already defined, the existed object will not be overritten so
    // that defined namespaces are preserved.
    var base = (host && host[wonder]) || {}, EMPTY = '';
    // QUESTION: what is the purpose of supporting dynamic host object?
    // QUESTION: why is `wonder` a string?
    base.host = host || {};
    wonder = host['WD'] = host[wonder] = meta.mix(base, meta, false);
    // QUESTION: why 'WD' is special?
    wonder.mix(wonder, {
        events : Backbone.Events,
        query : jQuery,
        createElement : jQuery,
        // QUESTION: what is the purpose of linking jQuery & Backbone objects?
        modules : {},
        getUid : function() {
            return _.uniqueId('wonder_uid_');
        },
        /**
         * Inherit the prototype methods from one constructor into another
         *
         * @param {function()} subclass Subclass
         * @param {function()} superclass Superclass
         */
        extend : function(subclass, superclass) {
            if (!subclass) {
                console.error('Seed - Please specify subclass.');
            }
            superclass = superclass || Object;
            var tempFun = function() {
            };

            tempFun.prototype = superclass.prototype;
            subclass.prototype = new tempFun();
            subclass.prototype.constructor = subclass;
            subclass._super_ = superclass.prototype;
            if (superclass.prototype.constructor === Object.prototype.construtor) {
                superclass.prototype.constructor = superclass;
            }
        },
        /**
         * return the namespace specied and create it if it does't existed;
         * be careful when naming space
         * wonder.namespace('wonder.app'); // returns wonder.app
         * wonder.namespace('wonder.music'); // returns wonder.music
         * @return {object} A reference to the last namespace object created
         */
        namespace : function() {
            var args = arguments, l = args.length, o = null, i, j, p, global = (args[l - 1] === true && l--);
            // TODO: use more specific variable names.
            for ( i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                // QUESTION: what `this` could be in this context?
                for ( j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            // QUESTION: what if user passes more than one namespace in the
            // argument? still returns the last namespace object?
            return o;
        },
        /**
         * add module code but it wouldn't be executed.
         * @para {string} name, module name.
         * @para {function()} func, moudel code which will be executed when
         * use "useModule" method
         */
        addModule : function(name, func) {
            if (!name) {
                throw new Error('please specified module name when create module');
            }
            var moduleList = this.modules[name] || (this.modules[name] = []);
            moduleList.push(func);
        },
        /**
         * boot the specified module
         * @para {String} name, module name
         */
        useModule : function(name) {
            if (!name) {
                throw new Error('please give module name when boot module');
            }
            var moduleList = this.modules[name];
            if (_.isArray(moduleList)) {
                _.each(moduleList, function(func) {
                    func.call(this, this);
                }, this);
                this.modules[name] = [];
            }
        }
    });

    // Copy the underscore API to wonder
    wonder.mix(wonder, _ || {}, false);
    // TODO: I don't think mixing functional operation and DOM operation in one
    // object (`wonder`) is a good idea.

    // Init the conmunication API
    wonder.mix(wonder, {
        // TODO: mixing too many things from different domains will make `wonder` work like no namespace at all.
        /**
         * Get parameter from URL
         *
         * @param {String} para Given parameter
         * @return {string} Parameter value
         */
        getParameter : function(para) {
            // TODO: use a more generic and more robust version of this function
            // from other library if possible.
            var location = window.location.href;
            var temp = location.split('?');
            // QUESTION: what if there are more than one question mark in the
            // url? what does the spec says about this? see rfc 3986.
            var args = [];
            var para_fragment = '';
            if (temp.length <= 1) {
                console.error('Seed - Please specify parameters in url.');
            }
            args = temp[1].split('&');
            for (var i = 0; i < args.length; i++) {
                if (args[i].indexOf(para) >= 0) {
                    para_fragment = args[i];
                    break;
                }
            }
            return ( para_fragment ? para_fragment.split('=')[1].replace('#', '') : null);
            // QUESTION: what if there are more than one equal signs in one
            // parameter? for example 'x=0&y=z=hello'.
        },
        /**
         * Get device ID
         *
         * @return {String} Device ID, return 'Default' if device_id is undefined
         */
        getDeviceID : function() {
            return this.getParameter('device_id') || 'Default';
        },
        /**
         * Create AJAX call
         *
         * @param {object} options Data structure:
         *  {
         *     url : 'wdj://contact',
         *     type : 'get' || 'post',
         *     data : object ,
         *     success : function(){},
         *     error : function(){}
         *  }
         */
        ajax : function(options) {
            // QUESTION: do we need a function supporting both 'http://' &
            // 'wdj://' address?
            // How about use jQuery.ajax() for a real 'http://' AJAX call?
            var deferred = $.Deferred();
            options = options || {};
            if (options.url) {
                options.type = options.type || 'get';
                options.data = options.data || {};
                options.directCallback = options.directCallback || false;
                var url = options.url;

                switch(options.type.toLowerCase()) {
                    case 'get' :
                        var datas = [];
                        for (var d in options.data) {
                            datas.push(d + '=' + window.encodeURIComponent(options.data[d]));
                        }
                        if (datas.length > 0) {
                            url = url + '?' + datas.join('&');
                        }
                        window.OneRingRequest(options.type, url, null, done);
                        break;
                    case 'post' :
                        window.OneRingRequest(options.type, url, window.encodeURIComponent(JSON.stringify(options.data)), done);
                        break;
                }

                function done(resp) {
                    var respObj = JSON.parse(resp);
                    // TODO Remove business code from here!!!!!!!!
                    if (!options.directCallback) {
                        switch(respObj.state_code) {
                            case 702:
                                alert(i18n.misc.ALERT_TIP_NO_SD_CARD);
                                break;
                            case 703:
                                var alertWindow = new window.UI.Panel({
                                    draggable : true,
                                    buttonSet : 'retry_cancel',
                                    width : 500,
                                    $bodyContent : doT.template(TemplateFactory.get('misc', 'sd-mount'))({})
                                });
                                alertWindow.on('button_retry', function() {
                                    wonder.ajax(options);
                                    alertWindow.close();
                                });
                                alertWindow.show();
                                break;
                        }
                    }

                    options.success && options.success.call(window, resp);
                    deferred.resolve();
                    console.log('AJAX call - Callback message for \'' + options.url + '\'', respObj);
                }


                console.log('AJAX call - Method: ' + options.type.toUpperCase() + '; URL = ' + options.url, options);
            } else {
                console.error('AJAX call - Init error. Parameters: ', options);
            }
            return deferred.promise();
        },
        /**
         * Send log
         *
         * @param {object} para Log parameters
         */
        log : function(para) {
            // QUESTION: why not calling `ajax` instead?
            // This method is used for sending logs to server through back-end,
            // we put a switcher and log info here in order to control it and see
            // what
            // exactly we've sent in console without reduplicate log in
            // wonder.ajax()
            var _switchOn = true;
            if (_switchOn) {
                para = para || {};
                wonder.mix(para, {
                    device_id : wonder.getDeviceID()
                }, true);
                var url = CONFIG.actions.SEND_LOG;
                var datas = [];
                for (var d in para) {
                    datas.push(d + '=' + para[d]);
                }
                url += '?' + datas.join('&');
                window.OneRingRequest('get', url, '', function(resp) {
                    resp = JSON.parse(resp);
                    if (resp.state_code === 200) {
                        console.log('Send Log: ', url);
                    }
                });
            }
        }
    });

    //the timer related api
    wonder.mix(wonder, {
        delay : function(scope, func, duration) {
            setTimeout(function() {
                func.call(scope);
            }, duration);
        }
    });
})(this, 'wonder');
﻿/**
 * @fileoverview Wonder provide utility function in UT object including Date,
 * template etc.
 * @author jingfeng@wandoujia.com, wangye.zhao@wandoujia.com
 */
wonder.addModule('wonder/utils', function(W) {

    /**
     * Template utilities
     */
    var template = {};
    W.mix(template, {
        /**
         * Template module paths
         *
         * @private
         */
        _module : {
            // TODO: meta data like these should be generated by build tools, at
            // least written in config.
            ui : '../../web/build/templates/ui/UITemplate.tpl',
            application : '../../web/build/templates/module/application/application.tpl',
            contact : '../../web/build/templates/module/contact/contact.tpl',
            video : '../../web/build/templates/module/video/video.tpl'
        },
        /**
         * DOM objects pool
         *
         * @private
         */
        _dom : {},
        /**
         * Get template with given name and ID
         *
         * @param {string} name Given template name
         * @param {string} templateID Given template node ID
         * @return {string} Template string
         */
        get : function(name, templateID) {
            var self = this;
            if (!this._dom[name]) {
                $.ajax({
                    url : this._module[name],
                    success : function(resp) {
                        console.log('Util - Template loaded: ' + self._module[name]);
                        self._dom[name] = $(StringUtil.compressHTML(resp));
                    },
                    error : function() {
                        // TODO: error should not be triggered and should be
                        // removed.
                        console.error('Util - Template loaded failed: ' + self._module[name]);
                    },
                    dataType : 'text',
                    async : false
                });
            }
            if (this._dom[name]) {
                return this._dom[name].find('#' + templateID).html();
                // QUESTION: why return if it's not guaranteed?
            } else {
                console.error('Util - Can\'t find template with name "' + name + '".');
                return null;
            }
        },
        /**
         * Make template object with given jQuery object
         *
         * @param {object} obj jQuery object
         * @return {object} Template object
         */
        makeTemplate : function(sourceTemplate) {
            // QUESTION: it seems nobody calls `makeTemplate`?
            sourceTemplate = sourceTemplate.trim();
            var output = '';
            var startString = sourceTemplate.slice(0, sourceTemplate.search(/>/) + 1);
            var endString = sourceTemplate.slice(sourceTemplate.lastIndexOf('<'), sourceTemplate.length);
            output = sourceTemplate.substr(startString.length, sourceTemplate.length);
            // QUESTION: why template content is wrapped in
            // `<templates></templates>`?
            return _.template(output.substr(0, output.length - endString.length));
        },
        /**
         * Make jQuery object with given template string
         *
         * @param {string} sourceTemplate Template string
         * @return {object} jQeury object
         */
        makeEl : function(sourceTemplate) {
            // QUESTION: it seems nobody calls `makeEl`?
            return $(sourceTemplate.slice(sourceTemplate.search(/</), sourceTemplate.search(/>/) + 1));
        }
    });
    W.Template = template;

    /**
     * String Utilities
     */
    var string = {};
    W.mix(string, {
        /**
         * Test a string whether ends with given suffix
         *
         * @param {string} str Source string
         * @param {string} suffix Given suffix
         * @return {boolean} Return true if the string ends with given suffix
         */
        endsWith : function(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },
        /**
         * Make bytes readable
         *
         * @param {String} bytes Bytes data
         * @return {String} Readable string
         */
        readableSize : function(bytes) {
            bytes = parseInt(bytes, 10);
            var units = ['B', 'KB', 'MB', 'GB', 'TB'];
            bytes = Math.max(bytes, 0);
            var pow = Math.floor(( bytes ? Math.log(bytes) : 0) / Math.log(1024));
            pow = Math.min(pow, units.length - 1);
            bytes = bytes * 100 / Math.pow(1024, pow);
            var unit = units[pow];
            if (unit === 'KB' || unit === 'B') {
                return Math.round(Math.round(bytes) / 100) + ' ' + units[pow]
            } else {
                return Math.round(bytes) / 100 + ' ' + units[pow];
            }
        },
        /**
         * Format string with given template and attributes
         *
         * @return {string} Formated string
         */
        formatString : function() {
            var str = arguments[0];
            if ( typeof arguments[1] === "object") {
                var vars = arguments[1];
                return str.replace(/\{(\w+)\}/g, function() {
                    return vars[arguments[1]];
                });
            } else {
                var args = arguments;
                return str.replace(/\{(\d+)\}/g, function() {
                    return args[arguments[1]];
                });
                ;
            }
        },
        /**
         * Convert specified characters in source string to character entity
         *
         * @param {string} source Source string
         * @return {string} Output String
         */
        toEntity : function(source) {
            if ( typeof source === 'string') {
                // QUESTION: there are more entities than these 4, why only these
                // 4 are handled?
                // Because when these 4 character appear in HTML tags, the
                // document structure will be broken.
                // QUESTION: is there possible ways to let browser do this for
                // you because browser knows all entities and has this function
                // built-in?
                return source.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&rsquo;');
            }
        },
        /**
         * Return true if given string is an valid URL
         *
         * @param {String} url Given URL
         * @return {Boolean} True if given string is valid
         */
        validateURL : function(url) {
            var strRegex = "^(http://)";
            var re = new RegExp(strRegex);
            return re.test(url);
        }
    });
    W.String = string;

    /*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */

    var dateFormat = function() {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g, pad = function(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len)
            val = "0" + val;
            return val;
        };
        // Regexes and supporting functions are cached through closure
        return function(date, mask, utc) {
            var dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask
            // prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date))
                throw SyntaxError("invalid date");
            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
                d : d,
                dd : pad(d),
                ddd : dF.i18n.dayNames[D],
                dddd : dF.i18n.dayNames[D + 7],
                m : m + 1,
                mm : pad(m + 1),
                mmm : dF.i18n.monthNames[m],
                mmmm : dF.i18n.monthNames[m + 12],
                yy : String(y).slice(2),
                yyyy : y,
                h : H % 12 || 12,
                hh : pad(H % 12 || 12),
                H : H,
                HH : pad(H),
                M : M,
                MM : pad(M),
                s : s,
                ss : pad(s),
                l : pad(L, 3),
                L : pad(L > 99 ? Math.round(L / 10) : L),
                t : H < 12 ? "a" : "p",
                tt : H < 12 ? "am" : "pm",
                T : H < 12 ? "A" : "P",
                TT : H < 12 ? "AM" : "PM",
                Z : utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o : (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S : ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

            return mask.replace(token, function($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Some common format strings
    dateFormat.masks = {
        "default" : "ddd mmm dd yyyy HH:MM:ss",
        shortDate : "m/d/yy",
        mediumDate : "mmm d, yyyy",
        longDate : "mmmm d, yyyy",
        fullDate : "dddd, mmmm d, yyyy",
        shortTime : "h:MM TT",
        mediumTime : "h:MM:ss TT",
        longTime : "h:MM:ss TT Z",
        isoDate : "yyyy-mm-dd",
        isoTime : "HH:MM:ss",
        isoDateTime : "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime : "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    dateFormat.i18n = {
        dayNames : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        monthNames : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    };

    // For convenience...
    Date.prototype.format = function(mask, utc) {
        return dateFormat(this, mask, utc);
    };

    var timer = function() {
        return {
            formatTimerFromMillisecond : function(millisecond) {
                var devide = 1000 * 60;
                var minute = parseInt(millisecond / devide, 10);
                var second = new String((millisecond % devide) / 1000).toString();
                if (second < 10) {
                    second = '0' + second;
                }
                minute = minute + ':' + second.substring(0, 2);
                return minute;
            }
        }
    }
    W.timer = timer;

    function RequestList() {
        this._list = [];
        this._sendList = [];
    }


    W.mix(RequestList.prototype, W.events);
    W.mix(RequestList.prototype, {
        push : function(request) {
            var self = this;
            if (request.item) {
                request.item.bind('remove', function(id) {
                    self.removeRequest(id);
                });
            }
            this._list.push(request);
        },
        removeRequest : function(id) {
            for (var i = 0; i < this._list.length; i++) {
                if (this._list[i].id === id) {
                    this._list.splice(i, 1);
                    return;
                }
            }
        },
        sendRequest : function(from, to) {
            to = this._list.length < to ? this._list.length : to;
            var item;
            var requestLen = to - from;
            var requestList = [];
            var request;
            this._sendList = [];

            for (var j = from, len = this._list.length; j < len; j++) {
                item = this._list[j];
                if (!item.isIgnore && requestList.length < requestLen) {
                    requestList.push(item);
                } else if (requestList.length >= requestLen) {
                    break;
                }
            }

            for (var i = 0; i < requestLen; i++) {
                request = requestList[i];
                if (request && !request.sending && !request.isSuccessed) {
                    if (request.supportSendList) {
                        this._sendList.push(request);
                    } else {
                        request.send();
                    }
                }
                if (request && request.item) {
                    request.item.setVisibility(true);
                }
            }

            var sendList = _.filter(this._sendList, function(item) {
                return !item.isSuccessed && !item.sending;
            });

            while (sendList.length) {
                this.sendListCallBack.call(null, sendList.splice(0, 5));
            }

        },
        setSendListCallback : function(callback) {
            this.sendListCallBack = callback;
        },
        reset : function() {
            this._list = [];
            this._sendList = [];
        }
    });

    W.RequestList = RequestList;

});
wonder.useModule('wonder/utils');
﻿/**
 * @fileoverview
 * @author jingfeng@wandoujia.com
 */

wonder.addModule('ui/event', function(W) {
    W.namespace('wonder.ui');

    function Event(type, opt_target) {
        // QUESTION: is this just a JSON? why a class is needed?

        /**
         * @type {String}
         */
        this.type = type;

        /**
         * target of the event.
         * @type {Object}
         */
        this.target = opt_target;

        /**
         * Object that had the listener attached.
         * @type {Object|undefined}
         */
        this.currentTarget = this.target;
    }


    W.ui.Event = Event;
});
wonder.useModule('ui/event');
﻿/**
 * @fileoverview uibase provide the based property of ui component.
 * @author jingfeng@wandoujia.com
 */
wonder.addModule('uibase', function(W) {
    W.namespace('wonder.ui');

    function UIBase(config) {
        // Init attributes and functions
        this._config = config ? W.mix(config, this._defaults, false) : this._defaults;
    };

    W.mix(UIBase.prototype, W.events);
    // TODO: W.events & W.ui.event is too confusing. just use Backbone.Events instead.

    /**
     *@type {Object} ,
     *@override
     */
    UIBase.prototype._defaults = {
    };
    /**
     * ui root element, it should be overide in subclass
     * @type {Element}
     * @private
     */
    UIBase.prototype._element = null;
    UIBase.prototype._value = null;
    UIBase.prototype._isVisible = true;
    UIBase.prototype._isRendered = false;
    UIBase.prototype._disabled = false;
    UIBase.prototype._uid = '';
    UIBase.prototype.propagation= true;

    /**
     * Call this method before ui render.
     * @param {Object} propagation
     */
    UIBase.prototype.setPropagation = function(propagation){
        this.propagation = propagation;
    };
    UIBase.prototype.getPropagation = function(propagation){
        return this.propagation;
    };
    UIBase.prototype.setValue = function(value) {
        this._value = value;
    };
    UIBase.prototype.getValue = function() {
        return this._value;
    };
    UIBase.prototype.isVisible = function() {
        return this._isVisible;
    };
    UIBase.prototype.isRendered = function() {
        return this._isRendered;
    };
    UIBase.prototype.getElement = function() {
        return this._element;
    };
    UIBase.prototype.getUid = function() {
        this._uid = this._uid || W.getUid();
        return this._uid;
    };
    UIBase.prototype.setDisabled = function() {
        //TO-DO
    };
    UIBase.prototype.isDisabled = function() {
        return this._disabled;
    };
    UIBase.prototype.focus = function(){
        this._element.focus();
    };
    UIBase.prototype.hasFocus = function(){
        //Implement this in subclass;
    };
    UIBase.prototype.active = function(){
        //Implement this in subclass;
    };

    /**
     * @param {String} className , add class to this ui root element.
     */
    UIBase.prototype.addClassName = function(className) {
        $(this._element).addClass(className);
        // QUESTION: what if `this._element === null`?
        return this;
    };
    UIBase.prototype.removeClassName = function(className) {
        $(this._element).removeClass(className);
        // QUESTION: what if `this._element === null`?
        return this;
    };
    /**
     * The template will be used
     * @type {string}
     * @private
     */
    UIBase.prototype._template = null;

    UIBase.prototype.hide = function() {
        this._element.hide();
        this._isVisible = false;
        return this;
    };
    UIBase.prototype.show = function() {
        this._element.show();
        this._isVisible = true;
        return this;
    };

    UIBase.prototype.dispose = function() {
        this._disposeInternal();
    };

    UIBase.prototype._disposeInternal = function() {
        //Implement this in subclass.
    };

    /**
     * @opt_parent {Node}, component container
     * @override
     */
    UIBase.prototype.render = function(opt_parent) {
        // QUESTION: why `opt_parent` is provided but not used at all?
        // Setup template if <code>templatePath</code> is given
        if(this._config.templatePath) {
            this.getTemplate(this._config.templatePath);
        }
    };
    /**
     * Get an external template file use jQeury.ajax()
     *
     * @param {string} path The path of the template file
     * @param {Function} callback The function to callback
     * @return {string} Return the template as string
     */
    UIBase.prototype.getTemplate = function(path) {
        var self = this;
        $.ajax({
            url : path,
            success : function(response) {
                console.log('UI Base - Success to load template file: ' + path, $(response));
                self._template = response;
            },
            error : function() {
                // QUESTION: what would user see if program runs into this place?
                console.error('UI Base - Failed to load template file with given path: ' + path);
            },
            dataType : 'text',
            async : false
        });
    };
    W.ui.UIBase = UIBase;
});
wonder.useModule('uibase');
﻿/**
 *
 * @fileoverview
 * @jingfeng@wandoujia.com
 *
 */
wonder.addModule('ui/button', function(W) {
    var doc = document;
    /**
     * @constructor
     */
    function Button(title) {
        this._title = title;
    }


    W.extend(Button, W.ui.UIBase);
    Button.Actions = {
        CLICK : 'click'
    };
    Button.prototype._textEl = null;
    Button.prototype.setTitle = function(title) {
        if(this._textEl) {
            this._textEl.text(title);
        }
        this._title = title;
    };
    Button.prototype.getTitle = function() {
        return this._title;
    };
    Button.prototype.setDisabled = function(disabled) {
        this._disabled = disabled;
        if(this._isRendered) {
            this._element.prop('disabled', !!disabled);
        }
    };
    Button.prototype.show = function() {
        this._element.show();
    };
    Button.prototype.hide = function() {
        this._element.hide();
    };
    Button.prototype.render = function(opt_parent) {
        if(this._isRendered) {
            throw new Error('component has rendered');
        }
        if(!this._element) {
            this._textEl = $('<text/>').text(this._title || '');
            this._element = $('<button/>').append(this._textEl);
            this._element.appendTo(opt_parent || document.body);
            // QUESTION: why not use a template?
            // TODO: replace DOM creation with template because DOM creation is not fast enough.
            this._element.bind('click', $.proxy(function(e) {
                if(!this.propagation) {
                    e.stopPropagation();
                }
                this.trigger(Button.Actions.CLICK, this);
            }, this));
            this._isRendered = true;
            this.setDisabled(!!this._disabled);
        }
        return this;
    };
    W.ui.Button = Button;

    function ImageButton(title) {
        Button.call(this, title);
        // TODO: subclass should have reference to superclass constructor and avoid knowing its name directly.
    }


    W.extend(ImageButton, Button);
    W.mix(ImageButton.prototype, {
        _iconEl : null,
        addImageClass : function(className) {
            this._iconEl.addClass(className);
            // QUESTION: is it possible to do this with `_element`'s class and the `addClassName` method of superclass?
        },
        render : function(opt_parent) {
            ImageButton._super_.render.call(this, opt_parent);
            this._iconEl = $('<span class="icon"/>');
            this._textEl.before(this._iconEl);
            this._element.addClass('w-icon-btn w-ui-iconbutton')
            return this;
        }
    });
    W.ui.ImageButton = ImageButton;
});
wonder.useModule('ui/button');
﻿/**
 * @fileoverview Toolbar
 * @author wangye.zhao@wandoujia.com
 */
wonder.addModule('ui/toolbar', function(W) {
    /**
     * @constructor Toolbar
     */
    function Toolbar() {
        W.ui.UIBase.call(this);
        this._components = {};
    }
    W.extend(Toolbar, W.ui.UIBase);
    Toolbar.prototype.addComponent = function(name, component) {
        if(this._components[name]){
            console.error('The ' + name + ' component existed.');
        }
        this._components[name] = component;
        component.render(this._element);
        // QUESTION: what if `component` has rendered before? what if a child element needs to move from one parent element to another?
        // TODO: child element should not need to know its parent during and only during render phase.
        // TODO: find a better solution for describing parent/child element relationship.
        return this;
    };
    Toolbar.prototype.getComponent = function(name){
        return this._components[name];
    };
    Toolbar.prototype.render = function(opt_parent) {
        if(!this._isRendered) {
            this._element = $('<div/>').addClass('w-ui-toolbar hbox');
            this._element.appendTo(opt_parent || doc.body);
            this._isRendered = true;
        }
        return this;
    };
    W.ui.Toolbar = Toolbar;
});
wonder.useModule('ui/toolbar');
﻿/**
 *
 * @fileoverview
 * @jingfeng@wandoujia.com
 *
 */
wonder.addModule('ui/menu', function(W) {

    var doc = W.host.document;

    /**
     * @constructor Menu
     */
    function Menu(title) {
        this._items = [];
        W.ui.ImageButton.call(this, title);
    }


    W.extend(Menu, W.ui.ImageButton);

    Menu.Actions = {
        SELECT : 'select'
    };

    Menu.prototype._isOpen = false;

    Menu.prototype._isDiaplaySelectLabel = false;

    Menu.prototype._isCloseOnSelect = true;

    Menu.prototype._itemContainerEl = null;

    Menu.prototype._switchMenu = function(e) {
        if(this._items.length <= 0)
            return;
        this._isOpen ? this.closeMenu() : this.openMenu();
    };

    Menu.prototype.setSelectLabelDisplable = function(dsl) {
        this._isDiaplaySelectLabel = dsl;
    };

    Menu.prototype.setCloseOnSelect = function(isCloseOnSelect) {
        this._isCloseOnSelect = isCloseOnSelect;
    };

    Menu.prototype._handleDocumentMouseDown = function(e) {
        var self = e.data;
        if(!self.containsElement(e.target)) {
            $(doc).unbind('click', self._handleDocumentMouseDown);
            self.closeMenu();
            self = null;
        }
    };

    Menu.prototype.containsElement = function(element) {
        if(this._element[0] === element || this._element.has(element).size() > 0 || this._itemContainerEl[0] === element || this._itemContainerEl.has(element).size() > 0) {
            return true;
        }
        return false;
    }

    Menu.prototype.openMenu = function() {
        this._isOpen = true;
        this._itemContainerEl.show();
        this._setPosition();

        $(doc).bind('mousedown', this, this._handleDocumentMouseDown);
    };

    Menu.prototype.closeMenu = function() {
        this._isOpen = false;
        this._itemContainerEl.hide();
        $(doc).unbind('click', this._handleDocumentMouseDown);
    };

    Menu.prototype.addItem = function(item) {
        var self = this;
        item.setMenuOwner(this);
        item.render(this._itemContainerEl);
        item.bind(Menu.Actions.SELECT, function(e) {
            self.trigger(Menu.Actions.SELECT, e);
            if(self._isCloseOnSelect) {
                self.closeMenu();
            }
            if(self._isDiaplaySelectLabel) {
                self.setTitle(item.getTitle());
            }
        });
        this._items.push(item);
    };

    Menu.prototype.removeAllItems = function() {
        this._itemContainerEl.unbind('');
        this._itemContainerEl.empty();
        this._items = [];
    };

    Menu.prototype.selectItemByIndex = function(index) {
        if(this._items[index]) {
            this._items[index].selectItem();
        }
    };

    Menu.prototype.getItemByIndex = function(index) {
        return this._items[index];
    };

    Menu.prototype.getItems = function() {
        return this._items;
    };

    Menu.prototype._setPosition = function() {
        var offset = this._element.offset();
        var x = offset.left;
        var y = offset.top + this._element[0].offsetHeight + 1;
        var menuWidth = this._itemContainerEl.width();
        var rightGapWidth = $(window).width() - x;
        var bottomGap = $(window).height() - y - this._itemContainerEl.height();

        if((menuWidth - rightGapWidth) > 0) {
            x = x - menuWidth + rightGapWidth - 6;
        }

        if(bottomGap < 0) {
            y = offset.top - this._itemContainerEl.outerHeight();
            y = y > 0 ? y : 0;
        }
        this._itemContainerEl.css({
            left : x,
            top : y
        });
    };

    Menu.prototype.render = function(opt_parent) {
        var self = this;
        if(!this._isRendered) {
            Menu._super_.render.call(this, opt_parent);
            this._element.append('<span class="dropdown"><div class="arrow"></div></span>');
            this._itemContainerEl = $('<menu/>').addClass(Menu.Classes.W_MENU_ITEM_CONTAINER).appendTo(doc.body);
            this.bind('click', function() {
                self._switchMenu();
            });

            $(window).bind('resize', $.proxy(function() {
                W.delay(this, this.closeMenu, 25);
            }, this));
        }
        return this;
    };

    Menu.Classes = {
        W_MENU_ITEM_CONTAINER : 'w-ui-menu-container'
    };

    /**
     * @constructor Menuitem
     *  Menu object invoke add method to add Menuitem
     */
    function MenuItem(title) {
        W.ui.Button.call(this, title);
    };


    W.extend(MenuItem, W.ui.Button);

    MenuItem.prototype._menuOwner = null;

    MenuItem.prototype._outerEl = null;

    MenuItem.prototype._innerEl = null;

    MenuItem.prototype.setMenuOwner = function(owner) {
        this._menuOwner = owner;
    };

    MenuItem.prototype.getMenuOwner = function() {
        return this._menuOwner;
    };

    MenuItem.prototype.selectItem = function() {
        this.trigger(Menu.Actions.SELECT, new W.ui.Event(Menu.Actions.SELECT, this));
    };

    MenuItem.prototype._buildContent = function() {
        this._outerEl = $('<div/>').addClass('hbox outer');
        this._innerEl = $('<a href="#"/>');

        this._element.append(this._outerEl.append(this._innerEl));
        this._innerEl.text(this._title || '');
    };

    MenuItem.prototype.setTitle = function(title) {
        this._innerEl.text(title || '');
        this._title = title;
    };

    MenuItem.prototype.getTitle = function(title) {
        return this._title;
    };

    MenuItem.prototype.setDisabled = function(disable) {
        this._element.unbind('click').addClass('w-menuitem-disabled');
        if(!disable) {
            this._element.bind('click', $.proxy(this.selectItem, this)).removeClass('w-menuitem-disabled');
        }
    };

    MenuItem.prototype.render = function(opt_parent) {
        if(!this._element) {
            this._element = $('<dd/>').addClass(MenuItem.Classes.W_MENUITEM);

            this._buildContent();
            this._element.appendTo(opt_parent);
            this._element.bind('click', $.proxy(this.selectItem, this));
        }
    };

    MenuItem.Classes = {
        W_MENUITEM : 'w-ui-menuitem'
    };

    /**
     * @constructor CheckMenuitem
     *  Menu object invoke add method to add CheckMenuItem
     */
    function CheckMenuItem(title, type) {
        this._type = type || "radio";
        //type: checkbox, radio.
        this.checked = false;
        MenuItem.call(this, title);
    }


    W.extend(CheckMenuItem, MenuItem);
    CheckMenuItem.Type = {
        RADIO : 'radio',
        CHECKBOX : 'checkbox'
    }
    W.mix(CheckMenuItem.prototype, {
        _name : '',
        getChecked : function() {
            //TO-DO: fix bug.
            return this.checked;
        },
        setChecked : function(isChecked) {
            //TO-DO: if type is radio, set checked property to false in other items.
            this.checked = isChecked;
            this.checkboxEl.prop('checked', this.checked);
        },
        setName : function(name) {
            if(this.checkboxEl) {
                this.checkboxEl.attr('name', name);
            }
            this._name = name;
        },
        addClass: function(className) {
            this._element.addClass(className);
        },
        render : function(opt_parent) {
            CheckMenuItem._super_.render.call(this, opt_parent);
            var self = this;
            var menuOwner = this.getMenuOwner();
            var checkboxEl = $('<input/>').attr('type', this._type).attr('name', this._name || menuOwner.getUid());
            this.checkboxEl = checkboxEl;

            this._element.addClass('w-ui-checkbox-menuitem');
            this._outerEl.prepend(checkboxEl);
            this.bind(Menu.Actions.SELECT, function() {
                if(self._type === 'radio') {
                    checkboxEl.prop('checked', true);
                } else if(self._type === 'checkbox') {
                    self.checked = !self.checked;
                    checkboxEl.prop('checked', self.checked);
                }
            });
        }
    });
    /**
     * @constructor CheckMenuitem
     *  Menu object invoke add method to add CheckMenuItem
     */
    function MenuSeparateLine() {
        MenuItem.call(this);
    }


    W.extend(MenuSeparateLine, MenuItem);
    W.mix(MenuSeparateLine.prototype, {
        render : function(opt_parent) {
            if(!this._isRendered) {
                this._element = $('<dd/>').addClass('w-menu-separate');
                this._element.appendTo(opt_parent);
                this._isRendered = true;
            }
        }
    });

    /**
     * @constructor
     */
    function ComboMenu(title) {
        Menu.call(this, title);
    }


    W.extend(ComboMenu, Menu);
    W.mix(ComboMenu.prototype, {
        _setPosition : function() {
            var offset = this._element.offset();
            var x = offset.left + this._element.width() - 25;
            var y = offset.top + this._element[0].offsetHeight + 1;
            var menuWidth = this._itemContainerEl.width();
            var rightGapWidth = $(window).width() - x;
            var bottomGap = $(window).height() - this._itemContainerEl.height() - y;

            if((menuWidth - rightGapWidth) > 0) {
                x = offset.left + this._element.width() - menuWidth;
            }
            if(bottomGap < 0) {
                y = offset.top - this._itemContainerEl.height() - 9;
            }
            this._itemContainerEl.css({
                left : x,
                top : y
            });
        },
        setDisabled : function(disabled) {
            this._disabled = disabled;
            if(this._isRendered) {
                this.actionBtn && this.actionBtn.setDisabled(disabled);
                this.dropBtn && this.dropBtn.setDisabled(disabled);
            }
        },
        setActionDisabled : function(disabled) {
            this.actionBtn.setDisabled(disabled)
        },
        setDropDisabled : function(disabled) {
            this.dropBtn.setDisabled(disabled)
        },
        render : function(opt_parent) {
            if(!this._isRendered) {
                var seprateEl = $('<span/>').addClass('vertical');
                ComboMenu._super_.render.call(this, opt_parent);
                this._element.unbind().remove();
                this._element = $('<div/>').addClass('w-ui-combomenu');
                this._element.appendTo(opt_parent);
                this.actionBtn = new W.ui.Button(this.getTitle());
                this.dropBtn = new W.ui.Menu('');

                this.actionBtn.setPropagation(this.getPropagation());
                this.dropBtn.setPropagation(this.getPropagation());

                this.actionBtn.render(this._element);

                this._element.append(seprateEl);
                this.dropBtn.render(this._element);


                this.unbind(W.ui.Button.Actions.CLICK);
                this.dropBtn.bind(W.ui.Button.Actions.CLICK, function() {
                    this._switchMenu();
                }, this);
                this.actionBtn.bind(W.ui.Button.Actions.CLICK, function(e) {
                    this.trigger(W.ui.Button.Actions.CLICK, e);
                }, this);
            }
        }
    });

    W.ui.Menu = Menu;
    W.ui.MenuItem = MenuItem;
    W.ui.CheckMenuItem = CheckMenuItem;
    W.ui.MenuSeparateLine = MenuSeparateLine;
    W.ui.ComboMenu = ComboMenu;
});

wonder.useModule('ui/menu');
﻿/**
 * @fileoverview
 * @ author jingfeng@wandoujia.com
 */

wonder.addModule('ui/window', function (W) {
    W.namespace('wonder.ui');
    var doc = document;
    var win = $(W.host);

    /**
     * @constructor
     */

    function Window (opt_title, opt_content, opt_config) {
        this._title = opt_title;
        this._dragOffset = {
            lastX : 0,
            lastY : 0
        };
        this._content = opt_content;
        this._config = opt_config || {
            className : '',
            mask : true
        };
        this.internalConponent = [];
        this.defaultFocusEl = null;
        _.bindAll(this, '_onKeyUp', '_onKeyDown');
    }


    W.extend(Window, W.ui.UIBase);

    Window.Events = {
        SHOW : 'show',
        HIDE : 'hide'
    };
    Window.prototype._draggable = true;

    Window.prototype._headerEl = null;

    Window.prototype._bodyEl = null;

    Window.prototype._footEl = null;

    Window.prototype._isSupportEsc = true;

    Window.prototype._buildWindow = function () {
        this._headerEl = $('<header/>').addClass('w-window-header');
        this._titleEl = $('<div/>').addClass('w-window-title').text(this._title || '');
        this.closeEl = $('<div/>').addClass('w-window-close');

        this._headerEl.append(this._titleEl).append(this.closeEl);
        this.closeEl.bind('click', $.proxy(this.hide, this));
        this._element.append(this._headerEl)

        this._bodyEl = $('<div/>').addClass('w-window-body');
        this._element.append(this._bodyEl.text(this._content || ''));

        this._footEl = $('<footer/>').addClass('w-window-footer');
        this._element.append(this._footEl);

        this.setDraggable(this._draggable);
    };

    Window.prototype.setSupportEsc = function (isSupportEsc) {
        this._isSupportEsc = isSupportEsc;
    };

    Window.prototype.setDraggable = function (draggable) {
        this._draggable = draggable;
        if (this._isRendered) {
            this._headerEl.unbind('mousedown');
            if (W.isBoolean(draggable) && draggable) {
                this._element.addClass('w-window-draggable');

                this._headerEl.bind('mousedown', $.proxy(this.dragMousedown, this));
            } else {
                this._element.removeClass('w-window-draggable');
            }
        }
    };

    Window.prototype.dragMousedown = function (e) {
        this._dragOffset.lastX = e.pageX;
        this._dragOffset.lastY = e.pageY;
        e.preventDefault();
        $(document).bind('mousemove', $.proxy(this.dragMousemove, this));
        $(document).bind('mouseup', $.proxy(this.dragMouseup, this));
    };

    Window.prototype.dragMousemove = function (e) {
        e.preventDefault();
        var offsetX = e.pageX - this._dragOffset.lastX;
        var offsetY = e.pageY - this._dragOffset.lastY;
        this._dragOffset.lastX = e.pageX;
        this._dragOffset.lastY = e.pageY;
        var curOffset = this._element.offset();
        var windowWidth = win.width();
        var windowHeight = win.height();
        var maxLeft = windowWidth - 45;
        var maxTop = windowHeight - 45;

        var newOffset = {
            left : curOffset.left + offsetX,
            top : curOffset.top + offsetY
        };
        if (newOffset.left <= 0) {
            newOffset.left = 0;
        } else if (newOffset.left >= maxLeft) {
            newOffset.left = maxLeft;
        }
        if (newOffset.top <= 0) {
            newOffset.top = 0;
        } else if (newOffset.top > maxTop) {
            newOffset.top = maxTop;
        }
        this._element.offset(newOffset);
    };

    Window.prototype.dragMouseup = function (e) {
        e.preventDefault();
        $(document).unbind('mousemove', $.proxy(this.dragMousemove, this));
    };

    Window.prototype.setOffset = function (x, y) {
        if (!this._isRendered)
            throw new Error ('This component didn\'t rendered');
        if (x == 'center') {
            x = (this._element.parent().width() - this._element.width()) / 2;
        }

        if (y == 'center') {
            y = (this._element.parent().height() - this._element.height()) / 2;
        }
        this._element.css('left', x).css('top', y);
    };

    Window.prototype.addBodyContent = function (component) {
        component.render(this._bodyEl);
        this.internalConponent.push(component);
    };

    Window.prototype.addFooterContent = function (component) {
        component.render(this._footEl);
        this.internalConponent.push(component);
    };

    Window.prototype.clearBodyContent = function () {
        this._bodyEl.empty();
    };

    Window.prototype.setTitle = function (title) {
        this._titleEl.text(title);
    };

    Window.prototype.show = function () {
        if (!this._isRendered)
            this.render(this._config.parent);
        this._isVisible = true;
        this.removeClassName('w-window-hidden');
        this.addClassName('w-window-visible');
        this.maskEl && this.maskEl.show();
        this.setOffset('center', 'center');
        this.trigger(Window.Events.SHOW);
    };

    Window.prototype.hide = function () {
        this._isVisible = false;
        this.removeClassName('w-window-visible');
        this.addClassName('w-window-hidden');
        this.maskEl && this.maskEl.hide();
        this.trigger(Window.Events.HIDE);
    };

    Window.prototype._onShow = function () {
        doc.addEventListener('keyup', this._onKeyUp);
        doc.addEventListener('keydown', this._onKeyDown);
        this.focus();
    };

    Window.prototype.focus = function () {
        if (this.defaultFocusEl) {
            return $(this.defaultFocusEl).focus().get(0);
        }
        var primaryBtns = this._element.find('.primary:visible');

        if (primaryBtns.length > 0) {
            $(primaryBtns.get(0)).focus();
            return primaryBtns.get(0);
        } else if (this.internalConponent.length > 0) {
            this.internalConponent[0].focus && this.internalConponent[0].focus();
        }
    };

    Window.prototype.hasFocus = function () {
        var primaryBtns = this._element.find(':focus');
        if (primaryBtns.length > 0) {
            return true;
        }
        return false;
    };

    Window.prototype._onHide = function () {
        doc.removeEventListener('keyup', this._onKeyUp);
        doc.removeEventListener('keydown', this._onKeyDown);
        this._element.find('.primary').blur();
    };
    Window.prototype._onKeyDown = function (e) {
        if (!this.isDisabled()) {
            switch(e.keyCode) {
            case 13:
                this.hasFocus() || this.focus();
                break;
            case 9:
                W.delay(this, function () {
                    this.hasFocus() || this.focus();
                }, 5);
                break;
            }
        }
    };
    Window.prototype._onKeyUp = function (e) {
        if (e.keyCode === 27 && !this.isDisabled()) {
            if (this._isSupportEsc) {
                this.hide();
            }
        }
    };

    Window.prototype._disposeInternal = function () {
        if (this._isRendered) {
            this._element.unbind();
            this._element.remove();
        }
    };

    Window.prototype.setDisabled = function (disabled) {
        this._disabled = disabled;
    };

    Window.prototype.render = function (opt_parent) {
        if (!this._isRendered) {
            this._isRendered = true;
            this._element = $('<div/>').addClass('w-window').addClass(this._config.className);
            this._buildWindow();
            if (this._config.mask) {
                this.maskEl = $('<div/>').addClass('w-window-mask-bg');
                this.maskEl.appendTo(opt_parent || doc.body);
            }

            this._element.appendTo(opt_parent || doc.body);
            this.setOffset('center', 'center');

            this.maskEl && this.maskEl.bind('click', function () {
                //TO-DO
            });
            this.bind(Window.Events.SHOW, this._onShow, this);
            this.bind(Window.Events.HIDE, this._onHide, this);
        } else {
            console.log('window conponent rendered.');
        }
    };
    W.ui.Window = Window;

});
wonder.useModule('ui/window');
﻿/**
 * Dialog window
 *
 * @author jingfeng@wandoujia.com, wangye.zhao@wandoujia.com
 */

wonder.addModule('ui/dialog', function(W) {
    wonder.namespace('wonder.ui');
    var locale = i18n.ui;

    /**
     * Dialog window
     *
     * @constructor
     * @param {String} title Window title
     * @param {String} content Body content
     */
    function Dialog(title, content) {
        this._content = content;
        W.ui.Window.call(this, title, content);
    }


    W.extend(Dialog, W.ui.Window);

    W.mix(Dialog.prototype, {
        _buttonKey : null,
        _addButtonSet : function() {
            var okBtn = new W.ui.Button(locale.CONFIRM);
            var yesBtn = new W.ui.Button(locale.YES);
            var noBtn = new W.ui.Button(locale.NO);
            var cancelBtn = new W.ui.Button(locale.CANCEL);
            var retryBtn = new W.ui.Button(locale.RETRY);

            this._footEl.empty();
            switch(this._buttonKey) {
                case  Dialog.ButtonSet.OK :
                    this.addFooterContent(okBtn);
                    break;
                case  Dialog.ButtonSet.YES_NO :
                    this.addFooterContent(yesBtn);
                    this.addFooterContent(noBtn);
                    break;
                case  Dialog.ButtonSet.OK_CANCEL :
                    this.addFooterContent(okBtn);
                    this.addFooterContent(cancelBtn);
                    break;
                case Dialog.ButtonSet.YES_NO_CANCEL :
                    this.addFooterContent(yesBtn);
                    this.addFooterContent(noBtn);
                    this.addFooterContent(cancelBtn);
                    break;
                case Dialog.ButtonSet.RETRY_CANCEL:
                    this.addFooterContent(retryBtn);
                    this.addFooterContent(cancelBtn);
                    break;
                default:
                    break;
            }

            okBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'ok');
                this.hide();
            }, this);
            okBtn.addClassName('primary');
            yesBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'yes');
                this.hide();
            }, this);
            yesBtn.addClassName('primary');
            noBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'no');
                this.hide();
            }, this);
            cancelBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'cancel');
                this.hide();
            }, this);
            retryBtn.addClassName('primary');
            retryBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'retry');
                this.hide();
            }, this);
        },
        setButtonSet : function(buttonKey) {
            this._buttonKey = buttonKey;
            if(this._isRendered) {
                this._addButtonSet();
            }
            return this;
        },
        setContent : function(content) {
            this._content = content;
            if(this._isRendered) {
                this._bodyEl.html(content);
            }
            return this;
        },
        render : function(opt_parent) {
            Dialog._super_.render.call(this, opt_parent);
            this._addButtonSet();
            this.setContent(this._content ? this._content : '');
            this._element.addClass('w-ui-dialog');
            return this;
        }
    });

    Dialog.ButtonSet = {
        OK : 'yes',
        YES_NO : 'yes_no',
        OK_CANCEL : 'ok_cancel',
        YES_NO_CANCEL : 'yes_no_cancel',
        RETRY_CANCEL : 'retry_cancel'
    };

    Dialog.Events = {
        SELECT : 'select'
    };

    W.ui.Dialog = Dialog;
});
wonder.useModule('ui/dialog');
﻿/**
 * @fileoverview Progress monitor
 * @author wangye.zhao@wandoujia.com
 *
 */
wonder.addModule('ui/ProgressMonitor', function(W) {

    /**
     * @constructor
     */
    function ProgressMonitor() {
        this._count = 0;
    }

    W.extend(ProgressMonitor, W.ui.UIBase);
    /**
     * Add a count to list
     */
    ProgressMonitor.prototype.add = function() {
        this._count++;
        if(this._isRendered) {
            this._element.show();
        }
    };
    /**
     * Subduct a count from list
     */
    ProgressMonitor.prototype.remove = function() {
        if(this._count >= 1) {
            this._count--;
        }
        if(this._count === 0 && this._isRendered) {
            this._element.hide();
        }
    };
    /**
     * @implement
     */
    ProgressMonitor.prototype.render = function(opt_parent) {
        if(!this._element) {
            this._element = $('<div>').addClass('w-progress');
            this._element.appendTo(opt_parent || document.body);
            this._isRendered = true;
        }
        return this;
    };
    W.ui.ProgressMonitor = ProgressMonitor;
});
wonder.useModule('ui/ProgressMonitor');
﻿/**
 * @fileoverview Process Status widgget
 * @author chenxingrun@wandoujia.com
 *
 */
wonder.addModule('ui/status', function(W) {
    W.namespace('wonder.ui.status');
    W.ui.status = {};
    /**
     * Process Status Model
     * @class
     */
    var Process = Backbone.Model.extend({
        defaults : {
            processing : false
        },
        start : function() {
            this.set({
                processing : true
            });
        },
        finish : function() {
            this.set({
                processing : false
            });
        }
    });
    W.ui.status.Process = Process;

    /**
     * Process Status View
     * @class
     */
    function ProcessView(model) {
        W.ui.UIBase.call(this);
        this.model = model;
        this._isRendered = false;
        this.template = {
            module : 'ui',
            id : 'template-ui-process'
        };
        this.initialize();
    }


    W.extend(ProcessView, W.ui.UIBase);
    W.mix(ProcessView.prototype, {
        changeProcessing : function(model, processing) {
            if(!!processing) {
                this.show();
            } else {
                this.hide();
            }
        },
        show : function() {
            $(this._element).removeClass('wd-invisible');
        },
        hide : function() {
            $(this._element).addClass('wd-invisible');
        },
        initialize : function() {
            this.model.bind('change:processing', $.proxy(this.changeProcessing, this));
        },
        render : function(opt_parent) {
            if(this._isRendered) {
                throw new Error('component has rendered');
            }
            if(!this._element) {
                var tempstr = W.Template.get(this.template.module, this.template.id);
                this._element = $(W.template(tempstr, this.model.toJSON()));
                this._element.appendTo(opt_parent || document.body);
                this._isRendered = true;
            }
        }
    });
    W.ui.status.ProcessView = ProcessView;

    /**
     * Progressbar Status Model
     * @class
     */
    var Progressbar = Process.extend({
        defaults : {
            max : 100,
            progress : 0
        },
        setMax : function(val) {
            this.set({
                max : val
            });
        },
        setProgress : function(val) {
            this.set({
                progress : val
            });
        }
    });
    W.ui.status.Progressbar = Progressbar;

    /**
     * Progressbar Status View
     * @class
     */
    function ProgressbarView(model) {
        this.model = model || new Progressbar();
        ProcessView.call(this, this.model);
        this._isRendered = false;
        this.template = {
            module : 'ui',
            id : 'template-ui-progressbar'
        };
        this.initialize();
    }


    W.extend(ProgressbarView, ProcessView);
    W.mix(ProgressbarView.prototype, {
        setText : function(text) {
            this._element.find('.w-ui-progressbar-label').html(text);
        },
        changeProgress : function(model, progress) {
            $('progress', this._element).attr('value', progress);
            $('.w-ui-progressbar-curr', this._element).text(progress);
        },
        changeMax : function(model, max) {
            $('progress', this._element).attr('max', max);
            $('.w-ui-progressbar-max', this._element).text(max);
        },
        hideMax : function() {
            $('.w-ui-progressbar-max', this._element).hide();
        },
        setDelimiter : function(delimiter) {
            $('.w-ui-progressbar-delimiter', this._element).text(delimiter);
        },
        hideProgress : function() {
            $('.w-ui-progressbar-meter').hide();
        },
        showProgress : function() {
            $('.w-ui-progressbar-meter').show();
        },
        initialize : function() {
            this.model.bind('change:progress', $.proxy(this.changeProgress, this));
            this.model.bind('change:max', $.proxy(this.changeMax, this));
        }
    });
    W.ui.status.ProgressbarView = ProgressbarView;

    /**
     * @constructor Progress
     */
    function Progress(opt) {
        this.model = new W.ui.status.Progressbar();
        this.view = new W.ui.status.ProgressbarView(this.model);
        this.cancelBtn = new W.ui.Button(i18n.ui.CANCEL)
        this.completeBtn = new W.ui.Button(i18n.misc.COMPLETE_TEXT);
        this.interval = null;
        W.ui.Window.call(this, i18n.ui.TIP, '', opt);
        this.session = null;
        this.setDraggable(false);
        this.setSupportEsc(false);
    }


    W.extend(Progress, W.ui.Window);
    W.mix(Progress.prototype, {
        config : {},
        show : function() {
            if(!this._isRendered) {
                this.render();
            }
            Progress._super_.show.call(this);
            this.view.show();
        },
        hide : function() {
            if(!this._isRendered)
                return;
            Progress._super_.hide.call(this);
            this.view.hide();
            this.model.setProgress(0);
            this.model.setMax(100);
            clearInterval(this.interval);
            this.interval = null;
            this.completeBtn.hide();
        },
        setText : function(text) {
            this.view.setText(text);
        },
        setMax : function(val) {
            this.model.setMax(val);
        },
        setCompleteBtnDelay : function(delay) {
            this.completeBtn.setTitle(i18n.misc.COMPLETE_TEXT + '(' + delay + ')');
        },
        setProgress : function(val, max) {
            this.model.setProgress(val);
            if(!isNaN(max)) {//avoid inconsistency when the value of 'max' changes.
                this.model.setMax(max);
            }
            if(val === this.model.get('max')) {
                var self = this;
                var delay = 3;
                this.setCompleteBtnDelay(3);
                this.completeBtn.show();
                if(this.interval) {
                    clearInterval(this.interval);
                }
                this.interval = setInterval(function() {
                    delay -= 1;
                    self.setCompleteBtnDelay(delay);
                    if(delay === 0) {
                        self.finish();
                    }
                }, 1000);
                this.cancelBtn.hide();
            } else {
                this.cancelBtn.show();
            }
        },
        hideProgress : function() {
            this.view.hideProgress();
        },
        showProgress : function() {
            this.view.showProgress();
        },
        setConfig : function(config) {
            this.config = config;
        },
        start : function(progress, max, processText, successText, opt_sessionPrefix, opt_lazyShow, cancelUrl, opt_parent) {
            var sessionId = W.getUid();
            var bindId = opt_sessionPrefix ? opt_sessionPrefix + sessionId : sessionId;
            this.session = bindId;
            this.cancelUrl = cancelUrl;
            this.render(opt_parent);
            if(!opt_lazyShow) {
                this.show();
            }
            this.showProgress();
            this.setProgress(progress);
            this.setMax(max);
            this.setText(processText);

            this.hander = function(data) {
                this.show();
                this.current = data.current;
                this.setProgress(data.current, data.total);
                if(data.current === data.total) {
                    IO.Backend.Device.offmessage(this.handlerId);
                    this.config = null;
                    this.setText(window.StringUtil.format(successText, data.total));
                }
            }

            this.handlerId = IO.Backend.Device.onmessage({
                'data.channel' : bindId
            }, this.hander, this);

            return bindId;
        },
        getCurrent : function() {
            return this.current;
        },
        finish : function() {
            this.hide();
        },
        cancel : function() {
            var self = this;
            IO.Backend.Device.offmessage(this.handlerId);

            W.ajax({
                url : this.cancelUrl,
                data : {
                    session : this.session
                },
                success : function() {
                    if(self.config && self.config.cancelCallback) {
                        self.config.cancelCallback.call(self);
                        self.config.cancelCallback = null;
                    } else {
                        self.hide();
                    }
                }
            });
        },
        render : function(opt_parent) {
            if(!this._isRendered) {
                Progress._super_.render.call(this, opt_parent);
                this._element.addClass('w-ui-progress-window');
                var self = this;
                this.addBodyContent(this.view);

                this.addFooterContent(this.completeBtn);
                this.addFooterContent(this.cancelBtn);
                this.completeBtn.addClassName('primary');
                this.completeBtn.bind('click', this.finish, this);
                this.cancelBtn.bind('click', this.cancel, this);
                //this.maskEl.hide();
                this.closeEl && this.closeEl.hide();
                this.completeBtn.hide();
            }
        }
    });

    W.ui.Progress = Progress;
});
wonder.useModule('ui/status');
/**
 * @fileoverview Select Delegate
 * @author wangye.zhao@wandoujia.com
 */
wonder.addModule('SelectDelegate', function(W) {
    W.namespace('wonder.ui');

    /**
     * Select Delegate
     *
     * @constructor
     * @extends {wonder.ui.UIBase}
     * @param {Object|null} config An object contains user defined
     * configurations.
     */
    var SelectDelegate = Backbone.View.extend({
        _isRendered : false,
        /**
         * @override
         */
        initialize : function() {
            var self = this;
            this.selectedItems = [];
            this.$el = $('<input>').prop('type', 'checkbox');
            this.$el.bind('click', $.proxy(this.clickCheckbox, this));
            // Events binding
            this.bind('unchecked', function() {
                self.setChecked(false);
            });
        },
        /**
         * @override
         */
        render : function(target) {
            if(!this._isRendered) {
                $(target).append(this.$el);
                this._isRendered = true;
            }
            return this;
        },
        setChecked : function(checked) {
            this.$el.prop('checked', checked);
        },
        setDisabled : function(disabled){
            this.$el.prop('disabled', disabled);
        },
        /**
         * Click checkbox
         *
         * @param {object} evt Click event object
         */
        clickCheckbox : function(evt) {
            if(this.$el.prop('checked')) {
                this.trigger('checked');
            } else {
                this.trigger('unchecked');
            }
        },
        /**
         * Events binding
         */
        events : {
            'click' : 'clickCheckbox'
        },
        /**
         * Add an item
         *
         * @param {object} item Item to be added
         */
        add : function(item) {
            var self = this;
            if(item && W.isObject(item) && item.get && item.get('id') && !$.isArray(item)) {
                var isExisted = false;
                _.each(this.selectedItems, function(itemExisted) {
                    if(itemExisted.get('id') === item.get('id')) {
                        isExisted = true;
                        return;
                    }
                });
                if(isExisted) {
                    return;
                }

            } else if($.isArray(item)){

                    if(!self.selectedItems.length){
                        self.setSelectedItems(item);
                    }else{
                        _.each(item, function(newItem){
                            if(self.selectedItems.indexOf(newItem) === -1){
                                self.selectedItems.push(newItem);
                            }
                        });
                    }

                this.trigger('add', item);
                return;
            } else {
                if(this.selectedItems.indexOf(item) !== -1) {
                    return;
                }
            }
            this.selectedItems.push(item);
            this.trigger('add', item);
        },
        /**
         * Remove an item
         *
         * @param {object} item Item to be removed
         */
        remove : function(item) {
            var self = this;
            if(item && W.isObject(item) && item.get && item.get('id') && !$.isArray(item)) {
                var tempItem = null;
                _.each(this.selectedItems, function(itemExisted) {
                    if(itemExisted.get('id') === item.get('id')) {
                        tempItem = itemExisted;
                        return;
                    }
                });
                if(tempItem) {
                    this.selectedItems.splice(this.selectedItems.indexOf(tempItem), 1);
                }
            } else if($.isArray(item)){
                var index;
                _.each(item, function(willBeRemovedItem){
                    index = self.selectedItems.indexOf(willBeRemovedItem);
                    if(index !== -1){
                        self.selectedItems.splice(index, 1);
                    }
                })
            } else {
                this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
            }
            this.trigger('remove', item);
            if(this.selectedItems.length === 0) {
                this.trigger('empty');
            }
        },
        /**
        * Set setSelectedItems
        */
        setSelectedItems : function(selectedItems){
            this.selectedItems = selectedItems;
        },
        /**
         * Reset this delegate
         */
        reset : function() {
            this.selectedItems = [];
            this.setChecked(false);
            this.trigger('empty');
        },
        /**
         * Get all items in delegate pool
         */
        getList : function() {
            return this.selectedItems;
        },
        /**
         * Get the size of delegate pool
         */
        size : function() {
            return this.selectedItems.length;
        },
        /**
         * Show component
         */
        show : function() {
            this.$el.show();
            this.trigger('show');
        },
        /**
         * Hide component
         */
        hide : function() {
            this.$el.hide();
            this.trigger('hide');
        },
        /**
         * Return true if delegate is empty
         *
         * @return {boolean} True if delegate is empty
         */
        isEmpty : function() {
            return this.selectedItems.length === 0;
        },
        /**
         * Return true if delegate is checked
         */
        isChecked : function() {
            return this.$el.prop('checked');
        }
    });
    W.ui.SelectDelegate = SelectDelegate;
});
wonder.useModule('SelectDelegate');
﻿/**
 * @fileoverview
 * @author lixiaomeng@wandoujia.com
 */

wonder.addModule('ui/clipImage', function(W){
    wonder.namespace('wonder.ui');

    function ClipImage(opt){
        //W.ui.UIBase.call(this);
        W.mix(this, opt, true);
        this.init();
    }
   // W.extend(ClipImage, W.ui.UIBase);
    W.mix(ClipImage.prototype, {
        imageClipContainerCls : 'w-imageClip',
        TLresizeCls : 'w-imageClip-resize-TL',
        TRresizeCls : 'w-imageClip-resize-TR',
        BLresizeCls : 'w-imageClip-resize-BL',
        BRresizeCls : 'w-imageClip-resize-BR',

        init: function(){
            /*add default className for imageClipContainer*/
            if(!this.imageClipContainer){
                console.error('Error : no imageClipContainer');
                return;
            }

            this.imageClipContainer.addClass(this.imageClipContainerCls);

            this.originImage = $('<img>');
            this.originImage.attr('src', this.imagePath);
            this.originImage.addClass('w-imageClip-origin-img').appendTo(this.imageClipContainer);

            var self = this;

            $('<div/>').addClass('mask').appendTo(self.imageClipContainer);

            self.clipingBox = $('<div/>');
            self.clipingBox.width(self.clipingBoxConf.defaultWidth);
            self.clipingBox.height(self.clipingBoxConf.defaultHeight);
            self.clipingBox.addClass(self.clipingBoxConf.className).appendTo(self.imageClipContainer);

            self.clipingBoxImg = $('<img/>');
            self.clipingBoxImg.attr('src', self.imagePath);
            self.clipingBoxImg.addClass('w-imageClip-box-image').appendTo(self.clipingBox);

            self.clipingBoxSurface = $('<div/>');
            self.clipingBoxSurface.addClass('w-imageClip-box-surface').appendTo(self.clipingBox);

            this.setImage(this.imagePath, this.imageConf.defaultWidth, this.imageConf.defaultHeight, this.imageConf.orientation);

            if(self.imageConf.resizable){
                createResizeEl(self.imageClipContainer, self);
            }
            if(self.clipingBoxConf.resizable){
                createResizeEl(self.clipingBox, self);
            }
             self.render();

            function createResizeEl(container, self){
                var imageResizableTL = $('<div/>').addClass('w-imageClip-resize-el ' + self.TLresizeCls);
                $('<span/>').appendTo(imageResizableTL);
                imageResizableTL.appendTo(container);

                var imageResizableTR = $('<div/>').addClass('w-imageClip-resize-el ' + self.TRresizeCls);
                $('<span/>').appendTo(imageResizableTR);
                imageResizableTR.appendTo(container);

                var imageResizableBL = $('<div/>').addClass('w-imageClip-resize-el ' + self.BLresizeCls);
                $('<span/>').appendTo(imageResizableBL);
                imageResizableBL.appendTo(container);

                var imageResizableBR = $('<div/>').addClass('w-imageClip-resize-el ' + self.BRresizeCls);
                $('<span/>').appendTo(imageResizableBR);
                imageResizableBR.appendTo(container);
            }
        },
        rotate: function(el, orientation){
            for(var i in this.ROTATE_CLASS){
                el.removeClass(this.ROTATE_CLASS[i]);
            }
            switch(orientation){
                case 0 :
                break;
                case 90:
                    el.addClass(this.ROTATE_CLASS.R90);
                break;
                case 180:
                    el.addClass(this.ROTATE_CLASS.R180);
                break;
                case 270:
                    el.addClass(this.ROTATE_CLASS.R270);
                break;
            }
        },
        ROTATE_CLASS : {
            R90: 'w-rotate-90',
            R180: 'w-rotate-180',
            R270: 'w-rotate-270'
        },
        render: function(){
            var old_bottom, old_right, old_top, old_left, old_margin_top, old_margin_left, old_width, old_height,
                self = this,
                eClientX_old,
                eClientY_old,
                mouseMoveFlag        = false,
                clipingBoxResizeFlag = false,
                imageReizeFlag       = false,
                w = this.clipingBox.width(),
                h = this.clipingBox.height(),
                containerWidth  = self.imageClipContainer.width(),
                containerHeight = self.imageClipContainer.height(),
                resizeDirection = null;

            if(self.constHeightData == null || self.constWidthData == null){
                var pT = parseInt(self.imageClipContainer.css('padding-top'), 10);
                var PL = parseInt(self.imageClipContainer.css('padding-left'), 10);

                var clipingBoxBorderTop = parseInt(self.clipingBox.css('border-top-width'), 10);
                var clipingBoxBorderLeft = parseInt(self.clipingBox.css('border-left-width'), 10);
                var clipingBoxBorderBottom = parseInt(self.clipingBox.css('border-bottom-width'), 10);
                var clipingBoxBorderRight = parseInt(self.clipingBox.css('border-right-width'), 10);

                self.constBorderData = clipingBoxBorderTop + clipingBoxBorderBottom;
                self.constHeightData =  pT + self.constBorderData;
                self.constWidthData = PL + self.constBorderData;
            }

            var calculateOldPosition = function(){
                old_width = parseInt(self.clipingBox.width(), 10);
                old_height = parseInt(self.clipingBox.height(), 10);

                old_top  = self.clipingBox.position().top;
                old_left = self.clipingBox.position().left;
                old_bottom = containerHeight - old_top - old_height;
                old_right = containerWidth - old_left - old_width;

                old_margin_top = parseInt(self.clipingBoxImg.css('margin-top'), 10);
                old_margin_left = parseInt(self.clipingBoxImg.css('margin-left'), 10);
            };

            var calculateResizeData = function(tmpHeight, tmpWidth, oldData1, oldData2){
                var imgNowWidth = self.originImage.width(),
                    imgNowHeight = self.originImage.height();

                switch(self.imageConf.orientation) {
                    case 0:
                    case 180:
                        var extralL = self.extralLeft;
                        var extralT = self.extralTop;
                    break;
                    case 90:
                    case 270:
                        var extralL = (containerWidth - imgNowHeight) / 2;
                        var extralT = (containerHeight - imgNowWidth) / 2;
                    break;
                }

                var tmpMaxWidth = containerWidth - oldData1 - extralL;
                var tmpMaxHeight = containerHeight - oldData2 - extralT;

                var maxWidth = Math.min(self.clipingBoxConf.maxWidth, tmpMaxWidth);
                var maxHeight = Math.min(self.clipingBoxConf.maxHeight, tmpMaxHeight);
                var widthVal = tmpWidth < self.clipingBoxConf.minWidth ? self.clipingBoxConf.minWidth : Math.min(maxWidth,tmpWidth),
                    heightVal = tmpHeight < self.clipingBoxConf.minHeight ? self.clipingBoxConf.minHeight : Math.min(maxHeight,tmpHeight);

                if(self.clipingBoxConf.keepSquare){
                    widthVal = heightVal = Math.min(widthVal, heightVal);
                }

                return {
                        width   : widthVal,
                        height  : heightVal,
                        extralL : extralL,
                        extralT : extralT
                       };
            };

            this.imageClipContainer.bind('mousedown', function(e){
                var target = $(e.target);

                if(target.hasClass('w-imageClip-box-surface')){
                    mouseMoveFlag = true;
                }
                if(target.hasClass('w-imageClip-resize-el') || target.parent().hasClass('w-imageClip-resize-el')){
                    if(!!target.parent(self.clipingBoxConf.className)){
                        clipingBoxResizeFlag = true;

                        if(target.hasClass(self.TLresizeCls) || target.parent().hasClass(self.TLresizeCls)){
                            resizeDirection = 'TL';
                        }else if(target.hasClass(self.TRresizeCls) || target.parent().hasClass(self.TRresizeCls)){
                            resizeDirection = 'TR';
                        }else if(target.hasClass(self.BLresizeCls) || target.parent().hasClass(self.BLresizeCls)){
                            resizeDirection = 'BL';
                        }else if(target.hasClass(self.BRresizeCls) || target.parent().hasClass(self.BRresizeCls)){
                            resizeDirection = 'BR';
                        }
                        calculateOldPosition();
                    }else if(!!target.parent(self.imageClipContainerCls)){
                        imageReizeFlag = true;
                    }
                }

                eClientX_old = e.clientX;
                eClientY_old = e.clientY;
            });

            this.imageClipContainer.bind('mousemove', function(e){
                var target = $(e.target),
                    eClientX = e.clientX,
                    eClientY = e.clientY,
                    clientXDiff = eClientX_old - eClientX,
                    clientYDiff = eClientY_old - eClientY;
                if(mouseMoveFlag){
                    var boundaryH, boundaryW;
                    switch(self.imageConf.orientation) {
                        case 0 :
                        case 180:
                            boundaryH = self.originImage.height();
                            boundaryW = self.originImage.width();
                            extralT = self.extralTop;
                            extralL = self.extralLeft;
                        break;
                        case 90 :
                        case 270:
                            var containerH = self.imageClipContainer.height();
                            var containerW = self.imageClipContainer.width();
                            boundaryH = Math.min(self.originImage.width(), containerH);
                            boundaryW = Math.min(self.originImage.height(), containerW);
                            if(containerH - boundaryH > 0){
                                extralT = (containerH - boundaryH) / 2;
                            }else{
                                extralT = 0;
                            }
                            if(containerW - boundaryW > 0){
                                extralL = (containerW - boundaryW) / 2;
                            }else{
                                extralL = 0;
                            }

                        break;
                    }

                    var topNow = self.clipingBox.position().top,
                        leftNow = self.clipingBox.position().left,
                        overBoundaryY = boundaryH - self.clipingBox.height() + extralT,
                        overBoundaryX = boundaryW - self.clipingBox.width() + extralL,
                        tmpTop = topNow - clientYDiff,
                        tmpLeft = leftNow - clientXDiff,
                        topVal = tmpTop  <= extralT ? extralT : (tmpTop >= overBoundaryY ? overBoundaryY : tmpTop),
                        leftVal = tmpLeft <= extralL ? extralL :(tmpLeft >= overBoundaryX ? overBoundaryX : tmpLeft);

                    self.clipingBox.css({
                        'top' : topVal,
                        'left': leftVal
                    });

                    self.clipingBoxImg.css({
                        'margin-top': (self.extralTop - topVal) + 'px',
                        'margin-left': (self.extralLeft - leftVal) + 'px'
                    });

                    eClientY_old = eClientY;
                    eClientX_old = eClientX;
                }else if(clipingBoxResizeFlag){

                    var w = self.clipingBox.width(),
                        h = self.clipingBox.height(),
                        top = self.clipingBox.position().top,
                        left = self.clipingBox.position().left,
                        imgNowWidth = self.originImage.width(),
                        imgNowHeight = self.originImage.height(),
                        tmpWidth = w - clientXDiff,
                        tmpHeight = h - clientYDiff,
                        constData = self.constHeightData,
                        marginTop,
                        marginLeft;

                    switch(resizeDirection){
                        case 'TL' :
                            clientYDiff = eClientY - eClientY_old;
                            clientXDiff = eClientX_old - eClientX;
                            tmpHeight = h - clientYDiff;
                            tmpWidth = w + clientXDiff;

                            var data = calculateResizeData(tmpHeight, tmpWidth, old_right, old_bottom);

                            if(imgNowWidth >= containerHeight){
                                constData = self.constBorderData;
                            }

                            switch(self.imageConf.orientation) {
                                case 0:
                                case 180:
                                    marginTop = '-' + (containerHeight - old_bottom - data.height - data.extralT);
                                    marginLeft = '-' + (containerWidth - old_right - data.width- data.extralL);
                                break;
                                case 90:
                                case 270:
                                    if(imgNowWidth > containerHeight){
                                        constData = self.constBorderData;
                                    }else if(imgNowWidth == containerHeight){
                                        constData = 0;
                                    }
                                    marginTop = old_margin_top + data.height - old_height + constData;
                                    marginLeft = old_margin_left + data.width - old_width + constData;

                                break;
                            }
                            self.clipingBox.css({
                                width  : data.width,
                                height : data.height,
                                bottom : old_bottom + self.constHeightData,
                                right  : old_right + self.constWidthData,
                                left   : '',
                                top    : ''
                            });
                            self.clipingBoxImg.css({
                                'margin-left' : marginLeft + 'px',
                                'margin-top' :  marginTop + 'px'
                            });
                        break;
                        case 'TR' :
                            clientYDiff = eClientY - eClientY_old;
                            tmpHeight = h - clientYDiff;

                            var data = calculateResizeData(tmpHeight, tmpWidth, left, old_bottom);

                            switch(self.imageConf.orientation) {
                                case 0:
                                case 180:
                                    marginTop = '-' + (containerHeight - old_bottom - data.height - data.extralT);
                                break;
                                case 90:
                                case 270:
                                    marginTop = old_margin_top + data.height - old_height + self.constBorderData;
                                break;
                            }
                            self.clipingBox.css({
                                width  : data.width,
                                height : data.height,
                                bottom : old_bottom + constData,
                                left   : old_left,
                                top    : '',
                                right  : ''
                            });
                            self.clipingBoxImg.css({
                                'margin-top' :  marginTop + 'px'
                            });
                        break;
                        case 'BL' :
                               clientXDiff = eClientX_old - eClientX;
                            tmpWidth = w + clientXDiff;

                            var data = calculateResizeData(tmpHeight, tmpWidth, old_right, top);

                            switch(self.imageConf.orientation) {
                                case 0:
                                case 180:
                                    marginLeft = '-' + (containerWidth - old_right - data.width- data.extralL);
                                break;
                                case 90:
                                case 270:
                                    if(imgNowWidth >= containerHeight){
                                        constData = self.constBorderData;
                                    }
                                    marginLeft = old_margin_left + data.width - old_width + constData;
                                break;
                            }
                            self.clipingBox.css({
                                width : data.width,
                                height: data.height,
                                right : old_right + constData,
                                top   : old_top,
                                bottom: '',
                                left  : ''
                            });
                            self.clipingBoxImg.css({
                                'margin-left' : marginLeft + 'px'
                            });
                        break;
                        case 'BR' :
                            var data = calculateResizeData(tmpHeight, tmpWidth, left, top);

                            self.clipingBox.css({
                                width : data.width,
                                height: data.height,
                                top   : old_top,
                                left  : old_left,
                                right : '',
                                bottom: ''
                            });
                        break;
                    }

                    eClientY_old = eClientY;
                    eClientX_old = eClientX;
                }else if(imageReizeFlag){
                    //TO DO
                }
            });

            $(document).bind('mouseup', function(e){
                mouseMoveFlag = false;
                clipingBoxResizeFlag = false;
                imageReizeFlag = false;
            });
        },
        setImage: function(path, defaultWidth, defaultHeight, orientation){
            this.imageConf.defaultWidth = defaultWidth;
            this.imageConf.defaultHeight = defaultHeight;
            this.imageConf.orientation = orientation;

            this.originImage.attr('src', path);
            this.originImage.css({
                'max-width' : defaultWidth,
                'max-height' : defaultHeight
            });
            this.rotate(this.originImage, orientation);

            var self = this;
            setTimeout(function(){
                self.extralTop = self.originImage[0].offsetTop;
                self.extralLeft = self.originImage[0].offsetLeft;

                var w = (self.imageClipContainer.width() - self.clipingBoxConf.defaultWidth) / 2;
                var h = (self.imageClipContainer.height() - self.clipingBoxConf.defaultHeight) / 2;
                var clipBoxW = w - self.extralLeft;
                var clipBoxH = h - self.extralTop;

                self.clipingBox.css({
                    width : self.clipingBoxConf.defaultWidth,
                    height: self.clipingBoxConf.defaultHeight,
                    top : h,
                    left: w
                });
                self.clipingBoxImg.attr('src', path);
                self.clipingBoxImg.css({
                    'max-width' : self.imageConf.defaultWidth,
                    'max-height': self.imageConf.defaultHeight,
                    'margin-top': '-' + clipBoxH + 'px',
                    'margin-left': '-' + clipBoxW + 'px'
                 });
                self.rotate(self.clipingBoxImg, orientation);

            },0);

        },
        clipImg : function(){
            var originWidth = this.originImage[0].naturalWidth;
            var originHeight = this.originImage[0].naturalHeight;
            var nowWidth = this.originImage.width();
            var nowHeight = this.originImage.height();
            var containerW = this.imageClipContainer.width();
            var containerH = this.imageClipContainer.height();
            var clipBoxLeft = this.clipingBox.position().left;
            var clipBoxTop = this.clipingBox.position().top;
            var rateWidth = 1;
            var rateHeight = 1;
            var top, left;
            if(originWidth > nowWidth){
                rateWidth = originWidth / nowWidth;
            }
            if(originHeight > nowHeight){
                rateHeight = originHeight / nowHeight;
            }

            switch(this.imageConf.orientation){
                case 0:
                case 180:
                    left = clipBoxLeft - (containerW - nowWidth) / 2;
                    top = clipBoxTop - (containerH - nowHeight)/ 2;
                break;
                case 90:
                case 270:
                    left = clipBoxLeft - (containerW - nowHeight) / 2;
                    top = clipBoxTop - (containerH - nowWidth)/ 2;
                    var tmp = rateHeight;
                    rateHeight = rateWidth;
                    rateWidth = tmp;
                break;
            }
            return{
                img : this.clipingBoxImg[0],
                top : top * rateHeight,
                left: left * rateWidth,
                width: this.clipingBox.width() * rateWidth,
                height:this.clipingBox.height() * rateHeight
            };
        }

    });
    W.ui.ClipImage = ClipImage;
});
wonder.useModule('ui/clipImage');
/**
 *   @constructor AvatarEditor
 */
wonder.addModule('contact/avatarEditor', function (W) {
    W.namespace('wonder.contact');

    function AvatarEditor () {
        W.ui.Window.call(this, i18n.contact.EDIT_CONTACT_HEAD);
    }


    W.extend(AvatarEditor, W.ui.Window);
    W.mix(AvatarEditor.prototype, {
        okBtn : null,
        cancelBtn : null,
        panelContentEl : null,
        delHeadEl : null,
        picLists : [],
        maxCountInOnePage : 30,
        clipImage : null,
        _data : {},
        _addComponent : function () {
            var self = this;
            self.okBtn = new W.ui.Button (i18n.misc.SAVE);
            self.cancelBtn = new W.ui.Button (i18n.ui.CANCEL);
            self.returnBtn = new W.ui.Button (i18n.misc.RESELECT_FILE_TEXT);
            self.picFormatTip = $('<span/>').text(i18n.contact.ALERT_PIC_FORMAT_TIP).addClass('w-contact-pic-format-tip');

            self.addFooterContent(self.okBtn);
            self.addFooterContent(self.cancelBtn);
            self.addFooterContent(self.returnBtn);
            self.addFooterContent({
                render : function (parent) {
                    self.picFormatTip.appendTo(parent);
                }
            });

            self.okBtn.addClassName('primary');
            self.returnBtn.addClassName('primary');
            self.returnBtn.addClassName('w-contact-edit-head-return');

            self.okBtn.bind('click', function (e) {
                var clipData = self.clipImage.clipImg();
                self._data.rect = clipData.left + ';' + clipData.top + ';' + clipData.width + ';' + clipData.height;
                self._data.dst_size = self.contactPanelHandle.getAvatarSize();
                W.ajax({
                    url : CONFIG.actions.EDIT_IMAGE,
                    data : self._data,
                    success : function (response) {
                        response = JSON.parse(response);
                        if (response.state_code === 200) {
                            self.contactPanelHandle.refreshAvatar(response.body.value);
                            self.hide();
                        } else {
                            // fail
                        }
                    }
                });
            });
            self.cancelBtn.bind('click', function (e) {
                self.hide();
            });
            self.returnBtn.bind('click', function (e) {
                self.recovery();
            });
            var tpl = W.Template.get('contact', 'contact_edit_head_panel');
            var panelContentEl = this.panelContentEl = $(tpl);
            var types = W.photo.PhotoCollection.type;

            this.phonePhotosEl = panelContentEl.find('.w-contact-edit-head-phone');
            this.libraryPhotosEl = panelContentEl.find('.w-contact-edit-head-library');
            this.photosEl = panelContentEl.find('.w-contact-edit-head-photos');

            this.tipEl = panelContentEl.find('.w-contact-edit-head-tip');

            panelContentEl.find('.w-contact-edit-head-source-tip').html(i18n.contact.EDIT_CONTACT_HEAD_SELECT_SOURCE);
            this.selectBtns = panelContentEl.find('.w-contact-edit-head-select-btns');
            this.createMenuBtn(this.selectBtns, types);

            this.selectPhotoFromPCBtn = new W.ui.Button (i18n.contact.EDIT_CONTACT_HEAD_PC_SOURCE);
            this.selectPhotoFromPCBtn.render(this.selectBtns);
            this.selectPhotoFromPCBtn.addClassName('primary');
            this.selectPhotoFromPCBtn.bind('click', function () {
                W.photo.photoCollection.getPhotoFromPC(0, function (imgPath) {
                    if (!imgPath) {
                        self.alertTip(i18n.photo.GET_PHOTO_FROM_PC_ERROR);
                    } else {
                        self.createClipImage(imgPath, 0);
                    }
                });
            });

            this.createDelHeadAlert();
            this.delHeadEl = this.panelContentEl.find('.w-contact-del-head');
            this.delHeadEl.html(i18n.contact.EDIT_CONTACT_HEAD_DEL_TEXT).attr('title', i18n.contact.EDIT_CONTACT_HEAD_DEL_TEXT);
            this.delHeadEl.bind('click', function () {
                self.delHeadAlert.show();
            });

            this.clipContainer = panelContentEl.find('.w-contact-edit-head-clip');
            this.selectContainer = panelContentEl.find('.w-contact-edit-head-select-container');
            this.photosEl.delegate('img', 'click', function (e) {
                var target = e.target;
                var id = $(target).attr('data-index');
                W.photo.photoCollection.getBigPicById(id, function (rep) {
                    if (rep.state_code === 200) {
                        var path = rep.body.path;
                        var picFormatArray = path.split('.');
                        if (/^(jpg|jpeg|png)$/i.test(picFormatArray[picFormatArray.length - 1])) {
                            self.createClipImage(rep.body.path, rep.body.orientation);
                        } else {
                            self.alertTip(i18n.contact.ALERT_PIC_FORMAT_ERROR);
                        }
                    } else {
                        self.alertTip(i18n.photo.GET_PHOTOS_ERROR);
                    }
                });
            });

            this.addBodyContent({
                render : function (opt_parent) {
                    panelContentEl.appendTo(opt_parent);
                }
            });

            panelContentEl.find('.w-contact-edit-head-photo-wrap')[0].onscroll = function (e) {
                var line = parseInt(e.target.scrollTop / 100, 10);
                var range = self.maxCountInOnePage + line * 5;

                W.delay(this, function () {
                    self.contactPhotoRequest.sendRequest(self.maxCountInOnePage, range);
                    self.maxCountInOnePage = range;
                }, 100);
            };

            W.photo.photoCollection.bind(W.photo.PhotoCollection.Events.SYNCED, function () {
                //currentContent.empty();
                //self.refresh();
                self.refreshPhotosList();
            });
        },
        alertTip : function (text) {
            alert(text);
        },
        createClipImage : function (path, orientation) {
            var self = this;
            var source = 'file:///' + path + '?date=' + new Date ().getTime();
            var img = self.clipContainer.find('.w-contact-edit-head-origin-img');
            if (img.length == 0) {
                img = $('<img/>').attr('src', source).addClass('w-contact-edit-head-origin-img').hide();
            } else {
                img.attr('src', source);
            }
            self._data = {
                'path' : path,
                'degree' : orientation
            };
            self.rotate(img, orientation);
            self.clipContainer.append(img);

            img.on('load', function () {
                var imgWidth = img[0].width;
                var imgHeight = img[0].height;
                var containerWidth = self.clipContainer.width();
                var containerHeight = self.clipContainer.height();
                var width = Math.min(imgWidth, containerWidth);
                var height = Math.min(imgHeight, containerHeight);

                if (!self.clipImage) {
                    self.clipImage = new W.ui.ClipImage ({
                        imageClipContainer : self.clipContainer,
                        imagePath : source,
                        imageConf : {
                            defaultWidth : width,
                            defaultHeight : height,
                            minWidth : 200,
                            minHeight : 200,
                            resizable : false,
                            keepSquare : false,
                            orientation : orientation
                        },
                        clipingBoxConf : {
                            defaultWidth : 100,
                            defaultHeight : 100,
                            minWidth : 40,
                            minHeight : 40,
                            maxWidth : width,
                            maxHeight : height,
                            resizable : true,
                            keepSquare : true,
                            className : 'w-imageClip-clipingbox'
                        }
                    });
                } else {
                    self.clipImage.setImage(source, width, height, orientation);
                }

                self.clipContainer.css('display', '-webkit-box');
                self.okBtn.show();
                self.cancelBtn.show();
                self.returnBtn.show();
                self.selectContainer.hide();
                self.picFormatTip.hide();
            });
        },
        createDelHeadAlert : function () {
            var self = this;
            if (!this.delHeadAlert) {
                this.delHeadAlert = new W.ui.Dialog (i18n.contact.DEL_CONTACT_HEAD);
                var buttonSetKey = W.ui.Dialog.ButtonSet.OK_CANCEL;
                var alertText = i18n.contact.ALERT_DEL_CONTACT_HEAD;
                this.delHeadAlert.bind('select', function (key) {
                    if (key === 'ok') {
                        self.contactPanelHandle.refreshAvatar('');
                    }
                    self.delHeadAlert.hide();
                    self.hide();
                });
                this.delHeadAlert.setButtonSet(buttonSetKey);
            }
            this.delHeadAlert.setContent(alertText);
        },
        createMenuBtn : function (opt_parent, types) {
            var selectSourceMenu = null;
            var item;
            var self = this;
            for (var i in types) {
                if (i !== 'ALL') {
                    if (!selectSourceMenu) {
                        selectSourceMenu = new W.ui.Menu (i18n.contact['EDIT_CONTACT_HEAD_SOURCE_BY_' + i.toUpperCase()]);
                        selectSourceMenu.render(opt_parent);
                        selectSourceMenu.addClassName('primary');
                        selectSourceMenu.removeAllItems();
                    }
                    item = new W.ui.CheckMenuItem (i18n.contact['EDIT_CONTACT_HEAD_SOURCE_BY_' + i.toUpperCase()]);
                    item.setValue(types[i]);
                    selectSourceMenu.addItem(item);
                }
            }
            selectSourceMenu.bind('select', function (e) {
                var value = e.target.getValue();
                self.currentType = value;
                if (value == W.photo.PhotoCollection.type.PHONE) {
                    self.phonePhotosEl.show();
                    self.libraryPhotosEl.hide();
                    this.setTitle(i18n.misc.NAV_PIC_PHONE_LIB);
                } else if (value == W.photo.PhotoCollection.type.LIBRARY) {
                    self.phonePhotosEl.hide();
                    self.libraryPhotosEl.show();
                    this.setTitle(i18n.misc.NAV_PIC_GALLERY);
                }

                self.refreshPhotosList();
            });
            selectSourceMenu.selectItemByIndex(0);
        },
        showTip : function () {
            var tip = '';
            if (this.picLists.length == 0) {
                if (this.currentType == W.photo.PhotoCollection.type.PHONE) {
                    tip = i18n.contact.EMPTY_PHONE_LIST;
                } else if (this.currentType == W.photo.PhotoCollection.type.LIBRARY) {
                    tip = i18n.contact.EMPTY_LIBRARY_LIST;
                }
            }

            if (Device.get('isMounted')) {
                tip = i18n.misc.SD_MOUNT_TIP_TEXT;
            }
            this.tipEl.text(tip).show();
        },
        hideTip : function () {
            this.tipEl.hide();
        },
        clearContent : function () {
            this.phonePhotosEl.empty();
            this.libraryPhotosEl.empty();
        },
        refreshPhotosList : function () {
            this.clearContent();
            if (!Device.get('isMounted')) {
                this.hideTip();
                this.getPhotos();
            } else {
                this.showTip();
            }
        },
        getPhotos : function () {
            this.contactPhotoRequest = new W.RequestList ();
            var request;
            var self = this;
            var photoInfo;
            var photosEl;
            W.photo.photoCollection.getPhotosList(self.currentType, function (response) {
                var list = [];
                self.picLists = [];
                if (response.body && response.body.list) {
                    list = response.body.list;
                }

                if (list.length <= 0 && response.state_code !== 202) {
                    self.showTip();
                } else if (response.state_code == 200) {

                    for (var i = 0, len = list.length; i < len; i++) {
                        for (var j = 0, len2 = list[i].photo_info.length; j < len2; j++) {
                            photoInfo = list[i].photo_info[j];
                            self.picLists.push(photoInfo);
                            setRequests(photoInfo.id, photoInfo.orientation);
                        }
                    }

                    function setRequests (id, orientation) {
                        var request = {
                            sending : false,
                            isSuccessed : false,
                            send : function () {
                                request.sending = true;
                                W.photo.photoCollection.getThumbnailById(id, function (resp) {
                                    if (resp.state_code == 200) {
                                        request.isSuccessed = true;

                                        var imgContainer = $('<div/>').addClass('w-contact-edit-head-img-wrap');
                                        var imgEl = $('<img>');
                                        if (self.currentType == W.photo.PhotoCollection.type.PHONE) {
                                            imgEl.appendTo(self.phonePhotosEl);
                                        } else if (self.currentType == W.photo.PhotoCollection.type.LIBRARY) {
                                            imgEl.appendTo(self.libraryPhotosEl);
                                        }
                                        imgEl.appendTo(imgContainer);
                                        imgEl.attr('src', 'file:///' + resp.body.value);
                                        imgEl.attr('data-index', id);
                                        self.rotate(imgEl, orientation);
                                        imgContainer.appendTo(photosEl);
                                    } else {
                                        request.isSuccessed = false;
                                    }
                                    request.sending = false;
                                });
                            }
                        }
                        self.contactPhotoRequest.push(request);
                    }

                    if (self.currentType == W.photo.PhotoCollection.type.PHONE) {
                        photosEl = self.phonePhotosEl;
                    } else if (self.currentType == W.photo.PhotoCollection.type.LIBRARY) {
                        photosEl = self.libraryPhotosEl;
                    }
                    photosEl.css('height', Math.round(self.picLists.length / 4) * 100);
                    self.contactPhotoRequest.sendRequest(0, self.maxCountInOnePage);
                }
            });
        },
        rotate : function (el, orientation) {
            for (var i in this.ROTATE_CLASS) {
                el.removeClass(this.ROTATE_CLASS[i]);
            }
            switch(orientation) {
            case 0 :
                break;
            case 90:
                el.addClass(this.ROTATE_CLASS.R90);
                break;
            case 180:
                el.addClass(this.ROTATE_CLASS.R180);
                break;
            case 270:
                el.addClass(this.ROTATE_CLASS.R270);
                break;
            }
        },
        ROTATE_CLASS : {
            R90 : 'w-rotate-90',
            R180 : 'w-rotate-180',
            R270 : 'w-rotate-270'
        },
        recovery : function () {
            this.clipContainer.hide();
            this.okBtn.hide();
            this.cancelBtn.hide();
            this.returnBtn.hide();
            this.selectContainer.show();
            this.picFormatTip.show();
        },
        saveHandleAndShow : function (handle) {
            this.contactPanelHandle = handle;
            this.show();
        },
        render : function (opt_parent) {
            var self = this;
            AvatarEditor._super_.render.call(this, opt_parent);
            this._addComponent();
            this.bind(W.ui.Window.Events.SHOW, function () {
                self.recovery();
            });
            Device.on('change:isMounted', function () {
                this.showTip();
            }, this);
        }
    });

    W.contact.avatarEditor = new AvatarEditor ();
});
wonder.useModule('contact/avatarEditor');
﻿/**
 * @fileoverview
 * jingfeng@wandoujia.com
 */

wonder.addModule('PageManager', function(W) {
	W.namespace('wonder.ui');
	var CONTENT_DOM_ID = 'd-content', doc = W.host.document;

	/**
	 * @constructor
	 */
	function PageManager() {

	};

	PageManager.PageNames = {
		ADDRESS_BOOK : 'address_book',
		ADDRESS_BOOK_ALL_CONTACT : 'address_book_all_contact',
		ADDRESS_BOOK_STAR_CONTACT : 'address_book_star_contact',
		ADDRESS_BOOK_OFTEN_CONTACT : 'address_book_often_contact',
		ADDRESS_BOOK_PHONE_CONTACT : 'address_book_phone_contact',

		MUSIC_PAGE : 'music',

		VIDEO_PAGE : 'video_page',

		WELCOME_PAGE : 'welcome_page'
	};

	W.mix(PageManager.prototype, W.events);

	PageManager.prototype._pages = {};

	PageManager.prototype.isValidPageName = function(pageName) {
		for (var i in PageManager.PageNames) {
			if (PageManager.PageNames[i] == pageName)
				return true;
		}
		return false;
	};
	PageManager.prototype.getPage = function(pageName) {
		return this._pages[this.mapPageName(pageName)];
	};
	PageManager.prototype.addPage = function(page) {
		if (!page) {
			throw new Error('Please specified the valid page');
		}

		if (!this.isValidPageName(page.getPageName())) {
			throw new Error('The input page name is invalid.');
		}

		if (this.getPage(page.getPageName())) {
			throw new Error('the page existed');
		} else {
			this._pages[this.mapPageName(page.getPageName())] = page;
			if (page.getDefaultRender()) {
				page.render(doc.getElementById(CONTENT_DOM_ID));
			}
		}
		page.setPageManager(this);
		return page;
	};
	PageManager.prototype.removePage = function(pageName) {
		if (!this.getPage[pageName])
			throw new Error('the page didn\'t existed.');
		delete this._pages[pageName];
	};
	PageManager.prototype.showPage = function(pageName, data, undefined) {
		var page = this.getPage(pageName);

		if (!page)
			throw new Error('the page -' + pageName + ' didn\'t existed.');

		if (!page.isRendered()) {
			page.render(doc.getElementById(CONTENT_DOM_ID));
		}

		for (var pn in this._pages) {
			if (this.mapPageName(pageName) != pn) {
				this._pages[pn].hide();
			}
		}
		page.show();
		page.trigger(Page.Actions.SHOW, data || pageName);
	};
	PageManager.prototype.mapPageName = function(pageName) {
		var pn;
		switch(pageName) {
			case W.PageManager.PageNames.ADDRESS_BOOK:
			case W.PageManager.PageNames.ADDRESS_BOOK_ALL_CONTACT:
			case W.PageManager.PageNames.ADDRESS_BOOK_STAR_CONTACT:
			case W.PageManager.PageNames.ADDRESS_BOOK_OFTEN_CONTACT:
			case W.PageManager.PageNames.ADDRESS_BOOK_PHONE_CONTACT:
				pn = W.PageManager.PageNames.ADDRESS_BOOK;
				break;
			case W.PageManager.PageNames.WELCOME_PAGE :
				pn = W.PageManager.PageNames.WELCOME_PAGE;
				break;
			case W.PageManager.PageNames.MUSIC_PAGE:
				pn = W.PageManager.PageNames.MUSIC_PAGE;
				break;
			case W.PageManager.PageNames.VIDEO_PAGE:
				pn = W.PageManager.PageNames.VIDEO_PAGE;
				break;
				break;
			default :
				console.log('the page ' + pageName + ' didnot existed.');
				break;
		}
		return pn;
	};
	W.PageManager = PageManager;
	W.PM = new PageManager();

	/**
	 * @constructor
	 */
	function Page(pageName, config) {
		W.ui.UIBase.call(this, config);
		this._name = pageName;
	};

	Page.Actions = {
		SHOW : 'show',
		HIDE : 'hide',
		SCROLL_LEFT : 'scroll_left'
	}

	W.extend(Page, W.ui.UIBase);

	/**
	 * Don't overrite this config
	 */
	Page.prototype._defaults = {
		top : true,
		left : true,
		right : true,
		leftWidth : '70%',
		rightWidth : '30%'
	};

	Page.prototype._defaultRender = false;

	Page.prototype._leftPage = null;

	Page.prototype._rightPage = null;

	Page.prototype._pm = null;

	Page.prototype.initPage = function() {
		this._pageTop = $('<div/>').addClass('w-page-top');
		this._leftPage = $('<div/>').addClass('w-page-left');
		this._rightPage = $('<div/>').addClass('w-page-right');

		if (this._config.top) {
			this._element.append(this._pageTop);
		}
		if (this._config.left) {
			this._element.append(this._leftPage);
		}
		if (this._config.right) {
			this._element.append(this._rightPage);
		}
		if (this._config.top) {
			this._element.append($('<div/>').addClass('w-page-top-shadow'));
		}

		if (this._config.leftWidth === 0) {
			this._rightPage.css({
				width : '100%'
			});
		} else if (this._config.rightWidth === 0) {
			this._leftPage.css({
				width : '100%'
			});
		} else {
			setTimeout(this.resizeWidth.bind(this), 0);
			$(window).bind('resize', $.proxy(function() {
				W.delay(this, this.resizeWidth, 25);
			}, this));
		}
	};
	Page.prototype.resizeWidth = function() {
		var relativeWidth = this._element.width(), rightWidth = 0;
		leftWidth = 0;
		if (W.isNumber(this._config.leftWidth)) {
			leftWidth = this._config.leftWidth;
			rightWidth = relativeWidth - leftWidth;
		} else if (W.isNumber(this._config.rightWidth)) {
			rightWidth = this._config.rightWidth;
			leftWidth = relativeWidth - rightWidth;
		} else {
			rightWidth = this._config.rightWidth;
			leftWidth = this._config.leftWidth;
		}
		this._leftPage.width(rightWidth === 0 ? leftWidth : (leftWidth - 1));
		this._rightPage.width(rightWidth);
	};
	Page.prototype.setPageManager = function(pm) {
		this._pm = pm;
	};
	Page.prototype.getPageManager = function(pm) {
		return this._pm;
	};
	Page.prototype.getPageName = function() {
		return this._name;
	};
	Page.prototype.addTopContent = function(component) {
		console.debug('Page Manager - Add top content: ' + this.getPageName());
		component.render(this._pageTop);
	};
	Page.prototype.addLeftContent = function(component) {
		console.debug('Page Manager - Add left content: ' + this.getPageName());
		if (component.render instanceof Function) {
			component.render(this._leftPage);
		} else {
			$(this._leftPage).append(component);
		}
	};

	Page.prototype.addClassToLeftPage = function(className) {
		this._leftPage.addClass(className);
	};

	Page.prototype.addRightContent = function(component) {
		console.debug('Page Manager - Add right content: ' + this.getPageName());
		component.render(this._rightPage);
	};

	Page.prototype.addPageContent = function(component) {
		component.render(this._element);
	};

	Page.prototype.getDefaultRender = function() {
		return this._defaultRender;
	};
	Page.prototype.setDefaultRender = function(defaultRender) {
		this._defaultRender = defaultRender;
	};
	Page.prototype.load = function() {
		if (this._isRendered)
			return;
		this.render(doc.getElementById(CONTENT_DOM_ID));
		this.trigger(Page.Actions.SHOW, this._name);
		if (this.isVisible()) {
			this.show();
		} else {
			this.hide();
		}
	};
	/**
	 *@override the "show" method in UIBase
	 */
	Page.prototype.show = function() {
		this._isVisible = true;
		this.removeClassName('wd-invisible');
	};
	/**
	 * *@override the "hide" method in UIBase
	 */
	Page.prototype.hide = function() {
		this._isVisible = false;
		this.addClassName('wd-invisible');
		this.trigger(Page.Actions.HIDE, this._name);
	};
	Page.prototype.render = function(opt_parent) {
		if (!this._isRendered) {
			Page._super_.render.call(this, opt_parent);
			this._element = this._element || $('<div/>').addClass('w-page');
			this._element.appendTo(opt_parent);
			this._isRendered = true;
			this.initPage();

			this._leftPage.bind('scroll', $.proxy(function(e) {
				this.trigger(Page.Actions.SCROLL_LEFT, e.target.scrollTop, e.target.scrollHeight);
			}, this));
		} else {
			throw new Error('Page rendered');
		}
	};
	W.ui.Page = Page;
});
wonder.useModule('PageManager');
﻿wonder.addModule('photo/data', function(W) {
    W.namespace('wonder.photo');

    /**
     * constructor PhotoCollection
     */
    function PhotoCollection() {
        this.initialize();
    };

    PhotoCollection.type = {
        ALL : 0,
        PHONE : 1,
        LIBRARY : 2
    }

    PhotoCollection.Events = {
        SYNCED : 'synced',
        REMOVE : 'remove'
    }
    W.mix(PhotoCollection.prototype, W.events);
    W.mix(PhotoCollection.prototype, {
        _currentType : PhotoCollection.type.PHONE,
        _curPlayList : [],
        phoneThreadList : [],
        libraryThreadList : [],

        initialize : function() {
            var self = this;

            IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.PHOTO_UPDATED
            }, function(data) {
                W.photo.loadingProcess.finish();
                if(!!data) {
                    self.trigger(PhotoCollection.Events.SYNCED);
                }
            });

            this.bind(W.photo.PhotoCollection.Events.REMOVE, function(data) {

                if(this._curPlayList) {
                    var index = this._curPlayList.indexOf(data);
                    if(index > -1) {
                        this._curPlayList.splice(index, 1);
                    }
                }
            }, this);
        },
        setCurrentType : function(type) {
            this._currentType = type;
        },
        getPhotoListByThreadKeyAndType : function(key, type) {
            var ret_photo_list = [];
            var thread;
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            for(var i = 0, len = list.length; i < len; i++) {
                thread = list[i];
                if(thread.key === key) {
                    ret_photo_list = thread.photo_info;
                    break;
                }
            }

            return ret_photo_list;
        },

        getPhotoThreadByTypeAndPhotoId : function(type, photoId) {
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;

            var retThread = _.find(list, function(thread) {
                return _.find(thread.photo_info, function(item) {
                    return item.id === photoId;
                });
            });

            return retThread;
        },

        getPlayList : function(type) {
            var playList = [];
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            _.each(list, function(data) {
                _.each(data.photo_info, function(phoneInfo) {
                    playList.push(phoneInfo);
                }, this);
            }, this);
            this._curPlayList = playList;
            return playList;
        },
        getPhotoListByType : function(type) {
            var retPhotoList = [], photoThreadList = (type === PhotoCollection.type.PHONE) ? this.phoneThreadList : this.libraryThreadList;

            _.each(photoThreadList, function(thread) {
                _.each(thread.photo_info, function(photo) {
                    retPhotoList.push(photo);
                }, this);
            }, this);

            this._curPlayList = retPhotoList;
            return retPhotoList;
        },
        updateCacheThreadIgnoreByKey : function(key, ignore) {
            var threadList = this.phoneThreadList.concat(this.libraryThreadList);
            var thread;
            for(var i = 0, len = threadList.length; i < len; i++) {
                thread = threadList[i];
                if(thread.key === key) {
                    thread.is_ignore = ignore;
                    break;
                }
            }
        },
        getUnignorePhotosList : function(type) {
            var photoList = [];
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            _.each(list, function(data) {
                if(!data.is_ignore) {
                    _.each(data.photo_info, function(phoneInfo) {
                        photoList.push(phoneInfo);
                    }, this);
                }
            }, this);
            return photoList;
        },
        setupThreadForPhotosList : function(type, thread, isIgnore) {
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            _.each(list, function(data) {
                if(data.key === thread.getKey()) {
                    data.is_ignore = isIgnore;
                    return false;
                }
            });
        },
        /* tip: the interface supports jpg and png format pictures*/
        getPhotoFromPC : function(type, callback) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.SELECT_CONTACT_PHOTO,
                data : {
                    type : type
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        console.log('Photos - Selected Photos success.');
                        callback.call(self, response.body.value ? response.body.value : '');
                    } else {
                        console.error('Photos - Selected photos failed. Error info: ' + response.state_line);
                    }
                }
            });
        },
        /**
         * @param {function} callback
         */
        getPhotosList : function(type, callback) {
            var self = this;

            W.ajax({
                url : CONFIG.actions.PHOTO_SHOW,
                data : {
                    photo_type : type
                },
                success : function(response) {
                    var response = JSON.parse(response);
                    var list = [];
                    if(response.body && response.body.list) {
                        list = response.body.list;
                    }
                    switch(type) {
                        case PhotoCollection.type.PHONE:
                            self.phoneThreadList = list;
                            break;
                        case PhotoCollection.type.LIBRARY:
                            self.libraryThreadList = list;
                            break;
                    }
                    callback && callback.call(this, response);
                }
            });
        },
        getCachePhotoThreadsByType : function(type) {
            var ret_threads = [];
            switch(type) {
                case PhotoCollection.type.PHONE:
                    ret_threads = this.phoneThreadList;
                    break;
                case PhotoCollection.type.LIBRARY:
                    ret_threads = this.libraryThreadList;
                    break;
            }

            return ret_threads;
        },
        getPhotoThreadsByType : function(type, callback, scope) {
            var self = this;

            W.ajax({
                url : CONFIG.actions.PHOTO_SHOW,
                data : {
                    photo_type : type
                },
                success : function(response) {
                    var response = JSON.parse(response), photoThreadList = [];
                    if(response.body && response.body.list) {
                        photoThreadList = response.body.list;
                    }
                    switch(type) {
                        case PhotoCollection.type.PHONE:
                            self.phoneThreadList = photoThreadList;
                            break;
                        case PhotoCollection.type.LIBRARY:
                            self.libraryThreadList = photoThreadList;
                            break;
                    }
                    callback && callback.call(scope, response);
                }
            });
        },
        sync : function(type, callback, scope) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.PHOTO_SYNC,
                data : {
                    photo_type : type
                },
                success : function(response) {
                    var response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },
        getThumbnailById : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.PHOTO_THUMBNAIL,
                data : {
                    photo_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback(response);
                }
            });
        },
        getBigPicById : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.PHOTO_GET,
                data : {
                    photo_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback(response);
                }
            });
        },
        getDataById : function(id) {
            var list = this.phoneThreadList.concat(this.libraryThreadList);
            for(var i = 0; i < list.length; i++) {
                var subList = list[i].photo_info;
                if(subList && subList.length > 0) {
                    for(var j = 0; j < subList.length; j++) {
                        if(subList[j].id === id)
                            return subList[j];
                    }
                }
            }
            return null;
        },
        removeDataById : function(id) {
            var list = this._currentType === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            for(var i = 0; i < list.length; i++) {
                var subList = list[i].photo_info;
                if(subList && subList.length > 0) {
                    for(var j = 0; j < subList.length; j++) {
                        if(subList[j].id === id) {
                            this.trigger(W.photo.PhotoCollection.Events.REMOVE, subList.splice(j, 1)[0]);
                            break;
                        }
                    }
                }
            }
            for(var j = 0; j < this._curPlayList.length; j++) {
                if(this._curPlayList[j].id === id) {
                    this._curPlayList.splice(j, 1);
                    break;
                }
            }
        },
        deletePictureById : function(ids, sessionId, callback) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.PHOTO_DELETE,
                data : {
                    photo_id_list : ids.join(','),
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(this, response);
                }
            });
        },
        setWallpaper : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.PHOTO_SET_WALLPAPER,
                data : {
                    photo_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(callback)
                        callback.call(this, response);
                }
            });
        },
        refreshThumbnail : function(id, orientation) {
            var data = this.getDataById(id);
            data && data.trigger(W.photo.PhotoItem.Events.REFRESH, id, orientation);

        },
        getThumbnailsByIdList : function(sendList) {
            _.each(sendList, function(req, index) {
                req.sending = true;
            });
            W.ajax({
                url : CONFIG.actions.PHOTO_THUMBNAILS,
                data : {
                    photo_id_list : _.pluck(sendList, 'id')
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        _.each(sendList, function(req, index) {
                            req.setThumbnail(response.body.success[index].item);
                            req.isSuccessed = true;
                        });
                    } else {
                        _.each(sendList, function(req, index) {
                            req.isSuccessed = false;
                        });
                    }
                    _.each(sendList, function(req, index) {
                        req.sending = false;
                    });
                }
            });
        }
    }, false);

    W.photo.PhotoCollection = PhotoCollection;
});
wonder.useModule('photo/data');
﻿/**
 * @fileoverview
 * @author jingfeng@wandoujia.com
 */

wonder.addModule('photo/photoView', function(W) {
    W.namespace('wonder.photo');

    var lastSelectItemId = null;
    var locale = i18n.photo;
    W.photo.phoneRequestList = new W.RequestList();
    W.photo.libraryRequestList = new W.RequestList();

    /**
     * @constructor ThreadView
     */
    function ThreadView(thread, type, index, globalCheckboxStatus) {
        this._data = thread;
        this._items = [];
        this._type = type;
        this._index = index;
        this.checkboxStatus = globalCheckboxStatus;
        W.ui.UIBase.call(this);
    }


    W.extend(ThreadView, W.ui.UIBase);

    ThreadView.Events = {
        SELECT : 'selectForToolbar',
        UNSELECT : 'unselectForToolbar',
        IGNORE : 'ignore'
    };

    W.mix(ThreadView.prototype, {
        _init : function() {
            var self = this;
            var title;
            if(this._data.key.indexOf('/') > -1) {
                var tmpArray = this._data.key.split('/');
                title = tmpArray[tmpArray.length - 2];
            } else {
                var tmpTitle = this._data.key.replace(/[\\]$/, '');
                tmpTitle = tmpTitle.replace(/^.*[\\]/, '');
                title = tmpTitle;
            }
            this.setTitle(title);

            this._data.path = this._data.key;
            this._data.isIgnore = this._data.is_ignore || false;

            this.setIgnoreBtn(this._data.isIgnore);
            this._data.isIgnore && this.hidePhotoItems();

            this.buildPhotoItem(this._data.photo_info);

        },
        buildPhotoItem : function(photosInfo, needPushData) {
            var self = this;

            if(needPushData) {
                this._data.photo_info = this._data.photo_info.concat(photosInfo);
            }

            _.each(photosInfo, function(photoInfo) {
                W.mix(photoInfo, W.events);

                var item = new PhotoItem(photoInfo, this._type, this._data.isIgnore, this.checkboxStatus);
                item.bind(PhotoItem.Events.PLAY, function(id) {
                    self.trigger(PhotoItem.Events.PLAY, id);
                });
                item.bind(PhotoItem.Events.SELECT, function(id, status) {
                    self.trigger(PhotoItem.Events.SELECT, id, status);
                    self.resetCheckbox();
                });
                photoInfo.bind('remove', function() {
                    self.removeItem(item);
                });

                photoInfo.bind(W.photo.PhotoItem.Events.REFRESH, function(id, orientation) {
                    self.refreshThumbnail(item, orientation);
                });
                photoInfo.bind(PhotoItem.Events.SELECT, function(status) {
                    if(status) {
                        item.select();
                    } else {
                        item.unSelect();
                    }
                });

                this.addItem(item);
            }, this);
        },
        setTitle : function(title) {
            this._element.find('.w-photo-title').text(title);
        },
        setIgnoreBtn : function(isIgnore) {
            var showText = isIgnore ? locale.THREAD_DISPLAY_SHOW : locale.THREAD_DISPLAY_HIDDEN;
            var ignoreBtn = this._element.find('.w-photo-ignore');
            ignoreBtn.text(showText);

            if(this._type === W.photo.PhotoCollection.type.PHONE) {
                ignoreBtn.hide();
                ignoreBtn.addClass('w-photo-phone-ignore');
            }
        },
        addItem : function(photoItem) {
            photoItem.render(this._element.find('.w-photo-items'));
            this._items.push(photoItem);
        },
        removeItem : function(photoItem) {
            for(var i = 0; i < this._items.length; i++) {
                if(this._items[i] == photoItem) {
                    this._items.splice(i, 1);
                    photoItem.remove();
                }
            }
            this.resetCheckbox();
            if(this._items.length <= 0) {
                this.remove();
            }
        },
        refreshThumbnail : function(item, orientation) {
            item.rotate(orientation);
        },
        resetCheckbox : function() {
            var checkedSize = this._element.find('.checked').length;
            var totalSize = this._items.length;
            var isChecked = (checkedSize == totalSize) && (totalSize > 0);
            this.setChecked(isChecked);
        },
        setChecked : function(checked) {
            this._checkbox.prop('checked', checked);
        },
        selectAll : function() {
            _.each(this._items, function(item) {
                item.setCheckboxSelect();
            }, this);
            this.setChecked(true);

            var photoList = W.photo.photoCollection.getPhotoListByThreadKeyAndType(this._data.key, this._type);
            this.trigger(ThreadView.Events.SELECT, _.pluck(photoList, 'id'));
        },
        unSelectAll : function() {
            _.each(this._items, function(item) {
                item.setCheckboxUnSelect();
            }, this);
            this.setChecked(false);

            var photoList = W.photo.photoCollection.getPhotoListByThreadKeyAndType(this._data.key, this._type);
            this.trigger(ThreadView.Events.UNSELECT, _.pluck(photoList, 'id'));
        },
        remove : function() {
            this._element.unbind().remove();
        },
        setItemIgnore : function(isIgnore) {
            _.each(this._items, function(item) {
                item.setIgnore(isIgnore);
            });
        },
        showPhotoItems : function() {
            this._element.find('.w-photo-items').show();

            var requestList = [];
            if(this._type === W.photo.PhotoCollection.type.PHONE) {
                requestList = W.photo.phoneRequestList;
            } else if(this._type === W.photo.PhotoCollection.type.LIBRARY) {
                requestList = W.photo.libraryRequestList;
            }
            _.each(this._items, function(photoItem) {
                if(!photoItem.getIsRequested()) {
                    requestList._list.unshift(photoItem.getRequest());
                }
            });
            requestList.sendRequest(0, this._items.length);
        },
        hidePhotoItems : function() {
            this._element.find('.w-photo-items').hide();
        },
        ignoreThread : function() {
            var self = this;
            var url = self._data.isIgnore ? CONFIG.actions.PHOTO_UNIGNORE_FOLDER : CONFIG.actions.PHOTO_IGNORE_FOLDER;

            W.ajax({
                type : 'GET',
                url : url,
                data : {
                    folder : self._data.path
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code == 200) {

                        self._data.isIgnore = !self._data.isIgnore;
                        self.setItemIgnore(self._data.isIgnore);
                        self.setIgnoreBtn(self._data.isIgnore);
                        W.photo.photoCollection.updateCacheThreadIgnoreByKey(self._data.path, self._data.isIgnore);

                        if(self._data.isIgnore) {
                            self.hidePhotoItems();
                            W.photo.page.insertThreadsFromUnbuildThread(self._items.length);
                        } else {
                            self.showPhotoItems();
                            W.photo.page.updateContentWrapperSize();
                        }
                        self.trigger(ThreadView.Events.IGNORE);
                    } else {
                        // to do Fail
                    }
                }
            });
        },
        getKey : function() {
            return this._data.key;
        },
        getIsIgnore : function() {
            return this._data.isIgnore;
        },
        getHeight : function() {
            return this._element.height();
        },
        render : function(opt_parent) {
            if(!this._isRendered) {
                var self = this;
                this._element = $(W.Template.get('photo', 'photo_thread'));
                this._element.appendTo(opt_parent);

                this._checkbox = this._element.find('.w-photo-thread-checkbox');
                this._checkbox.bind('click', $.proxy(function(e) {
                    if(e.target.checked) {
                        this.selectAll();
                    } else {
                        this.unSelectAll();
                    }
                }, this));

                this._ignoreBtn = this._element.find('.w-photo-ignore');
                this._ignoreBtn.bind('click', function() {
                    self.ignoreThread();
                });

                this._isRendered = true;
                this._init();
                this._element.find('.w-photo-thread-title').attr('data-path', this._data.path);

                this.setChecked(this.checkboxStatus);
            }
        }
    });

    /**
     * @constructor PhotoItem
     */
    function PhotoItem(data, type, isIgnore, checkboxStatus) {
        this._data = data;
        this._type = type;
        this._data._type = type;
        this.checkboxStatus = checkboxStatus;
        this.isIgnore = isIgnore;
        W.ui.UIBase.call(this);
    }


    W.extend(PhotoItem, W.ui.UIBase);
    PhotoItem.Events = {
        PLAY : 'play',
        SELECT : 'select',
        WALLPAPER : 'setwallpaper',
        REFRESH : 'refresh'
    };

    W.mix(PhotoItem.prototype, {
        _init : function() {

        },
        doCallbak : function(e) {
            var self = this;
            var target = $(e.target);
            if(target.hasClass('w-photo-item-thumbnail-share') ||
            	target.hasClass('icon')) {
                target.prop('disabled', true);

                this.getBigPicture(function(response) {
                    var previewContentSize = socialService.getPreviewContentSize();

                    var previewImg = $('<img/>').attr('src', 'file:///' + response.path + ' ?date= ' + new Date().getTime())
                                                .css({
                                                    'max-width' : previewContentSize.width,
                                                    'max-height': previewContentSize.height
                                                });
                    var rotation;
                    switch(self._data.orientation){
                        case 0 :
                            rotation = 0;
                        break;
                        case 3 :
                        case 90:
                            previewImg.addClass('turn-right')
                            rotation = 3;
                        break;
                        case 2 :
                        case 180:
                            previewImg.addClass('turn-down')
                            rotation = 2;
                        break;
                        case 1 :
                        case 270:
                            previewImg.addClass('turn-left')
                            rotation = 1;
                        break;
                    }
                    var data = {
                        hasPreview : true,
                        previewContent : previewImg,
                        shareData : {
                            need_shell : 0,
                            pic        : response.path,
                            rotation   : rotation
                        },
                        type : CONFIG.enums.SOCIAL_PHOTO,
                        size : this._data.size,
                        shareCallback : function(){
                            window.Sync.PhotoSyncView.getInstance().tryToShowPhotoSyncAlertView();
                        }
                    };

                    socialService.show(data);
                });

                target && target.prop('disabled', false);
            } else if(e.target.tagName.toLowerCase() == 'input') {
                this.toggle();
                if(e.target.checked) {
                    W.photo.photoItemColletion.showAllItemCheckbox();
                } else if(!W.photo.photoItemColletion.hasCheckedBox()) {
                    W.photo.photoItemColletion.hideAllItemCheckbox();
                }

                if(e.shiftKey && lastSelectItemId !== null) {
                    W.photo.photoItemColletion.setCheckedBox(this._data.id, lastSelectItemId, e.target.checked);
                }
                lastSelectItemId = this._data.id;
            } else {
                this.playPic();
            }
        },
        getBigPicture : function(callback) {
            var self = this;
            W.photo.progressBar.add();
            W.ajax({
                url : CONFIG.actions.PHOTO_GET,
                data : {
                    photo_id : self._data.id
                },
                success : function(response) {
                    W.photo.progressBar.remove();
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        callback.call(self, response.body);
                    } else {
                        alert(i18n.photo.GET_PHOTOS_ERROR);
                    }
                }
            });
        },
        toggle : function() {
            var checked = this._element.hasClass('checked'); !checked ? this.select() : this.unSelect();
        },
        setCheckboxSelect : function() {
            if(this._element.children('input:visible').length == 0) {
                return;
            }
            this._element.children('input').prop('checked', true);
            this._element.addClass('checked');
        },
        setCheckboxUnSelect : function() {
            this._element.children('input').prop('checked', false);
            this._element.removeClass('checked');
        },
        select : function() {
            this.setCheckboxSelect();
            this.trigger(PhotoItem.Events.SELECT, this._data.id, true);
        },
        unSelect : function() {
            this.setCheckboxUnSelect();
            this.trigger(PhotoItem.Events.SELECT, this._data.id, false);
        },
        setIgnore : function(isIgnore) {
            this.isIgnore = isIgnore;
            this.request.isIgnore = isIgnore;
        },
        getThumbnail : function() {
            var self = this;
            var id = this._data.id;

            this.request = {
                id : id,
                item : this,
                sending : false,
                isSuccessed : false,
                isIgnore : self.isIgnore,
                supportSendList : false,
                send : function() {
                    this.sending = true;
                    W.ajax({
                        url : CONFIG.actions.PHOTO_THUMBNAIL,
                        data : {
                            photo_id : id
                        },
                        success : function(response) {
                            response = JSON.parse(response);
                            if(response.state_code == 200) {
                                self.request.isSuccessed = true;
                                self.request.setThumbnail.call(self, response.body.value);
                            } else {
                                self.request.isSuccessed = false;
                            }
                            self.request.sending = false;
                        }
                    });
                },
                setThumbnail : function(source) {
                    var imgEl = self._element.find('img');
                    imgEl.attr('src', 'file:///' + source);
                }
            };

            if(!this.isIgnore) {
                if(this._type === 1) {
                    W.photo.phoneRequestList.push(this.request);
                } else if(this._type == 2) {
                    W.photo.libraryRequestList.push(this.request);
                }
            }

        },
        getIsRequested : function() {
            return this.request.isSuccessed ? true : false;
        },
        getRequest : function() {
            return this.request;
        },
        remove : function() {
            this._element.unbind().remove();
            this.trigger('remove', this._data.id);
        },
        playPic : function() {
            this.trigger(PhotoItem.Events.PLAY, this._data.id);
        },
        setVisibility : function(visibiliy) {
            var el = this._element;
            visibiliy ? el.removeClass('wd-invisible') : el.addClass('wd-invisible');
        },
        rotate : function(orientation) {
            for(var i in this.ROTATE_CLASS) {
                this._element.removeClass(this.ROTATE_CLASS[i]);
            }
            switch(orientation) {
                case 0 :
                    break;
                case 90:
                    this._element.addClass(this.ROTATE_CLASS.R90);
                    break;
                case 180:
                    this._element.addClass(this.ROTATE_CLASS.R180);
                    break;
                case 270:
                    this._element.addClass(this.ROTATE_CLASS.R270);
                    break;
            }

            this._data.orientation = orientation;
        },
        ROTATE_CLASS : {
            R90 : 'w-rotate-90',
            R180 : 'w-rotate-180',
            R270 : 'w-rotate-270'
        },

        setThumbnailWeiboButton : function() {
            var isConnected = Device.get('isConnected');
            var weiboButton = this._element.find('.w-photo-item-thumbnail-share');

            if(isConnected) {
                weiboButton.show();
            } else {
                weiboButton.hide();
            }
            switch(Environment.locale) {
                case CONFIG.enums.LOCALE_EN_US :
                    title = i18n.misc.SHARE_TO_FACEBOOK;
                    break;
                case CONFIG.enums.LOCALE_ZH_CN :
                case CONFIG.enums.LOCALE_DEFAULT :
                default:
                    title = i18n.misc.WEIBO_SHARE_TEXT;
                    break;
            }
            weiboButton.attr('title', title);
        },
        render : function(opt_parent) {
            var self = this;
            if(!this._isRendered) {
                this._element = $(_.template(W.Template.get('photo', 'photo_item'))({}));
                this._element.appendTo(opt_parent);
                this.rotate(this._data.orientation);

                this._element.attr('data-name', self._data.display_name);
                this._element.attr('data-date', self._data.date);
                this._element.attr('data-size', self._data.size);

                this._element.bind('click', $.proxy(this.doCallbak, this));
                Device.on('change:isConnected', function() {
                    self.setThumbnailWeiboButton();
                });
                this._isRendered = true;
                this._init();
                // this.setVisibility(false);
                this.getThumbnail();
                this.setThumbnailWeiboButton();

                if(this.checkboxStatus) {
                    this.setCheckboxSelect();
                } else {
                    this.setCheckboxUnSelect();
                }

                W.photo.phoneRequestList.setSendListCallback(W.photo.photoCollection.getThumbnailsByIdList);
                W.photo.libraryRequestList.setSendListCallback(W.photo.photoCollection.getThumbnailsByIdList);

            }
        }
    });

    W.photo.PhotoItem = PhotoItem;
    W.photo.ThreadView = ThreadView;
});
wonder.useModule('photo/photoView');
/**
 * Photo Module
 *
 * @author jingfeng@wandoujia.com
 */
wonder.addModule('photo', function (W) {
    W.namespace('wonder.photo');

    var locale = i18n.photo;
    var currentPage = null;
    var currentType = W.photo.PhotoCollection.type.PHONE;
    var currentContent = null;
    var phoneCheckedBoxDelegate = null;
    var libraryCheckedBoxDelegate = null;
    var photoCollection = new W.photo.PhotoCollection ();
    var player = null;
    var toolbar = null;
    var phoneContent = null;
    var libraryContent = null;
    var maxCountInOnePage = 60;
    var setToolbarStatus = null;
    var progressBar = new W.ui.ProgressMonitor ();
    var loadingProcess = new W.ui.status.Process ();
    var loadingView = new W.ui.status.ProcessView (loadingProcess);
    var progressWin = new W.ui.Progress ();
    var phoneUnbuildThread = [];
    var libraryUnbuildThread = [];
    var photoSize = {
        width : 136,
        height : 100
    };
    var photoOuterSize = {
        width : 154,
        height : 118
    };
    var threadTitleHeight = 34;
    var photoTipHeight = 24;
    var contentWrapper;
    var globalCheckboxStatus = false;
    var photoInfo;

    W.photo.loadingProcess = loadingProcess;
    W.photo.progressBar = progressBar;
    W.photo.progressWin = progressWin;
    W.photo.photoCollection = photoCollection;

});
wonder.useModule('photo');
﻿/**
 * @fileoverview
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/dataCollection', function(W) {
    W.namespace('wonder.video');
    var alert = new W.ui.Dialog(i18n.ui.TIP);
    alert.setButtonSet(W.ui.Dialog.ButtonSet.OK);

    function VideoCollection() {
        this.initialize();
    }


    VideoCollection.Events = {
        UPDATE : 'update',
        REMOVE : 'remove',
        SYNC_FAILED : 'syncFailed'
    };

    W.mix(VideoCollection.prototype, W.events);

    W.mix(VideoCollection.prototype, {
        cacheList : {},

        initialize : function() {
            IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.VIDEO_UPDATED
            }, function(data) {
                console.log('Video - Video list update success.');
                if(!!data) {
                    this.trigger(VideoCollection.Events.UPDATE);
                }
            }, this);
        },

        getVideoThumbnail : function(id, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_THUMBNAIL,
                data : {
                    video_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        getCacheList : function() {
            return this.cacheList;
        },

        getVideoItemList : function() {
            var videoItemList = [];

            for(var i in this.cacheList) {
                _.each(this.cacheList[i], function(data) {
                    videoItemList.push(data);
                });
            }
            return videoItemList;
        },

        getVideoThreadList : function(callback) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.VIDEO_SHOW,
                success : function(response) {
                    try {
                        response = JSON.parse(response);
                    } catch(e) {
                        console.error('get List error: please check if backend response:', response);
                    }
                    if(!!response.body) {
                        self.cacheList = response.body;
                    }
                    callback && callback.call(this, response);
                }
            });
        },

        sync : function(callback) {
            W.ajax({
                url : CONFIG.actions.VIDEO_SYNC,
                success : function(response) {
                    try {
                        response = JSON.parse(response);
                    } catch(e) {
                        console.error('get List error: please check if backend response:', response);
                    }
                    callback && callback.call(this, response);
                }
            });
        },

        getVideoById : function(id) {
            var list = this.getVideoItemList();
            for(var i = 0, len = list.length; i < len; i++) {
                if(list[i].id === id) {
                    return list[i];
                }
            }

            return null;
        },

        removeVideoById : function(id) {
            var self = this;
            var list = this.cacheList;
            var videoArry = [];
            for(var i in list) {
                videoArry = list[i];
                _.each(videoArry, function(videoData, index) {
                    if(videoData.id === id) {
                        self.trigger(VideoCollection.Events.REMOVE, videoArry.splice(index, 1)[0]);
                    }
                });
            }

        },

        getVideoPath : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.VIDEO_LOAD,
                data : {
                    video_id : id
                },
                success : callback
            });
        },

        getVideosFromPC : function(type, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_SELECT_VIDEO,
                data : {
                    type : type
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        importVideo : function(videoList, sessionId, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_IMPORT,
                data : {
                    file_path_list : videoList,
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        play : function(videoId, sessionId, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_PLAY,
                data : {
                    video_id : videoId,
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        cancelPlay : function(sessionId, videoId, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_CANCEL,
                data : {
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        callback && callback.call(scope, videoId);
                    }
                }
            });
        }
    });
    W.video.VideoCollection = VideoCollection;
});
wonder.useModule('video/dataCollection');
﻿/**
 * @fileoverview video content
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/content', function(W){
    W.namespace('wonder.video');
    var locale = i18n.video;
    var progressWin = new W.ui.Progress({className : 'w-video-play-loading', mask: false});

    function VideoContent(){
        this._threads = [];
        W.ui.UIBase.call(this);
    }
    W.extend(VideoContent, W.ui.UIBase);

    W.mix(VideoContent.prototype, {
        lastThread : null,
        lastSessionId : null,

        addThread: function(thread){
            thread.render(this._element);
            this._threads.push(thread);
        },

        selectAllThread: function(){
            _.each(this._threads, function(item){
                item.selectAll();
            }, this);
        },

        unSelectAllThread: function(){
            _.each(this._threads, function(item){
                item.unSelectAll();
            }, this);
        },

        empty: function(){
            this._threads = [];
            this.infoTpl = null;
            this._element.empty();
        },

        showTip: function(text){
            this.clearContent();
            text && this._element.html(text);
        },

        getThreadTitle: function(){
            return this._element.find('.w-video-thread:visible .w-video-thread-title');
        },

        setPosition2Thread: function(thread, setPosition2ThreadTimer){
            clearTimeout(setPosition2ThreadTimer);
            if(!this.lastThread){
                this.lastThread = this.getThreadTitle().first();
            }
            this.lastThread.parent('dl').css('position', 'relative');
            thread.parent('dl').css('position', 'static');
            this.lastThread = thread;
        },

        showVideoInfo: function(data, position){
            if(!this.infoTpl){
                var tpl = W.Template.get('video', 'video_info');
                this.infoTpl = $(tpl);
                this.infoTpl.appendTo(this._element);
            }

            this._element.find('.w-video-name').html(data.name);
            this._element.find('.w-video-size').html(data.size);
            this._element.find('.w-video-duration').html(data.duration);

            this.infoTpl.css({
                display : 'block',
                left : position.left,
                top  : position.top
            });
        },

        hideVideoInfo: function(){
            this.infoTpl && this.infoTpl.hide();
        },

        showAllCheckbox : function(){
            this.getAllCheckbox().removeClass('item-hide');
        },

        hideAllCheckbox : function(){
            this.getAllCheckbox().addClass('item-hide');
        },

        getAllCheckbox: function(){
            return this._element.find('.w-video-item-checkbox');
        },

        hasCheckedbox : function(){
            var checkboxDelegate = W.video.videoPage.getCheckboxDelegate();
            if(checkboxDelegate.selectedItems.length){
                return true;
            }else{
                return false;
            }
        },

        clearContent: function(){
            this._element.empty();
        },

        playVideo: function(video_id){
            var self = this;
            var parentEl = self._element.parent('.w-video-content-wrapper');
            var sessionId
                = self.lastSessionId
                = progressWin.start(0, 100, locale.PLAY_VIDEO_TEXT, locale.PLAY_VIDEO_SUCCESS,'','','', parentEl);
            progressWin.view.setDelimiter('%');
            progressWin.view.hideMax();
            W.video.videoCollection.play(video_id, sessionId, function(response){
                progressWin.hide();

                if(response.state_code == 500){
                    alert(locale.PLAY_DISCONNECT);
                }else if(response.state_code == 400){
                    var text;
                    if(progressWin.getCurrent() == 100){
                        var video_data = W.video.videoCollection.getVideoById(video_id);
                        var video_arry = video_data.display_name.split('.');
                        var video_type = video_arry[video_arry.length - 1];
                        text = window.StringUtil.format(locale.PLAY_NO_PLAYER, video_type.toUpperCase());
                    }else{
                        text = locale.PLAY_CANNOT_READ;
                    }
                    alert(text);
                }

            }, self);
        },

        render: function(parent){
            var self = this;
            if(!this.rendered){
                this._element = $('<div/>').addClass('w-video-content');
                this._element.appendTo(parent);

                this._element.delegate('.w-video-item-mask', 'click', function(e){
                    var target = $(e.target);
                    var video_id = target.attr('data-id');

                    if(self.lastSessionId){
                        W.video.videoCollection.cancelPlay(self.lastSessionId, video_id, self.playVideo, self);
                    }else{
                        self.playVideo(video_id);
                    }

                }).delegate('.w-video-item-mask', 'mouseover', function(e){

                    var offset = $(this).offset();
                    var position = {
                        left : offset.left - 150,
                        top  : offset.top + 40
                    };
                    var target = $(e.target);
                    var video_id = target.attr('data-id');
                    var video_data = W.video.videoCollection.getVideoById(video_id);

                    var data = {};
                    data.name = video_data.display_name;
                    data.size = W.String.readableSize(video_data.size);
                    data.duration = W.timer().formatTimerFromMillisecond(video_data.duration);

                    self.showVideoInfo(data, position);

                }).delegate('.w-video-item-mask', 'mouseout', function(e){
                    self.hideVideoInfo();
                });

                Device.on('change:hasSDCard', function(Device){
                    var tipText = '';
                    if(!Device.get('hasSDCard')){
                        tipText =  i18n.misc.NO_SD_CARD_TIP_TEXT;
                        this.showTip(tipText);
                    }if(this._threads.length <= 0){
                        tipText = locale.NO_VIDEOS_TEXT;
                        this.showTip(tipText);
                    }

                }, this);

                $(document).bind('keydown', function(e){
                   if(e.which === 27){ // Esc is pressed
                        W.video.videoCollection.cancelPlay(self.lastSessionId, '', function(){
                            progressWin.hide();
                        }, self);
                   }
                });
                this.rendered = true;
            }
        }
    });

    W.video.VideoContent = VideoContent;
});
wonder.useModule('video/content');
﻿/**
 * @fileoverview video thread
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/thread', function(W){
    W.namespace('wonder.video');
    var locale = i18n.video;

    function VideoThread(threadData, threadName){
        this.data = threadData;
        this.name = threadName;
        this.items = [];
        W.ui.UIBase.call(this);
    }

    W.extend(VideoThread, W.ui.UIBase);

    VideoThread.Events = {
        SELECT : 'videoThreadSelect',
        UNSELECT : 'videoThreadUnselect'
    };

    W.mix(VideoThread.prototype, {
        _init : function () {
            var self = this;

            self.setThreadTitle(this.name);

            var videoItem;
            _.each(self.data, function(videoData) {

                W.mix(videoData, W.events);
                videoItem = new W.video.VideoItem(videoData);

                videoItem.bind( W.video.VideoItem.Events.SELECT, function(id){
                    self.trigger( W.video.VideoItem.Events.SELECT, id);
                    self.resetCheckbox();
                });

                videoItem.bind( W.video.VideoItem.Events.UNSELECT, function(id){
                    self.trigger( W.video.VideoItem.Events.UNSELECT, id);
                    self.resetCheckbox();
                });

                videoItem.bind(W.video.VideoItem.Events.REMOVE, function(id){
                   self.removeItem(id);
                 });

                self.addItem(videoItem);
            });
        },

        addItem : function(videoItem){
            videoItem.render(this._element.find('.w-video-thread-items'));
            this.items.push(videoItem);
        },

        removeItem: function(id){
            for(var i=0; i < this.items.length; i++){
                if(this.items[i].data.id == id){
                    this.items.splice(i, 1);
                }
            }
            this.resetCheckbox();
            if(this.items.length <= 0){
                this.remove();
            }
        },

        remove: function(){
            this._element.unbind().remove();
        },

        setThreadTitle : function(title) {
            this._element.find('.w-video-thread-title b').text(title);
        },

        resetCheckbox: function(){
            var checkedSize = this._element.find('dd>div.checked').length;
            var totalSize = this.items.length;
            this.setChecked((checkedSize == totalSize) && (totalSize > 0));
        },

        setChecked : function(checked) {
            this._checkbox.prop('checked', checked);
        },

        selectAll: function(){
            _.each(this.items, function(item){
                item.select();
            }, this);
            this.setChecked(true);
        },

        unSelectAll: function(){
            _.each(this.items, function(item){
                item.unSelect();
            }, this);
            this.setChecked(false);
        },

        render : function(parent) {
            var self = this;
            if(!this.rendered){
                this._element = $(W.Template.get('video', 'video_thread'));
                this._element.appendTo(parent);
                this._init();

                this._checkbox = this._element.find('.w-video-thread-checkbox');
                this._element.click(function(e){
                    var target = e.target;
                    if($(target).hasClass('w-video-thread-checkbox')){
                        if(target.checked){
                            self.selectAll();
                        }else{
                            self.unSelectAll();
                        }
                    }

                });
                this.rendered = true;
            }
        }
    });
    W.video.VideoThread = VideoThread;
});
wonder.useModule('video/thread');
﻿/**
 * @fileoverview
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/item', function(W){
    W.namespace('wonder.video');

    function VideoItem(data){
        this.data = data;
        W.ui.UIBase.call(this);
    }
    W.extend(VideoItem, W.ui.UIBase);

    VideoItem.Events = {
        SELECT : 'videoItemSelect',
        UNSELECT : 'videoItemUnselect',
        REMOVE : 'videoItemRemove'
    };

    W.mix(VideoItem.prototype, {
       getThumbnail: function(){
            var self = this;
            var id = this.data.id;

            this.request = {
                id: id,
                item: this,
                sending: false,
                isSuccessed: false,
                isIgnore: false,
                send: function(){
                    this.sending = true;

                    W.video.videoCollection.getVideoThumbnail(id, function(response){
                        if(response.state_code == 200){
                             this.request.isSuccessed = true;
                             var imgEl = this._element.find('img');
                             imgEl.attr('src', 'file:///' + response.body.value);
                        }else{
                            this.request.isSuccessed = false;
                        }
                        this.request.sending = false;
                    }, self)
                }
            };


            W.video.videoRequestList.push(this.request);
        },

        removeItem: function(){
            this._element.unbind().remove();
            this.trigger(VideoItem.Events.REMOVE, this.data.id);
        },

        toggle: function(){
            var checked = this._element.hasClass('checked');
            !checked ? this.select() : this.unSelect();
        },

        select: function(){
            if(this._element.children('input:visible').length == 0){
                return ;
            }
            this._element.children('input').prop('checked', true);
            this._element.addClass('checked');
            this.trigger(VideoItem.Events.SELECT, this.data.id);
        },

        unSelect: function(){
            this._element.children('input').prop('checked', false);
            this._element.removeClass('checked');
            this.trigger(VideoItem.Events.UNSELECT, this.data.id);
        },

        setVisibility: function(visibiliy){
            var el = this._element;
            visibiliy ? el.removeClass('wd-invisible') : el.addClass('wd-invisible');
        },

        render : function(parent) {
            var self = this;
            if(!this.rendered){
                var tpl = W.Template.get('video', 'video_item');

                this._element = $(tpl);
                this._element.appendTo(parent);
                this._element.find('.w-video-item-mask').attr('data-id', self.data.id);

                this._element.click(function(e){
                    var target = e.target;
                    if(target.tagName.toLowerCase() == 'input'){
                        self.toggle();
                        if(target.checked){
                            W.video.videoContent.showAllCheckbox();
                        }else if(!W.video.videoContent.hasCheckedbox()){
                            W.video.videoContent.hideAllCheckbox();
                        }
                    }
                });

                this.data.bind(VideoItem.Events.REMOVE, function(){
                    self.removeItem();
                });

                this.rendered = true;
            }
            this.getThumbnail();
        }
    });

    W.video.VideoItem = VideoItem;
    W.video.videoRequestList = new W.RequestList();

});
wonder.useModule('video/item');
﻿/**
 * @fileoverview video module entrance
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video', function (W) {
    W.namespace('wonder.video');
    var locale = i18n.video;
    var toolbar = null;

    var loadingProcess = new W.ui.status.Process ();
    var loadingView = new W.ui.status.ProcessView (loadingProcess);
    var deleteTipDialog = new W.ui.Dialog (i18n.ui.TIP);
    var progressWin = new W.ui.Progress ();
    var allCheckbox = $('<input/>').attr('type', 'checkbox');
    var videoContent = W.video.videoContent = new W.video.VideoContent ();
    var VideoCollection = W.video.VideoCollection;
    var videoCollection = W.video.videoCollection = new VideoCollection ();
    window.Music.PIMCollection.getInstance().get(6).set({
        count : videoCollection.getVideoItemList().length
    });
    videoCollection.on('update', function () {
        window.Music.PIMCollection.getInstance().get(6).set({
            count : videoCollection.getVideoItemList().length
        });
    });
    window.Device.on('change:isMounted', function (Device, isMounted) {
        if (!isMounted) {
            window.Music.PIMCollection.getInstance().get(6).set({
                count : videoCollection.getVideoItemList().length
            });
        } else {
            window.Music.PIMCollection.getInstance().get(6).set({
                count : 0
            });
        }
    });
    var maxRequestOnePage = 80;
    var contentWrapper;
    var setPosition2ThreadTimer;
    var checkboxDelegate;
    var alert = new W.ui.Dialog (i18n.ui.TIP);
    alert.setButtonSet(W.ui.Dialog.ButtonSet.OK);

    /**
     * @constructor
     */
    function VideoPage (pageName, config) {
        W.ui.Page.call(this, pageName, config);
    }


    W.extend(VideoPage, W.ui.Page);

    W.mix(VideoPage.prototype, {
        _initToolbar : function () {
            var self = this;
            toolbar = new W.ui.Toolbar ();
            this.addTopContent(toolbar);

            var mainBtn = new W.ui.ImageButton (locale.ADD_LOCAL_VIDEO_TEXT);
            var delBtn = new W.ui.ImageButton (i18n.misc.DELETE);
            var expBtn = new W.ui.ImageButton (i18n.misc.EXPORT);
            var refreshBtn = new W.ui.ImageButton (i18n.misc.REFRESH);
            checkboxDelegate = new W.ui.SelectDelegate ();

            toolbar.addComponent('checkboxDelegateBtn', checkboxDelegate).addComponent('mainBtn', mainBtn).addComponent('deleteBtn', delBtn).addComponent('exportBtn', expBtn).addComponent('refreshBtn', refreshBtn);

            delBtn.setDisabled(true);
            expBtn.setDisabled(true);

            mainBtn.addClassName('primary min').addImageClass('add');
            delBtn.addClassName('min').addImageClass('delete');
            expBtn.addClassName('min').addImageClass('export');
            refreshBtn.addClassName('min').addImageClass('refresh');

            mainBtn.bind('click', this.addVideoFormPC, this);
            refreshBtn.bind('click', this.refreshActionCallback, this);
            expBtn.bind('click', function () {
                window.Music.VideoService.exportVideosAsync(checkboxDelegate.getList());
            });
            delBtn.bind('click', function () {
                self.deleteVideo(checkboxDelegate.getList());
            });

            checkboxDelegate.bind('add', this.setToolbarStatus);
            checkboxDelegate.bind('remove', this.setToolbarStatus);
            checkboxDelegate.bind('empty', this.setToolbarStatus);
            checkboxDelegate.bind('checked', function () {
                videoContent.selectAllThread();
                self.setToolbarStatus.call(self);
            });
            checkboxDelegate.bind('unchecked', function () {
                this.reset();
                videoContent.unSelectAllThread();
                self.setToolbarStatus.call(self);
            });
            checkboxDelegate.bind('show', this.setToolbarStatus);

            Device.on('change', this.setToolbarStatus, this);
            this.setToolbarStatus();
        },

        getCheckboxDelegate : function () {
            return checkboxDelegate;
        },

        addVideoFormPC : function () {
            window.Music.ImportVideoView.getInstance().show();
        },

        refreshActionCallback : function () {
            var self = this;
            checkboxDelegate.reset();
            videoContent.empty();
            loadingProcess.start();
            videoCollection.sync(function (response) {
                if (response.state_code !== 200 && response.state_code !== 402) {
                    alert(i18n.misc.REFRESH_ERROR);
                }
                loadingProcess.finish();
                window.Music.PIMCollection.getInstance().get(6).set({
                    count : videoCollection.getVideoItemList().length
                });
            });
        },

        deleteVideo : function (videoIds) {
            window.Music.VideoService.deleteVideosAsync(videoIds);
        },

        setToolbarStatus : function () {
            var connected = Device.get('isConnected');
            var hasSDCard = Device.get('hasSDCard');
            var checkedSize = checkboxDelegate.size();
            var totalSize = videoCollection.getVideoItemList().length;

            var mainBtn = toolbar.getComponent('mainBtn');
            var refreshBtn = toolbar.getComponent('refreshBtn');
            var delBtn = toolbar.getComponent('deleteBtn');
            var expBtn = toolbar.getComponent('exportBtn');

            mainBtn.setDisabled(!connected || !hasSDCard);
            refreshBtn.setDisabled(!connected || !hasSDCard);
            delBtn.setDisabled(!(connected && checkedSize > 0 && hasSDCard));
            expBtn.setDisabled(!(connected && checkedSize > 0 && hasSDCard));
            checkboxDelegate.setChecked((totalSize == checkedSize) && (totalSize > 0));
        },

        _initPage : function () {
            contentWrapper = $('<div/>').addClass('w-video-content-wrapper');
            videoContent.render(contentWrapper);
            this.addLeftContent(contentWrapper);

            progressBar = new W.ui.ProgressMonitor ();
            progressWin = new W.ui.Progress ();
            W.video.progressBar = progressBar;
            W.video.progressWin = progressWin;
            this.addPageContent(loadingView);
            this._initToolbar();
        },

        refreshVideosData : function (videoThreadDataList) {
            var threadData;
            var threadName;
            videoContent.empty();
            W.video.videoRequestList.reset();
            for (var i in videoThreadDataList) {
                threadData = videoThreadDataList[i];
                threadName = locale[i.toUpperCase() + '_THREAD_NAME'];
                var videoThread = new W.video.VideoThread (threadData, threadName);

                videoThread.bind(W.video.VideoItem.Events.SELECT, function (id) {
                    checkboxDelegate.add(id);
                });

                videoThread.bind(W.video.VideoItem.Events.UNSELECT, function (id) {
                    checkboxDelegate.remove(id);
                });

                videoContent.addThread(videoThread);
            }

            W.video.videoRequestList.sendRequest(0, maxRequestOnePage);

        },

        refresh : function () {
            window.Music.PIMCollection.getInstance().get(6).set({
                count : videoCollection.getVideoItemList().length
            });

            if (Device.get('hasSDCard')) {
                var self = this;
                var videoThreadDataList = {};
                checkboxDelegate.reset();
                videoContent.empty();

                loadingProcess.start();
                videoCollection.getVideoThreadList(function (response) {
                    window.Music.PIMCollection.getInstance().get(6).set({
                        count : videoCollection.getVideoItemList().length
                    });

                    if (response.state_code !== 202 || !Device.get('isConnected') || !Device.get('hasSDCard')) {
                        loadingProcess.finish();
                    }

                    if (response.body && response.body) {
                        videoThreadDataList = response.body;
                    }

                    var enumberable = false;
                    for (var i in videoThreadDataList) {
                        enumberable = true;
                    }
                    if (!enumberable && response.state_code !== 202) {
                        videoContent.showTip(locale.NO_VIDEOS_TEXT);
                        checkboxDelegate.setDisabled(true);
                    } else {
                        self.refreshVideosData(videoThreadDataList);
                        checkboxDelegate.setDisabled(false);
                    }

                    if (response.state_code !== 202) {
                    }
                });
            } else {
                videoContent.showTip(i18n.misc.NO_SD_CARD_TIP_TEXT);
                loadingView.hide();
            }
        },

        render : function (opt_parent) {
            var self = this;
            var preScrollTop = 0;
            var enableShowThreadTitle = [];

            VideoPage._super_.render.call(this, opt_parent);

            this.addClassName('w-video');
            this._initPage();
            // videoAddor.bind('successed', this.refresh, this);

            videoCollection.bind(VideoCollection.Events.UPDATE, this.refresh, this);
            videoCollection.bind(VideoCollection.Events.SYNC_FAILED, function () {
                this.refreshVideosData(videoCollection.getCacheList());
                loadingProcess.finish();
            }, this);
            videoCollection.bind(VideoCollection.Events.REMOVE, function (data) {
                checkboxDelegate.remove(data.id);
            });

            setTimeout(this.refresh.bind(this), 0);
            contentWrapper.bind('scroll', function (e) {
                var scrollTop = e.target.scrollTop;
                var scrollHeight = e.target.scrollHeight;
                var from = parseInt(scrollTop / 170);
                var requestList = null;

                W.delay(this, function () {
                    W.video.videoRequestList.sendRequest(from, maxRequestOnePage + from * 7);
                }, 100);

                enableShowThreadTitle = [];
                allThreadTitles = videoContent.getThreadTitle();

                setPosition2ThreadTimer = setTimeout(function () {
                    if (scrollTop > preScrollTop) {
                        _.each(allThreadTitles, function (item) {
                            var threadTitle = $(item), offset = threadTitle.offset();
                            if (offset.top <= 50) {
                                enableShowThreadTitle.push(threadTitle);
                            }
                        });
                        videoContent.setPosition2Thread(enableShowThreadTitle.pop(), setPosition2ThreadTimer);
                    } else {
                        _.each(allThreadTitles, function (item) {
                            var threadTitle = $(item), thread = threadTitle.parent('.w-video-thread'), offset = thread.offset();
                            if (thread.height() + offset.top > 20) {
                                enableShowThreadTitle.push(threadTitle);
                            }
                        });
                        videoContent.setPosition2Thread(enableShowThreadTitle.shift(), setPosition2ThreadTimer);
                    }

                    preScrollTop = scrollTop;
                }, 25);
            });
        }
    });

    videoPage = new VideoPage (W.PageManager.PageNames.VIDEO_PAGE, {
        top : true,
        rightWidth : 0
    });
    W.PM.addPage(videoPage);
    W.video.videoPage = videoPage;
});
wonder.useModule('video');
