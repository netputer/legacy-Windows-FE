/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'ui/TemplateFactory'
    ], function (
        Backbone,
        doT,
        $,
        TemplateFactory
    ) {
        console.log('ClipImage - File loaded.');

        var ClipImage = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('ui', 'clip-image')),
            className : 'w-ui-clip-image',
            initialize : function () {
                ClipImage.__super__.initialize.apply(this, arguments);

                var path = '';
                var container;

                var imageDefaultWidth = 0;
                var imageDefaultHeight = 0;
                var imageMiniWidth = 200;
                var imageMiniHeight = 200;
                var imageResizable = false;
                var imageKeepSquare = false;
                var imageOrientation = 0;
                var boxDefaultWidth = 100;
                var boxDefaultHeight = 100;
                var boxMiniWidth = 40;
                var boxMiniHeight = 40;
                var boxMaxWidth = 40;
                var boxMaxHeight = 40;
                var boxResizable = true;
                var boxKeepSquare = true;

                var extralTop = 0;
                var extralLeft = 0;

                var constHeightData;
                var constWidthData;
                var constBorderData;

                Object.defineProperties(this, {
                    path : {
                        get : function () {
                            return path;
                        },
                        set : function (value) {
                            path = value;
                        }
                    },
                    container : {
                        get : function () {
                            return container;
                        },
                        set : function (value) {
                            container = value;
                        }
                    },
                    imageDefaultWidth : {
                        get : function () {
                            return imageDefaultWidth;
                        },
                        set : function (value) {
                            imageDefaultWidth = value;
                            this.boxMaxWidth = value;
                        }
                    },
                    imageDefaultHeight : {
                        get : function () {
                            return imageDefaultHeight;
                        },
                        set : function (value) {
                            imageDefaultHeight = value;
                            this.boxMaxHeight = value;
                        }
                    },
                    imageMiniWidth : {
                        get : function () {
                            return imageMiniWidth;
                        },
                        set : function (value) {
                            imageMiniWidth = value;
                        }
                    },
                    imageMiniHeight : {
                        get : function () {
                            return imageMiniHeight;
                        },
                        set : function (value) {
                            imageMiniHeight = value;
                        }
                    },
                    imageResizable : {
                        get : function () {
                            return imageResizable;
                        },
                        set : function (value) {
                            imageResizable = value;
                        }
                    },
                    imageKeepSquare : {
                        get : function () {
                            return imageKeepSquare;
                        },
                        set : function (value) {
                            imageKeepSquare = value;
                        }
                    },
                    imageOrientation : {
                        get : function () {
                            return imageOrientation;
                        },
                        set : function (value) {
                            imageOrientation = value;
                        }
                    },
                    boxDefaultWidth : {
                        get : function () {
                            return boxDefaultWidth;
                        },
                        set : function (value) {
                            boxDefaultWidth = value;
                        }
                    },
                    boxDefaultHeight : {
                        get : function () {
                            return boxDefaultHeight;
                        },
                        set : function (value) {
                            boxDefaultHeight = value;
                        }
                    },
                    boxMiniWidth : {
                        get : function () {
                            return boxMiniWidth;
                        },
                        set : function (value) {
                            boxMiniWidth = value;
                        }
                    },
                    boxMiniHeight : {
                        get : function () {
                            return boxMiniHeight;
                        },
                        set : function (value) {
                            boxMiniHeight = value;
                        }
                    },
                    boxMaxWidth : {
                        get : function () {
                            return boxMaxWidth;
                        },
                        set : function (value) {
                            boxMaxWidth = value;
                        }
                    },
                    boxMaxHeight : {
                        get : function () {
                            return boxMaxHeight;
                        },
                        set : function (value) {
                            boxMaxHeight = value;
                        }
                    },
                    boxResizable : {
                        get : function () {
                            return boxResizable;
                        },
                        set : function (value) {
                            boxResizable = value;
                        }
                    },
                    boxKeepSquare : {
                        get : function () {
                            return boxKeepSquare;
                        },
                        set : function (value) {
                            boxKeepSquare = value;
                        }
                    },
                    extralTop : {
                        get : function () {
                            return extralTop;
                        },
                        set : function (value) {
                            extralTop = value;
                        }
                    },
                    extralLeft : {
                        get : function () {
                            return extralLeft;
                        },
                        set : function (value) {
                            extralLeft = value;
                        }
                    },
                    constHeightData : {
                        get : function () {
                            return constHeightData;
                        },
                        set : function (value) {
                            constHeightData = value;
                        }
                    },
                    constWidthData : {
                        get : function () {
                            return constWidthData;
                        },
                        set : function (value) {
                            constWidthData = value;
                        }
                    },
                    constBorderData : {
                        get : function () {
                            return constBorderData;
                        },
                        set : function (value) {
                            constBorderData = value;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            render : function () {

                this.$el.html(this.template({}));

                this.originImg = this.$('.origin-image');
                this.clipBox = this.$('.cliping-box');
                this.clipImg = this.$('.clip-box-image');

                this.loadImage();

                return this;
            },
            loadImage : function () {
                var source = this.path + '?data=' + new Date().getTime();
                var img = new Image();

                img.onload = function () {

                    this.imageDefaultWidth = Math.min(img.width, this.$el.width());
                    this.imageDefaultHeight = Math.min(img.height, this.$el.height());

                    this.originImg.attr('src', source);
                    this.clipBox.css({
                        width : this.boxDefaultWidth,
                        height : this.boxDefaultHeight
                    });

                    this.clipImg.attr('src', source);

                    this.setImage(source);

                    if (this.imageResizable) {
                        this.createResizeEl(this.$el);
                    }

                    if (this.boxResizable) {
                        this.createResizeEl(this.clipBox);
                    }

                    this.bindAction();

                }.bind(this);

                img.src = source;
            },
            bindAction : function () {
                var old_bottom;
                var old_right;
                var old_top;
                var old_left;
                var old_margin_top;
                var old_margin_left;
                var old_width;
                var old_height;
                var eClientX_old;
                var eClientY_old;
                var mouseMoveFlag = false;
                var clipingBoxResizeFlag = false;
                var imageReizeFlag  = false;
                var w = this.clipBox.width();
                var h = this.clipBox.height();
                var containerWidth  = this.$el.width();
                var containerHeight = this.$el.height();
                var resizeDirection = null;

                if (this.constHeightData === null || this.constWidthData === null) {
                    var pT = parseInt(this.$el.css('padding-top'), 10);
                    var PL = parseInt(this.$el.css('padding-left'), 10);

                    var clipingBoxBorderTop = parseInt(this.clipBox.css('border-top-width'), 10);
                    var clipingBoxBorderLeft = parseInt(this.clipBox.css('border-left-width'), 10);
                    var clipingBoxBorderBottom = parseInt(this.clipBox.css('border-bottom-width'), 10);
                    var clipingBoxBorderRight = parseInt(this.clipBox.css('border-right-width'), 10);

                    this.constBorderData = clipingBoxBorderTop + clipingBoxBorderBottom;
                    this.constHeightData =  pT + this.constBorderData;
                    this.constWidthData = PL + this.constBorderData;
                }

                var calculateOldPosition = function () {
                    old_width = parseInt(this.clipBox.width(), 10);
                    old_height = parseInt(this.clipBox.height(), 10);

                    old_top  = this.clipBox.position().top;
                    old_left = this.clipBox.position().left;
                    old_bottom = containerHeight - old_top - old_height;
                    old_right = containerWidth - old_left - old_width;

                    old_margin_top = parseInt(this.clipImg.css('margin-top'), 10);
                    old_margin_left = parseInt(this.clipImg.css('margin-left'), 10);

                }.bind(this);

                var calculateResizeData = function (tmpHeight, tmpWidth, oldData1, oldData2) {
                    var imgNowWidth = this.originImg.width();
                    var imgNowHeight = this.originImg.height();
                    var extralL;
                    var extralT;

                    switch (this.imageOrientation) {
                    case 0:
                    case 180:
                        extralL = this.extralLeft;
                        extralT = this.extralTop;
                        break;
                    case 90:
                    case 270:
                        extralL = (containerWidth - imgNowHeight) / 2;
                        extralT = (containerHeight - imgNowWidth) / 2;
                        break;
                    }

                    var tmpMaxWidth = containerWidth - oldData1 - extralL;
                    var tmpMaxHeight = containerHeight - oldData2 - extralT;

                    var maxWidth = Math.min(this.boxMaxWidth, tmpMaxWidth);
                    var maxHeight = Math.min(this.boxMaxHeight, tmpMaxHeight);
                    var widthVal = tmpWidth < this.boxMiniWidth ? this.boxMiniWidth : Math.min(maxWidth, tmpWidth);
                    var heightVal = tmpHeight < this.boxMiniHeight ? this.boxMiniHeight : Math.min(maxHeight, tmpHeight);

                    if (this.boxKeepSquare) {
                        widthVal = heightVal = Math.min(widthVal, heightVal);
                    }

                    return {
                        width   : widthVal,
                        height  : heightVal,
                        extralL : extralL,
                        extralT : extralT
                    };
                }.bind(this);

                this.$el.bind('mousedown', function (e) {
                    var target = $(e.target);

                    if (target.hasClass('clip-box-surface')) {
                        mouseMoveFlag = true;
                    }

                    if (target.hasClass('clip-resize-el') || target.parent().hasClass('clip-resize-el')) {
                        if (!!target.parent('cliping-box')) {
                            clipingBoxResizeFlag = true;

                            if (target.hasClass('clip-resize-tl') || target.parent().hasClass('clip-resize-tl')) {
                                resizeDirection = 'TL';
                            } else if (target.hasClass('clip-resize-tr') || target.parent().hasClass('clip-resize-tr')) {
                                resizeDirection = 'TR';
                            } else if (target.hasClass('clip-resize-bl') || target.parent().hasClass('clip-resize-bl')) {
                                resizeDirection = 'BL';
                            } else if (target.hasClass('clip-resize-br') || target.parent().hasClass('clip-resize-br')) {
                                resizeDirection = 'BR';
                            }
                            calculateOldPosition();
                        } else if (!!target.parent('w-ui-clip-image')) {
                            imageReizeFlag = true;
                        }
                    }

                    eClientX_old = e.clientX;
                    eClientY_old = e.clientY;

                }.bind(this));

                this.$el.bind('mousemove', function (e) {
                    var target = $(e.target);
                    var eClientX = e.clientX;
                    var eClientY = e.clientY;
                    var clientXDiff = eClientX_old - eClientX;
                    var clientYDiff = eClientY_old - eClientY;

                    if (mouseMoveFlag) {
                        var boundaryH, boundaryW;

                        switch (this.imageOrientation) {
                        case 0:
                        case 180:
                            boundaryH = this.originImg.height();
                            boundaryW = this.originImg.width();
                            extralT = this.extralTop;
                            extralL = this.extralLeft;
                            break;
                        case 90:
                        case 270:
                            var containerH = this.$el.height();
                            var containerW = this.$el.width();
                            boundaryH = Math.min(this.originImg.width(), containerH);
                            boundaryW = Math.min(this.originImg.height(), containerW);

                            if (containerH - boundaryH > 0) {
                                extralT = (containerH - boundaryH) / 2;
                            } else {
                                extralT = 0;
                            }

                            if (containerW - boundaryW > 0) {
                                extralL = (containerW - boundaryW) / 2;
                            } else {
                                extralL = 0;
                            }
                            break;
                        }

                        var topNow = this.clipBox.position().top;
                        var leftNow = this.clipBox.position().left;
                        var overBoundaryY = boundaryH - this.clipBox.height() + extralT;
                        var overBoundaryX = boundaryW - this.clipBox.width() + extralL;
                        var tmpTop = topNow - clientYDiff;
                        var tmpLeft = leftNow - clientXDiff;
                        var topVal = tmpTop  <= extralT ? extralT : (tmpTop >= overBoundaryY ? overBoundaryY : tmpTop);
                        var leftVal = tmpLeft <= extralL ? extralL : (tmpLeft >= overBoundaryX ? overBoundaryX : tmpLeft);

                        this.clipBox.css({
                            'top' : topVal,
                            'left': leftVal
                        });

                        this.clipImg.css({
                            'margin-top': (this.extralTop - topVal) + 'px',
                            'margin-left': (this.extralLeft - leftVal) + 'px'
                        });

                        eClientY_old = eClientY;
                        eClientX_old = eClientX;

                    } else if (clipingBoxResizeFlag) {

                        var w = this.clipBox.width();
                        var h = this.clipBox.height();
                        var top = this.clipBox.position().top;
                        var left = this.clipBox.position().left;
                        var imgNowWidth = this.originImg.width();
                        var imgNowHeight = this.originImg.height();
                        var tmpWidth = w - clientXDiff;
                        var tmpHeight = h - clientYDiff;
                        var constData = this.constHeightData;
                        var marginTop;
                        var marginLeft;
                        var data;

                        switch (resizeDirection) {
                        case 'TL':
                            clientYDiff = eClientY - eClientY_old;
                            clientXDiff = eClientX_old - eClientX;
                            tmpHeight = h - clientYDiff;
                            tmpWidth = w + clientXDiff;

                            data = calculateResizeData(tmpHeight, tmpWidth, old_right, old_bottom);

                            if (imgNowWidth >= containerHeight) {
                                constData = this.constBorderData;
                            }

                            switch (this.imageOrientation) {
                            case 0:
                            case 180:
                                marginTop = '-' + (containerHeight - old_bottom - data.height - data.extralT);
                                marginLeft = '-' + (containerWidth - old_right - data.width - data.extralL);
                                break;
                            case 90:
                            case 270:
                                if (imgNowWidth > containerHeight) {
                                    constData = this.constBorderData;
                                } else if (imgNowWidth === containerHeight) {
                                    constData = 0;
                                }
                                marginTop = old_margin_top + data.height - old_height + constData;
                                marginLeft = old_margin_left + data.width - old_width + constData;
                                break;
                            }

                            this.clipBox.css({
                                width  : data.width,
                                height : data.height,
                                bottom : old_bottom + this.constHeightData,
                                right  : old_right + this.constWidthData,
                                left   : '',
                                top    : ''
                            });

                            this.clipImg.css({
                                'margin-left' : marginLeft + 'px',
                                'margin-top' :  marginTop + 'px'
                            });
                            break;
                        case 'TR':
                            clientYDiff = eClientY - eClientY_old;
                            tmpHeight = h - clientYDiff;

                            data = calculateResizeData(tmpHeight, tmpWidth, left, old_bottom);

                            switch (this.imageOrientation) {
                            case 0:
                            case 180:
                                marginTop = '-' + (containerHeight - old_bottom - data.height - data.extralT);
                                break;
                            case 90:
                            case 270:
                                marginTop = old_margin_top + data.height - old_height + this.constBorderData;
                                break;
                            }

                            this.clipBox.css({
                                width  : data.width,
                                height : data.height,
                                bottom : old_bottom + constData,
                                left   : old_left,
                                top    : '',
                                right  : ''
                            });

                            this.clipImg.css({
                                'margin-top' :  marginTop + 'px'
                            });
                            break;
                        case 'BL':
                            clientXDiff = eClientX_old - eClientX;
                            tmpWidth = w + clientXDiff;

                            data = calculateResizeData(tmpHeight, tmpWidth, old_right, top);

                            switch (this.imageOrientation) {
                            case 0:
                            case 180:
                                marginLeft = '-' + (containerWidth - old_right - data.width - data.extralL);
                                break;
                            case 90:
                            case 270:
                                if (imgNowWidth >= containerHeight) {
                                    constData = this.constBorderData;
                                }
                                marginLeft = old_margin_left + data.width - old_width + constData;
                                break;
                            }

                            this.clipBox.css({
                                width : data.width,
                                height: data.height,
                                right : old_right + constData,
                                top   : old_top,
                                bottom: '',
                                left  : ''
                            });

                            this.clipBox.css({
                                'margin-left' : marginLeft + 'px'
                            });
                            break;
                        case 'BR':
                            data = calculateResizeData(tmpHeight, tmpWidth, left, top);

                            this.clipBox.css({
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
                    } else if (imageReizeFlag) {
                        //TO DO
                    }
                }.bind(this));

                $(document).on('mouseup', function (e) {
                    mouseMoveFlag = false;
                    clipingBoxResizeFlag = false;
                    imageReizeFlag = false;
                });
            },
            createResizeEl : function (container) {

                var els = ['tl', 'tr', 'bl', 'br'];
                $.each(els, function (name) {

                    container.append(
                        $('<div/>').addClass('clip-resize-el clip-resize-' + name).append('<span>')
                    );

                }.bind(this));
            },
            setImage : function (source) {

                this.originImg.css({
                    'max-width' : this.imageDefaultWidth,
                    'max-height': this.imageDefaultHeight
                });

                setTimeout(function () {

                    this.extralTop = this.originImg[0].offsetTop;
                    this.extralLeft = this.originImg[0].offsetLeft;

                    this.rotate(this.originImg, this.imageOrientation);

                    var w = (this.$el.width() - this.boxDefaultWidth) / 2;
                    var h = (this.$el.height() - this.boxDefaultHeight) / 2;
                    var clipBoxW = w - this.extralLeft;
                    var clipBoxH = h - this.extralTop;

                    this.clipBox.css({
                        width : this.boxDefaultWidth,
                        height: this.boxDefaultHeight,
                        top : h,
                        left: w
                    });

                    this.clipImg.attr('src', source);
                    this.clipImg.css({
                        'max-width' : this.imageDefaultWidth,
                        'max-height': this.imageDefaultHeight,
                        'margin-top': '-' + clipBoxH + 'px',
                        'margin-left': '-' + clipBoxW + 'px'
                    });

                    this.rotate(this.clipImg, this.imageOrientation);

                }.bind(this), 0);
            },
            rotate : function (el, orientation) {
                var rotate = {
                    R90: 'rotate-90',
                    R180: 'rotate-180',
                    R270: 'rotate-270'
                };

                for (var i in rotate) {
                    el.removeClass(rotate[i]);
                }

                switch (orientation) {
                    case 0 :
                        break;
                    case 90:
                        el.addClass(rotate.R90);
                    break;
                    case 180:
                        el.addClass(rotate.R180);
                    break;
                    case 270:
                        el.addClass(rotate.R270);
                    break;
                }
            },
            remove: function () {
                this.$el.remove();
                this.stopListening();
            },
            clip : function () {

                var originWidth = this.originImg[0].naturalWidth;
                var originHeight = this.originImg[0].naturalHeight;
                var nowWidth = this.originImg.width();
                var nowHeight = this.originImg.height();
                var containerW = this.$el.width();
                var containerH = this.$el.height();
                var clipBoxLeft = this.clipBox.position().left;
                var clipBoxTop = this.clipBox.position().top;
                var rateWidth = 1;
                var rateHeight = 1;
                var top, left;

                if (originWidth > nowWidth) {
                    rateWidth = originWidth / nowWidth;
                }

                if (originHeight > nowHeight) {
                    rateHeight = originHeight / nowHeight;
                }

                switch (this.imageOrientation) {
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
                    img : this.clipBox[0],
                    top : top * rateHeight,
                    left: left * rateWidth,
                    width: this.clipBox.width() * rateWidth,
                    height:this.clipBox.height() * rateHeight
                };
            }
        });

        return ClipImage;
    });

}(this));
