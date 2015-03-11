(function() {
    "use strict";

    angular.module('basilisk.chat').controller('ChatCtrl', [
        '$scope', '$timeout', '$cookies', 'chatManager', 'message',
        function($scope, $timeout, $cookies, chatManager, statusMessage) {
            // The array of messages to show in the chat.
            $scope.messages = chatManager.getMessages;

            // The array of sticky messages
            $scope.stickyMessages = chatManager.getStickyMessages;

            // Status message shown next to the connect button
            // will contain an error message if the connection
            // fails for some reason.
            $scope.statusMessage = statusMessage;

            // The user object with the username.
            $scope.user = {
                name: $cookies.username || ''
            };

            // Watch the username and save it in
            // the cookies, so that it will be available
            // after a page refresh.
            $scope.$watch(function() {
                return $scope.user.name;
            }, function() {
                $cookies.username = $scope.user.name;
            });

            // Detect enter key press. When that happens,
            // try to send a message.
            $scope.keyPress = function(event) {
                if (event.which == 13) {
                    var input = $('#message-text'),
                        message = input.val().trim();

                    if (0 === message.length) {
                        return;
                    }

                    input.val('');

                    if (message === '!leave') {
                        chatManager.sendEvent('leave');
                    } else {
                        chatManager.sendMessage($scope.user.name, message);
                    }
                }
            };

            // This is used by the connect button.
            // The button will be disabled if this returns false.
            $scope.isUsernameValid = function() {
                return $scope.user.name && $scope.user.name.match(/^[a-zA-Z0-9]{1,20}$/);
            };

            // If true, the login view is hidden
            // and the chat one is shown.
            $scope.usernameChosen = false;

            // If this callback is called, that means that the connection was
            // successful and not rejected in the handshake.
            // Switch to the chat view and hide any error message.
            chatManager.client.on('open', function() {
                $scope.usernameChosen = true;
                $scope.statusMessage.clearContents();
                $scope.focusMessageInput();

                $scope.$apply();
            });

            // The connection was closed. Could be that we can't connect.
            chatManager.client.on('close', function() {
                if (chatManager.currentConnectionHasError()) {
                    $scope.statusMessage.setLevel('error').setContents('Could not connect to server.');
                }
            });

            // Try to connect.
            $scope.connect = function() {
                chatManager.connect($scope.user.name);
            };

            // Scroll to the bottom if needed
            $scope.newMessageRendered = function() {
                if (chatManager.shouldScrollToBottom()) {
                    $('html, body').scrollTop($(document).height());
                    chatManager.clearScrollToBottom();
                }
            };

            // Focus the username input on load.
            $scope.focusUsernameInput = function() {
                $('#username-text').focus();
            };

            // Focus the message input when it is shown.
            $scope.focusMessageInput = function() {
                $timeout(function() {
                    $('#message-text').focus();
                }, 0, false);
            };
        }]);
})();
