/*global define, Backbone, _, $*/
(function (window, undefined) {
    define([
        'IOBackendDevice',
        'Configuration'
    ], function (
        IO,
        CONFIG
    ) {
        console.log('MusicModel - File loaded. ');

        var MusicModel = Backbone.Model.extend({
            defaults : {
                title : '',
                artist : '',
                duration : 0,
                format : '',
                size : 0,
                album : '',
                playing : false,
                loading : false,
                error : false
            },
            initialize : function () {
                var displayName = this.get('display_name');
                var format;

                if (displayName !== undefined) {
                    displayName = displayName.split('.');

                    if (displayName.length > 1) {
                        format = displayName[displayName.length - 1];
                    }
                }
                this.set({
                    artist : this.get('artist') || this.get('artist_name') || '',
                    album : this.get('album') || this.get('album_name') || '',
                    format : this.get('format') || format || this.get('mime_type').replace('audio/', '')
                });
            },
            getPathAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_LOAD,
                    data : {
                        music_id : this.id
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MusicModel - Delete success. ');
                            deferred.resolve(resp);
                        } else {
                            console.error('MusicModel - Delete faild. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            setRingAsync : function (type) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_SET_RINGTONE,
                    data : {
                        music_id : this.id,
                        type : type
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MusicModel - Set ring success. ');

                            switch (type) {
                            case 0:
                                this.collection.settings.ringtone = this.id;
                                break;
                            case 1:
                                this.collection.settings.notification = this.id;
                                break;
                            case 2:
                                this.collection.settings.alarm = this.id;
                                break;
                            }

                            deferred.resolve(resp);
                        } else {
                            console.error('MusicModel - Set ring faild. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            }
        });

        return MusicModel;
    });
}(this));