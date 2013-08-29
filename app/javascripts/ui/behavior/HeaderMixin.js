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

            this.listenToCollection.comparator = function (current) {
                var json = current.toJSON();

                var key = json;
                var i;

                for (i = 0; i < sortBy.length; i++) {
                    key = key[sortBy[i]];
                }

                if (sortBy[0] === 'update') {
                    return key + json.base_info.name;
                }

                return sortType === 'string' ? key : Number(key);
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
