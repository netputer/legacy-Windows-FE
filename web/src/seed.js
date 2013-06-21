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
