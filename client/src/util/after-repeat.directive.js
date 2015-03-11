(function() {
    "use strict";

    // Do something after the last element of an ng-repeat is rendered.
    angular.module('basilisk.util').directive('basiliskAfterRepeat', ['$timeout', function($timeout) {
        return function(scope, element, attrs) {
            // This is the last element.
            if (scope.$last){
                // A timeout of 0 is necessary to wait for
                // the DOM to be ready.
                $timeout(function() {
                    scope.$eval(attrs.basiliskAfterRepeat);
                }, 0);
            }
        };
    }]);
})();
