<?php

namespace Basilisk\WebSocket;

use Ratchet\ConnectionInterface;
use Ratchet\WebSocket\WsServer as BaseWsServer;
use Basilisk\ClientsManager;

/**
 * Custom WsServer::attemptUpgrade implementation
 * that will check if the username is valid.
 *
 * @package Basilisk\WebSocket
 */
class WsServer extends BaseWsServer {
    /** @var ClientsManager */
    private $clients;

    /**
     * @param ClientsManager $clientsManager
     */
    public function setClientsManager(ClientsManager $clientsManager) {
        $this->clients = $clientsManager;
    }

    /**
     * Handle handshake. Reject connection if the username is not valid.
     *
     * @param ConnectionInterface $conn
     * @param string              $data
     */
    protected function attemptUpgrade(ConnectionInterface $conn, $data = '') {
        $username = $conn->WebSocket->request->getQuery()->get('username');

        // Username was not provided or is not valid
        if(!$username or !preg_match('/^[a-zA-Z0-9]{1,20}$/', $username)) {
            return $conn->close();
        }

        // Username is already in use.
        if($this->clients->getClient($username)) {
            return $conn->close();
        }

        return parent::attemptUpgrade($conn, $data);
    }
}
