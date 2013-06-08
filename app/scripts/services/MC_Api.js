'use strict';

angular.module('mcConfettiApp')
    .factory('mcApi', ['localStorageService', function (localStorageService) {

        var options = {
            hostname: "localhost",
            port: 20059
        };

        return {
            api : null,
            config : function(hostname, port, salt, callback) {

                if (typeof callback === "undefined") {
                    callback = function(){};
                }

                options.hostname = hostname;
                options.port = port;
                options.salt = salt;
                this.api = new JSONAPI(options);

                localStorageService.add();

                this.api.call('getPlayerLimit', undefined, callback);
            },
            login : function(username, password, callback) {

                if (typeof callback === "undefined") {
                    callback = function(){};
                }

                options.username = username;
                options.password = password;
                this.api = new JSONAPI(options);

                this.api.call('getServer', undefined, callback);
            },
            logout : function() {
                delete options.username;
                delete options.password;
                delete options.salt;
                this.api = null;
            }
        };

    }]);
