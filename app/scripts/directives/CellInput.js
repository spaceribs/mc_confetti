'use strict';

angular.module('mcConfettiApp')
    .directive('cellInput', ['$compile', '$http', '$templateCache', function($compile, $http, $templateCache) {
        return {
            restrict: 'E',
            scope: {
                type: "=",
                model: "="
            },
            controller: ['$scope', 'CellTypes', function($scope, CellTypes) {
                $scope.cellTypes = CellTypes.get();
                $scope.getType = CellTypes.getType;

                $scope.addField = function(e){
                    e.preventDefault();

                    var val = _.last($scope.model) ? _.last($scope.model).val : "";
                    var type = _.last($scope.model) ? _.last($scope.model).type : "string";

                    if ($scope.type === "object") {
                        $scope.model.push({
                            key : "",
                            val : val,
                            type : type
                        });
                    } else if ($scope.type === "array") {
                        $scope.model.push({
                            val : val,
                            type : type
                        });
                    }
                };

                $scope.removeRow = function(e, row) {
                    e.preventDefault();
                    $scope.model.splice(row,1);
                };
            }],
            link: function(scope, iElement) {
                scope.$watch('type', function(newtype, prevtype){
                    if (prevtype === "object" && newtype !== "object") {
                        switch (newtype) {
                        case "array":
                            scope.model = _.map(scope.model, function(val){
                                return {
                                    val: val.val,
                                    type: val.type
                                };
                            });
                            break;
                        default:
                            scope.model = _.first(scope.model) ? _.first(scope.model).val : "";
                            break;
                        }
                    } else if (prevtype === "array" && newtype !== "array") {
                        switch (newtype) {
                        case "object":
                            scope.model = _.map(scope.model, function(val, index){
                                return {
                                    key: index,
                                    val: val,
                                    type: "string"
                                };
                            });
                            break;
                        default:
                            scope.model = scope.model.length ? _.first(scope.model) : "";
                            break;
                        }
                    } else if (prevtype !== "object" && newtype === "object") {
                        switch (prevtype) {
                        case "array":
                            scope.model = _.map(scope.model, function(val, index){
                                return {
                                    key: index,
                                    val: val,
                                    type: "string"
                                };
                            });
                            break;
                        default:
                            scope.model = [{
                                key: "",
                                val: scope.model,
                                type: "string"
                            }];
                            break;
                        }
                    } else if (prevtype !== "array" && newtype === "array") {
                        switch (prevtype) {
                        case "object":
                            scope.model = _.map(scope.model, function(val){
                                return {
                                    val: val,
                                    type: "string"
                                };
                            });
                            break;
                        default:
                            scope.model = [{
                                val: scope.model,
                                type: "string"
                            }];
                            break;
                        }
                    }

                    $http.get('includes/cells/'+scope.type+'.html', {cache: $templateCache}).success(function(tplContent){
                        iElement.html($compile(tplContent)(scope));
                    });
                }, true);
            }
        };
    }]);
