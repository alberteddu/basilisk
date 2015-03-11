<?php

namespace Basilisk;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Exception;

/**
 * Class ChatHandler
 *
 * @package Basilisk
 */
class ChatHandler implements MessageComponentInterface {
    /** @var ClientsManager Connected clients */
    protected $clients;

    /**
     * @param ClientsManager $clientsManager
     */
    public function __construct(ClientsManager $clientsManager) {
        $this->clients = $clientsManager;
    }

    /**
     * A connection was opened. If this is called,
     * the handshake was successful.
     *
     * @param ConnectionInterface $conn
     */
    public function onOpen(ConnectionInterface $conn) {
        $identifier = $conn->WebSocket->request->getQuery()->get('username');

        $this->clients->attach($identifier, $conn);

        $this->clients->broadcast(array(
            'type'       => 'join',
            'identifier' => $identifier
        ));
    }

    /**
     * A message was received.
     *
     * @param ConnectionInterface $from
     * @param string              $msg
     *
     * @throws Exception when $msg is not a valid JSON string, or does not contain the required fields
     */
    public function onMessage(ConnectionInterface $from, $msg) {
        $data       = json_decode($msg, true);
        $identifier = $from->WebSocket->request->getQuery()->get('username');

        // The payload sent by the client is not valid.
        if(!is_array($data) or !isset($data['type'])) {
            throw new Exception('Invalid payload');
        }

        // The client provided an id. We send a confirm
        // event to confirm that the server received the message.
        if(isset($data['id'])) {
            $from->send($this->clients->createPayload(array(
                'type' => 'confirm',
                'id'   => $data['id']
            )));
        }

        // The client sent leave event, close the conection.
        if($data['type'] == 'leave') {
            $from->close();

            return;
        }

        // The client sent a message.
        if($data['type'] == 'message') {
            if(!isset($data['message']) or empty($data['message'])) {
                throw new Exception('Invalid payload');
            }

            // Broadcast the message to all clients
            // except the one that sent the message.
            $this->clients->broadcast(array(
                'type'    => 'message',
                'author'  => $identifier,
                'message' => $data['message']
            ), function ($clientIdent) use ($identifier) {
                return $clientIdent != $identifier;
            });
        }
    }

    /**
     * A connection was closed.
     *
     * @param ConnectionInterface $conn
     */
    public function onClose(ConnectionInterface $conn) {
        $identifier = $conn->WebSocket->request->getQuery()->get('username');

        $this->clients->detach($identifier);

        // Broadcast the leave event.
        $this->clients->broadcast(array(
            'type'       => 'leave',
            'identifier' => $identifier
        ));
    }

    /**
     * There was an error. Close the connection.
     *
     * @param ConnectionInterface $conn
     * @param \Exception          $e
     */
    public function onError(ConnectionInterface $conn, \Exception $e) {
        $conn->close();
    }
}
