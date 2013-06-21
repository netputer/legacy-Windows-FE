/**
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
