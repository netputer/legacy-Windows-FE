/*global define*/
(function (window) {
    define(['jquery'], function ($) {
        var db;

        var openDataBaseAsync = function () {
            var deferred = $.Deferred();

            var openRequest = window.indexedDB.open('wandoujia2', 1);

            openRequest.onupgradeneeded = function (evt) {
                db = evt.target.result;
                var store = db.createObjectStore('welcome', {
                    keyPath : 'key'
                });
            };

            openRequest.onsuccess = function (evt) {
                db = evt.target.result;
                deferred.resolve();
            };

            return deferred.promise();
        };

        var DB = {};

        DB.addOrUpdateAsync = function (table, value) {
            var deferred = $.Deferred();

            var doAction = function () {
                var request = db.transaction(table, 'readwrite')
                            .objectStore(table)
                            .put(value);

                request.oncomplete = deferred.resolve;
            };

            if (db) {
                doAction();
            } else {
                openDataBaseAsync().done(doAction);
            }

            return deferred.promise();
        };

        DB.readAsync = function (table, key) {
            var deferred = $.Deferred();

            var doAction = function () {
                var request = db.transaction(table, 'readonly')
                            .objectStore(table)
                            .get(key);

                request.onsuccess = deferred.resolve;
            };

            if (db) {
                doAction();
            } else {
                openDataBaseAsync().done(doAction);
            }

            return deferred.promise();
        };

        return DB;
    });
}(this));
