(function() {
    "use strict";

    // Create a new application.
    angular.module('basilisk', [
        'basilisk.chat',
        'ngAnimate',
        'ngTouch'
    ]).run(['$rootScope', '$http', '$templateCache', function($rootScope, $http, $templateCache) {
        /**
         * Get template path.
         *
         * @param name
         *
         * @returns {string}
         */
        $rootScope.template = function(name) {
            return 'src/templates/' + name + '.html';
        };

        // List of templates to preload
        var preloadedTemplates = [
            'login',
            'message',
            'messages',
            'command',
            'messages/connection-lost',
            'messages/connection-successful',
            'messages/join',
            'messages/leave'
        ];

        for (var i in preloadedTemplates) {
            if (preloadedTemplates.hasOwnProperty(i)) {
                // Preload the template with its path as name.
                $http.get($rootScope.template(preloadedTemplates[i]), {cache: $templateCache});
            }
        }
    }]);
})();
