<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Basilisk\Basilisk;

// Create and run server.
$chat = new Basilisk();
$chat->run();
