module.exports = (function() {
    "use strict";

    var Chat = {};

    /**
     * Chat Handler.
     *
     * @param server
     * @param clients
     *
     * @constructor
     */
    Chat.Handler = function(server, clients) {
        // Called when a new connection is opened.
        server.on('connection', function(connection) {
            // The connection was declined in the handshake, abort.
            if (connection.upgradeReq.client.destroyed) {
                return;
            }

            // Get the identifier which was set by the verifyClient function.
            var identifier = connection.upgradeReq.identifier;

            // Message received
            connection.on('message', function(data, flags) {
                data = JSON.parse(data);

                // The client provided an id, confirm that
                // the message was received by the server.
                if (typeof data.id !== 'undefined') {
                    connection.send(clients.createPayload({
                        type: 'confirm',
                        id:   data.id
                    }));
                }

                // The client wants to leave, close the connection.
                if (data.type === 'leave') {
                    connection.close();

                    return;
                }

                // The client sent a message
                if (data.type === 'message') {
                    // Broadcast the message to everyone
                    // except the client that sent the message.
                    clients.broadcast({
                        type:    'message',
                        author:  identifier,
                        message: data.message
                    }, function(clientIdent) {
                        return clientIdent != identifier;
                    });
                }
            });

            // Connection closed
            connection.on('close', function() {
                // Remove client from client manager.
                clients.detach(identifier);

                clients.broadcast({
                    type:       'leave',
                    identifier: identifier
                });
            });

            // Attach client to client manager.
            clients.attach(identifier, connection);

            // There is a new client, broadcast join event.
            clients.broadcast({
                type:       'join',
                identifier: identifier
            });
        });
    };

    return Chat;
})();
