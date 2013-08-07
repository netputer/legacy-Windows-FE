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
                var imageDefaultWidth = 0;
                var imageDefaultHeight = 0;
                var imageMiniWidth = 200;
                var imageMiniHeight = 200;
                //var imageResizable = false;
                //var imageKeepSquare = false;
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
                var constHeightData = null;
                var constWidthData = null;
                var constBorderData;
                var mouseMoveFlag = false;
                var clipingBoxResizeFlag = false;
                //var imageReizeFlag = false;

                var oldPosition = {};

                Object.defineProperties(this, {
                    path : {
                        get : function () {
                            return path;
                        },
                        set : function (value) {
                            path = value;
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
                    /*imageResizable : {
                        get : function () {
                            return imageResizable;
                        },
                        set : function (value) {
                            imageResizable = value;
                        }
                    },*/
                    /*imageKeepSquare : {
                        get : function () {
                            return imageKeepSquare;
                        },
                        set : function (value) {
                            imageKeepSquare = value;
                        }
                    },*/
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
                    },
                    mouseMoveFlag : {
                        get : function () {
                            return mouseMoveFlag;
                        },
                        set : function (value) {
                            mouseMoveFlag = value;
                        }
                    },
                    clipingBoxResizeFlag : {
                        get : function () {
                            return clipingBoxResizeFlag;
                        },
                        set : function (value) {
                            clipingBoxResizeFlag = value;
                        }
                    },
                    /*imageReizeFlag : {
                        get : function () {
                            return imageReizeFlag;
                        },
                        set : function (value) {
                            imageReizeFlag = value;
                        }
                    },*/
                    oldPosition : {
                        get : function () {
                            return oldPosition;
                        },
                        set : function (value) {
                            oldPosition = value;
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

                var mouseUpHandle = function (e) {
                    this.mouseMoveFlag = false;
                    this.clipingBoxResizeFlag = false;
                    //this.imageReizeFlag = false;
                }.bind(this);

                $(window.document).on('mouseup', mouseUpHandle);

                this.on('remove', function () {
                    $(window.document).off('mouseup', mouseUpHandle);
                });
            },
            render : function () {

                this.$el.html(this.template({}));

                this.$originImg = this.$('.origin-image');
                this.$clipBox = this.$('.cliping-box');
                this.$clipImg = this.$('.clip-box-image');

                this.loadImage();

                return this;
            },
            loadImage : function () {
                var source = this.path + '?data=' + new Date().getTime();
                var img = new window.Image();

                img.onload = function () {

                    this.imageDefaultWidth = Math.min(img.width, this.$el.width());
                    this.imageDefaultHeight = Math.min(img.height, this.$el.height());

                    this.$originImg.attr('src', source);
                    this.$clipBox.css({
                        'width' : this.boxDefaultWidth,
                        'height' : this.boxDefaultHeight
                    });

                    this.$clipImg.attr('src', source);

                    this.setImage(source);

                    /*if (this.imageResizable) {
                        this.createResizeEl(this.$el);
                    }*/

                    if (this.boxResizable) {
                        this.createResizeEl(this.$clipBox);
                    }

                    if (this.constHeightData === null || this.constWidthData === null) {
                        var pT = parseInt(this.$el.css('padding-top'), 10);
                        var pL = parseInt(this.$el.css('padding-left'), 10);

                        var clipingBoxBorderTop = parseInt(this.$clipBox.css('border-top-width'), 10);
                        //var clipingBoxBorderLeft = parseInt(this.$clipBox.css('border-left-width'), 10);
                        var clipingBoxBorderBottom = parseInt(this.$clipBox.css('border-bottom-width'), 10);
                        //var clipingBoxBorderRight = parseInt(this.$clipBox.css('border-right-width'), 10);

                        this.constBorderData = clipingBoxBorderTop + clipingBoxBorderBottom;
                        this.constHeightData =  pT + this.constBorderData;
                        this.constWidthData = pL + this.constBorderData;
                    }

                }.bind(this);

                img.src = source;
            },
            mouseDownSurface : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();

                this.mouseMoveFlag = true;

                this.oldPosition.clientX = evt.clientX;
                this.oldPosition.clientY = evt.clientY;
            },
            mouseDownResizeEl : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();

                var target = $(evt.currentTarget);

                if (!!target.parent('cliping-box')) {
                    this.clipingBoxResizeFlag = true;
                    this.calculateOldPosition();
                }
                //else if (!!target.parent('w-ui-clip-image')) {
                //    this.imageReizeFlag = true;
                //}

                this.resizeDirection = target.data('position').toUpperCase();

                this.oldPosition.clientX = evt.clientX;
                this.oldPosition.clientY = evt.clientY;
            },
            calculateOldPosition : function () {
                var width = parseInt(this.$clipBox.width(), 10),
                    height = parseInt(this.$clipBox.height(), 10),
                    top  = this.$clipBox.position().top,
                    left = this.$clipBox.position().left;

                this.oldPosition = {
                    width : width,
                    height : height,
                    top : top,
                    left : left,
                    bottom : this.$el.height() - top - height,
                    right : this.$el.width() - left - width,
                    marginTop : parseInt(this.$clipImg.css('marginTop'), 10),
                    marginLeft : parseInt(this.$clipImg.css('marginLeft'), 10)
                };
            },
            calculateResizeData : function (tmpHeight, tmpWidth, oldData1, oldData2) {
                var imgNowWidth = this.$originImg.width(),
                    imgNowHeight = this.$originImg.height(),
                    containerWidth  = this.$el.width(),
                    containerHeight = this.$el.height(),
                    extralL,
                    extralT;

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
            },
            mouseMoveClip : function (evt) {
                var clipBoxWidth = this.$clipBox.width();
                var clipBoxHeight = this.$clipBox.height();
                var containerWidth  = this.$el.width();
                var containerHeight = this.$el.height();
                var imageHeight = this.$originImg.height();
                var imageWidth = this.$originImg.width();

                var target = $(evt.target);
                var eClientX = evt.clientX;
                var eClientY = evt.clientY;
                var clientXDiff = this.oldPosition.clientX - eClientX;
                var clientYDiff = this.oldPosition.clientY - eClientY;

                if (this.mouseMoveFlag) {
                    var boundaryH, boundaryW, extralT, extralL;

                    switch (this.imageOrientation) {
                    case 0:
                    case 180:
                        boundaryH = imageHeight;
                        boundaryW = imageWidth;
                        extralT = this.extralTop;
                        extralL = this.extralLeft;
                        break;
                    case 90:
                    case 270:
                        var containerH = containerHeight;
                        var containerW = containerWidth;
                        boundaryH = Math.min(imageWidth, containerH);
                        boundaryW = Math.min(imageHeight, containerW);

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

                    var topNow = this.$clipBox.position().top;
                    var leftNow = this.$clipBox.position().left;
                    var overBoundaryY = boundaryH - this.$clipBox.height() + extralT;
                    var overBoundaryX = boundaryW - this.$clipBox.width() + extralL;
                    var tmpTop = topNow - clientYDiff;
                    var tmpLeft = leftNow - clientXDiff;
                    var topVal = tmpTop  <= extralT ? extralT : (tmpTop >= overBoundaryY ? overBoundaryY : tmpTop);
                    var leftVal = tmpLeft <= extralL ? extralL : (tmpLeft >= overBoundaryX ? overBoundaryX : tmpLeft);

                    this.$clipBox.css({
                        'top' : topVal,
                        'left': leftVal
                    });

                    this.$clipImg.css({
                        'marginTop': (this.extralTop - topVal) + 'px',
                        'marginLeft': (this.extralLeft - leftVal) + 'px'
                    });

                    this.oldPosition.clientY = eClientY;
                    this.oldPosition.clientX = eClientX;

                    return;
                }

                if (this.clipingBoxResizeFlag) {

                    var tmpWidth = clipBoxWidth - clientXDiff;
                    var tmpHeight = clipBoxHeight - clientYDiff;
                    var constData = this.constHeightData;
                    var marginTop;
                    var marginLeft;
                    var oldData1 = this.$clipBox.position().left, oldData2 = this.$clipBox.position().top;

                    var vertical = this.resizeDirection.substr(0, 1);
                    var horizontal = this.resizeDirection.substr(1, 2);

                    var top = '', bottom = '', left = '', right = '';

                    if (vertical === 'T') {
                        clientYDiff = eClientY - this.oldPosition.clientY;
                        tmpHeight = clipBoxHeight - clientYDiff;
                        oldData2 = this.oldPosition.bottom;
                    }

                    if (horizontal === 'L') {
                        clientXDiff = this.oldPosition.clientX - eClientX;
                        tmpWidth = clipBoxWidth + clientXDiff;
                        oldData1 = this.oldPosition.right;
                    }

                    var data = this.calculateResizeData(tmpHeight, tmpWidth, oldData1, oldData2);

                    switch (this.imageOrientation) {
                    case 0:
                    case 180:

                        if (vertical === 'T') {
                            marginTop = '-' + (containerHeight - this.oldPosition.bottom - data.height - data.extralT);
                        }

                        if (horizontal === 'L') {
                            marginLeft = '-' + (containerWidth - this.oldPosition.right - data.width - data.extralL);
                        }

                        break;
                    case 90:
                    case 270:

                        if (vertical === 'T') {
                            if (imageHeight >= containerWidth) {
                                constData = this.constBorderData;
                            }
                            marginTop = this.oldPosition.marginTop + data.height - this.oldPosition.height + constData;
                        }

                        if (horizontal === 'L') {
                            if (imageWidth >= containerHeight) {
                                constData = this.constBorderData;
                            }
                            marginLeft = this.oldPosition.marginLeft + data.width - this.oldPosition.width + constData;
                        }
                        break;
                    }

                    if (vertical === 'T') {
                        bottom = this.oldPosition.bottom + this.constHeightData;
                        this.$clipImg.css({
                            'marginTop' :  marginTop + 'px'
                        });
                    } else {
                        top = this.oldPosition.top;
                    }

                    if (horizontal === 'L') {
                        right = this.oldPosition.right + this.constWidthData;
                        this.$clipImg.css({
                            'marginLeft' : marginLeft + 'px'
                        });
                    } else {
                        left = this.oldPosition.left;
                    }


                    this.$clipBox.css({
                        width  : data.width,
                        height : data.height,
                        bottom : bottom,
                        right  : right,
                        left   : left,
                        top    : top
                    });

                    this.oldPosition.clientY = eClientY;
                    this.oldPosition.clientX = eClientX;

                    return;
                }

                //if (this.imageReizeFlag) {}
            },
            createResizeEl : function (container) {

                var els = ['tl', 'tr', 'bl', 'br'];
                $.map(els, function (name) {

                    container.append(
                        $('<div/>').addClass('clip-resize-el clip-resize-' + name).data('position', name).append('<span>')
                    );

                }.bind(this));
            },
            setImage : function (source) {

                this.$originImg.css({
                    'max-width' : this.imageDefaultWidth,
                    'max-height': this.imageDefaultHeight
                });

                setTimeout(function () {

                    this.extralTop = this.$originImg[0].offsetTop;
                    this.extralLeft = this.$originImg[0].offsetLeft;

                    this.rotate(this.$originImg, this.imageOrientation);

                    var w = (this.$el.width() - this.boxDefaultWidth) / 2;
                    var h = (this.$el.height() - this.boxDefaultHeight) / 2;
                    var clipBoxW = w - this.extralLeft;
                    var clipBoxH = h - this.extralTop;

                    this.$clipBox.css({
                        width : this.boxDefaultWidth,
                        height: this.boxDefaultHeight,
                        top : h,
                        left: w
                    });

                    this.$clipImg.attr('src', source);
                    this.$clipImg.css({
                        'max-width' : this.imageDefaultWidth,
                        'max-height': this.imageDefaultHeight,
                        'margin-top': '-' + clipBoxH + 'px',
                        'margin-left': '-' + clipBoxW + 'px'
                    });

                    this.rotate(this.$clipImg, this.imageOrientation);

                }.bind(this), 0);
            },
            rotate : function (el, orientation) {
                var rotate = {
                    90: 'rotate-90',
                    180: 'rotate-180',
                    270: 'rotate-270'
                };

                var className = el.attr('class');
                el.attr('class', className.replace(/\srotate-(\d{2,3})/, ''));

                if (rotate[orientation]) {
                    el.addClass(rotate[orientation]);
                }
            },
            clip : function () {

                var originWidth = this.$originImg[0].naturalWidth;
                var originHeight = this.$originImg[0].naturalHeight;
                var nowWidth = this.$originImg.width();
                var nowHeight = this.$originImg.height();
                var containerW = this.$el.width();
                var containerH = this.$el.height();
                var clipBoxLeft = this.$clipBox.position().left;
                var clipBoxTop = this.$clipBox.position().top;
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
                    top = clipBoxTop - (containerH - nowHeight) / 2;
                    break;
                case 90:
                case 270:
                    left = clipBoxLeft - (containerW - nowHeight) / 2;
                    top = clipBoxTop - (containerH - nowWidth) / 2;
                    var tmp = rateHeight;
                    rateHeight = rateWidth;
                    rateWidth = tmp;
                    break;
                }

                return {
                    img : this.$clipBox[0],
                    top : top * rateHeight,
                    left: left * rateWidth,
                    width: this.$clipBox.width() * rateWidth,
                    height: this.$clipBox.height() * rateHeight
                };
            },
            events : {
                'mousemove' : 'mouseMoveClip',
                'mousedown .clip-box-surface' : 'mouseDownSurface',
                'mousedown .clip-resize-el' : 'mouseDownResizeEl'
            }
        });

        return ClipImage;
    });

}(this));
