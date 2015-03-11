module.exports = (function() {
    'use strict';

    // Libs
    var WebSocketServer = require('ws').Server;

    var chat = require('./chat.js'),
        clients = require('./clients.js'),
        handshake = require('./handshake.js');

    /**
     * Main Basilisk object.
     *
     * @param {Object} options
     *
     * @constructor
     */
    var Basilisk = function(options) {
        if (typeof options === 'undefined') {
            options = {};
        }

        this.host = options.host || '127.0.0.1';
        this.port = options.port || 8080;

        var server = new WebSocketServer({
            host:         this.host,
            port:         this.port,
            verifyClient: function(object, callback) {
                handshake.verifyClient(clients, object, callback);
            }
        }, function() {
            console.log('Running...');
        });

        // Create a new chat handler. The handler will
        // listen on the websocket events.
        this.chat = new chat.Handler(server, clients);
    };

    return {
        Basilisk: Basilisk
    };
})();
