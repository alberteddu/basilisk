module.exports = (function() {
    "use strict";

    // Main Clients object
    var Clients = {};

    // The object that will contain all clients.
    // The key is the identifier.
    var clientStore = {};

    /**
     * Attach a new client.
     *
     * @param identifier
     * @param client
     */
    Clients.attach = function(identifier, client) {
        clientStore[identifier] = client;
    };

    /**
     * Detach a client.
     *
     * @param identifier
     */
    Clients.detach = function(identifier) {
        delete clientStore[identifier];
    };

    /**
     * Get the connection object by identifier.
     *
     * @param identifier
     *
     * @returns {Object}
     */
    Clients.getClient = function(identifier) {
        return clientStore[identifier];
    };

    /**
     * Do something with the client.
     * The connection object is passed to the callback.
     *
     * @param identifier
     * @param callback
     */
    Clients.withClient = function(identifier, callback) {
        var client = Clients.getClient(identifier);

        if (!client) {
            return;
        }

        callback(client);
    };

    /**
     * Do something with all clients.
     * The first parameter passed to the callback is the identifier.
     * The second one is the connection object.
     * The clients can be filtered using `filterCallback`.
     * For each client, if `filterCallback(identifier, connection)`
     * is truthy, process the client.
     *
     * @param callback
     * @param filterCallback
     */
    Clients.withClients = function(callback, filterCallback) {
        var clients = clientStore;

        for (var identifier in clients) {
            if (clients.hasOwnProperty(identifier)) {
                // By default, all clients are processed.
                var shouldBeProcessed = true;

                if (typeof filterCallback === 'function') {
                    shouldBeProcessed = filterCallback(identifier, client);
                }

                if (shouldBeProcessed) {
                    var client = clients[identifier];

                    callback(identifier, client);
                }
            }
        }
    };

    /**
     * Creates string payload from object.
     *
     * @param object
     *
     * @returns {String}
     */
    Clients.createPayload = function(object) {
        return JSON.stringify(object);
    };

    /**
     * Broadcast object to all clients. Clients can
     * be specified using `filterCallback`. Filtering
     * works the same as `Clients.withClients`.
     *
     * @param object
     * @param filterCallback
     */
    Clients.broadcast = function(object, filterCallback) {
        // The event date defaults to now.
        if (typeof object.date === 'undefined') {
            object.date = new Date().getTime();
        }

        Clients.withClients(function(identifier, connection) {
            connection.send(Clients.createPayload(object));
        }, filterCallback);
    };

    return Clients;
})();
