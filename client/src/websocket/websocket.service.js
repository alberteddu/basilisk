(function() {
    "use strict";

    // Wraps an instance of WebSocket. It uses an event emitter
    // so that multiple listeners can be attached to the websocket events
    // (instead of using the `.on*` properties).
    angular.module('basilisk.websocket', []).service('webSocketClient', function() {
        var ee = new EventEmitter(),
            ws;

        /**
         * Create the WebSocket instance and try to connect.
         *
         * @param username
         */
        this.connect = function(username) {
            ws = new WebSocket('ws://127.0.0.1:8080/?username=' + username);

            ws.onopen = function() {
                ee.trigger('open');
            };

            ws.onclose = function(event) {
                ee.trigger('close', [event]);
            };

            ws.onmessage = function(data) {
                data = JSON.parse(data.data);
                data.date = new Date(data.date);

                ee.trigger('message', [data]);
            };

            ws.onerror = function(event) {
                ee.trigger('error', [event]);
            };
        };

        /**
         * Low level send method to send a string to the server.
         *
         * @param payload
         */
        this.send = function(payload) {
            if (typeof ws.send === 'function') {
                ws.send(payload);
            }
        };

        /**
         * Add an event listener.
         *
         * @param event
         * @param callback
         */
        this.on = function(event, callback) {
            ee.on(event, callback);
        };
    });
})();
