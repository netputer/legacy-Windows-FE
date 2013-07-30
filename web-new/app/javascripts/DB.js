/*global define*/
(function (window) {
    define(['jquery'], function ($) {
        var db;

        $(function () {
            var openRequest = window.indexedDB.open('wandoujia2', 1);

            openRequest.onupgradeneeded = function (evt) {
                db = evt.target.result;
                var store = db.createObjectStore('welcome', {
                    keyPath : 'key'
                });
            };

            openRequest.onsuccess = function (evt) {
                db = evt.target.result;
            };
        });

        var DB = {};

        DB.addOrUpdateAsync = function (table, value) {
            var deferred = $.Deferred();

            if (db) {
                var request = db.transaction(table, 'readwrite')
                            .objectStore(table)
                            .put(value);

                request.oncomplete = deferred.resolve;
            } else {
                setInterval(function () {
                    DB.addOrUpdateAsync(table, value);
                }, 10);
            }

            return deferred.promise();
        };

        DB.readAsync = function (table, key) {
            var deferred = $.Deferred();

            if (db) {
                var request = db.transaction(table, 'readonly')
                            .objectStore(table)
                            .get(key);

                request.onsuccess = deferred.resolve;
            } else {
                setInterval(function () {
                    DB.readAsync(table, key);
                }, 10);
            }

            return deferred.promise();
        };

        return DB;
    });
}(this));
