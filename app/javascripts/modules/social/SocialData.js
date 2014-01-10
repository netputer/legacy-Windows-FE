/*global define*/
(function (window) {
    define([
        'jquery',
        'IO',
        'Configuration'
    ], function (
        $,
        IO,
        Configuration
    ) {
        var SocialData = function () {

            return {
                getUserAuthAsync : function (authSuccess, authFail, error) {
                    var deferred = $.Deferred();

                    IO.requestAsync({
                        url : Configuration.actions.USER_SHOW,
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                if (authSuccess) {
                                    authSuccess.call(this, resp.body);
                                }
                                deferred.resolve(resp);
                            } else if (resp.state_code === 401) {
                                if (authFail) {
                                    authFail.call(this, resp.body);
                                }
                                deferred.reject(resp);
                            } else {
                                if (error) {
                                    error.call(this, resp.body);
                                }
                                deferred.reject(resp);
                            }
                        }
                    });

                    return deferred.promise();
                },

                authAsync : function (authData, authSuccess, authFail) {
                    var deferred = $.Deferred();

                    IO.requestAsync({
                        url : Configuration.actions.AUTH,
                        data : authData,
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                if (authSuccess) {
                                    authSuccess.call(this, resp.body);
                                }
                                deferred.resolve(resp);
                            } else {
                                if (authFail) {
                                    authFail.call(this, resp.body);
                                }
                                deferred.reject(resp);
                            }
                        }
                    });

                    return deferred.promise();
                },

                shareAsync : function (shareData, shareSuccess, authFail, error) {
                    var deferred = $.Deferred();

                    IO.requestAsync({
                        url : Configuration.actions.STATUS_UPLOAD,
                        data : shareData,
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                if (shareSuccess) {
                                    shareSuccess.call(this, resp.body);
                                }
                                deferred.resolve(resp);
                            } else if (resp.state_code === 401) {
                                if (authFail) {
                                    authFail.call(this, resp.body);
                                }
                                deferred.reject(resp);
                            } else {
                                if (error) {
                                    error.call(this, resp.body);
                                }
                                deferred.reject(resp);
                            }
                        }

                    });

                    return deferred.promise();
                },

                exitAuthAsync : function (success, error) {
                    var deferred = $.Deferred();

                    IO.requestAsync({
                        url : Configuration.actions.USER_LOGOUT,
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                if (success) {
                                    success.call(this, resp);
                                }
                                deferred.resolve(resp);
                            } else {
                                if (error) {
                                    error.call(this, resp);
                                }
                                deferred.reject(resp);
                            }
                        }
                    });

                    return deferred.promise();
                },

                viewOriginPicFromPicAsync : function (data, success, error) {
                    var deferred = $.Deferred();

                    IO.requestAsync({
                        url  : Configuration.actions.OPEN_FILE,
                        data : data,
                        success: function (resp) {
                            if (resp.state_code === 200) {
                                if (success) {
                                    success.call(this, resp);
                                }
                                deferred.resolve(resp);
                            } else {
                                if (error) {
                                    error.call(this, resp);
                                }
                                deferred.reject(resp);
                            }
                        }
                    });

                    return deferred.promise();
                },

                authInfoAsync : function (data, success, error) {
                    var deferred = $.Deferred();

                    IO.requestAsync({
                        url : Configuration.actions.AUTH_INFO,
                        data : data,
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                if (success) {
                                    success.call(this, resp);
                                }
                                deferred.resolve(resp);
                            } else {
                                if (error) {
                                    error.call(this, resp);
                                }
                                deferred.reject(resp);
                            }
                        }
                    });

                    return deferred.promise();
                },

                getTokenAsync : function (success, error) {
                    var deferred = $.Deferred();

                    IO.requestAsync({
                        url : Configuration.actions.GET_TOKEN,
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                if (success) {
                                    success.call(this, resp);
                                }
                                deferred.resolve(resp);
                            } else {
                                if (error) {
                                    error.call(this, resp);
                                }
                                deferred.reject(resp);
                            }
                        }
                    });

                    return deferred.promise();
                }
            };
        };

        var socialData = new SocialData();

        return socialData;
    });
}(this));
