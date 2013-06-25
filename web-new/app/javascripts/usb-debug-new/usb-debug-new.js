var titleView;
var selectView;
var feedbackView;
var sliderView;

$(document).ready(function () {

    (function(){

        var TitleView = function (){};
        TitleView.prototype = {
            className: 'usb-debug-title-view',
            template: $('#titleView').html(),
            $el: null,
            render: function (container){
                var me = this;
                me.$el= $('<div>').addClass(me.className);
                me.$el.html(_.template(me.template, {}));
                container.append(me.$el);

                $('.feedback').click(function(){
                    me.clickFeedBack();
                });

            },
            clickFeedBack: function(){
                var feed = $('.feedback');
                if(!feed.hasClass('active')){
                    feed.addClass('active');
                    $.event.trigger('FEEDBACK');
                }
            },
            reset: function () {
                var feed = $('.feedback');
                feed.removeClass('active');
            }
        };

        titleView = new TitleView();
    }(this));

    (function(){
        var data = {
            brands: [
                {name: '三星手机', className: 'samsung'},
                {name: '小米手机', className: 'miui'},
                {name: '索尼手机', className: 'sony'},
                {name: ' HTC 手机', className: 'htc'},
                {name: '华为手机', className: 'huawei'},
                {name: '联想手机', className: 'lenovo'},
                {name: '中兴手机', className: 'zte'},
                {name: 'MOTO 手机', className: 'moto'}
            ],
            systems: [
                {name: 'Android 1.6 - 3.2', className: 'gingerbread'},
                {name: 'Android 4.0 - 4.1', className: 'ics'},
                {name: 'Android 4.2', className: 'jeallybean'},
                {name: 'MIUI V5', className: 'miuios'},
                {name: 'Flyme', className: 'meizu'},
            ]
        };

        var SelectView = function(){};
        SelectView.prototype = {
            className: 'usb-debug-select-view',
            template: $('#selectView').html(),
            $el: null,
            render: function (container) {
                var me = this;
                me.$el = $('<div>').addClass(me.className);
                me.$el.html(_.template(me.template, data));
                container.append(me.$el);

                me.$el.find('li').click(function(evt){
                    me.clickSelect(evt);
                });
            },
            clickSelect: function (evt) {
                var tmp = /(\w+)\s(\w+)/.exec(evt.currentTarget.className);
                var type = tmp[1];
                var version = tmp[2];
                $.event.trigger('SELECT', [type, version]);
            }
        };

        selectView = new SelectView();
    }(this));

    (function(){
        var FeedbackView = function(){};
        FeedbackView.prototype = {
            className: 'usb-debug-feedback-view',
            template: $('#feedBackView').html(),
            $el: null,
            render: function (container) {

                var me = this;
                me.$el = $('<div>').addClass(me.className);
                me.$el.html(_.template(me.template, {}));
                container.append(me.$el);

                me.$el.find('.return').click(function(){
                    me.clickReturn();
                });

                var tip = me.$el.find('.send-message p');
                var numInput = me.$el.find('.send-message input');

                var btn = me.$el.find('.send-message button').click(function(){
                    var num = $.trim(numInput.val())

                    if (num){
                        if(/1\d{10}/.test(num)) {
                            tip.css('visibility', 'hidden');
                        } else {
                            tip.css('visibility', 'visible');
                            return;
                        }
                    } else {
                        btn.prop('disabled', true);
                        tip.css('visibility', 'hidden');
                        return;
                    } 

                    $.ajax("http://www.wandoujia.com/sms", {
                        data:{
                            'type': 'USB_SETUP',
                            'action': 'send',
                            'phone': num

                        }
                    });

                    btn.prop('disabled', true);

                    var index = 60;
                    btn.html('重新发送(' + index-- +')');
                    var handler = setInterval(function(){
                        if(index < 0){
                            clearInterval(handler);
                            btn.html('重新发送').prop('disabled', false);
                            return;
                        }
                        btn.html('重新发送(' + index-- + ')');
                    }, 1000);
                            
                });

                
            },
            clickReturn: function () {
                $.event.trigger('RETURN');
            },
        };

        feedbackView = new FeedbackView();
    }(this));

    (function(){

        var SilderView = function(){};
        SilderView.prototype = {
            className: 'usb-debug-slider-view',
            template: $('#sliderView').html(),
            $el: null,
            render:function(container){
                var me = this;
                me.$el = $('<div>').addClass(me.className);
                me.$el.html(_.template(me.template, {}));
                container.append(me.$el);

                me.arrow = this.$el.find('.pointer');
                me.leftButton = this.$el.find('.left');
                me.rightButton = this.$el.find('.right');
                me.number = this.$el.find('.number');
                me.describe = this.$el.find('.steps-describe');
                me.page = this.$el.find('.page')

                me.$el.find('.more').click(function(){
                    $.event.trigger('MORE');
                });

                me.$el.find('.left').click(function(){
                    if (me.currentIndex > 0){
                        me.moveLeft();
                        me.resetBtn();
                    }
                });

                me.$el.find('.right').click(function(){
                    if (me.currentIndex < me.devInfo.steps.length -1 ){
                        me.moveRight();
                        me.resetBtn();
                    }
                });
            },
            currentIndex: 0,
            devInfo: {},
            totleIndex: 0,
            lis: [],
            start: function(type, version){
                var me = this;
                var data = brandInfo;
                if(type === 'system'){
                    data = systemInfo;
                }

                me.devInfo = data[version];
                me.$el.find('.describe').html(me.devInfo.name);

                var len = me.devInfo.steps.length;
                var ul = $('<ul>').addClass('warp');
                var str = '', i = 0;

                me.totleIndex = 10 * len;
                for (i; i<len; i++) {
                    var t = i+1;
                    str += "<li class='course-li'><img data-des='" +  me.devInfo.steps[i].des + "' src='images/usb-debug-new/course/" + version + "/" + t + ".png'></li>";
                }
                ul.html(str);
                if (me.warp) {
                    me.warp.remove();
                }
                me.$el.find('.ul-container').append(ul);
                me.warp = ul;
                me.lis = ul.find('li');
                me.initCss();
            },
            setNav: function (index){
                this.number.html(index + 1);
                this.describe.html(this.devInfo.steps[index].des);
                var p = index + 1 + '/' + this.devInfo.steps.length;
                this.page.html('(' + p + ')');
            },
            resetBtn: function(){
                if(this.currentIndex === 0){
                    this.leftButton.attr('disabled', true);
                }else{
                    this.leftButton.removeAttr('disabled');
                }

                if(this.currentIndex === this.devInfo.steps.length -1){
                    this.rightButton.attr('disabled', true);
                }else{
                    this.rightButton.removeAttr('disabled');
                }
            },
            initCss: function(){
                var me = this;
                var t = me.totleIndex;

                me.lis.addClass('init white');
                $.each(me.lis, function(index, li){
                    t -= 1;
                    var tmp = t
                    $(li).css('zIndex', t).attr('zindex', t);
                });

                me.currentIndex = 0;
                me.$el.find('.left').attr('disabled', true);
                me.$el.find('.right').attr('disabled', false);

                $(me.lis[0]).removeClass('white').addClass('go-current');
                me.showArrow(me.currentIndex)
                me.setNav(0);
            },
            hideArrow: function() {
                this.arrow.hide().stop();
            },
            showArrow: function(index) {
                var pos = this.devInfo.steps[index].pos;

                var top = parseInt(pos.top);
                if ('-webkit-transform' in pos){
                    top = top - 15 + 'px';
                    this.arrow.show().css(pos).fadeIn(1000);
                } else {
                    top = top + 15 + 'px';
                    pos['-webkit-transform'] = 'none';
                    this.arrow.show().css(pos).fadeIn(1000);
                    delete pos['-webkit-transform'];
                }
                this.arrow.animate({'top': top}, 'slow');
            },
            moveRight: function (){

                var me = this;
                me.hideArrow();
                for(var i=0; i <= me.currentIndex; i++){
                    var li = $(me.lis[i]);
                    var zIndex = parseInt(li.attr('zindex'));
                    zIndex -= 2;
                    li.css('zIndex', zIndex).attr('zindex', zIndex);
                }

                $(me.lis[this.currentIndex]).addClass('go-before');

                me.currentIndex++;

                $(me.lis[me.currentIndex]).one('webkitTransitionEnd', function(){
                    me.showArrow(me.currentIndex);
                }).addClass('go-current');

                me.setNav(me.currentIndex);
            },
            moveLeft : function () {

                var me = this;
                me.hideArrow();
                for(var i=0; i < me.currentIndex; i++){
                    var li = $(me.lis[i]);
                    var zIndex = parseInt(li.attr('zindex'));
                    zIndex += 2;
                    li.css('zIndex', zIndex).attr('zindex', zIndex);
                }

                $(me.lis[me.currentIndex]).removeClass('go-current');

                me.currentIndex--;

                $(me.lis[this.currentIndex]).one('webkitTransitionEnd', function(){
                    me.showArrow(me.currentIndex);
                }).removeClass('go-before');

                me.setNav(me.currentIndex);
            }
        };

        sliderView = new SilderView();
    }(this));
});

var getUrlParam = function (name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return unescape(r[2]); return null;
}

var VIDMap = {
    '04E8': 'samsung',
    '054C': 'sony',
    '2717': 'miui',
    '0BB4': 'htc',
    '12D1': 'huawei',
    '17EF': 'lenovo',
    '19D2': 'zte',
    '22B8': 'moto'
},
device_id = getUrlParam('device_id'),
tmp = /VID_(\w{4})/.exec(device_id),
version = null;

if(tmp){
    var vid = tmp[1];
    if(vid in VIDMap){
        version = VIDMap[vid];
    }
}

$(document).ready(function(){
    var container = $('.container');
    var currentView;
    var lastView;

    $('.w-ui-loading').hide();
    titleView.render(container);

    if (version){
        
        sliderView.render(container);
        currentView = sliderView;
        currentView.$el.show();
        currentView.start('brands', version);

    } else {
        
        selectView.render(container);
        currentView = selectView;
        currentView.$el.show();
    }
    
    feedbackView.render(container);

    $('.check-usb-debug').click(function(){
        window.externalCall('', 'connection.detect_device', window.location.search);
    });

    $(document).bind('FEEDBACK', function(){
        currentView.$el.hide();
        lastView = currentView;
        currentView = feedbackView;
        feedbackView.$el.show();
    });

    $(document).bind('RETURN', function(){
        currentView.$el.hide();
        lastView.$el.show();
        currentView = lastView;
        lastView = feedbackView;
        titleView.reset();
    });

    $(document).bind('SELECT', function(evt, type, version){
        currentView.$el.hide();
        lastView = selectView;
        currentView = sliderView;

        if(!sliderView.$el){
            sliderView.render(container);
        }
        sliderView.$el.show();
        currentView.start(type, version);
    });

    $(document).bind('MORE', function(){
        currentView.$el.hide();
        lastView = selectView;
        currentView = selectView;

        if(!selectView.$el){
            selectView.render(container);
        }
        selectView.$el.show();
    });
});
