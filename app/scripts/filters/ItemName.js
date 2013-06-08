'use strict';

angular.module('mcConfettiApp')
    .filter('itemName', ['mcItems', function (mcItems) {
        return function (input) {
            return mcItems.items[input].item_name;
        };
    }]
    );