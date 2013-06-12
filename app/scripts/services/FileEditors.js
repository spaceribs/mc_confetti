'use strict';

angular.module('mcConfettiApp')
    .factory('FileEditors', [function () {

        var filetypes = [
            {
                name : "undefined",
                generic : true,
                match : {}
            },
            {
                name : "directory",
                generic : true,
                match : {
                    directory : true
                }
            },
            {
                name : "yml",
                generic : true,
                match : {
                    type : "yml"
                }
            },
            {
                name : "log",
                generic : true,
                match : {
                    type : "log"
                }
            },
            {
                name : "properties",
                generic : true,
                match : {
                    type : "properties"
                }
            },
            {
                name : "txt",
                generic : true,
                match : {
                    type : "txt"
                }
            },
            {
                name : "json",
                generic : true,
                match : {
                    type : "json"
                }
            },
            {
                name : "items",
                generic : false,
                match : {
                    type : "yml",
                    path : ["ChestLootz", "items"]
                }
            }
        ];

        // Public API here
        return {
            getEditor: function (activeItem, activePlugin) {

                var generic = "includes/editors/";
                var specific = "includes/plugins/"+activePlugin+"/";

                var match = {
                    type : activeItem.type,
                    plugin : activePlugin,
                    path : activeItem.path,
                    directory : activeItem.directory
                };

                var templates = _.sortBy(filetypes, function(filetype){
                    return _.reduce(match, function(memo, val, key){
                        if (val === filetype.match[key]){
                            return memo+1;
                        } else if (typeof filetype.match[key] !== "undefined") {
                            return memo-1;
                        } else {
                            return memo;
                        }
                    }, 0);
                });

                var template = _.last(templates);

                if (template.generic === true) {
                    return generic + template.name + ".html";
                } else {
                    return specific + template.name + ".html";
                }
            }
        };
    }]);
