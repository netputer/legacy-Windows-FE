/**
 * @fileoverview Definition of high performance Grid class
 *
 */
wonder.addModule('ui/grid', function(W) {
    W.namespace('wonder.ui');

    var doc = W.host.document;
    //Set global sorting to true if one grid is sorting. Set sorting to false
    // after sorting complete. It fix bug: NOT render content while sorting.
    var refreshGridContent = false;

    /**
     * @constructor Create a high performance container of list.
     * @para {Object} , specify the container height(size), size of item,
     * current scrollbar position, and item count.
     */
    function HighPerformanceContainer(config) {
        wonder.ui.UIBase.call(this, config);

        /**
         * The configuration for the container.
         * @type {Object}
         * @private
         */
        this._datas = [];
    };

    W.extend(HighPerformanceContainer, wonder.ui.UIBase);

    HighPerformanceContainer.Events = {
        SCROLL_TOP : 'scrollTop',
        SCROLL_LEFT : 'scrollLeft'
    }

    HighPerformanceContainer.prototype._defaults = {
        total : 0, // item count
        position : 0, // current postion
        itemSize : 0, // default item size
        size : 100// the container set the size automaticly
    };

    HighPerformanceContainer.prototype._barContainerEl = null;

    HighPerformanceContainer.prototype._barEl = null;

    HighPerformanceContainer.prototype._contentContainerEl = null;

    HighPerformanceContainer.prototype._scrollbarEl = null;

    HighPerformanceContainer.prototype._posQueue = [];

    HighPerformanceContainer.prototype._init = function() {
        $(window).bind('resize', $.proxy(function() {
            W.delay(this, this._resize, 25);
        }, this));
        this._resize();

        $(this._barContainerEl).on('scroll', $.proxy(function() {
            this._scroll();
        }, this));
        $(this._contentContainerEl).bind('mousewheel', $.proxy(this._onMousewheel, this));
        $(this._contentContainerEl).bind('scroll', $.proxy(function(ev) {
            this.trigger(HighPerformanceContainer.Events.SCROLL_LEFT, ev.target.scrollLeft);
        }, this));
        $(this._contentContainerEl).bind('click', function(e) {
            if (this === e.target)
                return false;
        });
        $(this._contentContainerEl).bind('keydown', $.proxy(function(ev) {
            if (ev.keyCode === 33) {
                this.pageUp();
            } else if (ev.keyCode === 34) {
                this.pageDown();
            } else {
                this._onMousewheel(ev);
            }
        }, this));
    };

    HighPerformanceContainer.prototype.pageUp = function() {
        this._setPosition(0);
        this._scroll();
    };

    HighPerformanceContainer.prototype.pageDown = function() {
        var len = this._datas.length;
        var pos = len < this.getViewSize() ? 0 : len - this.getViewSize();
        this._setPosition(pos);
        this._scroll();
    };

    HighPerformanceContainer.prototype.getItemCount = function() {
        return this._config.total;
    };

    HighPerformanceContainer.prototype.showContentByPos = function(pos) {
        this._setPosition(pos);
        this._scroll();
    };

    HighPerformanceContainer.prototype.setSize = function() {
        if ($(this.getElement()).height() > 0) {
            this._setOptions({
                size : $(this.getElement()).height()
            });
        }
    };
    //when window resize, it will resize grid container height.
    //Grid width resize depending on parent width.
    HighPerformanceContainer.prototype._resize = function() {
        this.setSize();
        this._scroll();
    };
    //when mouse wheel, srcollbar and key down events trigger,
    //they will refresh grid content.
    HighPerformanceContainer.prototype._scroll = function() {
        if (!this._datas || this._datas.length <= 0) {
            this.trigger(HighPerformanceContainer.Events.SCROLL_TOP, [], false, false);
            return false;
        }

        var self = this, pn, pq, pos = this._getDataPosition();

        if (pos > 0 && this._config.position > 0 && pos === this._config.position && !refreshGridContent) {
            return false;
        }

        this._config.position = pos;
        pn = self.getViewSize();

        this._posQueue.push({
            start : pos,
            end : pos + pn
        });

        if (!this.it) {
            //让出 javascript 部分执行时间片段来渲染界面， 防止界面短暂卡的现象。
            this.it = window.setInterval(function() {
                pq = self._posQueue.shift();

                if (!pq || self._posQueue.length <= 0) {
                    window.clearInterval(self.it);
                    self.it = null;
                }
                if (pq) {
                    self.trigger(HighPerformanceContainer.Events.SCROLL_TOP, self._datas.slice(pq.start, pq.end), pq.start === 0 ? true : false, pq.end >= self._datas.length ? true : false);
                }
            }, 20);
        }
    };

    HighPerformanceContainer.prototype._onMousewheel = function(ev) {
        var self = this;
        this._mouseWheelPos = [];
        if (!ev.originalEvent.wheelDelta && ev.keyCode !== 38 && ev.keyCode !== 40)
            return;
        var isMouseUp = (ev.originalEvent.wheelDelta > 0 || ev.keyCode === 38) ? true : false;
        var pos = this._getDataPosition();
        pos = isMouseUp ? pos - 3 : pos + 3;
        this._mouseWheelPos.push(pos);
        window.clearTimeout(this._mouseWheelTimer);
        this._mouseWheelTimer = null;
        if (!this._mouseWheelTimer) {
            this._mouseWheelTimer = window.setTimeout(function() {
                var context = self;
                var shiftPos = context._mouseWheelPos.shift();
                if (shiftPos !== undefined) {
                    context._setPosition(shiftPos);
                    context._scroll();
                }
            }, 10);
        }
    };
    HighPerformanceContainer.prototype._setOptions = function(options) {
        W.mix(this._config, options);
        this._refreshBarHeight();
    };
    HighPerformanceContainer.prototype._refreshBarHeight = function() {
        $(this.getContentEl()).height($(this.getElement()).height());
        $(this._barEl).height(this._config.total * this._config.itemSize);
        $(this._barContainerEl).height($(this.getElement()).height());
    };
    HighPerformanceContainer.prototype.getViewSize = function() {
        return (this._config.size / this._config.itemSize) + 1;
    };
    HighPerformanceContainer.prototype._setPosition = function(pos) {
        this._barContainerEl.scrollTop = Math.round(pos * this._config.itemSize);
    };
    HighPerformanceContainer.prototype._getDataPosition = function() {
        var top = this._barContainerEl.scrollTop;
        pos = Math.ceil(top / this._config.itemSize);
        return pos;
    };
    HighPerformanceContainer.prototype.setData = function(data) {
        var self = this;
        this._datas = data;
        this._setOptions({
            total : data.length
        });
        this.setSize();
        this.clearContent();
        this.isShowHighlightTip = false;
        this._scroll();
        window.setTimeout(function() {
            self.isShowHighlightTip = true;
        }, 500);
    };
    HighPerformanceContainer.prototype.getData = function() {
        return this._datas;
    };
    HighPerformanceContainer.prototype.getItemSize = function() {
        return this._config.itemSize;
    };
    HighPerformanceContainer.prototype.getContentEl = function() {
        return this._contentContainerEl;
    };
    HighPerformanceContainer.prototype.setContent = function(content) {
        this._extraEl.innerHTML = content;
    };
    HighPerformanceContainer.prototype.clearContent = function() {
        this._extraEl.innerHTML = '';
    };
    HighPerformanceContainer.prototype.showHighlightTip = function(content) {
        var self = this;
        $(this.highlightTipEl).show().html(content);
        window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(function() {
            $(self.highlightTipEl).hide();
        }, 1000);
    };
    HighPerformanceContainer.prototype.render = function(opt_parent) {

        var tag = 'div', barContainer = doc.createElement(tag), bar = doc.createElement(tag), contentContainer = doc.createElement(tag), scrollbar = doc.createElement(tag), element = doc.createElement(tag);
        extraEl = doc.createElement(tag);
        highlightTipEl = doc.createElement(tag);

        $(element).addClass('modal-container');
        $(contentContainer).addClass('modal-container-content').attr('tabindex', 0);
        $(scrollbar).addClass('modal-container-scrollbar');

        $(barContainer).append(bar).appendTo(scrollbar);

        $(bar).width(1);
        $(element).append(contentContainer).append(scrollbar);
        contentContainer.appendChild(extraEl);
        contentContainer.appendChild(highlightTipEl)
        $(extraEl).addClass('w-content-tip');
        $(highlightTipEl).addClass('w-grid-highlighttip');

        this._element = element;
        this._barContainerEl = barContainer;
        this._barEl = bar;
        this._contentContainerEl = contentContainer;
        this._scrollbarEl = scrollbar;
        this._extraEl = extraEl;
        this.highlightTipEl = highlightTipEl;
        opt_parent = opt_parent || doc.body;
        opt_parent.appendChild(element);

        this._init();
    };
    /**
     * @constructor Column
     */
    function Column(data) {
        W.ui.UIBase.call(this);
        this.data = data;
    }


    W.extend(Column, W.ui.UIBase);

    W.mix(Column.prototype, {
        getValue : function() {
            return this.data;
        }
    });

    W.ui.Column = Column;

    /**
     * @function
     * ultil function, it's used for validation of
     * grid config
     */
    var validateGridConfig = function(config) {
        if ( typeof config === 'object') {
            if (config.colModel && W.isArray(config.colModel)) {
                return config.colModel.every(function(item) {
                    if ('index' in item && 'name' in item) {
                        return true;
                    } else {
                        return false;
                    }
                });
            }
        }
        return false;
    }
    /**
     * @contructor Create Grid.
     * @para {Object}, config data structure:
     * {
     *    calModel : [{
     *        colLabel : string,
     *        index : string,
     *        name : string,
     *        sortable : boolean,
     *        sorttype : string,
     *        resizable  : boolean
     *        width : number | String('flex'),
     *        dataType : string('size')
     *    },...],
     *
     *    rowHeight : number,
     *    emptyTip : string,
     *    multiSelectable : boolean,
     *    isShowHeader : boolean,
     *    isShowAllCheckbox : boolean,
     *    isContentMultiSelected : boolean,
     * }
     */
    function Grid(config) {
        wonder.ui.UIBase.call(this);

        if (!validateGridConfig(config)) {
            throw new Error('Grid config is invalid');
        }

        this._config = config;
        this._bodyContainer = new HighPerformanceContainer({
            itemSize : (config.rowHeight || 25)
        });
        if (W.isNumber(config.checkboxColWidth)) {
            this._config.checkboxColWidth = config.checkboxColWidth < 42 ? 42 : config.checkboxColWidth;
        }
        this.currentTag = 'defaultTag';
        this.lastSortor = {};
        this._data = [];
        this._resizingStatus = {
            width : -1,
            start : -1,
            end : -1,
            cell : null,
            resizing : false,
            reset : function() {
                this.width = this.start = this.end = -1;
                this.cell = null;
                this.resizing = false;
            }
        };
        this.reusedList = {
            _initialize : false,
            unUsedRow : [],
            list : [],
            unUsedColumnList : [],
            columnList : [],
            container : this._bodyContainer,
            _buildReusedRow : function() {
                var classes = Grid.Classes;
                var checkboxColumn = $('<div data-role="row-checkbox"/>').addClass(classes.W_GRID_COLUMN + ' ' + classes.W_GRID_COLUMN_CHECKBOX).append($('<input data-role="row-checkbox"/>').prop('type', 'checkbox'));

                var rowEl = $('<div/>').addClass(Grid.Classes.W_GRID_ROW + ' ' + Grid.Classes.W_GRID_ROW_HIDE);
                return {
                    checkboxColumn : checkboxColumn,
                    row : rowEl
                }
            },
            _buildColumn : function() {
                return $('<div/>').addClass(Grid.Classes.W_GRID_COLUMN);
            },
            initialize : function() {
                var len = this.container.getViewSize();
                var colSize = config.colModel.length;
                var allColSize = colSize * len;
                var containerEl = $(this.container.getContentEl());
                for (var i = 0; i < len; i++) {
                    var row = this._buildReusedRow();
                    this.list.push(row);
                    this.unUsedRow.push(row);
                    containerEl.append(row.row);
                }

                for (var j = 0; j < allColSize; j++) {
                    var column = this._buildColumn();
                    this.columnList.push(column);
                    this.unUsedColumnList.push(column);
                }
                this._initialize = true;
            },
            resetUnusedRow : function() {
                this.unUsedRow = [];
                this.zoom();
                for (var i = 0; i < this.list.length; i++) {
                    this.unUsedRow.push(this.list[i]);
                }
            },
            getReusedRow : function() {
                this.zoom();
                var row = this.unUsedRow.shift();
                if (!row) {
                    row = this._buildReusedRow();
                    this.list.push(row);
                }
                return row;
            },
            resetUnusedColumnList : function() {
                this.unUsedColumnList = [];
                for (var i = 0; i < this.columnList.length; i++) {
                    this.unUsedColumnList.push(this.columnList[i]);
                }
            },
            getReusedColumn : function() {
                var column = this.unUsedColumnList.shift();
                if (!column) {
                    column = this._buildColumn();
                    this.columnList.push(column);
                }
                return column;
            },
            zoom : function() {
                if (!this._initialize) {
                    this.initialize();
                }
                var len = this.container.getViewSize();
                var colSize = config.colModel.length;
                var allColSize = colSize * len;

                if (len > this.list.length) {
                    var addListLen = len - this.list.length;
                    var containerEl = $(this.container.getContentEl());
                    addListLen = Math.ceil(addListLen);
                    for (var i = 0; i < addListLen; i++) {
                        var row = this._buildReusedRow();
                        this.list.push(row);
                        containerEl.append(row.row);
                    }
                }

                if (allColSize > this.columnList.length) {
                    addListLen = allColSize - this.columnList.length;
                    for (var i = 0; i < addListLen; i++) {
                        this.columnList.push(this._buildColumn());
                    }
                }
            }
        };
    };

    W.extend(Grid, wonder.ui.UIBase);
    Grid.Events = {
        SELECT : 'select',
        UNSELECT : 'unselect',
        SELECT_ALL : 'select_all',
        UNSELECT_ALL : 'unselect_all'
    };

    Grid.prototype._allCheckboxEl = null;

    Grid.prototype._checkedMap = null;

    Grid.prototype._initCheckedMap = function() {
        this._checkedMap = {
            currentTag : 'defaultTag',
            lastCheckedData : {
                defaultTag : ''
            },
            shiftUncheckedData : {
                defaultTag : ''
            },
            values : {
                defaultTag : {}
            },
            selectedOrderData : {
                defaultTag : []
            },
            getOrderSelectedIds : function() {
                return this.selectedOrderData[this.currentTag];
            },
            setLastCheckedData : function(data) {
                this.lastCheckedData[this.currentTag] = data;
            },
            getLastCheckedData : function() {
                return this.lastCheckedData[this.currentTag];
            },
            setShiftUncheckedData : function(data) {
                this.shiftUncheckedData[this.currentTag] = data;
            },
            getShiftUncheckedData : function() {
                return this.shiftUncheckedData[this.currentTag];
            },
            push : function(key, value) {
                this.values[this.currentTag][key] = value;
                var checkedArray = this.selectedOrderData[this.currentTag];
                if (checkedArray.indexOf(key) === -1) {
                    checkedArray.push(key);
                }
            },
            get : function(key) {
                return this.values[this.currentTag][key];
            },
            remove : function(key) {
                delete this.values[this.currentTag][key];
                var checkedArray = this.selectedOrderData[this.currentTag];
                var index = checkedArray.indexOf(key);
                if (index > -1) {
                    checkedArray.splice(index, 1);
                }
            },
            clear : function() {
                this.values[this.currentTag] = {};
                this.selectedOrderData[this.currentTag] = [];
            },
            getAll : function() {
                var arr = [];

                this.each(function(item) {
                    arr.push(item);
                });
                return arr;
            },
            each : function(func, context) {
                context = context || this;
                for (var i in this.values[this.currentTag]) {
                    func.call(context, this.values[this.currentTag][i]);
                }
            },
            isContainKey : function(key) {
                return ( key in this.values[this.currentTag]);
            },
            hasCheckd : function() {
                var checked = this.values[this.currentTag];
                for (var i in checked) {
                    return true;
                }
                return false;
            },
            getSize : function() {
                return this.getAll().length;
            },
            setTag : function(tag) {
                this.currentTag = tag;
                if (!this.values[this.currentTag]) {
                    this.values[this.currentTag] = {};
                }
                if (!this.selectedOrderData[this.currentTag]) {
                    this.selectedOrderData[this.currentTag] = [];
                }
            }
        }
    };

    Grid.prototype.getOrderSelectedIds = function() {
        return this._checkedMap.getOrderSelectedIds();
    };

    Grid.prototype.hasChecked = function() {
        return this._checkedMap.hasCheckd();
    };

    Grid.prototype.setCurrentTag = function(tag) {
        this._checkedMap.setTag(tag);
        this.currentTag = tag;
    };

    Grid.prototype.addAllCheckboxEl = function(el) {
        //Only one allCheckbox just existed, This api will overrite the default
        //Grid allcheckbox and replace her bahavor.
        this._allCheckboxEl = $(el).prop('type', 'checkbox').bind('click', $.proxy(this._clickGrid, this)).attr('data-role', 'm-status');
    };

    Grid.prototype.setAllChecboxStatus = function() {
        if (this._allCheckboxEl) {
            this._allCheckboxEl.prop('checked', this._data.length > 0 && this._data.length === this._checkedMap.getSize());
            this._allCheckboxEl.prop('disabled', this._data.length <= 0);
        }
    };

    Grid.prototype.getAllCheckboxEl = function() {
        return this._allCheckboxEl;
    };

    Grid.prototype.selectAll = function() {
        var dataIds = [];
        _.each(this._data, function(data) {
            dataIds.push(data.id);
            this.highlightRow(data.id);
        }, this);
        this._allCheckboxEl.prop('checked', true);
        this.trigger(Grid.Events.SELECT_ALL, dataIds);
    };

    Grid.prototype.unSelectAll = function() {
        _.each(this._data, function(data) {
            this.unHighlightRow(data.id);
        }, this);
        this._allCheckboxEl.prop('checked', false);
        this.trigger(Grid.Events.UNSELECT_ALL);
    };

    Grid.prototype.getViewSize = function() {
        return this._bodyContainer.getViewSize();
    };
    /**
     * build grid header and body.
     */
    Grid.prototype._buildGrid = function() {
        var header = $('<header/>').addClass(Grid.Classes.W_GRID_HEADER), headerRow = $('<div/>').addClass(Grid.Classes.W_GRID_HEADER_ROW), body = $('<div/>').addClass(Grid.Classes.W_GRID_BODY), isMultiSelectable = this._config.multiSelectable, colModel = this._config.colModel;

        this._element.append(header.append(headerRow)).append(body);
        if (W.isBoolean(this._config.isShowHeader) && !this._config.isShowHeader) {
            header.hide();
        }
        if (W.isBoolean(isMultiSelectable) && isMultiSelectable) {
            var isShowAllCheckbox = this._config.isShowAllCheckbox;
            var multiCheckboxEl = $('<input data-role="m-status"></input>').prop('type', 'checkbox').bind('click', $.proxy(this._clickGrid, this));

            if (!this._allCheckboxEl) {
                this._allCheckboxEl = multiCheckboxEl;
            }
            var allCheckboxEl = $('<div></div>').addClass(Grid.Classes.W_GRID_COLUMN + ' ' + Grid.Classes.W_GRID_COLUMN_CHECKBOX).width(this._config.checkboxColWidth || 0).appendTo(headerRow);
            if (W.isBoolean(isShowAllCheckbox)) {
                isShowAllCheckbox ? allCheckboxEl.append(multiCheckboxEl) : '';
            } else {
                allCheckboxEl.append(multiCheckboxEl);
            }
            body.bind('click', $.proxy(this._clickGrid, this));
        }

        _.each(colModel, function(col) {
            var colEl = $('<div/>').addClass(Grid.Classes.W_GRID_COLUMN).attr('cel-index', col.index);
            var textEl = $('<div/>').addClass(Grid.Classes.W_GRID_COLUMN_LABEL);
            W.isNumber(col.width) ? colEl.width(col.width) : colEl.addClass(Grid.Classes.W_GRID_COLUMN_FLEX);
            textEl.text(W.isString(col.colLabel) ? col.colLabel : '');
            headerRow.append(colEl.append(textEl));

            if (W.isBoolean(col.resizable) && col.resizable) {
                $('<div/>').addClass(Grid.Classes.W_GRID_RESIZABLE).appendTo(colEl).bind('mousedown', $.proxy(this._startResize, this));
            }

            if (W.isBoolean(col.sortable) && col.sortable) {
                textEl.addClass(Grid.Classes.W_GRID_SORTABLE).attr('cell-index', col.index).bind('click', $.proxy(function(ev) {
                    if (this._data.length === 0) {
                        return;
                    }
                    var ix = textEl.attr('cell-index');
                    var className = textEl.find('div.sortable').prop('className') || '';
                    var isAsc = className.indexOf('asc') === -1 ? false : true;
                    var sortorder = isAsc ? 'desc' : 'asc';
                    var descClass = Grid.Classes.W_GRID_SORT_DESC;
                    var ascClass = Grid.Classes.W_GRID_SORT_ASC;
                    var sortableEls = header.find('.' + Grid.Classes.W_GRID_SORTABLE);

                    sortableEls.find('div.sortable').remove();
                    textEl.append($('<div>').addClass('sortable').addClass(sortorder));
                    this._sort(ix, col.sorttype, sortorder);
                    this.setData(this._data);
                }, this));
            }
        }, this);
        $('<div/>').appendTo(this.getElement()).addClass(Grid.Classes.W_GRID_RESIZE_BAR);
        this._bodyContainer.render(body[0]);
    };

    Grid.prototype.setLastSortor = function(index, sorttype, sortorder) {
        if (!this.lastSortor[this.currentTag]) {
            this.lastSortor[this.currentTag] = {};
        }
        this.lastSortor[this.currentTag].index = index;
        this.lastSortor[this.currentTag].sorttype = sorttype;
        this.lastSortor[this.currentTag].sortorder = sortorder;
    };

    Grid.prototype._sort = function(index, sorttype, sortorder) {
        var data = this._data;
        var col = this._getColByIndex(index);
        this.setLastSortor(index, sorttype, sortorder);
        sorttype = sorttype || 'text';
        if ( typeof sorttype == 'function') {
            data.sort(sorttype);
        } else {
            data.sort(function(a, b) {
                if (col.dataType == 'object') {
                    a = a[index].getValue();
                    b = b[index].getValue();
                }

                if (sorttype == 'text') {
                    if (col.dataType !== 'object') {
                        if (a[index]) {
                            a = a[index].toString();
                        } else {
                            a = '';
                        }
                        if (b[index]) {
                            b = b[index].toString();
                        } else {
                            b = '';
                        }
                    }
                    return sortorder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
                } else if (sorttype === 'number') {
                    if (col.dataType !== 'object') {
                        a = parseFloat(a[index]);
                        b = parseFloat(b[index]);
                    } else {
                        a = parseFloat(a);
                        b = parseFloat(b);
                    }
                    return sortorder === 'asc' ? (a - b) : (b - a);
                }
            });
        }
    };

    Grid.prototype._getColByIndex = function(index) {
        var r = this._config.colModel.filter(function(col) {
            if (col.index === index) {
                return true;
            }
            return false;
        });
        return (r.length > 0 ? r[0] : null);
    };

    Grid.prototype._startResize = function(e) {
        var resizing = this._resizingStatus, resizeBar = null;

        this._resizingStatus.resizing = true;
        resizing.start = e.clientX;
        resizing.cell = $(e.target).closest('.' + Grid.Classes.W_GRID_COLUMN).attr('cel-index');

        $(doc).bind('mousemove', $.proxy(this._moveResize, this));
        resizeBar = this.getElement().find('.' + Grid.Classes.W_GRID_RESIZE_BAR).show(100);
        resizeBar.offset({
            left : e.clientX
        });

        $(doc).bind('mouseup', $.proxy(this._endResize, this))
    };

    Grid.prototype._moveResize = function(e) {
        this.getElement().find('.' + Grid.Classes.W_GRID_RESIZE_BAR).offset({
            left : e.clientX
        });
    };

    Grid.prototype._endResize = function(e) {
        $(doc).unbind('mousemove');
        if (!this._resizingStatus.resizing)
            return;

        var resizing = this._resizingStatus, resizeingGap = 0, col = this._getColByIndex(resizing.cell), newWidth = col.width, totalWidth = 0;

        resizing.end = e.clientX;
        resizeingGap = resizing.end - resizing.start;

        if (resizeingGap < 0) {
            newWidth = col.width - Math.abs(resizeingGap);
            newWidth = newWidth < 0 ? 12 : col.width - Math.abs(resizeingGap);
        }
        if (resizeingGap >= 0) {
            newWidth = col.width + Math.abs(resizeingGap);
        }
        col.width = newWidth;

        _.each(this._config.colModel, function(col) {
            totalWidth += col.width;
        }, this);
        this.getElement().find('[cel-index="' + resizing.cell + '"]').width(newWidth);
        this.getElement().find('.' + Grid.Classes.W_GRID_ROW).width(totalWidth + (this._config.checkboxColWidth || 0));
        this.getElement().find('.' + Grid.Classes.W_GRID_RESIZE_BAR).hide();
        resizing.reset();
        $(doc).unbind('mouseup')
    };

    Grid.prototype._clickGrid = function(e) {
        var role = e.target.dataset['role'], that = this, classes = Grid.Classes;

        if (role === 'row-checkbox' || (!!this._config.isContentMultiSelected && role !== 'm-status')) {
            var row = $(e.target).closest('.' + classes.W_GRID_ROW);
            var id = row.attr('id');

            if (row.hasClass(classes.W_GRID_HIGHLIGHT)) {
                this.unHighlightRow(id);
                this._shiftUncheckedData(id);
                this.trigger(Grid.Events.UNSELECT, id);
            } else {
                this.highlightRow(id);
                this._shiftCheckedData(id);
                this.trigger(Grid.Events.SELECT, id);
            }
        } else if (role === 'm-status') {
            var el = $(e.target);
            if (!e.target.checked) {
                e.target.checked = false;
                el.removeClass(classes.W_CHECKBOX_FULL_CHECKED + ' ' + classes.W_CHECKBOX_PART_CHECKED);

                this._element.find('.' + classes.W_GRID_ROW).each(function() {
                    $(this).removeClass(classes.W_GRID_HIGHLIGHT);
                    $(this).find('input:checkbox').prop('checked', false);
                });
                this._checkedMap.clear();
                this.trigger(Grid.Events.UNSELECT_ALL);
                this._checkedMap.setShiftUncheckedData('');
            } else {
                var ids = [];
                el.addClass(classes.W_CHECKBOX_FULL_CHECKED);
                this._element.find('.' + classes.W_GRID_ROW).each(function() {
                    $(this).addClass(classes.W_GRID_HIGHLIGHT);
                    $(this).find('input:checkbox').prop('checked', true);
                });
                _.each(this._bodyContainer.getData(), function(data) {
                    this._checkedMap.push(data.id, data);
                    ids.push(data.id);
                }, this);
                this.trigger(Grid.Events.SELECT_ALL, ids);
                this._checkedMap.setLastCheckedData('');
            }
        } else {
            var row = $(e.target).closest('.' + classes.W_GRID_ROW), id = row.attr('id');

            if (window.event.ctrlKey && window.event.shiftKey) {
                if (row.hasClass(classes.W_GRID_HIGHLIGHT)) {
                    this.unHighlightRow(id);
                    this._shiftUncheckedData(id);
                    this.trigger(Grid.Events.UNSELECT, id);
                } else {
                    this.highlightRow(id);
                    this._shiftCheckedData(id);
                    this.trigger(Grid.Events.SELECT, id);
                }
            } else {
                this._element.find('.' + classes.W_GRID_ROW).removeClass(classes.W_GRID_HIGHLIGHT).find('input:checkbox').prop('checked', false);
                row.addClass(classes.W_GRID_HIGHLIGHT).find('input:checkbox').prop('checked', true);

                this._checkedMap.clear();
                this._checkedMap.push(id, this._getDataById(id));
                this.trigger(Grid.Events.SELECT, id);
            }
        }

        that.setAllChecboxStatus();
    };

    Grid.prototype._shiftUncheckedData = function(id) {
        var lastUncheckedData = this._checkedMap.getShiftUncheckedData();
        var lastCheckedData = this._checkedMap.getLastCheckedData();
        var nowUnCheckdData = this._getDataById(id);

        if (window.event.shiftKey) {
            var lastIndex = this._data.indexOf(lastUncheckedData);
            var nowIndex = this._data.indexOf(nowUnCheckdData);
            var unSelectedData = [];
            if (nowIndex <= lastIndex) {
                var temp = lastIndex;
                lastIndex = nowIndex;
                nowIndex = temp;
            }
            unSelectedData = this._data.slice(lastIndex, nowIndex);
            _.each(unSelectedData, function(data) {
                this.unHighlightRow(data.id);
            }, this);

            this._checkedMap.setShiftUncheckedData(nowUnCheckdData);
        } else {
            this._checkedMap.setShiftUncheckedData('');
        }
        if (nowUnCheckdData === lastCheckedData) {
            this._checkedMap.setLastCheckedData('');
        }
    };

    Grid.prototype._shiftCheckedData = function(id) {
        var lastUncheckedData = this._checkedMap.getShiftUncheckedData();
        var lastCheckedData = this._checkedMap.getLastCheckedData();
        var nowCheckdData = this._getDataById(id);

        if (window.event.shiftKey && lastCheckedData) {
            var lastIndex = this._data.indexOf(lastCheckedData);
            var nowIndex = this._data.indexOf(nowCheckdData);
            var selectedData = [];

            if (nowIndex <= lastIndex) {
                var temp = lastIndex;
                lastIndex = nowIndex;
                nowIndex = temp;
            }
            selectedData = this._data.slice(lastIndex, nowIndex);
            _.each(selectedData, function(data) {
                this.highlightRow(data.id);
            }, this);
        }
        this._checkedMap.setLastCheckedData(this._getDataById(id));
        if (nowCheckdData === lastUncheckedData) {
            this._checkedMap.setShiftUncheckedData('');
        }
    };

    Grid.prototype._getDataById = function(dataId) {
        var datas = this._bodyContainer.getData(), len = datas.length;

        for (var i = 0; i < len; i++) {
            if (datas[i].id == dataId) {
                return datas[i];
            }
        }
        datas = null;
    };

    Grid.prototype.selectSingleRow = function(id, opt) {
        var opt = opt || {};
        this._element.find('.' + Grid.Classes.W_GRID_ROW).removeClass(Grid.Classes.W_GRID_HIGHLIGHT).find('input:checkbox').prop('checked', false);
        this._checkedMap.clear();
        this.highlightRow(id);
        if (!opt.silent) {
            this.trigger(Grid.Events.SELECT, id);
        }
    };

    Grid.prototype.highlightRow = function(row) {
        var id = '';
        var data = null;
        if (W.isString(row)) {
            id = row;
            row = this._element.find('#' + row);
        } else {
            id = row.attr('id');
        }
        if (!row.hasClass(Grid.Classes.W_GRID_HIGHLIGHT)) {
            row.addClass(Grid.Classes.W_GRID_HIGHLIGHT);
            row.find('input:checkbox').prop('checked', true);
        }
        data = this._getDataById(id);
        if (data) {
            this._checkedMap.push(id, this._getDataById(id));
        }
    };
    /**
     * @param {Object || String} row parameter is row id or row element.
     */
    Grid.prototype.unHighlightRow = function(row) {
        var id = '';
        if (W.isString(row)) {
            id = row;
            row = this._element.find('#' + row);
        } else {
            id = row.attr('id');
        }
        if (row.hasClass(Grid.Classes.W_GRID_HIGHLIGHT)) {
            row.removeClass(Grid.Classes.W_GRID_HIGHLIGHT);
            row.find('input:checkbox').prop('checked', false);
        }
        this._checkedMap.remove(id);
    };

    Grid.prototype.render = function(opt_parent) {
        var self = this;

        Grid._super_.render.call(this, opt_parent);

        if (!this._element) {
            this._element = $('<div></div>').addClass(Grid.Classes.W_GRID);
            this._isRendered = true;
        }

        this._initCheckedMap();
        this._element.appendTo(opt_parent || document.body);
        this._buildGrid();

        this._bodyContainer.bind(HighPerformanceContainer.Events.SCROLL_TOP, function(data, isFirst, isLast) {
            this.renderViewRows(data, isFirst, isLast);
        }, this);
        this._bodyContainer.bind(HighPerformanceContainer.Events.SCROLL_LEFT, function(left) {
            self.getElement().find('.' + Grid.Classes.W_GRID_HEADER_ROW).prop('scrollLeft', left);
        });

        this._bodyContainer.setData(this._data);
        this.setAllChecboxStatus();
    };

    Grid.prototype.hideAllRows = function() {
        var list = this.reusedList.list;
        _.each(list, function(item) {
            item.row.addClass(Grid.Classes.W_GRID_ROW_HIDE);
        });
    };

    Grid.prototype.renderViewRows = function(list, isFirst, isLast) {
        var forceToShowRowData = null;
        if (isFirst) {
            forceToShowRowData = list[0];
        } else if (isLast) {
            forceToShowRowData = list[list.length - 1];
        }

        this.hideAllRows();
        this.reusedList.resetUnusedRow();
        this.reusedList.resetUnusedColumnList();

        if (list && list.length > 0 && list[0].letter && this._bodyContainer.isShowHighlightTip) {
            this._bodyContainer.showHighlightTip(list[0].letter);
        }

        _.each(list, function(data) {
            try {
                this.addRow(data);
            } catch(e) {
                this.addRow(data);
            }
        }, this);
        if (forceToShowRowData) {
            try {
                doc.getElementById(forceToShowRowData.id).scrollIntoView();
            } catch(e) {
                console.log('exception');
            }
        }
    };

    Grid.prototype.getMinutesFromMilisecond = function(milisecond) {
        var devide = 1000 * 60;
        var minute = parseInt(milisecond / devide);
        var second = new String((milisecond % devide) / 1000).toString();
        if (second < 10) {
            second = '0' + second;
        }
        minute = minute + ':' + second.substring(0, 2);
        return minute;
    };

    Grid.prototype.addRow = function(rowData, pos) {
        if (!rowData || rowData.id === undefined) {
            throw new Error('the rowData is invalid, the rowData or id property of rowData shouldn\'t be null or undefind ');
        }

        var isChecked = !!this._checkedMap.get(rowData.id);
        var reusedRow = this.reusedList.getReusedRow();
        var rowEl = reusedRow.row.attr('id', rowData.id).empty();
        var isMultiSelectable = this._config.multiSelectable;
        var totalWidth = 0;
        if (W.isBoolean(isMultiSelectable) && isMultiSelectable) {
            var checkboxColumn = reusedRow.checkboxColumn;
            checkboxColumn.width(this._config.checkboxColWidth).appendTo(rowEl);
            totalWidth += this._config.checkboxColWidth;
        }
        var fragment = doc.createDocumentFragment();
        _.each(this._config.colModel, function(col) {
            var colEl = this.reusedList.getReusedColumn().attr('cel-index', col.index);
            colEl[0].innerHTML = '';
            if (col.dataType === 'object') {
                rowData[col.index].render(colEl);
            } else {
                var text = '';
                if (col.dataType === 'size') {
                    text = W.String.readableSize(rowData[col.index]);
                } else if (col.dataType == 'time') {
                    text = this.getMinutesFromMilisecond(rowData[col.index]);
                } else {
                    text = rowData[col.index] || '';
                }
                colEl.html('<text class="wc">' + (text || '') + '</text>');
            }
            W.isNumber(col.width) ? colEl.width(col.width) : colEl.addClass(Grid.Classes.W_GRID_COLUMN_FLEX);
            fragment.appendChild(colEl[0]);
            totalWidth += col.width;
        }, this);
        rowEl.append(fragment);
        rowEl.removeClass(Grid.Classes.W_GRID_ROW_HIDE);
        rowEl.width(totalWidth).height(this._bodyContainer.getItemSize() - 2);
        this[!!isChecked ? 'highlightRow' : 'unHighlightRow'](rowEl);
    };

    Grid.prototype.removeRow = function(id) {
        var row = this._element.find('#' + id);
        if (row) {
            row.addClass(Grid.Classes.W_GRID_ROW_HIDE);
            this.unHighlightRow(id);
        }
        this._checkedMap.remove(id);
    };

    Grid.prototype.setData = function(data) {
        refreshGridContent = true;
        if (this._isRendered) {
            this._data = data;
            var lastSortor = this.lastSortor[this.currentTag];
            if (lastSortor) {
                this._sort(lastSortor.index, lastSortor.sorttype, lastSortor.sortorder);
            }

            this._bodyContainer.setData(data);
            this.setAllChecboxStatus();
        } else {
            this._data = data;
        }
        refreshGridContent = false;
    };

    Grid.prototype.getData = function() {
        return this._data;
    };

    Grid.prototype.getCheckedData = function() {
    	if(this._checkedMap) {
    		return this._checkedMap.getAll();
    	} else {
    		return [];
    	}
    };

    Grid.prototype.setContent = function(content) {
        this._bodyContainer.setContent(content);
    };

    Grid.prototype.clearContent = function() {
        this.hideAllRows();
        this._bodyContainer.clearContent();
        this._checkedMap.clear();
        this.setData([]);
    };

    Grid.prototype.makeRowShow = function(id) {
        for (var i = 0; i < this._data.length; i++) {
            if (this._data[i].id === id) {
                this._bodyContainer.showContentByPos(i);
                break;
            }
        }
    };

    Grid.Classes = {
        W_GRID : 'w-grid',
        W_GRID_HEADER : 'w-grid-header',
        W_GRID_HEADER_ROW : 'w-grid-header-row',
        W_GRID_BODY : 'w-grid-body',
        W_GRID_COLUMN : 'w-grid-column',
        W_GRID_COLUMN_LABEL : 'w-grid-column-label',
        W_GRID_COLUMN_CHECKBOX : 'w-grid-column-checkbox',
        W_GRID_ROW : 'w-grid-row',
        W_GRID_HIGHLIGHT : 'highlight',
        W_GRID_COLUMN_FLEX : 'w-grid-column-flex',
        W_CHECKBOX_FULL_CHECKED : 'w-checkbox-full-checked',
        W_CHECKBOX_PART_CHECKED : 'w-checkbox-part-checked',
        W_GRID_RESIZABLE : 'w-grid-resizable',
        W_GRID_SORTABLE : 'w-grid-sortable',
        W_GRID_RESIZE_BAR : 'w-grid-resize-bar',
        W_GRID_ROW_HIDE : 'w-grid-row-hide',

        W_GRID_SORT_DESC : 'w-grid-sort-desc',
        W_GRID_SORT_ASC : 'w-grid-sort-asc'
    };

    W.ui.Grid = Grid;
});
wonder.useModule('ui/grid');
