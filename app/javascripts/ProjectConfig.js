/*global define*/
(function (window) {
    define([], function () {
        console.log('ProjectConfig - File loaded.');

        var localStorage = window.localStorage;
        var ProjectConfig = {};

        var config = JSON.parse(localStorage.getItem('projectConfig') || '{}');

        ProjectConfig.get = function (key) {
            return config[key] || false;
        };

        window.ProjectConfig = ProjectConfig;
        return ProjectConfig;
    });
}(this));
