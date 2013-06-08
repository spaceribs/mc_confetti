'use strict';

angular.module('mcConfettiApp')
    .controller('MainCtrl', [
        '$scope',
        '$dialog',
        'localStorageService',
        'mcApi',
        'mcIgnore',
        '$timeout',
        '$routeParams',
        function ($scope, $dialog, localStorageService, mcApi, mcIgnore, $timeout, $routeParams) {

            var serverDialog = {
                backdrop: true,
                keyboard: false,
                backdropClick: false,
                templateUrl: 'includes/serverDialog.html',
                controller: 'ServerDialogCtrl'
            };

            var reloadDialog = {
                backdrop: true,
                keyboard: false,
                backdropClick: false,
                templateUrl: 'includes/reloadDialog.html'
            };

            var loadingDialog = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                resolve: {
                    loading: function(){ return $scope.loadingDialog; },
                    server: function(){ return $scope.serverDialog; }
                },
                templateUrl: 'includes/loadingDialog.html',
                controller: 'LoadingDialogCtrl'
            };

            $scope.loadingDialog = $dialog.dialog(loadingDialog);
            $scope.serverDialog = $dialog.dialog(serverDialog);
            $scope.reloadDialog = $dialog.dialog(reloadDialog);

            $scope.session = JSON.parse(localStorageService.cookie.get('session'));
            $scope.route = $routeParams;

            $scope.activePlugin = null;
            $scope.activePath = null;
            $scope.activeItemName = null;
            $scope.activeItem = null;

            $scope.initialize = function(callback){

                if (typeof callback === "undefined") {
                    callback = function(){};
                }

                function routeDir() {
                    $scope.$apply(function () {
                        if ($scope.route.filepath) {
                            var path = $scope.route.filepath.split('/');

                            var tempdir = $scope.plugin;
                            var tempitem = $scope.plugin;

                            if (path.length) {

                                angular.forEach(path, function(val){
                                    var filename = val.split('.');
                                    var type, name;

                                    if (filename.length > 1) {
                                        type = filename.pop();
                                        name = filename.join('.');
                                    } else {
                                        name = filename[0];
                                    }

                                    var dir = _.findWhere(tempdir.files, {name:name, type:type});
                                    if (dir) {
                                        tempitem = dir;
                                        if (dir.directory) {
                                            tempdir = dir;
                                        }
                                    }
                                });
                            }

                            $scope.activeDir = tempdir;
                            $scope.activeItem = tempitem;

                        } else {

                            $scope.activeDir = $scope.plugin;
                            $scope.activeItem = $scope.plugin;
                        }
                    });
                }

                function postLogin(login) {
                    mcApi.api.call('getPlugins', undefined, function (result) {
                        $scope.$apply(function () {
                            $scope.session = login.session;
                            $scope.server = login.server;
                            $scope.plugins = result.success;
                            if ($routeParams.plugin) {
                                $scope.getPluginFiles($routeParams.plugin, function(){
                                    routeDir();
                                    callback();
                                });
                            }
                        });
                    });
                }

                if (!$scope.session) {
                    $scope.serverDialog.open().then(postLogin);
                } else {

                    var auth = $scope.session;
                    $scope.loadingDialog.open();

                    mcApi.config(auth.host, auth.port, auth.salt, function (result) {
                        if (result.result === "success") {
                            mcApi.login(auth.username, auth.password, function (result) {
                                $scope.loadingDialog.close();
                                if (result.result === "success") {
                                    postLogin({
                                        server : result.success,
                                        session : $scope.session
                                    });
                                } else {
                                    $scope.serverDialog.open().then(postLogin);
                                }
                            });
                        } else {
                            $scope.loadingDialog.close();
                            $scope.serverDialog.open().then(postLogin);
                        }
                    });
                }
            };

            $scope.getPath = function(item){
                if (item) {
                    var filename = item.name;
                    var path = '';

                    if (item.type) {
                        filename = item.name+'.'+item.type;
                    }

                    if (item.path.length) {
                        path += '/';
                        path += _.reduce(item.path, function(memo, val){
                            return memo + '/' + val;
                        });
                    }

                    return path+"/"+filename;
                } else {
                    return $scope.activePlugin;
                }
            };

            $scope.getPathBack = function(item){
                if (item) {

                    var path = '';

                    if (item.path.length) {
                        path += '/';
                        path += _.reduce(item.path, function(memo, val){
                            return memo + '/' + val;
                        });
                    }

                    return path+"/";
                } else {
                    return $scope.activePlugin;
                }
            };

            $scope.getPluginPath = function(pathname, index){
                return 'plugins/'+_.reduce(pathname.slice(0,index+1), function(memo, val){
                    return memo + '/' + val;
                });
            };

            $scope.listDirectory = function(path){
                var dir = path.split("/");

                var pathto = _.reject(dir, function(val){
                    return val === "" || val === "plugins";
                });

                pathto.pop();

                if (path.lastIndexOf("/") === path.length-1) {
                    return {
                        name : dir[dir.length-2],
                        directory: true,
                        path : pathto,
                        files : null
                    };
                } else {
                    var filename = dir[dir.length-1].split(".");
                    var type = filename.pop();
                    var name = filename.join('.');
                    return {
                        type : type,
                        name : name,
                        path : pathto,
                        valid : true,
                        yaml : "",
                        data : {},
                        directory: false
                    };
                }
            };

            var foldersLeft = 0;

            $scope.exploreRecursively = function(dirpath, dirlist, callback) {
                var dirs = _.where(dirlist, {directory:true});
                if (dirs.length) {
                    foldersLeft += dirs.length;
                    angular.forEach(dirs, function(dir){
                        mcApi.api.call('fs.listDirectory', dirpath+'/'+dir.name, function (result) {
                            dir.files = _.map(result.success, $scope.listDirectory);
                            dir.files = _.reject(dir.files, function(file){
                                return (file.name === "") ||
                                    _.contains(mcIgnore, file.type);
                            });
                            foldersLeft -= 1;
                            $scope.exploreRecursively(dirpath+'/'+dir.name, dir.files, callback);
                        });
                    });
                } else if (foldersLeft === 0) {
                    callback();
                }
            };

            $scope.getPluginFiles = function(plugin, callback) {
                mcApi.api.call('fs.listDirectory', 'plugins/'+plugin, function (result) {

                    var files = result.success;

                    $scope.$apply(function () {
                        var directory = _.map(files, $scope.listDirectory);

                        $scope.exploreRecursively('plugins/'+plugin, directory, function(){
                            callback();
                        });

                        $scope.plugin = {
                            name : plugin,
                            files : directory,
                            path : [],
                            directory : true
                        };
                    });
                });
            };

            $scope.reloadPlugins = function (e) {
                if (typeof e !== "undefined") {
                    e.preventDefault();
                }

                if (mcApi.api) {

                    $scope.reloadDialog.open();

                    mcApi.api.call('reloadServer');
                    $timeout(function () {
                            $scope.reloadDialog.close();
                        }, 10000
                    );
                }
            };
        }
    ]);
