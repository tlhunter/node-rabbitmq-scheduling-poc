#!/usr/bin/env node

var amqp = require('amqplib');
var os = require('os');
var sleep = require('sleep');

var QUEUE_NAME = process.pid + '@' + os.hostname(); // Unique queue name per process
var EXCHANGE_NAME = 'example-pubsub';

amqp.connect('amqp://localhost').then(function(conn) {
	process.once('SIGINT', function() { conn.close(); });

	return conn.createChannel().then(function(channel) {
		var ok = channel.assertExchange(EXCHANGE_NAME, 'direct', {
			durable: true
		});

		ok = ok.then(function() {
			return channel.assertQueue(QUEUE_NAME, {
				exclusive: true
			});
		});

		ok = ok.then(function(qok) {
			return channel.bindQueue(qok.queue, EXCHANGE_NAME, '').then(function() {
				return qok.queue;
			});
		});

		ok = ok.then(function(queue) {
			return channel.consume(queue, function(msg) {
				console.log(msg.content.toString());
				sleepMS(10); // block
				return channel.ack(msg);
			}, {
				noAck: false
			});
		});

		return ok.then(function() {
			console.log('Waiting for messages delivered to queue: ' + QUEUE_NAME);
		});
	});
}).then(null, console.warn);

function sleepMS(ms) {
	sleep.usleep(ms * 1000); // usleep is in microseconds
}
