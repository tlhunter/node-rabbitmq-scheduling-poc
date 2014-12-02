#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var os = require('os');
var sleep = require('sleep');

var QUEUE_NAME = process.pid + '@' + os.hostname(); // Unique queue name per process
var EXCHANGE_NAME = 'example-pubsub';

amqp.connect('amqp://localhost', function(err, conn) {
	process.once('SIGINT', function() { conn.close(); });

	conn.createChannel(function(err, channel) {
		channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

		channel.assertQueue(QUEUE_NAME, { exclusive: true }, function(err, qok) {
			channel.bindQueue(qok.queue, EXCHANGE_NAME, '');

			channel.consume(qok.queue, function(msg) {
				console.log(msg.content.toString());
				sleepMS(10); // block
				channel.ack(msg);
			}, {
				noAck: false
			}, function() {
				console.log('Waiting for messages delivered to queue: ' + QUEUE_NAME);
			});
		});
	});
});

function sleepMS(ms) {
	sleep.usleep(ms * 1000); // usleep is in microseconds
}
