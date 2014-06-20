/*global console, define*/
(function (window) {
    define([
        'underscore',
        'jquery'
    ], function (
        _,
        $
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

            this.rebuild();
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
                var keyA = a.toJSON();
                var keyB = b.toJSON();

                if (sortBy[0] === 'update') {
                    sortType = 'string';

                    keyA = keyA.update + keyA.base_info.name;
                    keyB = keyB.update + keyB.base_info.name;
                } else {
                    var i;
                    for (i = 0; i < sortBy.length; i++) {
                        keyA = keyA[sortBy[i]];
                        keyB = keyB[sortBy[i]];
                    }
                }

                var result;
                if (sortType === 'string') {
                    result = asc ? keyA.localeCompare(keyB) : keyB.localeCompare(keyA);
                } else if (sortType === 'number') {
                    result = asc ? (keyA - keyB) : (keyB - keyA);
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
