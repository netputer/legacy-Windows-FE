/*global console, define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'ui/behavior/DataSetMixin'
    ], function (
        _,
        $,
        DataSetMixin
    ) {
        console.log('HeaderMixin - File loaded.');

        var insertSortIcon = function ($header) {
            var $sortables = $header.find('.smart-list-sortable');
            $sortables.append($('<span>').addClass('sort-icon'));
        };

        var sortModels = function ($column, asc) {
            if (this.$header) {
                this.$header.find('.smart-list-sortable').toggleClass('asc', false).toggleClass('desc', false);
            }

            $column.toggleClass('asc', !asc);
            $column.toggleClass('desc', asc);

            this.$el.data({
                'smart-list-sortby' : $column.data('smart-list-sortby'),
                'smart-list-sort-type' : $column.data('smart-list-sort-type')
            });

            this.sortModels(asc);
        };

        var sortableClickHandler = function (evt) {
            var $column = $(evt.currentTarget);

            sortModels.call(this, $column, $column.hasClass('asc'));

            this.build();
        };

        var HeaderMixin = {};

        HeaderMixin.headerMixinInit = function () {
            var $header = this.$header;
            var $sortables = $header.find('.smart-list-sortable');

            insertSortIcon.call(this, $header);
            $sortables.on('click', sortableClickHandler.bind(this));
        };

        HeaderMixin.switchComparator = function () {
            if (this.$header !== undefined) {
                var $header = this.$header;
                var $currentSelectedColumn = $header.find('.asc, .desc');
                if ($currentSelectedColumn.length > 0) {
                    sortModels.call(this, $currentSelectedColumn, !$currentSelectedColumn.hasClass('asc'));
                }
            }
        };

        HeaderMixin.sortModels = function (asc) {
            var sortBy = this.$el.data('smart-list-sortby') && this.$el.data('smart-list-sortby').split('.');
            var sortType = this.$el.data('smart-list-sort-type');

            this.listenToCollection.comparator = function (a, b) {
                a = a.toJSON();
                b = b.toJSON();

                var i;
                for (i = 0; i < sortBy.length; i++) {
                    a = a[sortBy[i]];
                    b = b[sortBy[i]];
                }

                var result;
                if (sortType === 'string') {
                    result = asc ? a.localeCompare(b) : b.localeCompare(a);
                } else if (sortType === 'number') {
                    result = asc ? (a - b) : (b - a);
                }
                return result;
            };
            this.listenToCollection.sort();
        };

        return {
            mixin : function (that) {
                _.extend(that, HeaderMixin);

                var $header;
                Object.defineProperties(that, {
                    $header : {
                        set : function (value) {
                            $header = value;
                            HeaderMixin.headerMixinInit.call(that);
                        },
                        get : function () {
                            return $header;
                        }
                    }
                });

                if (that.options.hasOwnProperty('$header')) {
                    this.$header = that.options.$header;
                }
            }
        };
    });
}(this));
