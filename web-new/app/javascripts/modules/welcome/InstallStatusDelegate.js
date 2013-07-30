/*global define*/
(function (window) {
    define([
        'apps/collections/AppsCollection'
    ], function (
        AppsCollection
    ) {
        var appsCollection = AppsCollection.getInstance();

        var maps = {};

        var renderButtons = function () {
            appsCollection.each(function () {

            });
        };

        var InstallStatusDelegate = {};

        InstallStatusDelegate.add = function (packageName, $button) {
            maps[packageName] = maps[packageName] || [];
            maps[packageName].push($button);
        };

        InstallStatusDelegate.remove = function (packageName, $button) {
            maps[packageName].splice(maps[packageName].indexOf($button), 1);
        };


        return InstallStatusDelegate;
    });
}(this));
