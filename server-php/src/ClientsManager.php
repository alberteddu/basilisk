<?php

namespace Basilisk;

use Exception;
use Ratchet\ConnectionInterface;

/**
 * Class ClientsManager
 *
 * @package Basilisk
 */
class ClientsManager {
    /** @var array Array of clients. */
    protected $clients = array();

    /**
     * Attach a new client.
     *
     * @param $identifier
     * @param $conn
     */
    public function attach($identifier, $conn) {
        $this->clients[$identifier] = $conn;
    }

    /**
     * Detach client by identifier.
     *
     * @param $identifier
     */
    public function detach($identifier) {
        unset($this->clients[$identifier]);
    }

    /**
     * Get client connection by identifier.
     * Returns null if the identifier is not found.
     *
     * @param $identifier
     *
     * @return ConnectionInterface
     */
    public function getClient($identifier) {
        if(!isset($this->clients[$identifier])) {
            return null;
        }

        return $this->clients[$identifier];
    }

    /**
     * Do something with client. The connection object
     * is passed to the callback function.
     *
     * @param $identifier
     * @param $callback
     *
     * @throws Exception when the client is not found
     */
    public function withClient($identifier, $callback) {
        if(is_null($conn = $this->getClient($identifier))) {
            throw new Exception('Client not found');
        }

        call_user_func($callback, $conn);
    }

    /**
     * Do something with all clients. Optionally
     * filter the clients using `$filterCallback`.
     * The identifier and the connection object will
     * be passed to both functions.
     *
     * @param callable $callback
     * @param callable $filterCallback
     */
    public function withClients(callable $callback, callable $filterCallback = null) {
        foreach($this->clients as $identifier => $conn) {
            $shouldBeProcessed = true;

            if(is_callable($filterCallback)) {
                $shouldBeProcessed = call_user_func($filterCallback, $identifier, $conn);
            }

            if($shouldBeProcessed) {
                call_user_func($callback, $identifier, $conn);
            }
        }
    }

    /**
     * Create string payload from array or object.
     *
     * @param $object
     *
     * @return string
     */
    public function createPayload($object) {
        return json_encode($object);
    }

    /**
     * Broadcast event to all clients. Clients can be filtered
     * by passing a callable as second parameter.
     *
     * @param array    $object
     * @param callable $filterCallback
     */
    public function broadcast(array $object, callable $filterCallback = null) {
        if(!isset($object['date'])) {
            $object['date'] = (integer) round(microtime(true) * 1000);
        }

        $this->withClients(function ($identifier, ConnectionInterface $conn) use ($object) {
            $conn->send($this->createPayload($object));
        }, $filterCallback);
    }
}
