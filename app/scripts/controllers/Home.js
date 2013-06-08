'use strict';

angular.module('mcConfettiApp')
    .controller('HomeCtrl', ['$scope', 'mcApi', function ($scope, mcApi) {

        $scope.initialize(function(){

        });

        function reloadPlugins() {
            mcApi.api.call('getPlugins', function(result){
                $scope.$apply(function(){
                    $scope.plugins = result.success;
                });
            });
        }

        $scope.disablePlugin = function(name) {
            mcApi.api.call('disablePlugin', name, function(){
                reloadPlugins();
            });
        };

        $scope.enablePlugin = function(name) {
            mcApi.api.call('enablePlugin', name, function(){
                reloadPlugins();
            });
        };
    }]);
