# Basilisk

Basilisk is a chat application. A NodeJS server is provided, along with a
client (HTML, CSS, JavaScript). A PHP server is also included, which can 
replace the NodeJS one.

# Usage

To run the NodeJS server, NodeJS is needed. First install the dependencies 
using npm (it is usually installed with NodeJS), by running this command in the 
"server-node" directory:

	npm install

Then run this command in the same directory to start the server:

	node bin/basilisk.js

To run the PHP server, PHP is required. First install the dependencies using 
composer (see [https://getcomposer.org/]) by running this command in the 
"server-php" directory: 

	php composer.phar install

Or, if you have composer installed globally:

	composer install

Then run this command in the same directory to start the server:

	php bin/basilisk.php

The client does not have any dependencies, except for some JavaScript libraries 
which are already included. To work properly, the client can't be run by just 
double clicking in the main file (index.html). It needs an HTTP server, 
like Apache. If you have Python available, a very simple way to get an HTTP 
server up in seconds is to run this command in the "client" directory:

	python -m SimpleHTTPServer

After that, open [http://localhost:8000/] in your browser.

Now you can choose a username and login to the chat. To test the offline 
capabilities in a local machine, you can trigger a disconnection of the client 
manually by sending the command "!leave". At this point you can write some 
offline messages, and then connect again using the "Connect" link.
