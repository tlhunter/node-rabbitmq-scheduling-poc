#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var async = require('async');

var EXCHANGE_NAME = 'example-pubsub';
var MESSAGE_COUNT = 4000;
var TICK = Math.floor(MESSAGE_COUNT / 100);

amqp.connect('amqp://localhost', function(err, conn) {
	process.once('SIGINT', function() { console.log('KILLING...'); conn.close(); });

	conn.createChannel(function(err, channel) {
		channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

		var count = 0;

		async.whilst(
			function() { return count < MESSAGE_COUNT; },
			function(cb) {
				count++;

				if (count % TICK === 0) {
					console.log(count / TICK + '%');
				}

				sender(count);

				setImmediate(cb);
			},
			function() {
				sender('FIN');

				setImmediate(function() {
					conn.close();
				});
			}
		);

		function sender(count) {
			channel.publish(EXCHANGE_NAME, '', new Buffer(JSON.stringify({
				message: count
			})));
		}
	});
});
