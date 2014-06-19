/*global define*/
(function (window, document) {
    define([
        'jquery',
        'underscore',
        'backbone',
        'doT',
        'FunctionSwitch',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/WindowState',
        'ui/behavior/DataSetMixin',
        'ui/behavior/SelectDelegateMixin',
        'ui/behavior/ObserverMixin',
        'ui/behavior/HeaderMixin',
        'ui/behavior/WanXiaoDouMixin'
    ], function (
        $,
        _,
        Backbone,
        doT,
        FunctionSwitch,
        UIHelper,
        TemplateFactory,
        WindowState,
        DataSetMixin,
        SelectDelegateMixin,
        ObserverMixin,
        HeaderMixin,
        WanXiaoDouMixin
    ) {
        console.log('SmartList - File loaded.');

        var setTimeout = window.setTimeout;
        var EventsMapping = UIHelper.EventsMapping;

        var count = 0;

        var addEmptyTip = function (emptyTip) {
            if (typeof emptyTip === 'object') {
                this.$('.text-tip').empty().append(emptyTip);
            } else if (emptyTip !== undefined) {
                this.$('.text-tip').html(emptyTip);
            }
        };

        var SmartList = Backbone.View.extend({
            className : 'w-ui-smartlist hbox',
            template : doT.template(TemplateFactory.get('ui', 'smart-list')),
            initialize : function () {
                DataSetMixin.mixin(this);
                SelectDelegateMixin.mixin(this);
                ObserverMixin.mixin(this);
                HeaderMixin.mixin(this);
                WanXiaoDouMixin.mixin(this);

                var activeItems = {};
                var containerHeight = 0;
                var emptyTip = '';
                var enableContextMenu = false;
                var enableDragAndDrop = false;
                var enableMutilselect = true;
                var lastSelect;
                var listenToCollection;
                var loading = false;
                var inactiveItems = [];
                var itemHeight = 0;
                var itemView;
                var minOffsetY = 0;
                var offsetY = 0;
                var rendered = false;
                var rowNumber = 0;
                var scrollHeight = 0;
                var selectable = true;
                var timer;
                var $container;
                var $scrollContainer;

                Object.defineProperties(this, {
                    activeItems : {
                        set : function (value) {
                            activeItems = value;
                        },
                        get : function () {
                            return activeItems;
                        }
                    },
                    containerHeight : {
                        set : function (value) {
                            var maxHeight = parseInt(this.$el.parent().css('max-height'), 10);
                            containerHeight = _.isNaN(maxHeight) ? parseInt(value, 10) : maxHeight;
                        },
                        get : function () {
                            return containerHeight;
                        }
                    },
                    emptyTip : {
                        set : function (value) {
                            if (typeof value === 'object') {
                                emptyTip = value;
                            } else if (value !== undefined) {
                                emptyTip = value = value.toString();
                            }

                            if (rendered) {
                                addEmptyTip.call(this, value);
                            } else {
                                this.once(EventsMapping.RENDERED, function () {
                                    addEmptyTip.call(this, value);
                                }, this);
                            }
                        },
                        get : function () {
                            return emptyTip;
                        }
                    },
                    enableContextMenu : {
                        set : function (value) {
                            enableContextMenu = Boolean(value);
                        },
                        get : function () {
                            return enableContextMenu;
                        }
                    },
                    enableMutilselect : {
                        get : function () {
                            return enableMutilselect;
                        },
                        set : function (value) {
                            enableMutilselect = Boolean(value);
                        }
                    },
                    enableDragAndDrop : {
                        get : function () {
                            return enableDragAndDrop;
                        },
                        set : function (value) {
                            enableDragAndDrop = Boolean(value);
                        }
                    },
                    itemHeight : {
                        set : function (value) {
                            itemHeight = parseInt(value, 10);
                        },
                        get : function () {
                            return itemHeight;
                        }
                    },
                    itemView : {
                        set : function (value) {
                            itemView = value;
                        },
                        get : function () {
                            return itemView;
                        }
                    },
                    listenToCollection : {
                        set : function (collection) {
                            listenToCollection = collection;
                        },
                        get : function () {
                            return listenToCollection;
                        }
                    },
                    lastSelect : {
                        set : function (value) {
                            lastSelect = value;
                        },
                        get : function () {
                            return lastSelect;
                        }
                    },
                    loading : {
                        set : function (value) {
                            loading = value = Boolean(value);
                            if (rendered) {
                                var $loading = this.$('.w-ui-loading');
                                if (value) {
                                    $loading.show();
                                } else {
                                    $loading.hide();
                                }
                            }
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    minOffsetY : {
                        get : function () {
                            return minOffsetY;
                        },
                        set : function (value) {
                            minOffsetY = value;
                        }
                    },
                    offsetY : {
                        get : function () {
                            return offsetY;
                        },
                        set : function (value) {
                            offsetY = value;
                        }
                    },
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    rowNumber : {
                        get : function () {
                            return rowNumber;
                        },
                        set : function (value) {
                            rowNumber = value;
                        }
                    },
                    scrollHeight : {
                        set : function (value) {
                            scrollHeight = value = parseInt(value, 10);
                            this.$('.w-ui-smartlist-scroll-substitution').height(value);
                        },
                        get : function () {
                            return scrollHeight;
                        }
                    },
                    selectable : {
                        set : function (value) {
                            selectable = Boolean(value);
                        },
                        get : function () {
                            return selectable;
                        }
                    },
                    timer : {
                        get : function () {
                            return timer;
                        },
                        set : function (value) {
                            timer = value;
                        }
                    },
                    inactiveItems : {
                        get : function () {
                            return inactiveItems;
                        },
                        set : function (value) {
                            inactiveItems = value;
                        }
                    },
                    isVisible : {
                        get : function () {
                            return this.$el.hasClass('visible');
                        }
                    },
                    $container : {
                        get : function () {
                            return $container;
                        },
                        set : function (value) {
                            $container = value;
                        }
                    },
                    $scrollContainer : {
                        get : function () {
                            return $scrollContainer;
                        },
                        set : function (value) {
                            $scrollContainer = value;
                        }
                    }
                });

                var options = this.options;
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }

                this.listenTo(WindowState, 'resize', function () {
                    var oldRowNumber;
                    var deltaY;
                    if (this.isVisible) {
                        oldRowNumber = this.calculateSettings();
                        if (this.needBuild(oldRowNumber)) {
                            deltaY = this.createItemView(this.rowNumber - oldRowNumber);
                            this.calculateOffSetY(deltaY);
                            this.build();
                        }
                    }
                });
            },
            needBuild : function (oldRowNumber) {
                var rowNumber = this.rowNumber;
                var currentModels = this.currentModels;
                if (oldRowNumber === rowNumber ||
                    (oldRowNumber >= currentModels.length && rowNumber > oldRowNumber) ||
                    (rowNumber < oldRowNumber && rowNumber >= currentModels.length)) {

                    return false;
                }

                return true;
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$container = this.$('.w-ui-smartlist-body-ctn');
                this.$scrollContainer = this.$('.w-ui-smartlist-scroll-ctn');

                this.loading = Boolean(this.loading);
                this.rendered = true;
                this.trigger(EventsMapping.RENDERED);

                setTimeout(function () {
                    this.init();
                }.bind(this));

                return this;
            },
            rebuild : function () {
                this.clearList();
                this.init();
                this.build();
            },
            calculateSettings : function () {
                this.containerHeight = this.$container.height();
                this.minOffsetY = this.containerHeight - (this.currentModels.length * this.itemHeight);

                var oldRowNumber = this.rowNumber;
                this.rowNumber = Math.ceil(this.containerHeight / this.itemHeight);
                return oldRowNumber;
            },
            clearList : function () {
                _.each(this.activeItems, function (itemView){
                    itemView.remove();
                });

                _.each(this.inactiveItems, function (itemView){
                    itemView.remove();
                });

                this.activeItems = {};
                this.inactiveItems = [];
                this.offsetY = 0;
            },
            init : function () {

                var currentModels = this.currentModels;
                this.toggleEmptyTip(currentModels.length === 0);
                this.calculateSettings();

                if (currentModels.length === 0) {
                    this.$scrollContainer.hide();
                    return;
                }

                this.$scrollContainer.show();
                var deltaY = this.createItemView();
                this.calculateOffSetY(deltaY);
                this.build();
                this.scrollHeight = currentModels.length * this.itemHeight;
            },
            createItemView : function (diff) {

                var currentModels = this.currentModels;
                var start = Math.floor(-this.offsetY / this.itemHeight);
                var end = start + this.rowNumber + 1;
                end = Math.min(end, currentModels.length);

                var activeKeys = _.sortBy(_.keys(this.activeItems), function (num) {
                    return num;
                });
                var activeLength = activeKeys.length;

                if(_.isUndefined(diff)) {
                    diff = end - start - activeLength;
                } else if (diff < 0) {
                    diff = Math.max(diff, end - start - activeLength);
                }

                var maxKey = _.max(activeKeys);
                if (maxKey === -Infinity) {
                    maxKey = 0;
                }

                var fragment = document.createDocumentFragment();
                var top;
                var dy = 0;

                if (diff > 0) {
                    var itemView;
                    var i = 0;
                    for (i; i < diff; i ++ ) {
                        itemView = new this.itemView();
                        this.inactiveItems.push(itemView);
                        fragment.appendChild(itemView.render().$el[0]);

                        top = maxKey++ * this.itemHeight;
                        this.toggleClass(itemView, maxKey);
                    }
                    this.$container.append(fragment);

                    if (end === currentModels.length) {
                        dy = (diff - 1) * this.itemHeight;
                    }

                } else if (diff < 0) {
                    diff = activeKeys.splice(activeLength + diff, -diff);
                    _.each(diff, function (num) {
                        this.activeItems[num].remove();
                        delete this.activeItems[num];
                    }, this);
                }
                return dy;
            },
            mousewheelBody : function (evt) {
                var deltaY = evt.originalEvent.wheelDeltaY / 3;
                this.calculateOffSetY(deltaY);
                this.build();
                this.moveScroller(-this.offsetY);
            },
            calculateOffSetY : function (deltaY) {
                this.offsetY = Math.min(Math.max(this.offsetY + deltaY, this.minOffsetY), 0);
            },
            build : function (flashAll) {

                var currentModels = this.currentModels;

                if (_.isUndefined(flashAll)) {
                    flashAll = false;
                }
                window.cancelAnimationFrame(this.timer);

                this.timer = window.requestAnimationFrame(function() {
                    var start = Math.floor(-this.offsetY / this.itemHeight);
                    var end = start + this.rowNumber + 1;
                    end = Math.min(end, currentModels.length);

                    var before = _.keys(this.activeItems);
                    var after = [];
                    var i;
                    for (i = start; i < end; i ++) {
                        after.push(i + '');
                    }

                    _.each(this.inactiveItems, function (item) {
                        item.$el.show();
                    });

                    var diffBeforeAfter = _.difference(before, after);
                    var diffAfterBefore = _.difference(after, before);
                    if (flashAll) {
                        _.intersection(before, after).forEach(function (i) {
                            if (currentModels[i].get('id') !== this.activeItems[i].model.get('id')) {
                                diffBeforeAfter.push(i);
                                diffAfterBefore.push(i);
                            }
                        }, this);

                        diffAfterBefore = _.uniq(diffAfterBefore);
                        diffBeforeAfter = _.uniq(diffBeforeAfter);
                    }

                    _.each(diffBeforeAfter, function(i) {
                        this.inactiveItems.push(this.activeItems[i]);
                        delete this.activeItems[i];
                    }, this);

                    var itemView;
                    _.each(diffAfterBefore, function(i) {

                        itemView = this.inactiveItems.pop();
                        itemView.decouple();
                        itemView.model = currentModels[i];
                        itemView.setup();
                        itemView.render();
                        this.toggleClass(itemView, i);
                        this.activeItems[i] = itemView;
                        itemView.toggleSelect(_.contains(this.selected, itemView.model.id));

                    }, this);

                    var keys = _.keys(this.activeItems);
                    _.each(keys, function (i) {
                        var top = i * this.itemHeight + this.offsetY;
                        this.activeItems[i].$el.css('webkitTransform', 'translate3d(0,' + top + 'px, 0)');
                    }, this);

                    _.each(this.inactiveItems, function (item) {
                        item.$el.hide();
                    });

                    this.trackerLog();
                    this.trigger(EventsMapping.BUILD, keys);

                }.bind(this));
            },
            removeScrollingClass : _.debounce(function (){
                this.$el.removeClass('scrolling');
            }, 200),
            moveScroller : function (scrollTop) {
                this.$scrollContainer.scrollTop(scrollTop);

                if (!this.$el.hasClass('scrolling')) {
                    this.$el.addClass('scrolling');
                }

                this.removeScrollingClass();
            },
            scrollHandler : function () {
                this.offsetY = -this.$scrollContainer.scrollTop();
                this.build();
            },
            trackerLog : function () {
                var currentModels = this.currentModels;
                var ran = _.random(0, 9);
                if (ran > 8 && FunctionSwitch.ENABLE_PERFORMANCE_TRACKER) {

                    var data = {
                        'type' : 'smartlist_scroll_' + window.SnapPea.CurrentModule,
                        'lengthOnScreen' : this.activeItems.length,
                        'url' : ''
                    };

                    if (currentModels.length > 0 && currentModels[0].collection) {
                        data.url = currentModels[0].collection.url || '';
                    }

                    var index = _.uniqueId('smartlist_scroll_');
                    window.wandoujia.data = window.wandoujia.data || {};
                    window.wandoujia.data[index] = data;
                    window.wandoujia.getFPS('recordFPS', index);
                }
            },
            toggleClass : function (itemView, index) {
                if (index % 2) {
                    itemView.$el.removeClass('even').addClass('odd');
                } else {
                    itemView.$el.removeClass('odd').addClass('even');
                }
            },
            toggleEmptyTip : function (show) {
                var $tipCtn = this.$('.empty-tip');
                if (show !== undefined) {
                    $tipCtn.toggleClass('w-layout-hide', !show);
                } else {
                    $tipCtn.toggleClass('w-layout-hide');
                }
            },
            clickListItem : function (evt) {
                if (evt.currentTarget.tagName === 'LI' && this.selectable) {
                    var selected = this.selected.concat();
                    var itemChecker = $(evt.currentTarget).find('.item-checker')[0];
                    var models = this.currentModels;

                    if (itemChecker) {
                        var id = itemChecker.value;
                        if (this.enableMutilselect) {
                            if (this.lastSelect && evt.shiftKey) {
                                var currentSetModelIds = _.pluck(models, 'id');
                                var indexOfLastSelect = currentSetModelIds.indexOf(this.lastSelect);
                                var indexOfCurrentSelect = currentSetModelIds.indexOf(id);

                                var startIndex = indexOfLastSelect < indexOfCurrentSelect ? indexOfLastSelect : indexOfCurrentSelect;
                                var stopIndex = (indexOfLastSelect > indexOfCurrentSelect ? indexOfLastSelect : indexOfCurrentSelect) + 1;

                                var set = models.slice(startIndex, stopIndex);

                                this.removeSelect(selected);

                                this.addSelect(_.pluck(set, 'id'));
                            } else if (evt.ctrlKey) {
                                if (itemChecker.checked) {
                                    this.removeSelect(id);
                                } else {
                                    this.addSelect(id);
                                }
                                this.lastSelect = id;
                            } else {
                                if (selected.length === 1) {
                                    if (selected[0] !== id) {
                                        this.removeSelect(selected, {
                                            silent : true
                                        });
                                        this.addSelect(id);
                                    }
                                } else {
                                    this.removeSelect(selected, {
                                        silent : true
                                    });

                                    this.addSelect(id);
                                }
                                this.lastSelect = id;
                            }
                        } else {
                            this.removeSelect(selected, {
                                silent : true
                            });

                            this.addSelect(id);
                        }
                    }
                }
            },
            checkListItem : function (evt) {
                evt.stopPropagation();

                if (evt.target.tagName === 'INPUT') {
                    var id = evt.target.value;

                    if (evt.target.checked) {
                        if (!this.enableMutilselect) {
                            var selected = this.selected.concat();
                            this.removeSelect(selected, {
                                silent : true
                            });
                        }
                        this.addSelect(id);
                    } else {
                        this.removeSelect(id);
                    }

                    this.lastSelect = id;
                }
            },
            rightClickItem : function (evt) {
                if (this.enableContextMenu) {
                    evt.preventDefault();

                    if (evt.currentTarget.tagName === 'LI') {
                        var selected = this.selected.concat();
                        var itemChecker = $(evt.currentTarget).find('.item-checker')[0];

                        var id = itemChecker.value;
                        if (!itemChecker.checked) {
                            this.removeSelect(selected, {
                                silent : true
                            });

                            this.addSelect(id);
                            this.lastSelect = id;
                        }
                    }

                    this.trigger('contextMenu', this.selected);
                }
            },
            remove : function () {

                _.each(this.activeItems, function (item) {
                    item.remove();
                });

                this.erase();
                this.clearSet();
                this.off();

                SmartList.__super__.remove.call(this);
            },
            scrollTo : function (model) {
                var index = this.currentModels.indexOf(model);
                this.offsetY = -index * this.itemHeight;
                this.build();
            },
            enableScrollHandler : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                this.$scrollContainer.on('scroll', this.scrollHandler.bind(this));
            },
            disableScrollHandler : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                this.$scrollContainer.off('scroll', this.scrollHandler.bind(this));
            },
            dragoverBody : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if (this.enableDragAndDrop) {
                    evt.originalEvent.dataTransfer.dropEffect = 'copy';
                    this.trigger('dropover', evt);
                }
            },
            dragleaveBody : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if (this.enableDragAndDrop) {
                    this.trigger('dragleave', evt);
                }
            },
            dragenterBody : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if (this.enableDragAndDrop) {
                    this.trigger('dragenter', evt);
                }
            },
            dropBody : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if (this.enableDragAndDrop) {
                    this.trigger('drop', evt);
                }
            },
            events : {
                'mouseover .w-ui-smartlist-scroll-ctn' : 'enableScrollHandler',
                'mouseleave .w-ui-smartlist-scroll-ctn' : 'disableScrollHandler',
                'mousewheel .w-ui-smartlist-body-ctn' : 'mousewheelBody',
                'click .w-ui-smartlist-body-ctn > li' : 'clickListItem',
                'click .w-ui-smartlist-body-ctn > li .item-checker' : 'checkListItem',
                'click .w-ui-smartlist-body-ctn > li .item-checker-wrap' : 'checkListItem',
                'contextmenu .w-ui-smartlist-body-ctn > li' : 'rightClickItem',
                'dragover .w-ui-smartlist-body-ctn' : 'dragoverBody',
                'dragleave .w-ui-smartlist-body-ctn' : 'dragleaveBody',
                'dragenter .w-ui-smartlist-body-ctn' : 'dragenterBody',
                'drop .w-ui-smartlist-body-ctn' : 'dropBody'
            }
        });

        return SmartList;
    });
}(this, this.document));
