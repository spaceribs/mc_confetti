'use strict';

angular.module('mcConfettiApp')
    .controller('PluginCtrl', ['$scope', 'mcApi', 'FileEditors', '$location', function ($scope, mcApi, FileEditors, $location) {

        $scope.initialize(function(){

            $scope.absPath = "plugins"+$scope.getPath($scope.activeItem);
            $scope.editorInclude = FileEditors.getEditor($scope.activeItem, $scope.plugin.name);

            $scope.readFile();
        });

        $scope.readFile = function() {
            mcApi.api.call('fs.readBinary', $scope.absPath, function(result){
                $scope.$apply(function(){
                    if ($scope.activeItem.type) {
                        $scope.activeItem[$scope.activeItem.type] = window.atob(result.success);
                    }
                });
            });
        };

        $scope.saveFile = function(e) {
            if (typeof e !== 'undefined') {
                e.preventDefault();
            }
            var data = window.btoa($scope.activeItem[$scope.activeItem.type]);
            mcApi.api.call('fs.writeBinary', [$scope.absPath, data], function(){
                $scope.readFile();
            });
        };

        $scope.createFile = function(e) {
            if (typeof e !== 'undefined') {
                e.preventDefault();
            }
            var filename = window.prompt("New Filename (with extension)","untitled.yml");
            if (filename) {
                mcApi.api.call('fs.createFile', $scope.absPath+'/'+filename, function(result){
                    $scope.$apply(function(){
                        $location.path('/'+result.success);
                    });
                });
            }
        };

        $scope.createDirectory = function(e) {
            if (typeof e !== 'undefined') {
                e.preventDefault();
            }
            var filename = window.prompt("New Foldername","untitled");
            if (filename) {
                mcApi.api.call('fs.createFolder', $scope.absPath+'/'+filename, function(result){
                    $scope.$apply(function(){
                        $location.path('/'+result.success);
                    });
                });
            }
        };

        $scope.deleteFile = function(e) {
            if (typeof e !== 'undefined') {
                e.preventDefault();
            }
            var confirm = window.confirm("Are you sure you want to delete this file?");

            if (confirm) {
                mcApi.api.call('fs.delete', $scope.absPath, function(){
                    $scope.$apply(function(){
                        var newPath = '/plugins'+$scope.getPathBack($scope.activeItem);
                        $location.path(newPath);
                    });
                });
            }
        };

        $scope.deleteDirectory = function(e) {
            if (typeof e !== 'undefined') {
                e.preventDefault();
            }
            var confirm = window.confirm("Are you sure you want to delete the current directory and all it's contents?");

            if (confirm) {
                mcApi.api.call('fs.delete', $scope.absPath, function(){
                    $scope.$apply(function(){
                        var newPath = '/plugins'+$scope.getPathBack($scope.activeItem);
                        $location.path(newPath);
                    });
                });
            }
        };

    }]);
