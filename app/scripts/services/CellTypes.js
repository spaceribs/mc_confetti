'use strict';

angular.module('mcConfettiApp')
    .factory('CellTypes', [function () {

        var types = [
            {
                name : "string",
                typeof : "string",
                label : "String",
                pluginMatch : [],
                nameMatch : []
            },
            {
                name : "boolean",
                typeof : "boolean",
                label : "Boolean",
                pluginMatch : ["CityWorld"],
                nameMatch : ["FlipableX"]
            },
            {
                name : "float",
                typeof : "number",
                label : "Unranged Float",
                typeMatch : function(val){
                    return val >= 1 && val <= 0;
                },
                pluginMatch : [],
                nameMatch : []
            },
            {
                name : "rangefloat",
                typeof : "number",
                label : "Ranged Float",
                typeMatch : function(val){
                    return val <= 1 && val >= 0;
                },
                pluginMatch : [],
                nameMatch : []
            },
            {
                name : "integer",
                typeof : "number",
                label : "Integer",
                typeMatch : function(val){
                    return parseInt(val, 10) === val;
                },
                pluginMatch : [],
                nameMatch : []
            },
            {
                name : "object",
                typeof : "object",
                label : "Object",
                typeMatch : function(val){
                    return Object.prototype.toString.call( val ) === "[object Object]";
                },
                pluginMatch : [],
                nameMatch : []
            },
            {
                name : "array",
                typeof : "object",
                label : "Array",
                typeMatch : function(val){
                    return Object.prototype.toString.call( val ) === "[object Array]";
                },
                pluginMatch : [],
                nameMatch : []
            }
        ];

        // Public API here
        return {
            set : function(obj){
                types = obj;
                return types;
            },
            get : function(){
                return types;
            },
            getType : function(val, key, plugin){

                //Check if plugin/name is already set to something
                //TODO: Hook up to local storage
                if (plugin) {
                    var matchname = _.filter(types, function(type){
                        if (type.pluginMatch) {
                            return _.contains(type.pluginMatch, plugin) && _.contains(type.nameMatch, key);
                        } else {
                            return null;
                        }
                    });

                    if (matchname.length) {
                        return matchname[0].name;
                    }
                }

                //Approximate type by checking typeof
                var matchtype = _.filter(types, function(type){
                    if (typeof val === type.typeof) {
                        if (typeof type.typeMatch !== "undefined") {
                            return type.typeMatch(val);
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                });

                if (matchtype.length > 0) {
                    return matchtype[matchtype.length-1].name;
                } else {
                    return "string";
                }
            }
        };
    }]);
