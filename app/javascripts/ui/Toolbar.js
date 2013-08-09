/*global define*/
(function (window) {
    define(['backbone'], function (Backbone) {
        console.log('Toolbar - File loaded.');

        var Toolbar = Backbone.View.extend({
            className : 'w-ui-toolbar hbox'
        });

        return Toolbar;
    });
}(this));
