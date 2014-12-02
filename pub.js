#!/usr/bin/env node

var amqp = require('amqplib');

var EXCHANGE_NAME = 'example-pubsub';
var MESSAGE_COUNT = 10000;
var TICK = Math.floor(MESSAGE_COUNT / 100);

amqp.connect('amqp://localhost').then(function(conn) {
	process.once('SIGINT', function() { conn.close(); });

	return conn.createChannel().then(function(channel) {
		var chok = channel.assertExchange(EXCHANGE_NAME, 'direct', {
			durable: true
		});

		chok.then(function() {
			// TODO: This blocks like you wouldn't believe...
			for (var i = 1; i < MESSAGE_COUNT; i++) {
				sender(i);

				if (i % TICK === 0) {
					console.log(i / TICK + '%');
				}
			}

			return sender('FIN');

		});

		return chok;

		function sender(i) {
			channel.publish(EXCHANGE_NAME, '', new Buffer(JSON.stringify({
				message: i
			})));
		}
	});
}).then(null, console.warn);
