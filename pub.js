#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var EXCHANGE_NAME = 'example-pubsub';
var MESSAGE_COUNT = 10000;
var TICK = Math.floor(MESSAGE_COUNT / 100);

amqp.connect('amqp://localhost', function(err, conn) {
	process.once('SIGINT', function() { conn.close(); });

	conn.createChannel(function(err, channel) {
		channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

		// TODO: This blocks like you wouldn't believe...
		for (var i = 0; i < MESSAGE_COUNT; i++) {
			sender(i);

			if (i % TICK === 0) {
				console.log(i / TICK + '%');
			}
		}

		sender('FIN');

		function sender(i) {
			channel.publish(EXCHANGE_NAME, '', new Buffer(JSON.stringify({
				message: i
			})));
		}
	});
});
