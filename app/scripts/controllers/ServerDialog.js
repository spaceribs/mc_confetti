'use strict';

angular.module('mcConfettiApp')
    .controller('ServerDialogCtrl', ['$scope', 'mcApi', 'dialog', 'localStorageService', function ($scope, mcApi, dialog, localStorageService) {

        $scope.host = '';
        $scope.port = 20059;
        $scope.salt = '';
        $scope.remember = true;
        $scope.loading = false;

        $scope.connection = {
            connected: false,
            error: false
        };

        $scope.login = {
            loggedin: false,
            error: false
        };

        $scope.connect = function () {

            mcApi.config($scope.host, $scope.port, $scope.salt, function (result) {

                $scope.$apply(function () {

                    if (result.result === "success") {

                        $scope.connection.connected = true;
                        $scope.connection.error = false;

                        mcApi.login($scope.username, $scope.password, function (result) {
                            $scope.$apply(function () {

                                $scope.loading = false;

                                if (result.result === "success") {

                                    $scope.login.loggedin = true;
                                    $scope.login.error = false;

                                    var session = {
                                        host : $scope.host,
                                        port : $scope.port,
                                        salt : $scope.salt,
                                        username : $scope.username,
                                        password : $scope.password
                                    };

                                    localStorageService.cookie.add('session', JSON.stringify(session));

                                    dialog.close({
                                        server : result.success,
                                        session : session
                                    });

                                } else {

                                    $scope.login.loggedin = false;
                                    $scope.login.error = result.error;

                                }
                            });
                        });

                    } else {

                        $scope.loading = false;
                        $scope.connection.connected = false;
                        $scope.connection.error = result.error;

                    }

                });

            });
        };
    }]);
