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

        var calculateSettings = function () {
            this.ctnHeight = this.$ctn.height();

            // Calculate content height and set scroll substitution height
            this.contentHeight = this.currentModels.length * this.itemHeight;

            if (this.contentHeight > this.ctnHeight) {
                this.scrollHeight = this.contentHeight;
            } else {
                this.scrollHeight = 0;
            }
        };

        var supplyItems = function (offset) {
            offset = _.isNumber(offset) ? offset : 0;

            // Cache vars
            var models = this.currentModels;
            var $itemCtn = this.$ctn;
            var modelCount = models.length;
            var ctnHeight = this.ctnHeight;
            var onScreenItems = this.onScreenItems;
            var itemHeight = this.itemHeight;

            if (onScreenItems.length > 0) {
                _.each(onScreenItems, function (item) {
                    item.remove();
                }, this);
            }

            onScreenItems.length = 0;

            // Render items
            var fragment = document.createDocumentFragment();
            var itemView;
            var i;
            var model;
            for (i = offset; i < modelCount; i++) {
                model = models[i];
                itemView = new this.itemView({
                    model : model
                });
                itemView.setup();

                onScreenItems.push(itemView);

                fragment.appendChild(itemView.render().$el[0]);
                if ((onScreenItems.length * itemHeight) >= ctnHeight) {
                    break;
                }
            }
            if (this.onScreenItems.length > 0) {
                $itemCtn.toggleClass('odd', models.indexOf(this.onScreenItems[0].model) % 2 === 1);
            }
            $itemCtn.append(fragment);

            this.toggleEmptyTip(models.length === 0);

            this.trigger(EventsMapping.BUILD);
        };

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

                var rendered = false;
                var ctnHeight = 0;
                var itemView;
                var contentHeight = 0;
                var itemHeight = 0;
                var scrollHeight = 0;
                var onScreenItems = [];
                var lastSelect;
                var emptyTip = '';
                var loading = false;
                var renderQueue = [];

                var removeScrollingClass = _.debounce(function () {
                    this.$el.removeClass('scrolling');
                }.bind(this), 200);

                var scrollHandler = function (evt) {
                    if (!this.$el.hasClass('scrolling')) {
                        this.$el.addClass('scrolling');
                    }

                    removeScrollingClass.call(this);

                    window.requestAnimationFrame(function () {
                        this.build(evt.target.scrollTop);
                    }.bind(this));

                    var ran = _.random(0, 9);
                    if (ran > 8 && FunctionSwitch.ENABLE_PERFORMANCE_TRACKER) {

                        var data = {
                            'type' : 'smartlist_scroll_' + window.SnapPea.CurrentModule,
                            'lengthOnScreen' : onScreenItems.length,
                            'url' : ''
                        };

                        if (this.currentModels.length > 0) {
                            data.url = this.currentModels[0].collection.url || '';
                        }

                        var index = _.uniqueId('smartlist_scroll_');
                        window.wandoujia.data = window.wandoujia.data || {};
                        window.wandoujia.data[index] = data;
                        window.wandoujia.getFPS('recordFPS', index);
                    }
                }.bind(this);

                var enableResizeListener = false;
                var enableContextMenu = false;
                var selectable = true;
                var listenToCollection;
                var enableMutilselect = true;
                var enableDragAndDrop = false;
                var $ctn;
                var $scrollCtn;
                var lastHeight;

                Object.defineProperties(this, {
                    lastHeight : {
                        get : function () {
                            return lastHeight;
                        },
                        set : function (value) {
                            lastHeight = value;
                        }
                    },
                    enableResizeListener : {
                        get : function () {
                            return enableResizeListener;
                        },
                        set : function (value) {
                            enableResizeListener = value;
                        }
                    },
                    isVisible : {
                        get : function () {
                            return this.$el.hasClass('visible');
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
                    ctnHeight : {
                        set : function (value) {
                            // Get max-height value if parent container has this CSS attribute
                            var maxHeight = parseInt(this.$el.parent().css('max-height'), 10);

                            ctnHeight = _.isNaN(maxHeight) ? parseInt(value, 10) : maxHeight;
                        },
                        get : function () {
                            return ctnHeight;
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
                    contentHeight : {
                        set : function (value) {
                            contentHeight = parseInt(value, 10);
                        },
                        get : function () {
                            return contentHeight;
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
                    onScreenItems : {
                        set : function (value) {
                            if (value instanceof Array) {
                                onScreenItems = value;
                            }
                        },
                        get : function () {
                            return onScreenItems;
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
                    renderQueue : {
                        set : function (value) {
                            renderQueue = value;
                        },
                        get : function () {
                            return renderQueue;
                        }
                    },
                    scrollHandler : {
                        get : function () {
                            return scrollHandler;
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
                    selectable : {
                        set : function (value) {
                            selectable = Boolean(value);
                        },
                        get : function () {
                            return selectable;
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
                    $ctn : {
                        get : function () {
                            return $ctn;
                        },
                        set : function (value) {
                            $ctn = value;
                        }
                    },
                    $scrollCtn : {
                        get : function () {
                            return $scrollCtn;
                        },
                        set : function (value) {
                            $scrollCtn = value;
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

                this.on('switchSet', function () {
                    calculateSettings.call(this);
                    this.switchComparator();
                    this.build();
                }, this);
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$ctn = this.$('.w-ui-smartlist-body-ctn');
                this.$scrollCtn = this.$('.w-ui-smartlist-scroll-ctn');

                this.loading = Boolean(this.loading);

                this.$scrollCtn.on('scroll', this.scrollHandler);

                if (this.enableResizeListener) {
                    this.listenTo(WindowState, 'resize', this.resizeHandler);
                }

                setTimeout(function () {
                    calculateSettings.call(this);
                    supplyItems.call(this);
                }.bind(this));

                this.rendered = true;

                this.trigger(EventsMapping.RENDERED);

                this.lastHeight = WindowState.height;

                return this;
            },
            resizeHandler : function (state) {

                if (state.height !== this.lastHeight && this.isVisible) {
                    this.resizeList();
                }

                this.lastHeight = state.height;
            },
            resizeList : function () {

                var topModel;

                if (this.onScreenItems[0]) {
                    topModel = this.onScreenItems[0].model;
                }

                this.ctnHeight = this.$ctn.height();

                if (topModel !== undefined) {
                    var index = 0;

                    _.find(this.currentModels, function (model, i) {
                        if (model.id === topModel.id) {
                            index = i;
                            return true;
                        }

                        return false;
                    });

                    supplyItems.call(this, index);
                } else {
                    supplyItems.call(this);
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
            build : function (scrollTop) {
                var $scrollCtn = this.$scrollCtn;
                $scrollCtn.off('scroll', this.scrollHandler);

                var scrollCtn = $scrollCtn[0];
                if (scrollTop === undefined || !_.isNumber(scrollTop)) {
                    scrollTop = scrollCtn.scrollTop;
                }

                if (scrollTop === 0) {
                    scrollCtn.scrollTop = 0;
                }

                // Cache vars
                var models = this.currentModels;
                var modelCount = models.length;
                var $itemCtn = this.$('.w-ui-smartlist-body-ctn');
                var screenDimension = this.onScreenItems.length;

                var screenHeight = screenDimension * this.itemHeight;
                if (modelCount < screenDimension) {
                    var itemToDrop = this.onScreenItems.slice(modelCount, screenDimension);

                    _.each(itemToDrop, function (item) {
                        item.remove();
                    }, this);

                    this.onScreenItems = this.onScreenItems.slice(0, modelCount);
                    screenDimension = this.onScreenItems.length;
                } else if (screenHeight < this.ctnHeight && modelCount > screenHeight / this.itemHeight) {
                    supplyItems.call(this, 0);

                    $scrollCtn.on('scroll', this.scrollHandler);
                    return;
                }

                // Calculate positions
                var topOffset = scrollTop / this.itemHeight;
                var upItemsCount = Math.ceil(topOffset);

                var newModels;
                if (upItemsCount + screenDimension > modelCount) {
                    newModels = models.slice(modelCount - screenDimension, modelCount);
                } else {
                    newModels = models.slice(upItemsCount, upItemsCount + screenDimension);
                }

                var oldOnScreenIds = _.map(this.onScreenItems, function (item) {
                    return item.model.id;
                });

                // Render items
                if (!_.isEqual(oldOnScreenIds, _.pluck(newModels, 'id'))) {
                    $itemCtn.children().detach();

                    var model, view;
                    var fragment = document.createDocumentFragment();
                    var i;
                    var length = newModels.length;
                    for (i = 0; i < length; i++) {
                        model = newModels[i];
                        view = this.onScreenItems[i];
                        view.decouple();
                        view.model = model;
                        view.setup();

                        fragment.appendChild(view.render().$el[0], fragment.firstChild);
                    }

                    if (this.onScreenItems.length > 0) {
                        $itemCtn.toggleClass('odd', models.indexOf(this.onScreenItems[0].model) % 2 === 1);
                    }
                    $itemCtn.append(fragment);
                }

                if (this.onScreenItems.length !== 0) {
                    if (screenDimension !== modelCount) {
                        if (models[0] === this.onScreenItems[0].model) {
                            // this.onScreenItems[0].$el[0].scrollIntoView();
                            $itemCtn[0].scrollTop = 0;
                        } else if (models[modelCount - 1] === this.onScreenItems[screenDimension - 1].model) {
                            this.onScreenItems[screenDimension - 1].$el[0].scrollIntoView();
                            scrollCtn.scrollTop = scrollCtn.scrollHeight;
                        }
                    } else {
                        if (scrollCtn.scrollTop === 0) {
                            // this.onScreenItems[0].$el[0].scrollIntoView();
                            $itemCtn[0].scrollTop = 0;
                        } else {
                            this.onScreenItems[screenDimension - 1].$el[0].scrollIntoView();
                        }
                    }
                }

                this.toggleEmptyTip(models.length === 0);

                this.trigger(EventsMapping.BUILD);

                $scrollCtn.on('scroll', this.scrollHandler);
            },
            buildQueue : function (scrollTop) {
                if (this.renderQueue.length === 0) {
                    this.renderQueue.push(scrollTop);
                } else if (this.renderQueue[this.renderQueue.length - 1] !== scrollTop) {
                    this.renderQueue.push(scrollTop);
                }

                if (!this.renderDelegate && this.renderQueue.length > 0) {
                    this.renderDelegate = window.requestAnimationFrame(function () {
                        if (this.renderQueue.length > 0) {
                            var target = this.renderQueue.shift();
                            this.build(target);
                        } else {
                            window.cancelAnimationFrame(this.renderDelegate);
                            this.renderDelegate = undefined;
                        }
                    }.bind(this), 15);
                }
            },
            mousewheelBody : _.throttle(function (evt) {
                if (this.renderQueue.length === 0) {
                    var $scrollCtn = this.$scrollCtn;

                    var models = this.currentModels;

                    if (this.onScreenItems.length !== models.length) {
                        var offset = 0;
                        var currentIndex = _.pluck(models, 'id').indexOf(this.onScreenItems[0].model.id);

                        if (evt.originalEvent.wheelDelta > 0) {
                            offset = Math.max((currentIndex - 3) * this.itemHeight, 0);
                            if (currentIndex - 1 >= 0) {
                                $scrollCtn[0].scrollTop = offset;
                            }
                        } else {
                            offset = Math.min((currentIndex + 3) * this.itemHeight, this.contentHeight);
                            if (currentIndex + this.onScreenItems.length + 1 <= models.length) {
                                $scrollCtn[0].scrollTop = offset;
                            }
                        }
                    } else {
                        if (evt.originalEvent.wheelDelta > 0) {
                            $scrollCtn[0].scrollTop -= this.itemHeight;
                        } else {
                            $scrollCtn[0].scrollTop += this.itemHeight;
                        }
                    }
                }

            }, 35),
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
                this.$scrollCtn.off('scroll', this.scrollHandler);

                _.each(this.onScreenItems, function (item) {
                    item.remove();
                });

                this.erase();
                this.clearSet();
                this.off();

                SmartList.__super__.remove.call(this);
            },
            scrollTo : function (model) {
                var index = this.currentModels.indexOf(model);
                this.$scrollCtn[0].scrollTop = index * this.itemHeight;

                if (this.onScreenItems[0]) {
                    this.onScreenItems[0].$el[0].scrollIntoView();
                }
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
