<?php

namespace Basilisk;

use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Basilisk\WebSocket\WsServer;

/**
 * Class Basilisk
 *
 * @package Basilisk
 */
class Basilisk {
    const DEFAULT_HOST = '127.0.0.1';
    const DEFAULT_PORT = '8080';

    /** @var IoServer */
    protected $server;

    /** @var ChatHandler */
    protected $chatHandler;

    /** @var ClientsManager */
    protected $clients;

    /**
     * Create a new Basilisk server.
     *
     * @param string $host
     * @param string $port
     */
    public function __construct($host = self::DEFAULT_HOST, $port = self::DEFAULT_PORT) {
        $this->clients     = new ClientsManager();
        $this->chatHandler = new ChatHandler($this->clients);
        $wsServer          = new WsServer($this->chatHandler);
        $wsServer->setClientsManager($this->clients);

        $this->server = IoServer::factory(new HttpServer($wsServer), $port, $host);
    }

    /**
     * Run the server.
     */
    public function run() {
        $this->server->run();
    }
}
