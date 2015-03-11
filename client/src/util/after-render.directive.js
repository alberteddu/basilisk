(function() {
    "use strict";

    // Do something after the element is rendered.
    angular.module('basilisk.util').directive('basiliskAfterRender', ['$timeout', function($timeout) {
        return function(scope, element, attrs) {
            // A timeout of 0 is necessary to wait for
            // the DOM to be ready.
            $timeout(function() {
                scope.$eval(attrs.basiliskAfterRender);
            }, 0, false);
        };
    }]);
})();
