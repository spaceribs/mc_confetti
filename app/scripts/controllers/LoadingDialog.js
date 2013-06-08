'use strict';

angular.module('mcConfettiApp')
    .controller('LoadingDialogCtrl', ['$scope', 'loading', 'server', function ($scope, loading, server) {
        $scope.stopConnecting = function(){
            loading.close();
            server.open();
        };
    }]);
