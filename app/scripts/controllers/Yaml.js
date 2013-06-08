'use strict';

angular.module('mcConfettiApp')
    .controller('YamlCtrl', ['$scope', 'CellTypes', 'mcApi', function ($scope, CellTypes, mcApi) {

        $scope.editorPref = {
            useWrapMode : false,
            showGutter: true,
            theme:'twilight',
            mode: 'yaml'
        };

        $scope.cellTypes = CellTypes.get();
        $scope.getType = CellTypes.getType;

        $scope.reloadFile = function(e){
            if (typeof e !== 'undefined') {
                e.preventDefault();
            }
            mcApi.api.call('fs.readBinary', $scope.absPath, function(result){
                $scope.$apply(function(){
                    if ($scope.activeItem.type) {
                        $scope.activeItem[$scope.activeItem.type] = window.atob(result.success);

                        var newData = $scope.convertToData($scope.activeItem.yml);
                        if (newData !== null){
                            $scope.activeItem.data = newData;
                        }
                    }
                });
            });
        };

        $scope.removeRow = function(e, row) {
            e.preventDefault();

            $scope.activeItem.data.splice(row,1);
        };

        $scope.addField = function(e, model) {
            e.preventDefault();

            var val = _.last(model) ? _.last(model).val : [{
                key : "",
                val : "",
                type : "string"
            }];
            var type = _.last(model) ? _.last(model).type : "object";

            model.push({
                key : "",
                val : val,
                type : type
            });
        };

        $scope.tableConfig = {
            isPaginationEnabled: false
        };

        var toData = function(val) {
            var valtype = CellTypes.getType(val, undefined, $scope.plugin.name);

            if (_.isArray(val)) {
                valtype = CellTypes.getType(val[1], val[0], $scope.plugin.name);
            }

            if (valtype === "object") {
                return {
                    key : val[0],
                    val : _.pairs(val[1]).map(toData),
                    type : valtype
                };
            } else if (valtype === "array") {
                return {
                    key : val[0],
                    val : _.map(val[1], toData),
                    type : valtype
                };
            } else {
                if (_.isArray(val)) {
                    return {
                        key : val[0],
                        val : val[1],
                        type : valtype
                    };
                } else {
                    return {
                        val : val,
                        type : valtype
                    };
                }
            }
        };

        var toYaml = function(data){
            if (_.isArray(data)) {
                return _.chain(data).map(function(val){
                    if (val.type === "object") {
                        return [val.key, toYaml(val.val)];
                    } else if (val.type === "array") {
                        return [val.key, _.map(val.val, function(sub){
                            return toYaml(sub);
                        })];
                    } else {
                        return [val.key, val.val];
                    }
                }).object().value();
            } else {
                if (data.type === "object") {
                    return toYaml(data.val);
                } else {
                    return data.val;
                }
            }
        };

        $scope.convertToData = function(content){
            if (content) {
                try {
                    var data = jsyaml.load(content);
                    data = _.pairs(data).map(toData);
                    $scope.activeItem.valid = true;
                    return data;
                } catch (e) {
                    $scope.activeItem.valid = e;
                    return null;
                }
            } else {
                return null;
            }
        };

        $scope.convertToYaml = function(content){
            if (content) {
                var data = toYaml(content);
                return jsyaml.dump(data);
            } else {
                return null;
            }
        };

        $scope.$watch("activeItem.data", function(record){
            var newData = $scope.convertToYaml(record);
            if (newData !== null){
                $scope.activeItem.yml = newData;
            }
        }, true);

        if ($scope.activeItem.yml !== "") {
            var newData = $scope.convertToData($scope.activeItem.yml);
            if (newData !== null){
                $scope.activeItem.data = newData;
            }
        }

        $scope.$watch("aceInstance", function(record){
            $scope.session = record.getSession();
            $scope.session.setTabSize(2);
            $scope.aceInstance.on("blur", function(){
                var newData = $scope.convertToData($scope.activeItem.yml);
                if (newData !== null){
                    $scope.activeItem.data = newData;
                }
            });
            $scope.$watch("activeItem.valid", function(record){
                if (record === true ) {
                    $scope.session.setAnnotations([]);
                } else if (typeof record !== "undefined") {
                    if (typeof record.mark !== "undefined") {
                        $scope.session.setAnnotations([{
                            row: record.mark.line,
                            column: record.mark.column,
                            text: record.reason,
                            type: "warning"
                        }]);
                    }
                }
            });
        });

    }]);
