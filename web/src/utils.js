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
        }
    });
    W.String = string;


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
