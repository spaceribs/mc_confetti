"use strict";

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }
        for (; from < len; from++) {
            if (from in this && this[from] === elt) {
                return from;
            }
        }
        return -1;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp */) {
        "use strict";
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function") {
            throw new TypeError();
        }
        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}

angular.module('ngGrid.directives').directive('ngGridIf', [function () {
    return {
        transclude: 'element',
        priority: 1000,
        terminal: true,
        restrict: 'A',
        compile: function (e, a, transclude) {
            return function (scope, element, attr) {

                var childElement;
                var childScope;
                scope.$watch(attr['ngGridIf'], function (newValue) {
                    if (childElement) {
                        childElement.remove();
                        childElement = undefined;
                    }
                    if (childScope) {
                        childScope.$destroy();
                        childScope = undefined;
                    }

                    if (newValue) {
                        childScope = scope.$new();
                        transclude(childScope, function (clone) {
                            childElement = clone;
                            element.after(clone);
                        });
                    }
                });
            };
        }
    };
}]);

angular.module("ngGrid").run(["$templateCache", function($templateCache) {
    console.log($templateCache);
    $templateCache.put("cellEditTemplate.html",
        "<div ng-cell-has-focus ng-dblclick=\"editCell()\">" +
            "	<div ng-grid-if=\"!isFocused\">" +
            "	DISPLAY_CELL_TEMPLATE" +
            "	</div>" +
            "	<div ng-grid-if=\"isFocused\">" +
            "	EDITABLE_CELL_TEMPLATE" +
            "	</div>" +
            "</div>"
    );
}]);