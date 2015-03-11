(function() {
    "use strict";

    angular.module('basilisk.chat').factory('chatManager', [
        '$rootScope', '$timeout', 'webSocketClient',
        function($rootScope, $timeout, webSocketClient) {
            // The main chatManager object.
            var chatManager = {};

            // Username chosen by the user. It is
            // set in the connect function.
            var username;

            // If this is true, that means that
            // there was an error since the
            // last successful connection
            var webSocketError = false;

            // Array of messages.
            var messages = [];

            // Array of sticky messages (shown underneath).
            var stickyMessages = [];

            // A map of unique messages. When a message with
            // options.unique is added, the reference of
            // that message is also stored here.
            // The key is options.unique itself.
            //
            // When a new message is added, if the unique
            // string is found here, the old message is updated
            // instead of creating a new one.
            var uniqueMessages = {};

            // After a message is received, this will be a list
            // containing at least one true if the page was completely
            // scrolled to the bottom before adding the message to the list.
            var shouldScroll = [];

            /**
             * Generate a new GUID.
             *
             * @link http://stackoverflow.com/a/2117523
             *
             * @returns {string}
             */
            var generateGUID = function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            // Connection was opened.
            webSocketClient.on('open', function(event) {
                // Set the connected flag to true.
                // The controllers can watch this value and act
                // based on connection/disconnection events.
                // Although they can also use the event emitter of
                // the webSocketClient instance.
                chatManager.connected = true;

                // We just (re-)connected, no errors for now.
                webSocketError = false;

                // If a connection status message is present
                // (maybe this is a reconnection), edit that message.
                // editOnly will avoid creating a new message.
                chatManager.addMessage('Basilisk', false, new Date(), true, true, {
                    template: 'messages/connection-successful',
                    level:    'success',
                    invert:   true,
                    unique:   'connection-status',
                    editOnly: true,
                    timeout:  2000
                });

                // If there are pending messages, try sending them again.
                angular.forEach(chatManager.getPendingMessages(), function(item) {
                    // Just try to send the message. Pending will
                    // be set to false when the 'confirm' event is received.
                    chatManager.sendEvent('message', {
                        id:      item.unique,
                        message: item.message
                    });
                });
            });

            // Connection was closed.
            webSocketClient.on('close', function(event) {
                // A connection was active before, therefore
                // show a "you are offline now" message.
                if (chatManager.connected) {
                    chatManager.addMessage('Basilisk', false, new Date(), true, true, {
                        template: 'messages/connection-lost',
                        level:    'error',
                        invert:   true,
                        timeout:  false,
                        unique:   'connection-status'
                    });
                }

                // And update the connected flag.
                chatManager.connected = false;

                // Necessary to update the DOM depending on when
                // the connection closed event happens.
                $rootScope.$apply();
            });

            // A new message is received
            webSocketClient.on('message', function(event) {
                // The server has received the message with id
                // `event.id`. Update the pending flag.
                if (event.type === 'confirm') {
                    chatManager.updateMessage(event.id, {
                        pending: false
                    });
                }

                // Someone joined (maybe it's us :-)
                if (event.type === 'join') {
                    chatManager.addMessage('Basilisk', false, event.date, true, false, {
                        identifier: event.identifier,
                        template:   'messages/join'
                    });
                }

                // Someone left.
                if (event.type === 'leave') {
                    chatManager.addMessage('Basilisk', false, event.date, true, false, {
                        identifier: event.identifier,
                        template:   'messages/leave'
                    });
                }

                // Someone sent a message. We will only receive
                // this event for messages of other users.
                if (event.type === 'message') {
                    chatManager.addMessage(event.author, event.message, event.date, event.server);
                }

                // Necessary to update the DOM depending on when
                // the event is received.
                $rootScope.$apply();
            });

            // There was an error in the connection, update the flag.
            webSocketClient.on('error', function(event) {
                webSocketError = true;
            });

            // The instance of the webSocketClient.
            chatManager.client = webSocketClient;

            // True if the connection to the websocket server is active.
            chatManager.connected = false;

            /**
             * Get normal messages.
             *
             * @returns {Array}
             */
            chatManager.getMessages = function() {
                return messages;
            };

            /**
             * Get sticky messages.
             *
             * @returns {Array}
             */
            chatManager.getStickyMessages = function() {
                return stickyMessages;
            };

            /**
             * True if should scroll to bottom.
             *
             * @returns {boolean}
             */
            chatManager.shouldScrollToBottom = function() {
                return shouldScroll.indexOf(true) !== -1;
            };

            /**
             * Clear shouldScroll flags.
             */
            chatManager.clearScrollToBottom = function() {
                shouldScroll = [];
            };

            /**
             * Get pending messages only.
             *
             * @returns {Array}
             */
            chatManager.getPendingMessages = function() {
                return chatManager.getMessages().filter(function(message) {
                    return message.pending === true;
                });
            };

            /**
             * Returns true if the current connection has an error.
             *
             * @returns {boolean}
             */
            chatManager.currentConnectionHasError = function() {
                return webSocketError;
            };

            /**
             * Add a new message.
             *
             * @param author
             * @param message
             * @param date
             * @param server
             * @param sticky
             * @param options
             *
             * @returns {Object}
             */
            chatManager.addMessage = function(author, message, date, server, sticky, options) {
                // Is the page scrolled (completely, or almost) to the bottom?
                shouldScroll.push($(window).scrollTop() + $(window).height() == $(document).height());

                if (typeof options === 'undefined') {
                    options = {};
                }

                // The message is an update to another message. If there is no
                // message with this unique identifier, abort.
                if (options.unique && options.editOnly && typeof uniqueMessages[options.unique] === 'undefined') {
                    return;
                }

                // We have a unique identifier and an existing message with that identifier.
                // Fetch the correct object and update it!
                if (options.unique && typeof uniqueMessages[options.unique] !== 'undefined') {
                    var newOptions = uniqueMessages[options.unique];

                    for (var key in options) {
                        if (options.hasOwnProperty(key)) {
                            newOptions[key] = options[key];
                        }
                    }

                    options = newOptions;
                }

                options.author = author;
                options.message = message;
                options.server = !!server;
                options.date = date;
                options.sticky = sticky;
                options.created = new Date();

                // The unique identifier was not provider, or this is the first message
                // with that identifier. Either way, we have to add a new message to the list.
                if (!options.unique || typeof uniqueMessages[options.unique] === 'undefined') {
                    if (sticky) {
                        stickyMessages.push(options);
                    } else {
                        messages.push(options);
                    }
                }

                // The unique identifier was provided and it was the first one.
                // Add it to the uniqueMessages list.
                if (options.unique && typeof uniqueMessages[options.unique] === 'undefined') {
                    uniqueMessages[options.unique] = options;
                }

                // Timeout is false and the previous message had a timeout set,
                // so cancel the timeout now.
                if (options.timeout === false && options.activeTimeout) {
                    $timeout.cancel(options.activeTimeout);
                }

                // Timeout is set, we have to remove this message when the time comes.
                if (options.timeout) {
                    options.activeTimeout = $timeout(function() {
                        var fromArray = sticky ? stickyMessages : messages,
                            index = fromArray.indexOf(options);

                        fromArray.splice(index, 1);

                        delete uniqueMessages[options.unique];
                    }, options.timeout);
                }

                return options;
            };

            /**
             * Add a new sticky message.
             *
             * @param author
             * @param message
             * @param date
             * @param server
             * @param options
             *
             * @returns {Object}
             */
            chatManager.addStickyMessage = function(author, message, date, server, options) {
                return chatManager.addMessage(author, message, date, server, true, options);
            };

            /**
             * Update the message with new options, only if it was already added.
             *
             * @param unique
             * @param options
             */
            chatManager.updateMessage = function(unique, options) {
                var message = uniqueMessages[unique];

                if (typeof message === 'undefined') {
                    return;
                }

                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        message[key] = options[key];
                    }
                }
            };

            /**
             * Send a generic event to the server.
             *
             * @param type
             * @param options
             */
            chatManager.sendEvent = function(type, options) {
                if (!chatManager.connected) {
                    return;
                }

                if (typeof options === 'undefined') {
                    options = {};
                }

                options.type = type;

                var payload = JSON.stringify(options);
                webSocketClient.send(payload);
            };

            /**
             * Send text message to the server.
             *
             * @param identifier
             * @param contents
             */
            chatManager.sendMessage = function(identifier, contents) {
                // The message will have this unique identifier.
                // When the confirm event is received, use this identifier
                // to remove the pending flag.
                var guid = generateGUID();

                // Add a new pending message.
                var message = chatManager.addMessage(identifier, contents, new Date(), false, false, {
                    unique:  guid,
                    pending: true
                });

                // If a connection is active, send the event.
                // Otherwise, it will be sent in the next connection.
                if (chatManager.connected) {
                    chatManager.sendEvent('message', {
                        message: contents,
                        id:      guid
                    });
                }
            };

            // Try to connect with username `name`.
            chatManager.connect = function(name) {
                username = name;

                webSocketClient.connect(name);
            };

            return chatManager;
        }]);
})();
