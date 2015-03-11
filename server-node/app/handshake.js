module.exports = (function() {
    "use strict";

    // We need url to parse the query parameters
    // and get the username.
    var url = require('url');

    var Handshake = {};

    /**
     * Verify a client. The function `callback` will
     * be called with true or false as first parameter.
     * True means the handshake was successful, and the connection
     * can be accepted. False will close the connection.
     * In this case, an optional status code and message can be passed.
     *
     * @param clients
     * @param object
     * @param callback
     */
    Handshake.verifyClient = function(clients, object, callback) {
        var urlString = object.req.url,
            query = url.parse(urlString, true).query,
            username = query.username;

        // Username was not provided or is invalid
        if(!username || !username.match(/^[a-zA-Z0-9]{1,20}$/)) {
            callback(false, 400, 'Invalid username');
        }

        // Username is already in use
        if(clients.getClient(username)) {
            callback(false, 400, 'Username already in use');
        }

        // Everything good, set the identifier
        // in the request object.
        object.req.identifier = username;

        callback(true);
    };

    return Handshake;
})();
