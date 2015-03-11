(function() {
    "use strict";

    // A simple message with a level that can be updated.
    angular.module('basilisk.util').service('message', function() {
        var contents = '',
            level = 'notice',
            that = this;

        this.setContents = function(newContents, level) {
            if(typeof level === 'string') {
                that.setLevel(level);
            }

            contents = newContents;

            return that;
        };

        this.setLevel = function(newLevel) {
            level = newLevel;

            return that;
        };

        this.getLevel = function() {
            return level;
        };

        this.getContents = function() {
            return contents;
        };

        this.clearContents = function() {
            contents = '';

            return that;
        };

        this.isEmpty = function() {
            return !contents || 0 === contents.length;
        };
    });
})();
